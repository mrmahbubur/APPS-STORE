import React, { useState } from 'react';
import { UploadCloud, AppWindow } from 'lucide-react';
import { normalizeAssetPath } from '../data/catalog';

export type StorePlatformFilter = 'All' | 'Android' | 'Smart TV' | 'Windows';

interface HeaderProps {
  onOpenPublish: () => void;
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'developer' | 'dmca') => void;
  onSelectCategory: (category: string) => void;
  onSelectPlatform?: (platform: StorePlatformFilter) => void;
  onOpenCharts?: () => void;
  activeCategory: string;
  activePlatform?: StorePlatformFilter;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPublish,
  onOpenLegal,
  onSelectCategory,
  onSelectPlatform,
  onOpenCharts,
  activeCategory,
  activePlatform = 'All',
}) => {
  const [logoError, setLogoError] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08] px-3.5 sm:px-6 lg:px-8"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-[1360px] mx-auto h-12 md:h-14 flex items-center justify-between gap-3 sm:gap-4 lg:gap-8">
        {/* Zone 1: Single-line Apple Store Wordmark */}
        <a
          href="./"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            if (onSelectPlatform) onSelectPlatform('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap shrink-0 group min-h-[40px] min-w-0"
        >
          {!logoError ? (
            <img
              src={normalizeAssetPath('./assets/site-logo-icon.jpg')}
              alt="MRS App Store"
              onError={() => setLogoError(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-[22.5%] object-cover ring-1 ring-white/15 group-hover:scale-105 transition-transform duration-200 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[22.5%] bg-[#0071e3] text-white flex items-center justify-center ring-1 ring-white/15 shrink-0">
              <AppWindow className="w-4 h-4" />
            </div>
          )}
          <span className="font-bold tracking-tight text-white text-[15px] sm:text-[17px] truncate">
            MRS App Store
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-[13px] font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              if (onSelectPlatform) onSelectPlatform('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1 ${
              activeCategory === 'All' && activePlatform === 'All'
                ? 'text-white font-semibold'
                : 'hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              if (onSelectPlatform) onSelectPlatform('Android');
              scrollToSection('catalog-section');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1 ${
              activePlatform === 'Android' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              if (onSelectPlatform) onSelectPlatform('Smart TV');
              scrollToSection('catalog-section');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1 ${
              activePlatform === 'Smart TV' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Smart TV
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('All');
              if (onSelectPlatform) onSelectPlatform('Windows');
              scrollToSection('catalog-section');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1 ${
              activePlatform === 'Windows' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Windows
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenCharts) onOpenCharts();
              scrollToSection('catalog-section');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1"
          >
            Charts
          </button>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-1"
          >
            Privacy
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0a84ff] active:scale-95 rounded-full transition-all whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
