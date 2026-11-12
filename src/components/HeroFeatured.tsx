import React from 'react';
import { Download, ShieldCheck, Star, Tv, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';
import { AppItem } from '../types';

interface HeroFeaturedProps {
  app: AppItem;
  onSelectApp: (app: AppItem) => void;
  onDirectDownload: (app: AppItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  app,
  onSelectApp,
  onDirectDownload,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/[0.08] shadow-2xl p-6 sm:p-10 lg:p-12 my-6">
      {/* Apple-style dynamic ambient neon blue glow */}
      <div className="absolute top-0 right-1/4 -mr-20 -mt-20 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Apple App Store Editorial Details */}
        <div className="lg:col-span-7 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <span>Featured Streamer</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">Today's Pick</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-300 font-mono">{app.version}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {app.title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
            {app.tagline}
          </p>

          {/* Apple Store Pill Metadata Strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{app.rating.toFixed(1)}</span>
            </span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-zinc-300 font-medium">Smart TV &amp; Android Mobile</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="tabular-nums font-mono text-zinc-400">{app.size}</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-zinc-400">File: {app.fileName}</span>
          </div>

          {/* Apple App Store GET Button & Secondary Action */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onDirectDownload(app)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-zinc-200 active:scale-95 font-bold text-sm tracking-wider rounded-full transition-all shadow-xl shadow-white/10 min-h-[48px]"
            >
              <Download className="w-4 h-4" />
              <span>GET APK ({app.size})</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectApp(app)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-semibold rounded-full border border-white/[0.1] transition-all min-h-[48px]"
            >
              <span>View Details &amp; Links</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Verified In-House Host Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300 font-semibold">Self-Hosted Direct CDN</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-emerald-400 font-medium">Instant Download · No Waiting</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-blue-400 font-mono">/api/download/{app.id}</span>
          </div>
        </div>

        {/* Right Column: Apple-grade Squircle App Icon Display */}
        <div
          className="lg:col-span-5 flex justify-center lg:justify-end cursor-pointer group"
          onClick={() => onSelectApp(app)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/25 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all duration-500 scale-95" />
            <img
              src="/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png"
              alt={app.title}
              className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-[22%] object-cover ring-2 ring-white/20 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs text-white">
              <span className="font-bold flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span>Smart TV Ready</span>
              </span>
              <span className="text-zinc-400">Tap to inspect</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
