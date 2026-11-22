import React, { useEffect, useMemo, useState } from 'react';
import {
  Tv,
  Monitor,
  ShieldCheck,
  Cast,
  Smartphone,
  Cpu,
  Cloud,
  Gamepad2,
  Server,
  Lock,
  ExternalLink,
} from 'lucide-react';
import type { SponsorAdLink, SponsorFilterTab, StorePlatformFilter } from '../types';
import { filterSponsorsByTab, mapPlatformToSponsorTab } from '../data/catalog';

interface SponsoredSpotlightProps {
  sponsors: SponsorAdLink[];
  activePlatform?: StorePlatformFilter;
  onSponsorClick?: (sponsor: SponsorAdLink) => void;
}

function getSponsorIcon(zoneId: string) {
  switch (zoneId) {
    case '11226634':
      return Tv;
    case '11683565':
      return Monitor;
    case '11242745':
      return Lock;
    case '11242069':
      return Cast;
    case '11242067':
      return Smartphone;
    case '11242742':
      return Cpu;
    case '11230440':
      return Cloud;
    case '11683560':
      return Gamepad2;
    case '9912130':
      return Server;
    case '11242744':
    default:
      return ShieldCheck;
  }
}

export const SponsoredSpotlight: React.FC<SponsoredSpotlightProps> = ({
  sponsors,
  activePlatform = 'All',
  onSponsorClick,
}) => {
  const [filterTab, setFilterTab] = useState<SponsorFilterTab>(() =>
    mapPlatformToSponsorTab(activePlatform)
  );

  useEffect(() => {
    setFilterTab(mapPlatformToSponsorTab(activePlatform));
  }, [activePlatform]);

  const filteredSponsors = useMemo(
    () => filterSponsorsByTab(sponsors, filterTab),
    [sponsors, filterTab]
  );

  const featuredSponsors = useMemo(
    () => filteredSponsors.filter((item) => item.placement === 'featured'),
    [filteredSponsors]
  );

  const listSponsors = useMemo(
    () => filteredSponsors.filter((item) => item.placement !== 'featured'),
    [filteredSponsors]
  );

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section id="sponsors-section" className="mt-12 space-y-5" aria-label="Sponsored Partners">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sponsored Partners
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            External partner software, streaming utilities, and cloud tools · Opens in a new tab
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-[#1c1c1e] border border-white/[0.08] rounded-xl overflow-x-auto no-scrollbar max-w-full self-start md:self-auto"
          role="group"
          aria-label="Filter sponsored partners"
        >
          {(['All Partners', 'Android & TV', 'Windows PC'] as const).map((tab) => {
            const isActive = filterTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[34px] ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {featuredSponsors.length > 0 && (
        <div
          className={`grid gap-4 ${
            featuredSponsors.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {featuredSponsors.map((sponsor) => {
            const Icon = getSponsorIcon(sponsor.zoneId);
            return (
              <div
                key={sponsor.id}
                className="rounded-[22px] bg-[#1c1c1e] border border-white/[0.08] p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/10 flex items-center justify-center text-[#0a84ff] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="text-[11px] font-semibold text-zinc-400 truncate">
                      <span className="text-[#0a84ff]">Sponsored</span>
                      <span aria-hidden="true"> · </span>
                      <span>{sponsor.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>External</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {sponsor.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {sponsor.subtitle}
                    </p>
                  </div>
                </div>

                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => onSponsorClick?.(sponsor)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0a84ff] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  <span>{sponsor.ctaLabel || 'Open'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {listSponsors.length > 0 && (
        <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-[22px] divide-y divide-white/[0.08] overflow-hidden">
          {listSponsors.map((sponsor) => {
            const Icon = getSponsorIcon(sponsor.zoneId);
            return (
              <div
                key={sponsor.id}
                className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                    <Icon className="w-4 h-4 text-[#0a84ff]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-zinc-400 truncate">
                      <span>Sponsored</span>
                      <span aria-hidden="true"> · </span>
                      <span>{sponsor.platformHint}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{sponsor.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {sponsor.title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {sponsor.subtitle}
                    </p>
                  </div>
                </div>

                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => onSponsorClick?.(sponsor)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#0a84ff] hover:text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  <span>{sponsor.ctaLabel || 'Visit'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
