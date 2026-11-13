import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Send,
  UploadCloud,
  Link2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  FileArchive,
} from 'lucide-react';
import { AppItem, DeveloperSubmission } from '../types';
import {
  getLocalPublishedApps,
  saveLocalPublishedApp,
  getLocalSubmissions,
  saveLocalSubmission,
} from '../data/catalog';

export { getLocalPublishedApps, getLocalSubmissions };

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasBackend?: boolean;
  onAppPublished?: (app: AppItem) => void;
  onSelectApp?: (app: AppItem) => void;
}

async function computeFileSha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return 'SHA-256 requires HTTPS / localhost';
}

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  hasBackend = true,
  onAppPublished,
  onSelectApp,
}) => {
  const adminEmail = 'mr216873@gmail.com';
  const publishingFee = 25.0;

  // Modal Tabs
  const [activeTab, setActiveTab] = useState<'submit' | 'receipts'>('submit');

  // Payment Option
  const [paymentOption, setPaymentOption] = useState<'USDT_BEP20' | 'BINANCE_PAY'>('USDT_BEP20');
  const [txHash, setTxHash] = useState('');

  // APK Source & Metrics
  const [apkSourceMode, setApkSourceMode] = useState<'upload' | 'url'>(hasBackend ? 'upload' : 'url');
  const [apkDownloadUrl, setApkDownloadUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedLocalPath, setUploadedLocalPath] = useState('');
  const [computedSize, setComputedSize] = useState('');
  const [computedSha256, setComputedSha256] = useState('');
  const [uploadingApk, setUploadingApk] = useState(false);

  // App Manifest Form
  const [appTitle, setAppTitle] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [packageId, setPackageId] = useState('');
  const [category, setCategory] = useState('IPTV & Streaming');
  const [platform, setPlatform] = useState('Smart TV & Android Mobile');
  const [ownerName, setOwnerName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [developerEmail, setDeveloperEmail] = useState('');
  const [description, setDescription] = useState('');

  // Status & Receipts
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [receiptResult, setReceiptResult] = useState<{
    submission: DeveloperSubmission;
    app: AppItem;
    mailtoUrl: string;
  } | null>(null);
  const [submissions, setSubmissions] = useState<DeveloperSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Copy states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (activeTab === 'receipts') {
      loadSubmissions();
    }
  }, [isOpen, activeTab]);

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const localSubs = getLocalSubmissions();
      if (hasBackend) {
        const res = await fetch('./api/publish/submissions');
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data.submissions)) {
            const seen = new Set(data.submissions.map((s: DeveloperSubmission) => s.id));
            const merged = [...data.submissions, ...localSubs.filter((s) => !seen.has(s.id))];
            setSubmissions(merged);
            return;
          }
        }
      }
      setSubmissions(localSubs);
    } catch {
      setSubmissions(getLocalSubmissions());
    } finally {
      setLoadingSubmissions(false);
    }
  };

  if (!isOpen) return null;

  // Exact verified payment destinations provided by the store owner
  const paymentDetails = {
    USDT_BEP20: {
      title: 'USDT (BEP-20)',
      displayName: 'Deposit USDT (BEP20)',
      network: 'BNB Smart Chain (BEP20)',
      label: 'Deposit Wallet Address',
      value: '0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e',
      qrImage: './assets/aistudio/unnamed__2__145559af.png',
      notice: "Send exactly $25.00 USDT via BNB Smart Chain (BEP20). Don't send NFTs.",
    },
    BINANCE_PAY: {
      title: 'Binance Pay',
      displayName: 'Binance Pay',
      network: 'Binance App (Zero Fee Instant)',
      label: 'Binance Pay ID / Username',
      value: 'mrxshahin',
      qrImage: './assets/aistudio/unnamed__1__2b5c7e8c.png',
      notice: 'Scan with Binance App to send $25.00 USD directly to Binance ID: mrxshahin.',
    },
  };

  const activeMethod = paymentDetails[paymentOption];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(activeMethod.value);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 2000);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setFormError('Please select a valid Android .apk file.');
      return;
    }

    setUploadingApk(true);
    try {
      const arrayBuf = await file.arrayBuffer();
      const bytesView = new Uint8Array(arrayBuf);
      if (bytesView.length < 4 || bytesView[0] !== 0x50 || bytesView[1] !== 0x4b) {
        setFormError('Selected file does not appear to be a valid Android APK archive.');
        return;
      }

      const mbSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const shaHex = await computeFileSha256Hex(arrayBuf);

      setUploadedFileName(file.name);
      setComputedSize(mbSize);
      setComputedSha256(shaHex);
      if (!appTitle.trim()) {
        setAppTitle(file.name.replace(/\.apk$/i, '').replace(/[_-]+/g, ' ').trim());
      }

      if (hasBackend) {
        const res = await fetch('./api/publish/upload-apk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURIComponent(file.name),
          },
          body: arrayBuf,
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          setUploadedLocalPath(data.localApkPath);
          setApkDownloadUrl(data.directDownloadUrl);
          setComputedSize(data.size);
          setComputedSha256(data.sha256);
        } else {
          const errData = ct.includes('application/json') ? await res.json().catch(() => null) : null;
          setFormError(errData?.message || 'Failed to upload APK binary to server.');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error reading APK binary.');
    } finally {
      setUploadingApk(false);
    }
  };

  const handleSubmitPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = appTitle.trim();
    const cleanDevName = developerName.trim();
    const cleanEmail = developerEmail.trim();
    const cleanTx = txHash.trim();
    const cleanDesc = description.trim();
    const cleanUrl = apkDownloadUrl.trim();

    if (!cleanTitle) {
      setFormError('Enter your application name.');
      return;
    }
    if (!cleanDevName) {
      setFormError('Enter the developer or studio name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Enter a valid developer contact email address.');
      return;
    }
    if (cleanTx.length < 6) {
      setFormError('Enter your USDT (BEP-20) TxHash or Binance Pay Order ID (minimum 6 characters).');
      return;
    }
    if (apkSourceMode === 'upload' && hasBackend && !uploadedLocalPath) {
      setFormError('Please select and upload your .apk package file first.');
      return;
    }
    if ((apkSourceMode === 'url' || !hasBackend) && !cleanUrl) {
      setFormError('Enter the direct HTTPS download URL for your .apk file.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        appTitle: cleanTitle,
        packageId: packageId.trim() || undefined,
        fileName: uploadedFileName || `${cleanTitle.replace(/\s+/g, '_')}.apk`,
        apkDownloadUrl: cleanUrl || uploadedLocalPath,
        localApkPath: uploadedLocalPath || undefined,
        size: computedSize || undefined,
        sha256: computedSha256 || undefined,
        category,
        platform,
        version: version.trim() || '1.0.0',
        description: cleanDesc || `${cleanTitle} Android application published via MRS App Store.`,
        developerName: cleanDevName,
        ownerName: ownerName.trim() || cleanDevName,
        developerEmail: cleanEmail,
        paymentMethod: activeMethod.title,
        tier: 'Standard',
        amountPaidUsd: publishingFee,
        paymentDetails: {
          cryptoTxHash: cleanTx,
          cryptoNetwork: activeMethod.network,
        },
      };

      if (hasBackend) {
        const res = await fetch('./api/publish/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : null;
        if (!res.ok || !data?.success) {
          setFormError(data?.message || 'Could not submit application. Check your details and try again.');
          return;
        }

        if (data.app) saveLocalPublishedApp(data.app);
        if (data.submission) saveLocalSubmission(data.submission);

        setReceiptResult({
          submission: data.submission,
          app: data.app,
          mailtoUrl: data.mailtoUrl,
        });
        if (onAppPublished && data.app) {
          onAppPublished(data.app);
        }
        return;
      }

      // Offline / Static GitHub Pages inbuilt persistence
      const now = Date.now();
      const dateStr = new Date().toISOString().split('T')[0];
      const slug =
        cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `app-${now}`;
      const pkg =
        packageId.trim() || `com.mrs.${slug.replace(/-/g, '')}`;

      const newApp: AppItem = {
        id: `${slug}-${String(now).slice(-4)}`,
        title: cleanTitle,
        fileName: uploadedFileName || `${cleanTitle.replace(/\s+/g, '_')}.apk`,
        tagline: `Published by ${cleanDevName} on MRS App Store.`,
        category,
        platform,
        version: version.trim() || '1.0.0',
        updatedAt: dateStr,
        size: computedSize || 'Direct APK URL',
        rating: 0,
        reviewsCount: 0,
        downloads: 0,
        minAndroid: 'Android 8.0+ (API 26)',
        ageRating: 'Everyone',
        languages: 'Android System Locale',
        chartRank: `v${version.trim() || '1.0.0'}`,
        icon: './assets/site-logo-icon.jpg',
        banner: './assets/site-logo-icon.jpg',
        developer: cleanDevName,
        developerEmail: cleanEmail,
        ownerName: ownerName.trim() || cleanDevName,
        packageId: pkg,
        sha256: computedSha256 || 'Provided by Developer URL',
        directDownloadUrl: cleanUrl,
        downloadUrl: cleanUrl,
        shareUrl: `./?app=${slug}-${String(now).slice(-4)}`,
        localApkPath: cleanUrl,
        description: cleanDesc || `${cleanTitle} Android application package.`,
        whatsNew: [
          `Published to MRS App Store on ${dateStr}`,
          `Version ${version.trim() || '1.0.0'}${computedSize ? ` (${computedSize})` : ''}`,
        ],
        features: [
          `Direct APK URL: ${cleanUrl}`,
          `Target platform: ${platform}`,
          `Developer contact: ${cleanEmail}`,
        ],
        permissions: ['android.permission.INTERNET'],
        screenshots: ['./assets/site-logo-icon.jpg'],
      };

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newSub: DeveloperSubmission = {
        id: `sub-${now}`,
        appTitle: newApp.title,
        packageId: newApp.packageId,
        apkDownloadUrl: newApp.directDownloadUrl,
        size: newApp.size,
        sha256: newApp.sha256,
        publishedAppId: newApp.id,
        category: newApp.category,
        platform: newApp.platform,
        version: newApp.version,
        description: newApp.description,
        developerName: newApp.developer,
        developerEmail: newApp.developerEmail,
        targetAdminEmail: adminEmail,
        tier: 'Standard',
        amountPaidUsd: publishingFee,
        paymentMethod: activeMethod.title,
        paymentDetails: {
          cryptoTxHash: cleanTx,
          cryptoNetwork: activeMethod.network,
        },
        invoiceNumber: `INV-MRS-${new Date().getFullYear()}-${randomSuffix}`,
        transactionId: `TXN-MRS-${now}-${randomSuffix}`,
        status: 'Live',
        submittedAt: new Date().toISOString(),
      };

      saveLocalPublishedApp(newApp);
      saveLocalSubmission(newSub);

      const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
        `[App Published] ${newSub.appTitle} (${newSub.transactionId})`
      )}&body=${encodeURIComponent(
        `Dear MRS App Store Owner (${adminEmail}),\n\nApplication submitted via MRS App Store Publishing System.\n\nInvoice Number: ${newSub.invoiceNumber}\nTransaction ID: ${newSub.transactionId}\nFee: $25.00 USD\nPayment Method: ${newSub.paymentMethod}\nNetwork: ${activeMethod.network}\nTxHash / Order ID: ${cleanTx}\n\nApp Name: ${newApp.title}\nPackage ID: ${newApp.packageId}\nVersion: ${newApp.version}\nSize: ${newApp.size}\nSHA-256: ${newApp.sha256}\nAPK URL: ${newApp.directDownloadUrl}\nDeveloper: ${newApp.developer} (${newApp.developerEmail})`
      )}`;

      setReceiptResult({ submission: newSub, app: newApp, mailtoUrl });
      if (onAppPublished) {
        onAppPublished(newApp);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormForAnother = () => {
    setReceiptResult(null);
    setAppTitle('');
    setPackageId('');
    setVersion('1.0.0');
    setDescription('');
    setTxHash('');
    setApkDownloadUrl('');
    setUploadedFileName('');
    setUploadedLocalPath('');
    setComputedSize('');
    setComputedSha256('');
    setFormError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0c0c0f] border border-white/[0.1] rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl my-auto text-zinc-100 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right p-2 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-5 border-b border-white/[0.08] pr-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">
            <span>Inbuilt Developer Publishing System</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400">$25.00 USD Fee</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Publish App on MRS App Store
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Pay the $25.00 USD fee via USDT (BEP-20) or Binance Pay, upload or link your APK, and publish directly into the store catalog.
          </p>

          {/* Navigation Switcher */}
          <div className="mt-4 inline-flex p-1 bg-black border border-white/[0.08] rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'submit' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Submit &amp; Publish App
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('receipts')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'receipts' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Submitted Receipts</span>
            </button>
          </div>
        </div>

        {activeTab === 'receipts' ? (
          <div className="mt-6 space-y-4">
            {loadingSubmissions ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading recorded submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.06] text-center space-y-2">
                <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">No developer submissions yet</p>
                <p className="text-xs text-zinc-400">
                  Applications published through this inbuilt system appear here with their real invoice ID, TxHash, and SHA-256 verification.
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] space-y-2.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sub.appTitle}</h3>
                      <p className="text-zinc-400">
                        {sub.developerName} ({sub.developerEmail}) · v{sub.version}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[11px]">
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-black/60 p-3 rounded-xl border border-white/[0.05] font-mono">
                    <div>
                      <span className="text-zinc-500 block">Invoice / TXN</span>
                      <span className="text-zinc-200">{sub.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Payment Method</span>
                      <span className="text-zinc-200">
                        {sub.paymentMethod} (${sub.amountPaidUsd.toFixed(2)} USD)
                      </span>
                    </div>
                    <div className="sm:col-span-2 truncate">
                      <span className="text-zinc-500 block">Payment Proof (TxHash / Order ID)</span>
                      <span className="text-blue-400">{sub.paymentDetails?.cryptoTxHash || 'N/A'}</span>
                    </div>
                    {sub.sha256 && (
                      <div className="sm:col-span-2 truncate">
                        <span className="text-zinc-500 block">APK SHA-256 ({sub.size || 'APK'})</span>
                        <span className="text-zinc-300">{sub.sha256}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : receiptResult ? (
          <div className="mt-6 space-y-5">
            <div className="p-6 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {receiptResult.app.title} Published Live
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Recorded via {receiptResult.submission.paymentMethod} · Invoice {receiptResult.submission.invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-black/70 p-4 rounded-xl border border-white/[0.06] font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Transaction ID</span>
                  <span className="text-white">{receiptResult.submission.transactionId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Payment Proof</span>
                  <span className="text-blue-400 break-all">
                    {receiptResult.submission.paymentDetails.cryptoTxHash}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Package &amp; Size</span>
                  <span className="text-white">
                    {receiptResult.app.fileName} ({receiptResult.app.size})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Status</span>
                  <span className="text-emerald-400 font-bold">Live in Store Catalog</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">SHA-256 Verification Hash</span>
                  <span className="text-zinc-300 break-all text-[11px]">{receiptResult.app.sha256}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {onSelectApp && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectApp(receiptResult.app);
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Published App Page</span>
                  </button>
                )}

                <a
                  href={receiptResult.mailtoUrl}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Copy to {adminEmail}</span>
                </a>

                <button
                  type="button"
                  onClick={resetFormForAnother}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
                >
                  Publish Another App
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitPublish} className="mt-6 space-y-6">
            {/* STEP 1: Payment Option + TxHash */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Step 1: Complete $25.00 USD Fee
                  </span>
                  <p className="text-sm font-bold text-white">
                    Choose Payment Method: <span className="text-emerald-400">$25.00 USD</span>
                  </p>
                </div>

                <div className="flex p-1 bg-black rounded-xl border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('USDT_BEP20')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      paymentOption === 'USDT_BEP20'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    USDT (BEP-20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('BINANCE_PAY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      paymentOption === 'BINANCE_PAY'
                        ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Binance Pay
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-black p-4 rounded-xl border border-white/[0.06]">
                <div className="w-32 h-32 bg-zinc-950 p-1.5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                  <img
                    src={activeMethod.qrImage}
                    alt={activeMethod.displayName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-white">{activeMethod.displayName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {activeMethod.network}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-200 break-all select-all bg-zinc-900 p-2 rounded-lg border border-white/[0.06]">
                    {activeMethod.value}
                  </p>
                  <p className="text-[11px] text-zinc-400">{activeMethod.notice}</p>
                  <button
                    type="button"
                    onClick={handleCopyValue}
                    className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    {copiedValue ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedValue ? 'Copied!' : `Copy ${activeMethod.label}`}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  {paymentOption === 'USDT_BEP20'
                    ? 'USDT (BEP-20) Transaction Hash (TxHash) *'
                    : 'Binance Pay Order ID / Reference *'}
                </label>
                <input
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder={
                    paymentOption === 'USDT_BEP20'
                      ? '0x... (paste BEP-20 TxHash after sending $25 USDT)'
                      : 'Paste your Binance Pay Order ID after paying mrxshahin'
                  }
                  className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* STEP 2: APK Package Upload or Direct URL + Manifest */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Step 2: Application Package &amp; Manifest
                  </span>
                  <p className="text-sm font-bold text-white">Provide Your Android APK</p>
                </div>

                <div className="flex p-1 bg-black rounded-xl border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setApkSourceMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all ${
                      apkSourceMode === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Inspect / Upload .apk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApkSourceMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all ${
                      apkSourceMode === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Direct APK URL</span>
                  </button>
                </div>
              </div>

              {apkSourceMode === 'upload' && (
                <div className="bg-black p-4 rounded-xl border border-dashed border-white/15 space-y-3">
                  <label className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center py-2">
                    {uploadingApk ? (
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    ) : (
                      <FileArchive className="w-6 h-6 text-blue-400" />
                    )}
                    <span className="text-xs font-bold text-white">
                      {uploadingApk
                        ? 'Computing real SHA-256 & uploading APK...'
                        : uploadedFileName
                        ? `Verified: ${uploadedFileName} (${computedSize})`
                        : 'Choose .apk file from your device'}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Computes exact MB size and SHA-256 hash automatically
                      {hasBackend ? ' and hosts APK on MRS App Store server.' : '.'}
                    </span>
                    <input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                  </label>

                  {computedSha256 && (
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/[0.06] text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold block">Real SHA-256 Checksum:</span>
                      <span className="text-zinc-300 break-all">{computedSha256}</span>
                    </div>
                  )}
                </div>
              )}

              {(apkSourceMode === 'url' || !hasBackend) && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Direct APK Download URL *
                  </label>
                  <input
                    type="url"
                    required={apkSourceMode === 'url' || !hasBackend}
                    value={apkDownloadUrl}
                    onChange={(e) => setApkDownloadUrl(e.target.value)}
                    placeholder="https://example.com/downloads/your-app.apk"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="e.g. StreamPlayer TV"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    App Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner Full Name or Handle"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Developer / Studio Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    placeholder="Your Studio or Organization"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    App Owner Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={developerEmail}
                    onChange={(e) => setDeveloperEmail(e.target.value)}
                    placeholder="owner@domain.com"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IPTV & Streaming">IPTV &amp; Streaming</option>
                    <option value="Smart TV & Video">Smart TV &amp; Video</option>
                    <option value="AI & Virtual Assistant">AI &amp; Virtual Assistant</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Target Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Smart TV & Android Mobile">Smart TV &amp; Android Mobile</option>
                    <option value="Smart TV (Firestick / Android TV)">Smart TV (Firestick / Android TV)</option>
                    <option value="Android Mobile">Android Mobile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Package Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  placeholder="e.g. com.company.appname"
                  className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Description &amp; Release Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your application features, compatibility, and release notes..."
                  className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Admin Support:</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-blue-400 font-mono hover:underline inline-flex items-center gap-1"
                >
                  <span>{copiedEmail ? 'Copied!' : adminEmail}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingApk}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-600/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Store...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit &amp; Publish App</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
