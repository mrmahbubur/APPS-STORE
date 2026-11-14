import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  Star,
  Copy,
  Check,
  Tv,
  Smartphone,
  Monitor,
  Share2,
  QrCode,
  Link2,
  HardDrive,
  UserCheck,
  ThumbsUp,
  MessageSquarePlus,
  Lock,
  ChevronDown,
  ChevronUp,
  Send,
  Globe,
  Tablet,
} from 'lucide-react';
import { AppItem, ReviewItem, ReviewStats } from '../types';
import {
  copyToClipboard,
  getAppLocalApkUrl,
  normalizeAssetPath,
  computeReviewStats,
  getLocalReviews,
  saveLocalReview,
  markLocalReviewHelpful,
} from '../data/catalog';

interface AppDetailModalProps {
  app: AppItem | null;
  onClose: () => void;
  onDirectDownload: (app: AppItem) => void;
  hasBackend?: boolean;
  onReviewStatsUpdated?: (appId: string, rating: number, reviewsCount: number) => void;
  onOpenLegal?: (tab: 'privacy' | 'terms' | 'developer' | 'dmca') => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  onClose,
  onDirectDownload,
  hasBackend = true,
  onReviewStatsUpdated,
  onOpenLegal,
}) => {
  const [copiedDownloadLink, setCopiedDownloadLink] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [iconImgError, setIconImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Real Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewDevice, setReviewDevice] = useState('Android Mobile');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState(false);
  const [helpfulClickedIds, setHelpfulClickedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!app) return;
    const isWin =
      /windows/i.test(app.platform || '') ||
      /\.(exe|msi|msix|msixbundle|appx|appxbundle)$/i.test(app.fileName || '');
    const isHyb = isWin && /android|smart tv/i.test(app.platform || '');
    setReviewDevice(isWin && !isHyb ? 'Windows 11 PC' : 'Android Mobile');
    setShowQrCode(false);
    setShowSharePanel(false);
    setShowPermissions(false);
    setShowReviewForm(false);
    setReviewSubmittedNotice(false);
    setIconImgError(false);
    setAvatarImgError(false);

    const loadReviews = async () => {
      if (hasBackend) {
        try {
          const res = await fetch(`./api/reviews/${app.id}`);
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data.reviews)) {
              setReviews(data.reviews);
              setReviewStats(data.stats || computeReviewStats(data.reviews));
              return;
            }
          }
        } catch (err) {
          console.warn('Using local reviews store:', err);
        }
      }
      const localList = getLocalReviews(app.id);
      setReviews(localList);
      setReviewStats(computeReviewStats(localList));
    };

    loadReviews();
  }, [app, hasBackend]);

  useEffect(() => {
    if (!app) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [app, onClose]);

  if (!app) return null;

  const pathname = window.location.pathname || '/';
  const basePath = pathname.endsWith('/')
    ? pathname
    : pathname.split('/').pop()?.includes('.')
    ? pathname.replace(/\/[^/]*$/, '/')
    : `${pathname}/`;
  const staticApkRel = getAppLocalApkUrl(app);
  const directDownloadUrl = hasBackend
    ? `${window.location.origin}${basePath}api/download/${app.id}`
    : staticApkRel.startsWith('http://') || staticApkRel.startsWith('https://')
    ? staticApkRel
    : `${window.location.origin}${basePath}${staticApkRel.replace(/^\.\//, '')}`;
  const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;

  const handleCopyDownloadLink = async () => {
    await copyToClipboard(directDownloadUrl);
    setCopiedDownloadLink(true);
    setTimeout(() => setCopiedDownloadLink(false), 2000);
  };

  const handleCopyShareLink = async () => {
    await copyToClipboard(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const appOwnerName = app.ownerProfile?.displayName || app.ownerName || app.developer;

  const handleCopySha = async () => {
    await copyToClipboard(app.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${app.title} — Official APK`,
        text: `Download ${app.title} (${app.fileName}) directly from MRS App Store.`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyShareLink();
      setShowSharePanel(true);
    }
  };

  const triggerDownload = () => {
    setDownloadStarted(true);
    onDirectDownload(app);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);

    try {
      if (hasBackend) {
        const res = await fetch(`./api/reviews/${app.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: reviewerName.trim(),
            title: reviewTitle.trim() || `${newRating}-Star Experience`,
            rating: newRating,
            device: reviewDevice,
            comment: reviewComment.trim(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews);
          setReviewStats(data.stats);
          if (onReviewStatsUpdated) {
            onReviewStatsUpdated(app.id, data.stats.averageRating, data.stats.totalReviews);
          }
          setReviewerName('');
          setReviewTitle('');
          setReviewComment('');
          setNewRating(5);
          setShowReviewForm(false);
          setReviewSubmittedNotice(true);
          setTimeout(() => setReviewSubmittedNotice(false), 4000);
          return;
        }
      }

      // Offline / GitHub Pages persistence
      const newRev: ReviewItem = {
        id: `rev-local-${Date.now()}`,
        appId: app.id,
        author: reviewerName.trim(),
        title: reviewTitle.trim() || `${newRating}-Star Experience`,
        rating: newRating,
        device: reviewDevice,
        comment: reviewComment.trim(),
        helpfulCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updatedList = saveLocalReview(app.id, newRev);
      const nextStats = computeReviewStats(updatedList);
      setReviews(updatedList);
      setReviewStats(nextStats);
      if (onReviewStatsUpdated) {
        onReviewStatsUpdated(app.id, nextStats.averageRating, nextStats.totalReviews);
      }
      setReviewerName('');
      setReviewTitle('');
      setReviewComment('');
      setNewRating(5);
      setShowReviewForm(false);
      setReviewSubmittedNotice(true);
      setTimeout(() => setReviewSubmittedNotice(false), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClickedIds[reviewId]) return;
    setHelpfulClickedIds((prev) => ({ ...prev, [reviewId]: true }));

    if (hasBackend) {
      try {
        const res = await fetch(`./api/reviews/${app.id}/${reviewId}/helpful`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews);
          return;
        }
      } catch {}
    }
    const updated = markLocalReviewHelpful(app.id, reviewId);
    setReviews(updated);
  };

  const displayRating = reviews.length > 0 ? reviewStats.averageRating : app.rating;
  const displayReviewsCount = reviews.length > 0 ? reviewStats.totalReviews : app.reviewsCount;
  const isWindowsApp =
    /windows/i.test(app.platform || '') ||
    /\.(exe|msi|msix|msixbundle|appx|appxbundle)$/i.test(app.fileName || '');
  const isHybridApp = isWindowsApp && /android|smart tv/i.test(app.platform || '');
  const lowerFile = (app.fileName || '').toLowerCase();
  const packageFormatLabel = lowerFile.endsWith('.exe')
    ? 'Direct EXE'
    : lowerFile.endsWith('.msi')
    ? 'Direct MSI'
    : lowerFile.endsWith('.msix') || lowerFile.endsWith('.msixbundle')
    ? 'Direct MSIX'
    : lowerFile.endsWith('.appx') || lowerFile.endsWith('.appxbundle')
    ? 'Direct APPX'
    : lowerFile.endsWith('.zip')
    ? 'Direct ZIP'
    : isWindowsApp
    ? 'Direct Package'
    : 'Direct APK';

  const shareText = encodeURIComponent(`Download ${app.title} (${app.fileName}) directly from MRS App Store`);
  const encodedShareUrl = encodeURIComponent(shareUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#1c1c1e] border-t sm:border border-white/[0.1] rounded-t-[28px] sm:rounded-[28px] px-4 pt-0 sm:px-9 shadow-2xl sm:my-auto text-zinc-100 max-h-[94dvh] sm:max-h-[90dvh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Apple Sheet Top Bar */}
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-9 px-4 sm:px-9 pt-2 pb-3 sm:py-3 mb-5 bg-[#1c1c1e]/90 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08]">
          <div className="w-9 h-1 rounded-full bg-white/25 mx-auto mb-2 sm:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {!iconImgError ? (
                <img
                  src={normalizeAssetPath(app.icon)}
                  alt=""
                  aria-hidden="true"
                  onError={() => setIconImgError(true)}
                  className="w-7 h-7 rounded-[22.5%] object-cover ring-1 ring-white/15 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/15 flex items-center justify-center text-[#0a84ff] shrink-0">
                  {isWindowsApp && !isHybridApp ? (
                    <Monitor className="w-3.5 h-3.5" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5" />
                  )}
                </div>
              )}
              <span className="text-xs sm:text-sm font-bold text-white truncate">{app.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerDownload}
                className="px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0a84ff] text-white text-xs font-bold whitespace-nowrap min-h-[38px] transition-colors"
              >
                {downloadStarted ? 'Downloading...' : 'GET'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.1] hover:bg-white/[0.18] text-zinc-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close app details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. Apple App Store Product Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b border-white/[0.08]">
          {!iconImgError ? (
            <img
              src={normalizeAssetPath(app.icon)}
              alt={app.title}
              onError={() => setIconImgError(true)}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-[22.5%] object-cover ring-1 ring-white/15 shadow-2xl shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/15 flex items-center justify-center text-[#0a84ff] shrink-0">
              {isWindowsApp && !isHybridApp ? (
                <Monitor className="w-10 h-10" />
              ) : (
                <Smartphone className="w-10 h-10" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {app.title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 leading-snug">
              {app.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-2">
              <a
                href="#owner-info-section"
                className="font-semibold text-blue-400 hover:underline"
              >
                {app.developer}
              </a>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">{app.fileName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              {/* Primary Apple GET Button */}
              <button
                type="button"
                onClick={triggerDownload}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full font-extrabold text-xs tracking-wider transition-all min-h-[44px] shadow-lg ${
                  downloadStarted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-95'
                }`}
              >
                {downloadStarted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isWindowsApp ? 'Downloading Package' : 'Downloading APK'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>GET · {app.size}</span>
                  </>
                )}
              </button>

              {/* Share Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSharePanel(!showSharePanel)}
                className={`flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors min-h-[44px] ${
                  showSharePanel
                    ? 'bg-white text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Share App</span>
              </button>

              {/* QR Toggle Button */}
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                title="Scan QR Code to Download"
                className={`p-2.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  showQrCode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-zinc-200'
                }`}
                aria-label="Toggle QR download code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Apple 5-Column Horizontal Metrics Strip */}
        <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto no-scrollbar divide-x divide-white/[0.08] py-4 border-b border-white/[0.08] text-center">
          <div className="min-w-[116px] sm:min-w-0 px-3">
            <p className="text-[11px] text-zinc-400 font-semibold">
              {displayReviewsCount} {displayReviewsCount === 1 ? 'Rating' : 'Ratings'}
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1 tabular-nums flex items-center justify-center gap-1">
              <span>{displayReviewsCount > 0 ? displayRating.toFixed(1) : '—'}</span>
              <Star className={`w-4 h-4 ${displayReviewsCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {displayReviewsCount > 0 ? 'User Average' : 'No ratings yet'}
            </p>
          </div>

          <div className="min-w-[116px] sm:min-w-0 px-3">
            <p className="text-[11px] text-zinc-400 font-semibold">Min OS</p>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1 tabular-nums">
              {isHybridApp ? 'Win · TV' : isWindowsApp ? 'Win 10/11' : '8.0+'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
              {isHybridApp
                ? 'Cross-Platform'
                : isWindowsApp
                ? '64-bit / ARM64'
                : 'Android API 26'}
            </p>
          </div>

          <div className="min-w-[126px] sm:min-w-0 px-3">
            <p className="text-[11px] text-zinc-400 font-semibold">Version</p>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1 tabular-nums">v{app.version}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{app.category}</p>
          </div>

          <div className="min-w-[136px] sm:min-w-0 px-3">
            <p className="text-[11px] text-zinc-400 font-semibold">Owner</p>
            <p className="text-sm font-bold text-white mt-1.5 sm:mt-2 truncate">{appOwnerName}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 sm:mt-1 truncate">{app.developer}</p>
          </div>

          <div className="min-w-[116px] sm:min-w-0 px-3">
            <p className="text-[11px] text-zinc-400 font-semibold">Size</p>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1 tabular-nums">{app.size}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">{packageFormatLabel}</p>
          </div>
        </div>

        {/* Optional QR Box */}
        {showQrCode && (
          <div className="my-6 p-5 rounded-2xl bg-zinc-900 border border-blue-500/30 flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(directDownloadUrl)}`}
                alt="Direct Package QR Code"
                className="w-36 h-36"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-base font-bold text-white">Scan QR to Transfer Download Link</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Scan this QR code or copy the direct link to download{' '}
                <span className="text-white font-mono">{app.fileName}</span> directly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={handleCopyDownloadLink}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white inline-flex items-center gap-1.5"
                >
                  {copiedDownloadLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedDownloadLink
                      ? 'Download Link Copied'
                      : isWindowsApp
                      ? 'Copy Direct Package Link'
                      : 'Copy Direct APK Link'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. App Sharing & Direct Distribution Section */}
        <section className={`my-6 space-y-3 ${showSharePanel ? 'p-5 rounded-2xl bg-zinc-900/90 border border-blue-500/30' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white">Share App &amp; Direct Links</h3>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/?text=${shareText}%20${encodedShareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodedShareUrl}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-semibold transition-colors"
              >
                Telegram
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedShareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Share on X
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-3.5 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold transition-colors inline-flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>System Share</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Direct APK Binary Link */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">
                    {isWindowsApp ? 'Direct Package Download Link' : 'Direct APK Download Link'}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">{directDownloadUrl}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyDownloadLink}
                className="w-full sm:w-auto justify-center px-3.5 py-2 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs shrink-0 inline-flex items-center gap-1.5"
              >
                {copiedDownloadLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDownloadLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Specific App Share URL */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">App Sharing Page Link</p>
                  <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">{shareUrl}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto justify-center px-3.5 py-2 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs shrink-0 inline-flex items-center gap-1.5"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShareLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4. Preview Gallery */}
        <section className="my-7 pt-6 border-t border-white/[0.08]">
          <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
            <div className="w-56 sm:w-72 h-56 sm:h-72 shrink-0 snap-start rounded-2xl overflow-hidden border border-white/10 bg-black">
              <img
                src={normalizeAssetPath(app.icon)}
                alt={`${app.title} Preview`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-64 sm:w-80 h-56 sm:h-72 shrink-0 snap-start rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-blue-400">{app.platform}</p>
                <h4 className="text-base sm:text-lg font-bold text-white mt-2">{app.title}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">{app.tagline}</p>
              </div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Verified Clean Binary · {app.size}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. What's New */}
        <section className="my-7 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">What’s New</h3>
            <span className="text-xs text-zinc-400 tabular-nums">
              Version {app.version} · {app.updatedAt}
            </span>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            {app.whatsNew.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-blue-400 font-bold select-none">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Details About This App & Key Features */}
        <section className="my-7 pt-6 border-t border-white/[0.08] space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">About {app.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {app.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2">Key Features</h4>
            <ul className="divide-y divide-white/[0.06] text-xs text-zinc-300">
              {app.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5 py-2.5">
                  <Check className="w-3.5 h-3.5 text-[#0a84ff] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compatibility */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Compatibility</h4>
            {isWindowsApp && !isHybridApp ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Windows 10 / 11 PC</p>
                    <p className="text-zinc-400">{app.minAndroid || '64-bit / ARM64'}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Package Format</p>
                    <p className="text-zinc-400">{packageFormatLabel}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Desktop Integrity</p>
                    <p className="text-zinc-400">SHA-256 Verified Build</p>
                  </div>
                </div>
              </div>
            ) : isHybridApp ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Windows 10 / 11 PC</p>
                    <p className="text-zinc-400">Desktop &amp; Surface</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Android Mobile</p>
                    <p className="text-zinc-400">Android 8.0+ (API 26)</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Smart TV &amp; Tablet</p>
                    <p className="text-zinc-400">Android TV / Firestick</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Android Mobile</p>
                    <p className="text-zinc-400">{app.minAndroid.split('(')[0].trim()}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Smart TV &amp; Firestick</p>
                    <p className="text-zinc-400">Android TV / Google TV</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3">
                  <Tablet className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Android Tablet</p>
                    <p className="text-zinc-400">HD &amp; Landscape Ready</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 7. Real Ratings & Reviews (Apple App Store Interactive Section) */}
        <section className="my-7 pt-6 border-t border-white/[0.08] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Ratings &amp; Reviews</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Real verified user ratings &amp; feedback</p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold transition-colors min-h-[40px]"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
            </button>
          </div>

          {reviewSubmittedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Thank you! Your rating and review have been published live.</span>
            </div>
          )}

          {/* Apple Score + 5-Star Distribution Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-zinc-900/50 border border-white/[0.07]">
            <div className="sm:col-span-4 text-center sm:text-left">
              <div className="text-5xl font-black text-white tabular-nums tracking-tight">
                {displayReviewsCount > 0 ? displayRating.toFixed(1) : '—'}
              </div>
              <p className="text-xs font-semibold text-zinc-400 mt-1">
                {displayReviewsCount > 0 ? 'out of 5' : 'No ratings yet'}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      displayReviewsCount > 0 && star <= Math.round(displayRating)
                        ? 'fill-current'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-1.5 tabular-nums">
                {displayReviewsCount} Total {displayReviewsCount === 1 ? 'Rating' : 'Ratings'}
              </p>
            </div>

            <div className="sm:col-span-8 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = reviewStats.breakdown[stars] || 0;
                const total = Math.max(1, reviewStats.totalReviews);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-10 text-right font-mono text-zinc-400 tabular-nums shrink-0">
                      {stars} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-zinc-500 tabular-nums shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Write a Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="p-5 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">Tap a Star to Rate {app.title}</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || newRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 transition-transform hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            active ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-amber-400 tabular-nums">
                    {newRating} / 5
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Hasan Ahmed"
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Device Used</label>
                  <select
                    value={reviewDevice}
                    onChange={(e) => setReviewDevice(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Windows 11 PC">Windows 11 PC</option>
                    <option value="Windows 10 PC">Windows 10 PC</option>
                    <option value="Android Mobile">Android Mobile</option>
                    <option value="Android TV / Google TV">Android TV / Google TV</option>
                    <option value="Amazon Fire TV Stick">Amazon Fire TV Stick</option>
                    <option value="Android Tablet">Android Tablet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Your Review *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={`Share how ${app.title} works on your device...`}
                  className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-full bg-white/10 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Review Cards List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/[0.06] text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-300">No customer reviews yet</p>
                <p className="text-xs text-zinc-500">
                  Be the first person to rate and write a real review for {app.title}.
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.07] space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-zinc-700'}`}
                            />
                          ))}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{rev.author}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rev.device}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono tabular-nums">{rev.createdAt}</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>

                  {rev.developerReply && (
                    <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-400">{rev.developerReply.author}</span>
                        <span className="text-zinc-500 font-mono">{rev.developerReply.date}</span>
                      </div>
                      <p className="text-zinc-300">{rev.developerReply.text}</p>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${
                        helpfulClickedIds[rev.id]
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 8. App Privacy Card */}
        <section className="my-7 pt-6 border-t border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">App Privacy</h3>
            {onOpenLegal && (
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                See Privacy Policy
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Data Not Linked to You</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                This application does not collect personal tracking identifiers or sell browsing activity to third parties.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.07] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>SHA-256 Verified Binary</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Verified package distributed directly from MRS App Store storage without adware wrappers.
              </p>
            </div>
          </div>
        </section>

        {/* 9. App Owner Section */}
        <section id="owner-info-section" className="my-7 pt-6 border-t border-white/[0.08] space-y-4">
          <h3 className="text-lg font-bold text-white">App Owner</h3>

          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/[0.08] flex items-center gap-3.5">
            {app.ownerProfile?.avatarUrl && !avatarImgError ? (
              <img
                src={app.ownerProfile.avatarUrl}
                alt={appOwnerName}
                onError={() => setAvatarImgError(true)}
                className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/20 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">
                {app.ownerProfile?.displayName || appOwnerName}
              </p>
              {app.developer && app.developer !== (app.ownerProfile?.displayName || appOwnerName) && (
                <p className="text-xs text-blue-400 font-semibold truncate">{app.developer}</p>
              )}
            </div>
          </div>
        </section>

        {/* 10. Apple App Store Technical Information Table */}
        <section className="pt-6 border-t border-white/[0.08]">
          <h3 className="text-lg font-bold text-white mb-3">Information</h3>
          <dl className="divide-y divide-white/[0.06] text-xs">
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
              <dt className="text-zinc-400">App Owner</dt>
              <dd className="text-zinc-200 font-medium sm:text-right">
                {app.developer && app.developer !== appOwnerName
                  ? `${appOwnerName} · ${app.developer}`
                  : appOwnerName}
              </dd>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
              <dt className="text-zinc-400">Package Identifier</dt>
              <dd className="text-zinc-200 font-mono sm:text-right break-all">{app.packageId}</dd>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
              <dt className="text-zinc-400">{isWindowsApp ? 'Package File Name' : 'APK File Name'}</dt>
              <dd className="text-zinc-200 font-mono sm:text-right break-all">{app.fileName}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-zinc-400">Size</dt>
              <dd className="text-zinc-200 font-mono tabular-nums text-right">{app.size}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-zinc-400">Category</dt>
              <dd className="text-zinc-200 text-right">{app.category}</dd>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
              <dt className="text-zinc-400">Compatibility</dt>
              <dd className="text-zinc-200 sm:text-right">{app.minAndroid}</dd>
            </div>
            <div className="py-3 flex justify-between gap-4">
              <dt className="text-zinc-400">Languages</dt>
              <dd className="text-zinc-200 text-right flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{app.languages || 'System Locale'}</span>
              </dd>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-4">
              <dt className="text-zinc-400 shrink-0">SHA-256 Checksum</dt>
              <dd className="flex items-center justify-between sm:justify-end gap-2 min-w-0">
                <span className="font-mono text-zinc-400 truncate max-w-[220px] sm:max-w-xs">{app.sha256}</span>
                <button
                  type="button"
                  onClick={handleCopySha}
                  className="text-blue-400 hover:underline font-semibold shrink-0"
                >
                  {copiedSha ? 'Copied' : 'Copy'}
                </button>
              </dd>
            </div>
            <div className="py-3">
              <button
                type="button"
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full flex items-center justify-between text-zinc-400 hover:text-white transition-colors"
              >
                <span>
                  {isWindowsApp && !isHybridApp
                    ? `Runtime & Package Info (${app.permissions.length})`
                    : `Android Permissions (${app.permissions.length})`}
                </span>
                {showPermissions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPermissions && (
                <ul className="mt-2.5 space-y-1.5 pl-1">
                  {app.permissions.map((perm) => (
                    <li key={perm} className="font-mono text-[11px] text-zinc-400">
                      · {perm}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};
