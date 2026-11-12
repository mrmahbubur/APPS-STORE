import React from 'react';
import { DollarSign } from 'lucide-react';

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
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="./"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group"
        >
          <img
            src="./assets/site-logo-icon.jpg"
            alt="MRS App Store"
            className="w-9 h-9 rounded-[22%] object-cover ring-1 ring-white/15 group-hover:scale-105 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
          <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
            MRS App Store
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-zinc-400">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 ${
              activeCategory === 'All' ? 'text-white' : 'hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('IPTV & Streaming');
              scrollToSection('catalog-section');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 ${
              activeCategory === 'IPTV & Streaming' ? 'text-white' : 'hover:text-white'
            }`}
          >
            Apps
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('Smart TV & Video');
              scrollToSection('catalog-section');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 ${
              activeCategory === 'Smart TV & Video' ? 'text-white' : 'hover:text-white'
            }`}
          >
            Smart TV
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('owner-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Owner Info
          </button>
          <button
            type="button"
            onClick={onOpenThemeExport}
            className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Theme XML
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 rounded-full transition-all whitespace-nowrap shrink-0"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Publish App ($25)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
