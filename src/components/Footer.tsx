import React, { useState } from 'react';
import { SiteMeta } from '../types';
import { ShieldCheck, UploadCloud, AppWindow, ExternalLink } from 'lucide-react';
import { MRS_GRAVATAR_OWNER_PROFILE, normalizeAssetPath } from '../data/catalog';

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
  const [logoError, setLogoError] = useState(false);
  const currentYear = siteMeta?.currentYear || new Date().getFullYear();
  const owner = siteMeta?.ownerProfile || MRS_GRAVATAR_OWNER_PROFILE;
  const copyright =
    siteMeta?.copyrightNotice ||
    `© ${currentYear} ${owner.displayName} (@${owner.username}) · MRS TV Network. All rights reserved.`;

  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-black text-zinc-400 pt-10 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-[1360px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            {!logoError ? (
              <img
                src={normalizeAssetPath('./assets/site-logo-icon.jpg')}
                alt="MRS App Store Official Logo"
                onError={() => setLogoError(true)}
                className="w-9 h-9 rounded-[22.5%] object-cover ring-1 ring-white/15 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-[22.5%] bg-[#0071e3] text-white flex items-center justify-center ring-1 ring-white/15 shrink-0">
                <AppWindow className="w-4 h-4" />
              </div>
            )}
            <div>
              <span className="font-bold text-white text-sm">MRS App Store</span>
              <p className="text-[11px] text-zinc-400">
                Owned &amp; Operated by {owner.displayName} (@{owner.username})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
            <a
              href={owner.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Owner Profile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
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
              className="min-h-[36px] hover:text-white transition-colors flex items-center gap-1.5 text-[#0a84ff] font-semibold"
            >
              <UploadCloud className="w-3.5 h-3.5" />
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p className="text-zinc-400 font-medium">{copyright}</p>
          <div className="flex items-center gap-2 text-zinc-400 tabular-nums">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{owner.email} · SHA-256 Direct APKs · {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
