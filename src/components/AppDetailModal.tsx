import React, { useState } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  Star,
  Copy,
  Check,
  Tv,
  Smartphone,
  ExternalLink,
  Share2,
  QrCode,
  Link2,
  HardDrive
} from 'lucide-react';
import { AppItem } from '../types';

interface AppDetailModalProps {
  app: AppItem | null;
  onClose: () => void;
  onDirectDownload: (app: AppItem) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  onClose,
  onDirectDownload,
}) => {
  if (!app) return null;

  const [copiedDownloadLink, setCopiedDownloadLink] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const directDownloadUrl = `${window.location.origin}/api/download/${app.id}`;
  const shareUrl = `${window.location.origin}/?app=${app.id}`;

  const handleCopyDownloadLink = () => {
    navigator.clipboard.writeText(directDownloadUrl);
    setCopiedDownloadLink(true);
    setTimeout(() => setCopiedDownloadLink(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${app.title} - Official APK`,
        text: `Download ${app.title} (${app.fileName}) direct APK from MRS App Store.`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  const triggerDownload = () => {
    setDownloadStarted(true);
    onDirectDownload(app);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-white/[0.1] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl my-auto text-zinc-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Store Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Product Header (Apple App Store format) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-white/[0.08]">
          <img
            src={app.icon}
            alt={app.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-[22%] object-cover ring-2 ring-white/15 shadow-2xl shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {app.title}
            </h2>
            <p className="text-sm font-semibold text-blue-400 mt-1">
              {app.developer}
            </p>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Package: {app.fileName} · {app.platform}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* GET Button */}
              <button
                type="button"
                onClick={triggerDownload}
                className={`inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all min-h-[42px] shadow-lg ${
                  downloadStarted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
                }`}
              >
                {downloadStarted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Downloading APK...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>GET APK</span>
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleNativeShare}
                title="Share this App"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all min-h-[42px]"
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share App</span>
                  </>
                )}
              </button>

              {/* QR Code Toggle */}
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                title="Scan QR to Download"
                className={`p-2.5 rounded-full border transition-all ${
                  showQrCode
                    ? 'bg-blue-600/30 text-blue-400 border-blue-500/50'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-300 border-transparent'
                }`}
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Apple 5-Column Metrics Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-6 border-b border-white/[0.08] text-center">
          <div className="border-r border-white/[0.08] last:border-none pr-2">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Ratings</p>
            <p className="text-base font-extrabold text-white mt-1 flex items-center justify-center gap-1">
              <span>{app.rating.toFixed(1)}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </p>
            <p className="text-[10px] text-zinc-500">{app.reviewsCount.toLocaleString()} Reviews</p>
          </div>

          <div className="border-r border-white/[0.08] last:border-none pr-2">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Age</p>
            <p className="text-base font-extrabold text-white mt-1">4+</p>
            <p className="text-[10px] text-zinc-500">Years Old</p>
          </div>

          <div className="border-r border-white/[0.08] last:border-none pr-2">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Category</p>
            <p className="text-base font-extrabold text-blue-400 mt-1 truncate">{app.category}</p>
            <p className="text-[10px] text-zinc-500">Featured</p>
          </div>

          <div className="border-r border-white/[0.08] last:border-none pr-2 hidden sm:block">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Size</p>
            <p className="text-base font-extrabold text-white mt-1 font-mono">{app.size}</p>
            <p className="text-[10px] text-zinc-500">Direct Binary</p>
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Hosting</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1">Self-Hosted</p>
            <p className="text-[10px] text-zinc-500">Direct CDN</p>
          </div>
        </div>

        {/* QR Code Scan Box (Optional Dropdown) */}
        {showQrCode && (
          <div className="my-6 p-5 rounded-2xl bg-zinc-900 border border-blue-500/30 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in duration-200">
            <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(directDownloadUrl)}`}
                alt="Direct Download QR Code"
                className="w-36 h-36"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>Scan for Instant Mobile / Smart TV Download</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">Point your Camera or TV Remote</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Scan this QR code with your smartphone or Smart TV barcode scanner to download <span className="text-white font-mono">{app.fileName}</span> directly without typing any URL.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={handleCopyDownloadLink}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                >
                  {copiedDownloadLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDownloadLink ? 'Copied' : 'Copy Download Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Specific Download & Share Links Card */}
        <div className="my-6 space-y-3">
          {/* Specific Direct Download Link */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Specific Direct APK Download Link</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Direct Binary</span>
                </p>
                <p className="text-xs text-zinc-400 font-mono truncate mt-0.5 max-w-xs sm:max-w-md">
                  {directDownloadUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCopyDownloadLink}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedDownloadLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDownloadLink ? 'Copied Link' : 'Copy Download Link'}</span>
              </button>

              <button
                type="button"
                onClick={triggerDownload}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Specific Sharing Link */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Specific App Sharing Page Link</span>
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Shareable</span>
                </p>
                <p className="text-xs text-zinc-400 font-mono truncate mt-0.5 max-w-xs sm:max-w-md">
                  {shareUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShareLink ? 'Copied Link' : 'Copy Share Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Screenshots Showcase (Apple App Store style preview) */}
        <div className="my-6">
          <h3 className="text-base font-bold text-white mb-3">Preview</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="w-72 sm:w-80 h-72 sm:h-80 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl">
              <img
                src={app.icon}
                alt="App Screenshot"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-72 sm:w-80 h-72 sm:h-80 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-950 via-zinc-900 to-black p-6 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{app.platform}</span>
                <h4 className="text-xl font-bold text-white mt-2">{app.tagline}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Engineered specifically for Android TV boxes, Firestick, and Android mobile devices with ultra-low latency channel switching.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Self-Hosted Direct In-House Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's New Version History */}
        <div className="my-6 p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs mb-3">
            <h3 className="text-sm font-bold text-white">What’s New</h3>
            <span className="text-zinc-400">Version {app.version} · {app.updatedAt}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {app.whatsNew.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 select-none">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Description & Key Capabilities */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Description</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              {app.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              {app.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Apple Store Information Table */}
          <div className="pt-4 border-t border-white/[0.08]">
            <h3 className="text-base font-bold text-white mb-3">Information</h3>
            <dl className="divide-y divide-white/[0.06] text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Provider</dt>
                <dd className="text-zinc-200 font-medium">{app.developer}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Contact Email</dt>
                <dd className="text-blue-400 font-medium font-mono">{app.developerEmail}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">File Package</dt>
                <dd className="text-zinc-200 font-mono">{app.fileName}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Size</dt>
                <dd className="text-zinc-200 font-mono">{app.size}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Category</dt>
                <dd className="text-zinc-200">{app.category}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Compatibility</dt>
                <dd className="text-zinc-200">{app.minAndroid}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Price</dt>
                <dd className="text-emerald-400 font-bold">Free Direct Download</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-zinc-400">Hosting Provider</dt>
                <dd className="text-emerald-400 font-semibold">MRS App Store (Self-Hosted CDN)</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
