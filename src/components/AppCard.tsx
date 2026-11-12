import React, { useState } from 'react';
import { Download, Star, ShieldCheck, Check, Tv, Share2, Link } from 'lucide-react';
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

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDirectDownload(app);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?app=${app.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${app.title} - Official APK`,
        text: `Download ${app.title} (${app.fileName}) direct APK from MRS App Store.`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  return (
    <article
      onClick={() => onSelectApp(app)}
      className="group relative bg-zinc-900/80 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/[0.18] rounded-[2rem] p-6 flex flex-col justify-between gap-5 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-950/20"
    >
      {/* Top Header: Icon + Info */}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={app.icon}
            alt={app.title}
            className="w-20 h-20 rounded-[22%] object-cover ring-1 ring-white/15 shadow-xl group-hover:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          {app.editorChoice && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full ring-2 ring-zinc-950 flex items-center justify-center text-[9px] font-black text-white" title="Editor's Choice">
              ★
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {app.title}
          </h2>

          <p className="text-xs font-mono text-zinc-400 mt-0.5 truncate">
            {app.fileName}
          </p>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1.5">
            <span className="text-blue-400 font-semibold">{app.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">{app.version}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{app.rating.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="tabular-nums font-mono text-zinc-400">{app.size}</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
        {app.tagline}
      </p>

      {/* Footer Strip: Compatibility & Apple GET + Share Pill Buttons */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Tv className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate max-w-[110px] sm:max-w-none">Smart TV &amp; Mobile</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Link Button */}
          <button
            type="button"
            onClick={handleShareClick}
            title="Share App Link"
            className={`p-2 rounded-full border transition-all ${
              shareSuccess
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border-white/10'
            }`}
          >
            {shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* GET Direct Download Button */}
          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className={`inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all min-h-[38px] whitespace-nowrap shrink-0 ${
              downloadSuccess
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/10 hover:bg-white/20 active:scale-95 text-blue-400 border border-blue-500/30'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloading</span>
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
