import React from 'react';
import { LayoutGrid, Newspaper, UploadCloud, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'discover' | 'categories' | 'publish' | 'legal';
  onSelectTab: (tab: 'discover' | 'categories' | 'publish' | 'legal') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/[0.1] px-2 pt-0.5"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center h-11">
        <button
          type="button"
          onClick={() => onSelectTab('discover')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'discover' ? 'text-[#0a84ff] font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Today</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('categories')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'categories' ? 'text-[#0a84ff] font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Apps</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('publish')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'publish' ? 'text-[#0a84ff] font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Publish</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('legal')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'legal' ? 'text-[#0a84ff] font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Trust</span>
        </button>
      </div>
    </nav>
  );
};
