import React, { useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Send
} from 'lucide-react';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const adminEmail = 'mr216873@gmail.com';
  const publishingFee = '$25.00 USD';

  const [paymentOption, setPaymentOption] = useState<'USDT_BEP20' | 'BINANCE_PAY'>('USDT_BEP20');
  const [appTitle, setAppTitle] = useState('');
  const [apkDownloadUrl, setApkDownloadUrl] = useState('');
  const [platform, setPlatform] = useState('Smart TV & Android Mobile');
  const [txHash, setTxHash] = useState('');
  const [developerName, setDeveloperName] = useState('');

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  // Exact data from user's uploaded Binance QR codes
  const paymentDetails = {
    USDT_BEP20: {
      title: 'Deposit USDT (BEP20)',
      network: 'BNB Smart Chain (BEP20)',
      label: 'Deposit Wallet Address',
      value: '0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e',
      qrImage: './assets/aistudio/unnamed__2__145559af.png',
      instructions: 'Deposit $25 USDT via BNB Smart Chain (BEP20)',
      notice: "Don't send NFTs to this address.",
    },
    BINANCE_PAY: {
      title: 'Binance Pay',
      network: 'Binance App (Instant Zero Fee)',
      label: 'Binance Pay ID / Username',
      value: 'mrxshahin',
      qrImage: './assets/aistudio/unnamed__1__2b5c7e8c.png',
      instructions: 'Scan with Binance App to pay $25 USD',
      notice: 'Send payment directly to Binance ID: mrxshahin',
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

  const emailSubject = encodeURIComponent(
    `[App Publishing Request] ${appTitle || 'New Application'} - Payment Verified ($25 USD)`
  );

  const emailBodyText = `Hello MRS App Store Team (mr216873@gmail.com),

I have completed the $25.00 USD publishing fee via ${activeMethod.title} for my application. Below are my submission details:

--- APPLICATION DETAILS ---
App Name: ${appTitle || '[Enter App Name]'}
Target Platform: ${platform}
Direct APK Download Link: ${apkDownloadUrl || '[Enter Direct APK URL]'}
Developer Name: ${developerName || '[Enter Developer Name]'}

--- PAYMENT DETAILS ($25.00 USD) ---
Method: ${activeMethod.title}
Network: ${activeMethod.network}
Destination: ${activeMethod.value}
Transaction Hash / Order ID: ${txHash || '[Paste Transaction Hash / Order ID here]'}

Please review my APK and publish it to the MRS App Store catalog.

Thank you!`;

  const mailtoLink = `mailto:${adminEmail}?subject=${emailSubject}&body=${encodeURIComponent(
    emailBodyText
  )}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(emailBodyText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-zinc-950 border border-white/[0.1] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl my-auto text-zinc-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-5 border-b border-white/[0.08]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Crypto &amp; Binance Payment</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Publish App on MRS App Store
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Send <strong className="text-white">{publishingFee}</strong> using Binance Pay or USDT BEP20, then email your APK link to <strong className="text-blue-400 font-mono">{adminEmail}</strong>.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* STEP 1: QR Payment Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Step 1: Scan &amp; Pay</span>
                <p className="text-sm font-bold text-white">Publishing Fee: <span className="text-emerald-400">{publishingFee}</span></p>
              </div>

              {/* Payment Method Switcher */}
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

            {/* Render User Uploaded QR Code & Details */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black p-4 rounded-xl border border-white/[0.06]">
              {/* QR Code Container */}
              <div className="w-36 h-36 bg-zinc-950 p-1.5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg overflow-hidden group">
                <img
                  src={activeMethod.qrImage}
                  alt={activeMethod.title}
                  className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-white">{activeMethod.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                    {activeMethod.network}
                  </span>
                </div>

                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">
                  {activeMethod.label}
                </span>

                <p className="text-xs font-mono text-zinc-200 break-all select-all bg-zinc-900 p-2.5 rounded-lg border border-white/[0.06]">
                  {activeMethod.value}
                </p>

                <p className="text-[11px] text-zinc-400 italic">
                  {activeMethod.notice}
                </p>

                <button
                  type="button"
                  onClick={handleCopyValue}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  {copiedValue ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedValue ? 'Copied to Clipboard!' : `Copy ${activeMethod.label}`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: Email Submission to mr216873@gmail.com */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Step 2: Submit Details</span>
                <p className="text-sm font-bold text-white">Send Application to Email</p>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-blue-400 font-mono text-xs font-semibold transition-all"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied' : adminEmail}</span>
              </button>
            </div>

            {/* Quick Helper Fields (Pre-fills the email) */}
            <div className="space-y-3 bg-black p-4 rounded-xl border border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="e.g. M R S IPTV Plus"
                  className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Direct APK Download Link
                </label>
                <input
                  type="text"
                  value={apkDownloadUrl}
                  onChange={(e) => setApkDownloadUrl(e.target.value)}
                  placeholder="https://example.com/your-app.apk"
                  className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Target Device
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Smart TV & Android Mobile">Smart TV &amp; Android Mobile</option>
                    <option value="Smart TV (Firestick / Android TV)">Smart TV (Firestick / Android TV)</option>
                    <option value="Android Mobile">Android Mobile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Crypto TxHash / Proof
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Paste transaction hash or TxID"
                    className="w-full bg-zinc-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Direct Mail Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href={mailtoLink}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30"
              >
                <Send className="w-4 h-4" />
                <span>Send Email to {adminEmail}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate ? 'Copied Text' : 'Copy Email Text'}</span>
              </button>
            </div>
          </div>

          {/* Simple Note */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.08]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct administrator review via mr216873@gmail.com</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
