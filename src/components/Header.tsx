import React from 'react';
import { DollarSign } from 'lucide-react';
import { normalizeAssetPath } from '../data/catalog';

interface HeaderProps {
  onOpenPublish: () => void;
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'developer' | 'dmca') => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPublish,
  onOpenLegal,
  onSelectCategory,
  activeCategory,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-40 bg-black/85 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="./"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 group min-h-[40px]"
        >
          <img
            src={normalizeAssetPath('./assets/site-logo-icon.jpg')}
            alt="MRS App Store"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-[22%] object-cover ring-1 ring-white/15 group-hover:scale-105 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
          <span className="font-extrabold tracking-tight text-white text-sm sm:text-lg">
            MRS App Store
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links (Tablet/Desktop/TV) */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-zinc-400">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 px-1 py-1 ${
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
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 px-1 py-1 ${
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
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 px-1 py-1 ${
              activeCategory === 'Smart TV & Video' ? 'text-white' : 'hover:text-white'
            }`}
          >
            Smart TV
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('catalog-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 px-1 py-1"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 px-1 py-1"
          >
            Privacy
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-white bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 rounded-full transition-all whitespace-nowrap shrink-0 min-h-[38px]"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Publish ($25)</span>
          </button>
        </div>
      </div>

      {/* Mobile / Small Tablet Horizontal Quick Navigation */}
      <nav
        aria-label="Quick navigation"
        className="md:hidden max-w-[1440px] mx-auto mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold text-zinc-400"
      >
        <button
          type="button"
          onClick={() => {
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
            activeCategory === 'All' ? 'bg-white text-black font-bold' : 'bg-white/[0.06] text-zinc-300'
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
          className={`px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
            activeCategory === 'IPTV & Streaming' ? 'bg-white text-black font-bold' : 'bg-white/[0.06] text-zinc-300'
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
          className={`px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-colors ${
            activeCategory === 'Smart TV & Video' ? 'bg-white text-black font-bold' : 'bg-white/[0.06] text-zinc-300'
          }`}
        >
          Smart TV
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('catalog-section')}
          className="px-3 py-1.5 rounded-full bg-white/[0.06] text-zinc-300 whitespace-nowrap shrink-0"
        >
          Catalog
        </button>
        <button
          type="button"
          onClick={() => onOpenLegal('privacy')}
          className="px-3 py-1.5 rounded-full bg-white/[0.06] text-zinc-300 whitespace-nowrap shrink-0"
        >
          Privacy
        </button>
      </nav>
    </header>
  );
};
