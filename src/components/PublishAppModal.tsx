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
  Image as ImageIcon,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
  Cpu,
  Clock,
} from 'lucide-react';
import { AppItem, AppOwnerProfile, DeveloperSubmission } from '../types';
import {
  APP_STORE_CATEGORIES,
  copyToClipboard,
  getAppLocalApkUrl,
  getLocalPublishedApps,
  saveLocalPublishedApp,
  getLocalSubmissions,
  saveLocalSubmission,
  normalizeAssetPath,
} from '../data/catalog';

export { getLocalPublishedApps, getLocalSubmissions };

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasBackend?: boolean;
  initialCategory?: string;
  onAppPublished?: (app: AppItem) => void;
  onSelectApp?: (app: AppItem) => void;
}

interface VerifiedPaymentInfo {
  tokenSymbol?: string;
  amountPaidUsd?: number;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
  txHash: string;
  paymentMethod: 'USDT (BEP-20)' | 'Binance Pay';
}

interface UploadedApkTelemetry {
  fileName: string;
  localApkPath?: string;
  directDownloadUrl: string;
  size: string;
  sha256: string;
  hasManifest?: boolean;
  hasClassesDex?: boolean;
  hasResources?: boolean;
  architectures?: string[];
  entryCount?: number;
}

const OWNER_BSC_WALLET = '0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e';
const REQUIRED_FEE_USD = 25.0;
const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const BSC_STABLECOINS: Record<string, { symbol: string; decimals: number }> = {
  '0x55d398326f99059ff775485246999027b3197955': { symbol: 'USDT (BEP-20)', decimals: 18 },
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': { symbol: 'USDC (BEP-20)', decimals: 18 },
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': { symbol: 'BUSD (BEP-20)', decimals: 18 },
};

async function computeFileSha256Hex(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return 'SHA-256 requires HTTPS / localhost';
}

