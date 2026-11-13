import React, { useState } from 'react';
import { Download, Star, Check, Share2, UserCheck } from 'lucide-react';
import { AppItem } from '../types';

interface AppCardProps {
  app: AppItem;
  onSelectApp: (app: AppItem) => void;
  onDirectDownload: (app: AppItem) => void;
  isDownloading?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onSelectApp,
  onDirectDownload,
  isDownloading = false,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const appOwner = app.ownerName || app.developer;

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectDownload(app);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${app.title} — Official APK`,
        text: `Download ${app.title} (${app.fileName}) directly from MRS App Store.`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectApp(app);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={() => onSelectApp(app)}
      onKeyDown={handleCardKeyDown}
      className="group relative bg-zinc-900/80 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/[0.18] rounded-[1.5rem] sm:rounded-[1.75rem] p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-left"
    >
      {/* Top Header: Squircle Icon + Unboxed Metadata */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <img
          src={app.icon}
          alt={app.title}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22%] object-cover ring-1 ring-white/15 shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {app.title}
          </h2>

          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {app.developer} · <span className="font-mono">{app.fileName}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-2 tabular-nums">
            <span className="text-blue-400 font-semibold truncate max-w-[140px] sm:max-w-none">{app.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            {app.reviewsCount > 0 ? (
              <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{app.rating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="font-mono text-zinc-400 shrink-0">v{app.version}</span>
            )}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono shrink-0">{app.size}</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
        {app.tagline}
      </p>

      {/* Per-App Owner Information */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/[0.06] flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          {app.ownerProfile?.avatarUrl ? (
            <img
              src={app.ownerProfile.avatarUrl}
              alt={appOwner}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
          <span className="text-zinc-300 font-semibold truncate">
            Owner: <span className="text-white">{appOwner}</span>
          </span>
        </div>
        <span className="text-zinc-400 font-mono truncate max-w-full sm:max-w-[165px]">
          {app.ownerProfile?.email || app.developerEmail}
        </span>
      </div>

      {/* Footer Strip: Compatibility & GET + Share Controls */}
      <div className="pt-3.5 sm:pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs text-zinc-400 font-medium truncate">
          {app.platform} · {app.reviewsCount > 0 ? `${app.reviewsCount} ${app.reviewsCount === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShareClick}
            title="Share App Link"
            aria-label={`Share ${app.title}`}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full border transition-colors ${
              shareSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border-white/10'
            }`}
          >
            {shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all min-h-[40px] whitespace-nowrap shrink-0 ${
              downloadSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white text-blue-400 hover:text-black active:scale-95'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>GET</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
