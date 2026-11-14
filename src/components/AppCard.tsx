import React, { useState } from 'react';
import { Download, Star, Check, Share2, UserCheck, Smartphone, Monitor } from 'lucide-react';
import { AppItem } from '../types';
import { copyToClipboard, normalizeAssetPath } from '../data/catalog';

interface AppCardProps {
  app: AppItem;
  onSelectApp: (app: AppItem) => void;
  onDirectDownload: (app: AppItem) => void;
  isDownloading?: boolean;
  variant?: 'card' | 'row';
  rank?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onSelectApp,
  onDirectDownload,
  isDownloading = false,
  variant = 'card',
  rank,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const appOwner = app.ownerName || app.developer;
  const isWindowsApp =
    /windows/i.test(app.platform || '') ||
    /\.(exe|msi|msix|msixbundle|appx|appxbundle)$/i.test(app.fileName || '');

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectDownload(app);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${app.title} — Official ${isWindowsApp ? 'Package' : 'APK'}`,
          text: `Download ${app.title} (${app.fileName}) directly from MRS App Store.`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      await copyToClipboard(shareUrl);
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

  if (variant === 'row') {
    return (
      <div
        tabIndex={0}
        role="button"
        onClick={() => onSelectApp(app)}
        onKeyDown={handleCardKeyDown}
        className="group px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sm:gap-5 hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          {typeof rank === 'number' && (
            <span className="w-6 text-center text-base sm:text-lg font-bold text-zinc-400 tabular-nums shrink-0">
              {rank}
            </span>
          )}

          {!imgError ? (
            <img
              src={normalizeAssetPath(app.icon)}
              alt={app.title}
              onError={() => setImgError(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22.5%] object-cover ring-1 ring-white/15 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/15 flex items-center justify-center text-[#0a84ff] shrink-0">
              {isWindowsApp ? <Monitor className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#0a84ff] transition-colors truncate">
                {app.title}
              </h3>
              {isWindowsApp && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 text-[#0a84ff] text-[10px] font-bold shrink-0">
                  <Monitor className="w-2.5 h-2.5" />
                  <span>Windows</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {app.category} · {appOwner}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-1 tabular-nums">
              {app.reviewsCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{app.rating.toFixed(1)}</span>
                </span>
              ) : (
                <span className="font-mono text-zinc-300">v{app.version}</span>
              )}
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">{app.size}</span>
              <span aria-hidden="true" className="hidden sm:inline text-zinc-600">·</span>
              <span className="hidden sm:inline font-mono text-zinc-400 truncate">{app.fileName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShareClick}
            title="Share App Link"
            aria-label={`Share ${app.title}`}
            className={`min-h-[38px] min-w-[38px] hidden sm:flex items-center justify-center rounded-full transition-colors ${
              shareSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-white'
            }`}
          >
            {shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`inline-flex items-center justify-center gap-1.5 px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all min-h-[36px] whitespace-nowrap shrink-0 ${
              downloadSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-white/[0.12] hover:bg-[#0071e3] text-[#0a84ff] hover:text-white active:scale-95'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </>
            ) : (
              <span>GET</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={() => onSelectApp(app)}
      onKeyDown={handleCardKeyDown}
      className="group relative bg-[#1c1c1e] hover:bg-[#242426] border border-white/[0.08] hover:border-white/[0.16] rounded-[22px] p-5 flex flex-col justify-between gap-4 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-left"
    >
      {/* Top Row: Apple Squircle + Title/Meta + GET Button */}
      <div className="flex items-start gap-3.5">
        {!imgError ? (
          <img
            src={normalizeAssetPath(app.icon)}
            alt={app.title}
            onError={() => setImgError(true)}
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[22.5%] object-cover ring-1 ring-white/15 shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/15 flex items-center justify-center text-[#0a84ff] shrink-0">
            {isWindowsApp ? <Monitor className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {typeof rank === 'number' && (
              <span className="text-xs font-bold text-zinc-500 tabular-nums shrink-0">
                #{rank}
              </span>
            )}
            <h3 className="text-base sm:text-[17px] font-bold text-white group-hover:text-[#0a84ff] transition-colors truncate">
              {app.title}
            </h3>
            {isWindowsApp && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 text-[#0a84ff] text-[10px] font-bold shrink-0">
                <Monitor className="w-2.5 h-2.5" />
                <span>Win</span>
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {app.category} · {app.developer}
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-2 tabular-nums">
            {app.reviewsCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold shrink-0">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{app.rating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="font-mono text-zinc-300 shrink-0">v{app.version}</span>
            )}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono shrink-0">{app.size}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono text-zinc-400 truncate max-w-[140px]">{app.fileName}</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-[13px] text-zinc-300 line-clamp-2 leading-relaxed">
        {app.tagline}
      </p>

      {/* Clean Hairline Owner Row (No nested box) */}
      <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {app.ownerProfile?.avatarUrl && !avatarError ? (
            <img
              src={app.ownerProfile.avatarUrl}
              alt={appOwner}
              onError={() => setAvatarError(true)}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserCheck className="w-4 h-4 text-[#0a84ff] shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs text-zinc-200 font-medium truncate">{appOwner}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShareClick}
            title="Share App Link"
            aria-label={`Share ${app.title}`}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-colors ${
              shareSuccess
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.08] hover:bg-white/[0.16] text-zinc-300 hover:text-white'
            }`}
          >
            {shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all min-h-[40px] whitespace-nowrap shrink-0 ${
              downloadSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-white/[0.12] hover:bg-[#0071e3] text-[#0a84ff] hover:text-white active:scale-95'
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
