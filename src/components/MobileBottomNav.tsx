import React from 'react';
import { Compass, Sparkles, UploadCloud, ShieldCheck } from 'lucide-react';

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center h-14">
        {/* Tab 1: Discover */}
        <button
          type="button"
          onClick={() => onSelectTab('discover')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'discover' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Discover</span>
        </button>

        {/* Tab 2: Categories */}
        <button
          type="button"
          onClick={() => onSelectTab('categories')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'categories' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Catalog</span>
        </button>

        {/* Tab 3: Publish */}
        <button
          type="button"
          onClick={() => onSelectTab('publish')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'publish' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Publish</span>
        </button>

        {/* Tab 4: Legal / Security */}
        <button
          type="button"
          onClick={() => onSelectTab('legal')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'legal' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Trust</span>
        </button>
      </div>
    </nav>
  );
};
