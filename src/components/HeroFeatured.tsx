import React, { useState } from 'react';
import { Download, Star, ArrowRight, Share2, Check } from 'lucide-react';
import { AppItem } from '../types';
import { getAppLocalApkFile } from '../data/catalog';

interface HeroFeaturedProps {
  app: AppItem;
  onSelectApp: (app: AppItem) => void;
  onDirectDownload: (app: AppItem) => void;
  hasBackend?: boolean;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  app,
  onSelectApp,
  onDirectDownload,
  hasBackend = true,
}) => {
  const [shared, setShared] = useState(false);

  const handleShareHero = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${app.title} — Official APK`,
        text: `Download ${app.title} (${app.fileName}) directly from MRS App Store.`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/[0.08] shadow-2xl p-6 sm:p-10 lg:p-12 my-6">
      <div className="absolute top-0 right-1/4 -mr-20 -mt-20 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Details */}
        <div className="lg:col-span-7 flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-400">
            <span>Today’s Pick</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">{app.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-300 font-mono">v{app.version}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-balance">
            {app.title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
            {app.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 pt-1 tabular-nums">
            {app.reviewsCount > 0 ? (
              <>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{app.rating.toFixed(1)}</span>
                </span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span className="text-zinc-300">
                  {app.reviewsCount} {app.reviewsCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </>
            ) : (
              <span className="text-zinc-400">No reviews yet</span>
            )}
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="font-mono text-zinc-400">{app.size}</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="font-mono text-zinc-400">{app.fileName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onDirectDownload(app)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-zinc-200 active:scale-95 font-bold text-sm rounded-full transition-all shadow-xl shadow-white/10 min-h-[48px]"
            >
              <Download className="w-4 h-4" />
              <span>GET APK ({app.size})</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectApp(app)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-semibold rounded-full border border-white/[0.1] transition-all min-h-[48px]"
            >
              <span>Details, Reviews &amp; Owner</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              type="button"
              onClick={handleShareHero}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-semibold rounded-full border border-white/[0.1] transition-all min-h-[48px]"
              aria-label={`Share ${app.title}`}
            >
              {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{shared ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-2">
            <span className="text-emerald-400 font-semibold">Self-Hosted Direct CDN</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="font-mono text-zinc-400">
              {hasBackend ? `./api/download/${app.id}` : `./apks/${getAppLocalApkFile(app.id)}`}
            </span>
          </div>
        </div>

        {/* Right Column: Squircle App Icon Showcase */}
        <div
          className="lg:col-span-5 flex justify-center lg:justify-end cursor-pointer group"
          onClick={() => onSelectApp(app)}
        >
          <div className="relative">
            <img
              src={app.icon || './assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'}
              alt={app.title}
              className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-[22%] object-cover ring-1 ring-white/15 shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
