import React from 'react';
import { SiteMeta } from '../types';
import { ShieldCheck, RefreshCw, DollarSign } from 'lucide-react';

interface FooterProps {
  siteMeta: SiteMeta | null;
  onOpenLegal: (tab: 'privacy' | 'terms' | 'developer' | 'dmca') => void;
  onOpenPublish: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteMeta,
  onOpenLegal,
  onOpenPublish,
}) => {
  const currentYear = siteMeta?.currentYear || new Date().getFullYear();
  const copyright = siteMeta?.copyrightNotice || `© ${currentYear} MRS TV Network. All rights reserved.`;

  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-black text-zinc-400 pt-12 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <img
              src="./assets/site-logo-icon.jpg"
              alt="MRS App Store Official Logo"
              className="w-10 h-10 rounded-[22%] object-cover ring-1 ring-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-extrabold text-white text-sm">MRS App Store</span>
              <p className="text-[11px] text-zinc-500">
                Verified Direct Android &amp; Smart TV APK Storefront
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="min-h-[36px] flex items-center hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenPublish}
              className="min-h-[36px] hover:text-white transition-colors flex items-center gap-1 text-blue-400"
            >
              <DollarSign className="w-3 h-3" />
              <span>Publish App ($25 USD)</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="min-h-[36px] flex items-center hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('dmca')}
              className="min-h-[36px] flex items-center hover:text-white transition-colors"
            >
              DMCA
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            <p className="text-zinc-300 font-medium">{copyright}</p>
            <p className="mt-1 text-zinc-500">
              All APKs served directly from MRS App Store in-house hosting. Automated annual policy verification active.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 Verified</span>
            </span>
            <span aria-hidden="true" className="text-zinc-800">|</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span>Year {currentYear}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
