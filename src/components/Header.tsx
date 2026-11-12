import React from 'react';
import { DollarSign, Shield, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenPublish: () => void;
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'developer' | 'dmca') => void;
  onOpenThemeExport: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPublish,
  onOpenLegal,
  onOpenThemeExport,
  onSelectCategory,
  activeCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Apple-style Brand Wordmark with User Uploaded Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group"
        >
          <img
            src="/src/assets/images/mrs_store_logo_1792766033667.jpg"
            alt="MRS App Store Official Logo"
            className="w-9 h-9 rounded-[22%] object-cover ring-1 ring-white/15 shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-white text-base sm:text-lg leading-tight flex items-center gap-1.5">
              <span>App Store</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">MRS</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-tight hidden sm:block">
              Official IPTV Network &amp; Verified APKs
            </span>
          </div>
        </a>

        {/* Zone 2: Apple App Store Top Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-zinc-300">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === 'All' ? 'text-white' : 'hover:text-white text-zinc-400'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('IPTV & Streaming');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === 'IPTV & Streaming' ? 'text-white' : 'hover:text-white text-zinc-400'
            }`}
          >
            IPTV &amp; Streaming
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('Smart TV & Video');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === 'Smart TV & Video' ? 'text-white' : 'hover:text-white text-zinc-400'
            }`}
          >
            Smart TV Edition
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal('developer')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-zinc-400"
          >
            Developer Guidelines ($25 Crypto)
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-zinc-400"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={onOpenThemeExport}
            className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 text-zinc-400"
          >
            Export Theme
          </button>
        </nav>

        {/* Zone 3: Apple-style Primary Action (Publish with USD Payment) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-full transition-all shadow-lg shadow-blue-600/25 whitespace-nowrap shrink-0"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Publish App ($25)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
