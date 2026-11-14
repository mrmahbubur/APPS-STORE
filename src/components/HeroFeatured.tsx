import React, { useState } from 'react';
import { Download, Star, ArrowRight, Share2, Check, UserCheck, Tv } from 'lucide-react';
import { AppItem } from '../types';
import { copyToClipboard, getAppLocalApkUrl, normalizeAssetPath } from '../data/catalog';

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
  const [heroImgError, setHeroImgError] = useState(false);
  const [iconImgError, setIconImgError] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleShareHero = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?app=${app.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${app.title} — Official APK`,
          text: `Download ${app.title} (${app.fileName}) directly from MRS App Store.`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      await copyToClipboard(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const resolvedIcon =
    normalizeAssetPath(app.icon) ||
    normalizeAssetPath('./assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png');

  return (
    <section className="pt-2 pb-4 sm:pt-4 sm:pb-6 space-y-4 sm:space-y-5">
      {/* Apple App Store "Today" Editorial Masthead */}
      <div className="flex items-end justify-between gap-4 border-b border-white/[0.08] pb-3.5">
        <div>
          <p className="text-xs font-semibold text-zinc-400 tracking-wide">{todayFormatted}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-none mt-1">
            Today
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 tabular-nums">
          <span>Verified Direct Packages</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>SHA-256 Checked</span>
        </div>
      </div>

      {/* Apple App Store Editorial Today Story Card */}
      <article className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#1c1c1e] border border-white/[0.09] shadow-2xl">
        {/* Editorial Backdrop Artwork + Measured Scrim */}
        {!heroImgError ? (
          <img
            src={normalizeAssetPath('./assets/apple_today_hero.jpg')}
            alt=""
            aria-hidden="true"
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-75 pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/75 to-black/35 pointer-events-none"
        />

        {/* Upper Story Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center p-5 sm:p-8 lg:p-10">
          <div className="lg:col-span-7 flex flex-col items-start gap-3.5 order-2 lg:order-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-300">
              <span className="text-[#0a84ff]">Editor’s Pick</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{app.category}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono tabular-nums">v{app.version}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance max-w-2xl">
              {app.title}
            </h2>

            <p className="text-sm sm:text-base text-zinc-200 max-w-xl leading-relaxed">
              {app.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-zinc-300 tabular-nums">
              {app.reviewsCount > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{app.rating.toFixed(1)}</span>
                  </span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span>
                    {app.reviewsCount} {app.reviewsCount === 1 ? 'Review' : 'Reviews'}
                  </span>
                </>
              ) : (
                <span className="text-zinc-300">Direct Release</span>
              )}
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono">{app.size}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{app.platform}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onSelectApp(app)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold rounded-full transition-colors min-h-[42px] whitespace-nowrap"
              >
                <span>App Details &amp; Reviews</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleShareHero}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full transition-colors min-h-[42px] whitespace-nowrap"
                aria-label={`Share ${app.title}`}
              >
                {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{shared ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Right App Icon Showcase */}
          <div
            tabIndex={0}
            role="button"
            aria-label={`View ${app.title} details`}
            onClick={() => onSelectApp(app)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectApp(app);
              }
            }}
            className="lg:col-span-5 flex justify-start sm:justify-center lg:justify-end cursor-pointer group order-1 lg:order-2 rounded-[22.5%]"
          >
            {!iconImgError ? (
              <img
                src={resolvedIcon}
                alt={app.title}
                onError={() => setIconImgError(true)}
                className="w-24 h-24 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-[22.5%] object-cover ring-1 ring-white/20 shadow-2xl group-hover:scale-[1.03] transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 sm:w-44 sm:h-44 lg:w-56 lg:h-56 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/20 flex items-center justify-center text-[#0a84ff]">
                <Tv className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        {/* Apple Today Card Signature Frosted Bottom App Bar */}
        <div className="relative z-10 bg-black/65 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/[0.1] px-5 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {!iconImgError ? (
              <img
                src={resolvedIcon}
                alt=""
                aria-hidden="true"
                onError={() => setIconImgError(true)}
                className="w-11 h-11 rounded-[22.5%] object-cover ring-1 ring-white/15 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/15 flex items-center justify-center text-[#0a84ff] shrink-0">
                <Tv className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{app.title}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 min-w-0">
                {app.ownerProfile?.avatarUrl && !avatarImgError ? (
                  <img
                    src={app.ownerProfile.avatarUrl}
                    alt={app.ownerName || app.developer}
                    onError={() => setAvatarImgError(true)}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck className="w-3 h-3 text-[#0a84ff] shrink-0" />
                )}
                <span className="truncate">{app.ownerName || app.developer}</span>
                <span aria-hidden="true" className="hidden sm:inline text-zinc-600">·</span>
                <span className="hidden sm:inline font-mono text-zinc-300 truncate">
                  {hasBackend ? `./api/download/${app.id}` : getAppLocalApkUrl(app)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDirectDownload(app)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-[#0071e3] hover:bg-[#0a84ff] active:scale-95 text-white font-bold text-xs tracking-wide rounded-full transition-all shadow-lg shadow-blue-600/25 min-h-[42px] whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>GET · {app.size}</span>
          </button>
        </div>
      </article>
    </section>
  );
};