async function verifyBscPaymentClientSide(txHashRaw: string): Promise<{
  verified: boolean;
  message: string;
  tokenSymbol?: string;
  amountPaidUsd?: number;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
}> {
  const txHash = txHashRaw.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return {
      verified: false,
      message: 'Enter a valid 66-character BNB Smart Chain (BEP-20) transaction hash starting with 0x.',
    };
  }

  const endpoints = [
    'https://bsc-dataseed.binance.org/',
    'https://bsc-rpc.publicnode.com',
  ];

  let receipt: any = null;
  let latestBlockHex = '';
  for (const rpcUrl of endpoints) {
    try {
      const [recRes, blkRes] = await Promise.all([
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txHash] }),
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'eth_blockNumber', params: [] }),
        }),
      ]);
      if (recRes.ok && blkRes.ok) {
        const recJson = await recRes.json();
        const blkJson = await blkRes.json();
        receipt = recJson?.result ?? null;
        latestBlockHex = blkJson?.result || '';
        break;
      }
    } catch {
      continue;
    }
  }

  if (!receipt) {
    return {
      verified: false,
      message: 'Transaction hash not found on BNB Smart Chain yet. Confirm on BscScan and retry.',
    };
  }
  if (receipt.status !== '0x1') {
    return {
      verified: false,
      message: 'This BNB Smart Chain transaction failed or was reverted on-chain.',
    };
  }

  const paddedOwnerTopic = `0x000000000000000000000000${OWNER_BSC_WALLET.slice(2)}`;
  let totalReceivedUsd = 0;
  let matchedSymbol = '';
  let fromAddr = receipt.from || '';

  for (const log of receipt.logs || []) {
    const tokenInfo = BSC_STABLECOINS[String(log.address || '').toLowerCase()];
    if (!tokenInfo) continue;
    const topics: string[] = log.topics || [];
    if (
      topics.length >= 3 &&
      topics[0]?.toLowerCase() === ERC20_TRANSFER_TOPIC &&
      topics[2]?.toLowerCase() === paddedOwnerTopic
    ) {
      const rawValue = BigInt(log.data || '0x0');
      const divisor = 10n ** BigInt(tokenInfo.decimals);
      totalReceivedUsd += Number(rawValue / divisor) + Number(rawValue % divisor) / Number(divisor);
      matchedSymbol = tokenInfo.symbol;
      if (topics[1]?.length === 66) {
        fromAddr = `0x${topics[1].slice(26)}`;
      }
    }
  }

  if (totalReceivedUsd <= 0) {
    return {
      verified: false,
      message: `No BEP-20 USDT/USDC transfer to ${OWNER_BSC_WALLET} found in this transaction.`,
    };
  }
  if (totalReceivedUsd + 0.0001 < REQUIRED_FEE_USD) {
    return {
      verified: false,
      message: `Transferred $${totalReceivedUsd.toFixed(2)} USD, which is below the required $${REQUIRED_FEE_USD.toFixed(2)} USD publishing fee.`,
    };
  }

  const txBlock = receipt.blockNumber ? parseInt(receipt.blockNumber, 16) : 0;
  const latestBlock = latestBlockHex ? parseInt(latestBlockHex, 16) : txBlock;
  return {
    verified: true,
    message: `Verified $${totalReceivedUsd.toFixed(2)} ${matchedSymbol} transfer to store wallet.`,
    tokenSymbol: matchedSymbol,
    amountPaidUsd: Number(totalReceivedUsd.toFixed(2)),
    fromAddress: fromAddr,
    toAddress: OWNER_BSC_WALLET,
    blockNumber: txBlock,
    confirmations: Math.max(1, latestBlock - txBlock + 1),
    explorerUrl: `https://bscscan.com/tx/${txHash}`,
  };
}

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  hasBackend = true,
  initialCategory,
  onAppPublished,
  onSelectApp,
}) => {
  const adminEmail = 'mr216873@gmail.com';
  const publishingFee = REQUIRED_FEE_USD;

  // Modal Tabs & Stepper
  const [activeTab, setActiveTab] = useState<'submit' | 'receipts'>('submit');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: App & Owner Details
  const [appTitle, setAppTitle] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [packageId, setPackageId] = useState('');
  const [category, setCategory] = useState(
    initialCategory && initialCategory !== 'All' ? initialCategory : 'IPTV & Streaming'
  );
  const [platform, setPlatform] = useState('Smart TV & Android Mobile');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [developerEmail, setDeveloperEmail] = useState('');
  const [gravatarHandle, setGravatarHandle] = useState('');
  const [lookingUpGravatar, setLookingUpGravatar] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<AppOwnerProfile | undefined>(undefined);
  const [gravatarMessage, setGravatarMessage] = useState<string | null>(null);

  // Step 2: Payment Verification
  const [paymentOption, setPaymentOption] = useState<'USDT_BEP20' | 'BINANCE_PAY'>('USDT_BEP20');
  const [txHash, setTxHash] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verifiedPaymentInfo, setVerifiedPaymentInfo] = useState<VerifiedPaymentInfo | null>(null);
  const [pendingBinanceReceipt, setPendingBinanceReceipt] = useState<{
    submission: DeveloperSubmission;
    mailtoUrl: string;
    message: string;
  } | null>(null);

  // Step 3: Upload App & Publish Live
  const [apkSourceMode, setApkSourceMode] = useState<'upload' | 'url'>(hasBackend ? 'upload' : 'url');
  const [apkDownloadUrl, setApkDownloadUrl] = useState('');
  const [uploadingApk, setUploadingApk] = useState(false);
  const [uploadedApk, setUploadedApk] = useState<UploadedApkTelemetry | null>(null);

  // Submission & Receipts State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [receiptResult, setReceiptResult] = useState<{
    submission: DeveloperSubmission;
    app: AppItem;
    mailtoUrl: string;
    explorerUrl?: string;
  } | null>(null);
  const [submissions, setSubmissions] = useState<DeveloperSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Copy helper feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [iconPreviewFailed, setIconPreviewFailed] = useState(false);
  const [gravatarAvatarFailed, setGravatarAvatarFailed] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setIconPreviewFailed(false);
    setGravatarAvatarFailed(false);
    setQrFailed(false);
    if (initialCategory && initialCategory !== 'All') {
      setCategory(initialCategory);
    }
    if (activeTab === 'receipts') {
      loadSubmissions();
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, activeTab, initialCategory, onClose]);

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

  const paymentDetails = {
    USDT_BEP20: {
      title: 'USDT (BEP-20)' as const,
      displayName: 'Deposit USDT (BEP20)',
      network: 'BNB Smart Chain (BEP20)',
      label: 'Deposit Wallet Address',
      value: OWNER_BSC_WALLET,
      qrImage: normalizeAssetPath('./assets/aistudio/unnamed__2__145559af.png'),
      notice: "Send at least $25.00 USDT/USDC via BNB Smart Chain (BEP20) for instant automated on-chain verification.",
    },
    BINANCE_PAY: {
      title: 'Binance Pay' as const,
      displayName: 'Binance Pay',
      network: 'Binance App (Zero Fee)',
      label: 'Binance Pay ID / Username',
      value: 'mrxshahin',
      qrImage: normalizeAssetPath('./assets/aistudio/unnamed__1__2b5c7e8c.png'),
      notice: 'Send $25.00 USD via Binance Pay to ID mrxshahin, then enter your Order ID for store owner review.',
    },
  };

  const activeMethod = paymentDetails[paymentOption];

  const copyText = async (key: string, text: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLookupGravatar = async () => {
    const clean = gravatarHandle.trim();
    if (!clean) {
      setGravatarMessage('Enter a Gravatar username (e.g. mrxshahin) or profile URL.');
      return;
    }
    setLookingUpGravatar(true);
    setGravatarMessage(null);
    setFormError(null);

    try {
      let profile: AppOwnerProfile | undefined;
      if (hasBackend) {
        const res = await fetch(`./api/publish/gravatar/${encodeURIComponent(clean)}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !data?.profile) {
          setGravatarMessage(data?.message || 'Gravatar profile not found.');
          return;
        }
        profile = data.profile;
      } else {
        const slug = clean
          .replace(/^https?:\/\/(en\.|www\.)?gravatar\.com\//i, '')
          .replace(/^@/, '')
          .replace(/\.json$/i, '')
          .replace(/[^a-zA-Z0-9._-]/g, '');
        const res = await fetch(`https://gravatar.com/${encodeURIComponent(slug)}.json`);
        if (!res.ok) {
          setGravatarMessage(`Gravatar profile "${slug}" not found.`);
          return;
        }
        const json = await res.json();
        const entry = json?.entry?.[0];
        if (!entry) {
          setGravatarMessage('No public Gravatar entry found.');
          return;
        }
        const cleanLines = String(entry.aboutMe || '')
          .split(/\r?\n/)
          .map((l: string) => l.replace(/[#*`>_]/g, '').trim())
          .filter(Boolean);
        const calEntry = Array.isArray(entry.contactInfo)
          ? entry.contactInfo.find(
              (c: any) =>
                c?.type === 'calendar' &&
                c?.value &&
                !String(c.value).toLowerCase().includes('blogspot')
            )
          : null;
        profile = {
          displayName: String(entry.displayName || slug),
          username: String(entry.preferredUsername || slug),
          profileUrl: String(entry.profileUrl || `https://gravatar.com/${slug}`),
          avatarUrl: entry.thumbnailUrl ? `${String(entry.thumbnailUrl)}?s=256` : '',
          email: entry.emails?.[0]?.value ? String(entry.emails[0].value) : '',
          phone: entry.phoneNumbers?.[0]?.value ? String(entry.phoneNumbers[0].value) : undefined,
          headline: cleanLines[0] || undefined,
          bio: cleanLines.slice(0, 3).join(' ').slice(0, 320) || undefined,
          calendarUrl: calEntry ? String(calEntry.value) : undefined,
          accounts: Array.isArray(entry.accounts)
            ? entry.accounts
                .filter((acc: any) => acc?.url && !String(acc.url).toLowerCase().includes('blogspot'))
                .map((acc: any) => ({
                  name: String(acc.name || acc.domain || 'Link'),
                  username: String(acc.username || acc.display || ''),
                  url: String(acc.url),
                  verified: Boolean(acc.verified),
                }))
            : [],
        };
      }

      if (profile) {
        setOwnerProfile(profile);
        if (!ownerName.trim()) {
          setOwnerName(
            profile.username ? `${profile.displayName} (@${profile.username})` : profile.displayName
          );
        }
        if (!developerEmail.trim() && profile.email) {
          setDeveloperEmail(profile.email);
        }
        setGravatarMessage(`Attached verified Gravatar profile for ${profile.displayName}.`);
      }
    } catch (err: any) {
      setGravatarMessage(err?.message || 'Unable to fetch Gravatar profile.');
    } finally {
      setLookingUpGravatar(false);
    }
  };

  const handleIconSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    if (file.size > 4 * 1024 * 1024) {
      setFormError('App icon image must be 4 MB or smaller (PNG, JPG, or WebP).');
      return;
    }

    setUploadingIcon(true);
    try {
      if (hasBackend) {
        const buf = await file.arrayBuffer();
        const res = await fetch('./api/publish/upload-icon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: buf,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          setFormError(data?.message || 'Failed to upload app icon.');
          return;
        }
        setIconUrl(data.iconUrl);
      } else {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Failed to read image file.'));
          reader.readAsDataURL(file);
        });
        setIconUrl(dataUrl);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Unable to process app icon.');
    } finally {
      setUploadingIcon(false);
    }
  };

  const validateStep1 = (): string | null => {
    if (!appTitle.trim()) return 'Enter your application name.';
    if (!version.trim()) return 'Enter your application version (e.g. 1.0.0).';
    if (!ownerName.trim()) return 'Enter the App Owner name.';
    if (!developerName.trim()) return 'Enter the Developer / Studio name.';
    if (!developerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(developerEmail.trim())) {
      return 'Enter a valid App Owner contact email address.';
    }
    return null;
  };

  const handleContinueToStep2 = () => {
    const err = validateStep1();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setCurrentStep(2);
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPendingBinanceReceipt(null);

    const step1Err = validateStep1();
    if (step1Err) {
      setFormError(step1Err);
      setCurrentStep(1);
      return;
    }

    const cleanTx = txHash.trim();
    if (!cleanTx) {
      setFormError(
        paymentOption === 'USDT_BEP20'
          ? 'Paste your USDT (BEP-20) TxHash (starting with 0x) to verify on-chain payment.'
          : 'Paste your Binance Pay Order ID to submit for owner verification.'
      );
      return;
    }

    setVerifyingPayment(true);
    try {
      const appDetailsPayload = {
        appTitle: appTitle.trim(),
        packageId: packageId.trim() || undefined,
        category,
        platform,
        version: version.trim() || '1.0.0',
        description: description.trim() || `${appTitle.trim()} Android application.`,
        developerName: developerName.trim(),
        ownerName: ownerName.trim(),
        developerEmail: developerEmail.trim(),
      };

      if (hasBackend) {
        const res = await fetch('./api/publish/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: activeMethod.title,
            txHash: cleanTx,
            appDetails: appDetailsPayload,
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          setFormError(data?.message || 'Payment verification failed. Check your TxHash or Order ID.');
          return;
        }

        if (data.verified && data.verificationToken) {
          setVerificationToken(data.verificationToken);
          setVerifiedPaymentInfo({
            ...data.verification,
            txHash: cleanTx,
            paymentMethod: activeMethod.title,
          });
          setCurrentStep(3);
          return;
        }

        if (data.pendingOwnerReview && data.submission) {
          saveLocalSubmission(data.submission);
          setPendingBinanceReceipt({
            submission: data.submission,
            mailtoUrl: data.mailtoUrl,
            message: data.message,
          });
          return;
        }

        setFormError(data?.message || 'Could not confirm payment status.');
        return;
      }

      // Offline / Static GitHub Pages verification fallback
      const alreadyUsed = getLocalSubmissions().some(
        (s) => (s.paymentDetails?.cryptoTxHash || '').trim().toLowerCase() === cleanTx.toLowerCase()
      );
      if (alreadyUsed) {
        setFormError('This transaction hash / order ID has already been used in this browser.');
        return;
      }

      if (paymentOption === 'USDT_BEP20') {
        const rpcCheck = await verifyBscPaymentClientSide(cleanTx);
        if (!rpcCheck.verified) {
          setFormError(rpcCheck.message);
          return;
        }
        setVerificationToken(`client-verified-${cleanTx}`);
        setVerifiedPaymentInfo({
          ...rpcCheck,
          txHash: cleanTx,
          paymentMethod: 'USDT (BEP-20)',
        });
        setCurrentStep(3);
      } else {
        if (!/^[a-zA-Z0-9_-]{8,64}$/.test(cleanTx)) {
          setFormError('Enter a valid Binance Pay Order ID (8–64 alphanumeric characters).');
          return;
        }
        const now = Date.now();
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const sub: DeveloperSubmission = {
          id: `sub-${now}`,
          appTitle: appTitle.trim(),
          packageId: packageId.trim() || undefined,
          apkDownloadUrl: 'Awaiting owner payment confirmation before APK upload',
          category,
          platform,
          version: version.trim() || '1.0.0',
          description: description.trim() || `${appTitle.trim()} Android application.`,
          developerName: developerName.trim(),
          developerEmail: developerEmail.trim(),
          targetAdminEmail: adminEmail,
          tier: 'Standard',
          amountPaidUsd: publishingFee,
          paymentMethod: 'Binance Pay',
          paymentDetails: {
            cryptoTxHash: cleanTx,
            cryptoNetwork: 'Binance Pay (mrxshahin)',
          },
          invoiceNumber: `INV-MRS-${new Date().getFullYear()}-${suffix}`,
          transactionId: `TXN-MRS-${now}-${suffix}`,
          status: 'Under Review',
          submittedAt: new Date().toISOString(),
        };
        saveLocalSubmission(sub);
        const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
          `[Binance Pay Verification] ${sub.appTitle} (${sub.invoiceNumber})`
        )}&body=${encodeURIComponent(
          `Dear Store Owner (${adminEmail}),\n\nBinance Pay Order ID: ${cleanTx}\nInvoice: ${sub.invoiceNumber}\nApp Name: ${sub.appTitle}\nOwner: ${ownerName.trim()} (${sub.developerEmail})`
        )}`;
        setPendingBinanceReceipt({
          submission: sub,
          mailtoUrl,
          message:
            'Binance Pay Order ID recorded under review. Personal Binance Pay orders require manual confirmation by M R S (mr216873@gmail.com); or pay via USDT (BEP-20) for instant automated verification and APK upload.',
        });
      }
    } catch (err: any) {
      setFormError(err?.message || 'Unable to verify payment right now.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleApkSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    if (!file.name.toLowerCase().endsWith('.apk')) {
      setFormError('Please select a valid Android .apk binary file.');
      return;
    }

    setUploadingApk(true);
    try {
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      if (bytes.length < 128 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        setFormError('Selected file does not have a valid Android APK/ZIP signature.');
        return;
      }

      if (hasBackend) {
        if (!verificationToken || !verifiedPaymentInfo) {
          setFormError('Complete Step 2 payment verification before uploading your APK.');
          setCurrentStep(2);
          return;
        }

        const res = await fetch('./api/publish/upload-apk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURIComponent(file.name),
            'x-payment-token': verificationToken,
            'x-tx-hash': verifiedPaymentInfo.txHash,
            'x-payment-method': verifiedPaymentInfo.paymentMethod,
          },
          body: arrayBuf,
        });
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json().catch(() => null) : null;
        if (!res.ok || !data?.success) {
          setFormError(data?.message || 'APK upload rejected by server verification.');
          return;
        }

        setUploadedApk({
          fileName: data.fileName,
          localApkPath: data.localApkPath,
          directDownloadUrl: data.directDownloadUrl,
          size: data.size,
          sha256: data.sha256,
          hasManifest: data.hasManifest,
          hasClassesDex: data.hasClassesDex,
          hasResources: data.hasResources,
          architectures: data.architectures,
          entryCount: data.entryCount,
        });
        setApkDownloadUrl(data.directDownloadUrl);
      } else {
        const mbSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        const shaHex = await computeFileSha256Hex(arrayBuf);
        setUploadedApk({
          fileName: file.name,
          directDownloadUrl: apkDownloadUrl.trim(),
          size: mbSize,
          sha256: shaHex,
        });
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to read or upload APK package.');
    } finally {
      setUploadingApk(false);
    }
  };

  const handleFinalizePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!verificationToken || !verifiedPaymentInfo) {
      setFormError('Payment verification is required before publishing.');
      setCurrentStep(2);
      return;
    }

    const cleanUrl = apkDownloadUrl.trim();
    if (hasBackend && apkSourceMode === 'upload' && !uploadedApk?.localApkPath) {
      setFormError('Upload your verified .apk binary in Step 3 before publishing.');
      return;
    }
    if ((apkSourceMode === 'url' || !hasBackend) && !/^https?:\/\/.+/i.test(cleanUrl)) {
      setFormError('Enter a valid HTTPS direct download URL for your .apk file.');
      return;
    }

    setSubmitting(true);
    try {
      if (hasBackend) {
        const res = await fetch('./api/publish/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appTitle: appTitle.trim(),
            packageId: packageId.trim() || undefined,
            fileName: uploadedApk?.fileName || `${appTitle.trim().replace(/\s+/g, '_')}.apk`,
            iconUrl: iconUrl || undefined,
            apkDownloadUrl: apkSourceMode === 'url' ? cleanUrl : (uploadedApk?.localApkPath || cleanUrl),
            localApkPath: apkSourceMode === 'upload' ? uploadedApk?.localApkPath || undefined : undefined,
            size: uploadedApk?.size || undefined,
            sha256: uploadedApk?.sha256 || undefined,
            architectures: uploadedApk?.architectures || undefined,
            category,
            platform,
            version: version.trim() || '1.0.0',
            description:
              description.trim() || `${appTitle.trim()} Android application published via MRS App Store.`,
            developerName: developerName.trim(),
            ownerName: ownerName.trim(),
            ownerProfile,
            developerEmail: developerEmail.trim(),
            paymentMethod: verifiedPaymentInfo.paymentMethod,
            verificationToken,
            tier: 'Standard',
            paymentDetails: {
              cryptoTxHash: verifiedPaymentInfo.txHash,
              cryptoNetwork: activeMethod.network,
            },
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          setFormError(data?.message || 'Failed to finalize app publication.');
          return;
        }

        if (data.app) saveLocalPublishedApp(data.app);
        if (data.submission) saveLocalSubmission(data.submission);

        setReceiptResult({
          submission: data.submission,
          app: data.app,
          mailtoUrl: data.mailtoUrl,
          explorerUrl: data.explorerUrl || verifiedPaymentInfo.explorerUrl,
        });
        if (onAppPublished && data.app) {
          onAppPublished(data.app);
        }
        return;
      }

      // Offline / Static mode persistence
      const now = Date.now();
      const dateStr = new Date().toISOString().split('T')[0];
      const slug =
        appTitle
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `app-${now}`;
      const pkg = packageId.trim() || `com.mrs.${slug.replace(/-/g, '')}`;
      const finalIcon = normalizeAssetPath(iconUrl || './assets/site-logo-icon.jpg');

      const newApp: AppItem = {
        id: `${slug}-${String(now).slice(-4)}`,
        title: appTitle.trim(),
        fileName: uploadedApk?.fileName || `${appTitle.trim().replace(/\s+/g, '_')}.apk`,
        tagline: `Published by ${ownerName.trim()} on MRS App Store.`,
        category,
        platform,
        version: version.trim() || '1.0.0',
        updatedAt: dateStr,
        size: uploadedApk?.size || 'Direct APK URL',
        rating: 0,
        reviewsCount: 0,
        downloads: 0,
        minAndroid: 'Android 8.0+ (API 26)',
        ageRating: 'Everyone',
        languages: 'Android System Locale',
        chartRank: `v${version.trim() || '1.0.0'}`,
        icon: finalIcon,
        banner: finalIcon,
        developer: developerName.trim(),
        developerEmail: developerEmail.trim(),
        ownerName: ownerName.trim(),
        ownerProfile,
        packageId: pkg,
        sha256: uploadedApk?.sha256 || 'Provided by Developer URL',
        directDownloadUrl: cleanUrl,
        downloadUrl: cleanUrl,
        shareUrl: `./?app=${slug}-${String(now).slice(-4)}`,
        localApkPath: cleanUrl,
        description: description.trim() || `${appTitle.trim()} Android application package.`,
        whatsNew: [
          `Published to MRS App Store on ${dateStr}`,
          `Version ${version.trim() || '1.0.0'}${uploadedApk?.size ? ` (${uploadedApk.size})` : ''}`,
        ],
        features: [
          `Direct APK URL: ${cleanUrl}`,
          `Target platform: ${platform}`,
          `Owner contact: ${developerEmail.trim()}`,
        ],
        permissions: ['android.permission.INTERNET'],
        screenshots: [finalIcon],
      };

      const suffix = Math.floor(1000 + Math.random() * 9000);
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
        amountPaidUsd: verifiedPaymentInfo.amountPaidUsd || publishingFee,
        paymentMethod: verifiedPaymentInfo.paymentMethod,
        paymentDetails: {
          cryptoTxHash: verifiedPaymentInfo.txHash,
          cryptoNetwork: `BNB Smart Chain (BEP20 · Block #${verifiedPaymentInfo.blockNumber || 'Verified'})`,
        },
        invoiceNumber: `INV-MRS-${new Date().getFullYear()}-${suffix}`,
        transactionId: `TXN-MRS-${now}-${suffix}`,
        status: 'Live',
        submittedAt: new Date().toISOString(),
      };

      saveLocalPublishedApp(newApp);
      saveLocalSubmission(newSub);

      const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
        `[App Published] ${newSub.appTitle} (${newSub.transactionId})`
      )}&body=${encodeURIComponent(
        `Dear Store Owner (${adminEmail}),\n\nApplication verified on BNB Smart Chain and published.\n\nInvoice: ${newSub.invoiceNumber}\nTxHash: ${verifiedPaymentInfo.txHash}\nApp: ${newApp.title} (${newApp.packageId})\nOwner: ${newApp.ownerName} (${newApp.developerEmail})\nAPK URL: ${newApp.directDownloadUrl}`
      )}`;

      setReceiptResult({
        submission: newSub,
        app: newApp,
        mailtoUrl,
        explorerUrl: verifiedPaymentInfo.explorerUrl,
      });
      if (onAppPublished) onAppPublished(newApp);
    } catch (err: any) {
      setFormError(err?.message || 'Publication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetWorkflow = () => {
    setReceiptResult(null);
    setPendingBinanceReceipt(null);
    setVerificationToken(null);
    setVerifiedPaymentInfo(null);
    setUploadedApk(null);
    setCurrentStep(1);
    setAppTitle('');
    setPackageId('');
    setVersion('1.0.0');
    setDescription('');
    setIconUrl('');
    setTxHash('');
    setApkDownloadUrl('');
    setGravatarHandle('');
    setGravatarMessage(null);
    setOwnerProfile(undefined);
    setFormError(null);
  };

  const previewIcon = iconPreviewFailed
    ? normalizeAssetPath('./assets/site-logo-icon.jpg')
    : normalizeAssetPath(iconUrl || './assets/site-logo-icon.jpg');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#1c1c1e] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-[28px] px-4 pt-0 sm:px-8 shadow-2xl sm:my-auto text-zinc-100 max-h-[94dvh] sm:max-h-[90dvh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Apple Sheet Top Bar */}
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-2 pb-3 sm:py-3.5 mb-5 bg-[#1c1c1e]/90 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08]">
          <div className="w-9 h-1 rounded-full bg-white/25 mx-auto mb-2 sm:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-[#0a84ff]">
                <span>App Publishing</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-emerald-400">$25.00 USD</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                Publish App on MRS App Store
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.1] hover:bg-white/[0.18] text-zinc-300 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtitle & Switcher */}
        <div className="pb-5 border-b border-white/[0.08]">
          <p className="text-xs text-zinc-400">
            Enter app &amp; owner details, verify your $25.00 USD payment on-chain, then upload your APK to publish live.
          </p>

          {/* Navigation Switcher */}
          <div className="mt-4 grid grid-cols-2 sm:inline-flex w-full sm:w-auto p-1 bg-black border border-white/[0.08] rounded-2xl sm:rounded-full gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all text-center ${
                activeTab === 'submit' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Publish Workflow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('receipts')}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'receipts' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
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
                  Applications verified and submitted through this system appear here with their real invoice ID, TxHash, and SHA-256 verification.
                </p>
              </div>
            ) : (
              submissions.map((sub) => {
                const proof = sub.paymentDetails?.cryptoTxHash || '';
                const isBscTx = /^0x[0-9a-fA-F]{64}$/.test(proof);
                return (
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
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          sub.status === 'Live'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : sub.status === 'Under Review'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                      >
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
                      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-zinc-500 block">Payment Proof (TxHash / Order ID)</span>
                          <span className="text-blue-400 break-all">{proof || 'N/A'}</span>
                        </div>
                        {isBscTx && (
                          <a
                            href={`https://bscscan.com/tx/${proof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline shrink-0"
                          >
                            <span>BscScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {sub.sha256 && (
                        <div className="sm:col-span-2 truncate">
                          <span className="text-zinc-500 block">APK SHA-256 ({sub.size || 'APK'})</span>
                          <span className="text-zinc-300">{sub.sha256}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : receiptResult ? (
          <div className="mt-6 space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {receiptResult.app.title} Verified &amp; Published Live
                  </h3>
                  <p className="text-xs text-emerald-300">
                    {receiptResult.submission.paymentMethod} verified · Invoice {receiptResult.submission.invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-black/70 p-4 rounded-xl border border-white/[0.06] font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Transaction ID</span>
                  <span className="text-white">{receiptResult.submission.transactionId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Verified Payment</span>
                  <span className="text-emerald-400 font-bold">
                    ${receiptResult.submission.amountPaidUsd.toFixed(2)} USD Confirmed
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">On-Chain Proof / TxHash</span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-blue-400 break-all">
                      {receiptResult.submission.paymentDetails.cryptoTxHash}
                    </span>
                    {receiptResult.explorerUrl && (
                      <a
                        href={receiptResult.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:underline shrink-0"
                      >
                        <span>View on BscScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Package &amp; Size</span>
                  <span className="text-white">
                    {receiptResult.app.fileName} ({receiptResult.app.size})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Owner</span>
                  <span className="text-white">
                    {receiptResult.app.ownerName || receiptResult.app.developer}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[10px]">SHA-256 Verification Hash</span>
                  <span className="text-zinc-300 break-all text-[11px]">{receiptResult.app.sha256}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
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

                <button
                  type="button"
                  onClick={() => {
                    const pathname = window.location.pathname || '/';
                    const basePath = pathname.endsWith('/')
                      ? pathname
                      : pathname.split('/').pop()?.includes('.')
                      ? pathname.replace(/\/[^/]*$/, '/')
                      : `${pathname}/`;
                    const staticApkRel = getAppLocalApkUrl(receiptResult.app);
                    const directUrl = hasBackend
                      ? `${window.location.origin}${basePath}api/download/${receiptResult.app.id}`
                      : staticApkRel.startsWith('http://') || staticApkRel.startsWith('https://')
                      ? staticApkRel
                      : `${window.location.origin}${basePath}${staticApkRel.replace(/^\.\//, '')}`;
                    copyText('apk', directUrl);
                  }}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {copiedKey === 'apk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'apk' ? 'APK Link Copied' : 'Copy Direct APK Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      'share',
                      `${window.location.origin}${window.location.pathname}?app=${receiptResult.app.id}`
                    )
                  }
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {copiedKey === 'share' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'share' ? 'Share Link Copied' : 'Copy Share Link'}</span>
                </button>

                <a
                  href={receiptResult.mailtoUrl}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email {adminEmail}</span>
                </a>

                <button
                  type="button"
                  onClick={resetWorkflow}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
                >
                  Publish Another App
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* 3-Step Visual Progress Stepper */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { step: 1 as const, shortLabel: '1. Details', label: '1. App & Owner Details' },
                { step: 2 as const, shortLabel: '2. Pay ($25)', label: '2. Verify Payment ($25)' },
                { step: 3 as const, shortLabel: '3. Upload', label: '3. Upload & Publish' },
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isDone =
                  (item.step === 1 && currentStep > 1) ||
                  (item.step === 2 && Boolean(verificationToken));
                const isLocked = item.step === 3 && !verificationToken;

                return (
                  <button
                    key={item.step}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (item.step === 1) setCurrentStep(1);
                      else if (item.step === 2) {
                        const err = validateStep1();
                        if (err) setFormError(err);
                        else {
                          setFormError(null);
                          setCurrentStep(2);
                        }
                      } else if (item.step === 3 && verificationToken) {
                        setFormError(null);
                        setCurrentStep(3);
                      }
                    }}
                    className={`p-2 sm:p-3 rounded-xl border text-left transition-all text-[11px] font-bold flex items-center justify-center sm:justify-start gap-1.5 min-h-[44px] ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : isDone
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : isLocked
                        ? 'bg-zinc-900/40 border-white/[0.06] text-zinc-500 cursor-not-allowed'
                        : 'bg-zinc-900/70 border-white/[0.08] text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                    ) : isDone && !isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : null}
                    <span className="sm:hidden truncate">{item.shortLabel}</span>
                    <span className="hidden sm:inline truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: APP & OWNER DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* App Details Block */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Step 1 of 3 · Application Manifest
                      </span>
                      <p className="text-sm font-bold text-white">App Icon &amp; Listing Details</p>
                    </div>
                  </div>

                  {/* Optional App Icon Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-black p-3.5 rounded-xl border border-white/[0.06]">
                    <img
                      src={previewIcon}
                      alt="App Icon Preview"
                      className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/15 shrink-0"
                      onError={() => setIconPreviewFailed(true)}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs font-bold text-white">App Icon (Optional · PNG/JPG/WebP)</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Displayed on your store listing card and detail page. Defaults to MRS store icon if omitted.
                      </p>
                    </div>
                    <label className="cursor-pointer px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0">
                      {uploadingIcon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingIcon ? 'Uploading...' : iconUrl ? 'Change Icon' : 'Upload Icon'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleIconSelected}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        App Name *
                      </label>
                      <input
                        type="text"
                        value={appTitle}
                        onChange={(e) => setAppTitle(e.target.value)}
                        placeholder="e.g. StreamPlayer TV"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Version *
                      </label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {APP_STORE_CATEGORIES.map((catName) => (
                          <option key={catName} value={catName}>
                            {catName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Target Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
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
                      className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white font-mono focus:outline-none focus:border-blue-500"
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
                      placeholder="Describe features, device compatibility, and what's new in this build..."
                      className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* App Owner Details + Gravatar Lookup */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      App Owner Identity (Shown on App Page)
                    </span>
                    <p className="text-sm font-bold text-white">Owner &amp; Developer Contact</p>
                  </div>

                  {/* Optional Gravatar Profile Fetch */}
                  <div className="bg-black p-3.5 rounded-xl border border-white/[0.06] space-y-2.5">
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      Gravatar Username or URL (Optional Auto-Fill)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={gravatarHandle}
                        onChange={(e) => setGravatarHandle(e.target.value)}
                        placeholder="e.g. mrxshahin or https://gravatar.com/username"
                        className="flex-1 bg-zinc-900 border border-white/[0.12] rounded-xl px-3.5 py-2 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleLookupGravatar}
                        disabled={lookingUpGravatar}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {lookingUpGravatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{lookingUpGravatar ? 'Fetching...' : 'Fetch Gravatar'}</span>
                      </button>
                    </div>
                    {gravatarMessage && (
                      <p className="text-[11px] text-zinc-400">{gravatarMessage}</p>
                    )}
                    {ownerProfile && (
                      <div className="flex items-center gap-3 pt-1">
                        {ownerProfile.avatarUrl && !gravatarAvatarFailed ? (
                          <img
                            src={ownerProfile.avatarUrl}
                            alt={ownerProfile.displayName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={() => setGravatarAvatarFailed(true)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-white truncate">
                            {ownerProfile.displayName} (@{ownerProfile.username})
                          </p>
                          <p className="text-[11px] text-emerald-400 truncate">
                            {ownerProfile.accounts?.length || 0} verified social links attached
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        App Owner Name *
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Owner Full Name or Handle"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        Developer / Studio Name *
                      </label>
                      <input
                        type="text"
                        value={developerName}
                        onChange={(e) => setDeveloperName(e.target.value)}
                        placeholder="Your Studio or Organization"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                        App Owner Contact Email *
                      </label>
                      <input
                        type="email"
                        value={developerEmail}
                        onChange={(e) => setDeveloperEmail(e.target.value)}
                        placeholder="owner@domain.com"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
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
                    <span>Support:</span>
                    <button
                      type="button"
                      onClick={() => copyText('adminEmail', adminEmail)}
                      className="text-blue-400 font-mono hover:underline"
                    >
                      {copiedKey === 'adminEmail' ? 'Copied!' : adminEmail}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueToStep2}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-600/25"
                  >
                    <span>Continue to Verify Payment ($25)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFY PAYMENT */}
            {currentStep === 2 && (
              <form onSubmit={handleVerifyPayment} className="space-y-5">
                {/* Summary Bar */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={previewIcon}
                      alt={appTitle}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                      onError={() => setIconPreviewFailed(true)}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">
                        {appTitle} · v{version}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        Owner: {ownerName} ({developerEmail})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>

                {/* Payment Verification Panel */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Step 2 of 3 · One-Time Fee Verification
                      </span>
                      <p className="text-sm font-bold text-white">
                        Pay &amp; Verify <span className="text-emerald-400">$25.00 USD</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex p-1 bg-black rounded-xl border border-white/[0.08] w-full sm:w-auto gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentOption('USDT_BEP20');
                          setFormError(null);
                          setPendingBinanceReceipt(null);
                        }}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                          paymentOption === 'USDT_BEP20'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        USDT (BEP-20)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentOption('BINANCE_PAY');
                          setFormError(null);
                          setPendingBinanceReceipt(null);
                        }}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
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
                      {!qrFailed ? (
                        <img
                          src={activeMethod.qrImage}
                          alt={activeMethod.displayName}
                          className="w-full h-full object-contain rounded-lg"
                          onError={() => setQrFailed(true)}
                        />
                      ) : (
                        <div className="text-center px-2 text-[10px] font-mono text-zinc-400">
                          {activeMethod.title}
                        </div>
                      )}
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
                        onClick={() => copyText('payDest', activeMethod.value)}
                        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                      >
                        {copiedKey === 'payDest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'payDest' ? 'Copied!' : `Copy ${activeMethod.label}`}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      {paymentOption === 'USDT_BEP20'
                        ? 'USDT (BEP-20) Transaction Hash (TxHash) *'
                        : 'Binance Pay Order ID *'}
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => {
                        setTxHash(e.target.value);
                        if (verificationToken) {
                          setVerificationToken(null);
                          setVerifiedPaymentInfo(null);
                        }
                      }}
                      placeholder={
                        paymentOption === 'USDT_BEP20'
                          ? '0x... (66-character BEP-20 TxHash after sending $25 USDT)'
                          : 'Paste your Binance Pay Order ID after paying mrxshahin'
                      }
                      className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {verifiedPaymentInfo && verificationToken && (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          Verified ${verifiedPaymentInfo.amountPaidUsd?.toFixed(2)} {verifiedPaymentInfo.tokenSymbol}
                        </span>
                      </div>
                      {verifiedPaymentInfo.explorerUrl && (
                        <a
                          href={verifiedPaymentInfo.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>BscScan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-zinc-300 font-mono text-[11px]">
                      Block #{verifiedPaymentInfo.blockNumber} · {verifiedPaymentInfo.confirmations} confirmations
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Upload App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {pendingBinanceReceipt && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">
                          Binance Pay Order Recorded · Status: Under Review
                        </p>
                        <p className="text-zinc-300 mt-1 leading-relaxed">{pendingBinanceReceipt.message}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] bg-black/60 p-3 rounded-xl border border-white/[0.06]">
                      <div>
                        <span className="text-zinc-500 block">Invoice Number</span>
                        <span className="text-white">{pendingBinanceReceipt.submission.invoiceNumber}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Order ID</span>
                        <span className="text-amber-300 break-all">
                          {pendingBinanceReceipt.submission.paymentDetails.cryptoTxHash}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={pendingBinanceReceipt.mailtoUrl}
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold inline-flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Order Proof to {adminEmail}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('receipts')}
                        className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold"
                      >
                        View Recorded Receipts
                      </button>
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Details</span>
                  </button>

                  <button
                    type="submit"
                    disabled={verifyingPayment}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-60 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-600/25"
                  >
                    {verifyingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {paymentOption === 'USDT_BEP20'
                            ? 'Verifying on BNB Smart Chain...'
                            : 'Recording Order ID...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {paymentOption === 'USDT_BEP20'
                            ? 'Verify On-Chain & Unlock Upload'
                            : 'Submit Order ID for Review'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: UPLOAD APP & PUBLISH LIVE */}
            {currentStep === 3 && (
              <form onSubmit={handleFinalizePublish} className="space-y-5">
                {verifiedPaymentInfo && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Payment Verified · ${verifiedPaymentInfo.amountPaidUsd?.toFixed(2) || '25.00'} USD ({verifiedPaymentInfo.tokenSymbol || verifiedPaymentInfo.paymentMethod})
                      </span>
                    </div>
                    {verifiedPaymentInfo.explorerUrl && (
                      <a
                        href={verifiedPaymentInfo.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                      >
                        <span>Block #{verifiedPaymentInfo.blockNumber}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Step 3 of 3 · Upload Android Package
                      </span>
                      <p className="text-sm font-bold text-white">Upload Verified .apk Binary</p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex p-1 bg-black rounded-xl border border-white/[0.08] w-full sm:w-auto gap-1">
                      <button
                        type="button"
                        onClick={() => setApkSourceMode('upload')}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1 transition-all ${
                          apkSourceMode === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5 shrink-0" />
                        <span>Upload .apk</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setApkSourceMode('url')}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1 transition-all ${
                          apkSourceMode === 'url'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        <span>APK URL</span>
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
                            ? 'Inspecting AndroidManifest.xml & computing SHA-256...'
                            : uploadedApk
                            ? `Verified: ${uploadedApk.fileName} (${uploadedApk.size})`
                            : 'Choose .apk file from your device'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {hasBackend
                            ? 'Validates ZIP signature, inspects AndroidManifest.xml, computes SHA-256, and hosts APK on store server.'
                            : 'Computes exact MB size & SHA-256 locally in-browser (enter your direct HTTPS APK URL below).'}
                        </span>
                        <input
                          type="file"
                          accept=".apk,application/vnd.android.package-archive"
                          onChange={handleApkSelected}
                          className="hidden"
                        />
                      </label>

                      {uploadedApk && (
                        <div className="p-3 rounded-lg bg-zinc-900 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-emerald-400 font-bold">SHA-256 Verified</span>
                            {uploadedApk.hasManifest && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                                AndroidManifest.xml ✓
                              </span>
                            )}
                            {uploadedApk.hasClassesDex && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px]">
                                classes.dex ✓
                              </span>
                            )}
                            {typeof uploadedApk.entryCount === 'number' && uploadedApk.entryCount > 0 && (
                              <span className="text-zinc-400 text-[10px]">
                                {uploadedApk.entryCount} entries
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-300 break-all">{uploadedApk.sha256}</p>
                          {uploadedApk.architectures && uploadedApk.architectures.length > 0 && (
                            <p className="text-zinc-400 inline-flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-blue-400" />
                              <span>ABIs: {uploadedApk.architectures.join(', ')}</span>
                            </p>
                          )}
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
                        value={apkDownloadUrl}
                        onChange={(e) => setApkDownloadUrl(e.target.value)}
                        placeholder="https://example.com/downloads/your-app.apk"
                        className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Store Listing Preview Card */}
                  <div className="p-3.5 rounded-xl bg-black/70 border border-white/[0.06] space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Live Store Listing Preview
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={previewIcon}
                        alt={appTitle}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/15 shrink-0"
                        onError={() => setIconPreviewFailed(true)}
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-white truncate">{appTitle}</p>
                        <p className="text-zinc-400 truncate">
                          {developerName} · Owner: {ownerName} · v{version}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {category} · {platform}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Payment</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || uploadingApk}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-600/25"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing Live...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish App Live to MRS App Store</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
