import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { AppCard } from './components/AppCard';
import { AppDetailModal } from './components/AppDetailModal';
import { PublishAppModal } from './components/PublishAppModal';
import { LegalPoliciesModal } from './components/LegalPoliciesModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AppItem, SiteMeta } from './types';
import {
  DEFAULT_APPS,
  getDefaultSiteMeta,
  normalizeAssetPath,
  getAppLocalApkFile,
  getLocalPublishedApps,
  mergeCatalogApps,
} from './data/catalog';
import {
  Search,
  Tv,
  Download,
  AlertCircle,
  DollarSign,
  Zap,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'IPTV & Streaming',
  'Smart TV & Video',
];

export default function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [siteMeta, setSiteMeta] = useState<SiteMeta | null>(null);
  const [hasBackend, setHasBackend] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');

  // Modals
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'developer' | 'dmca'>('privacy');

  // Mobile navigation
  const [mobileTab, setMobileTab] = useState<'discover' | 'categories' | 'publish' | 'legal'>('discover');

  // Toast
  const [activeDownloadNotification, setActiveDownloadNotification] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appsRes, metaRes] = await Promise.all([
        fetch('./api/apps').catch(() => null),
        fetch('./api/meta').catch(() => null),
      ]);

      const localPublished = getLocalPublishedApps().filter((a) => a.id !== 'camellia-ai');
      const appsContentType = appsRes?.headers.get('content-type') || '';
      if (appsRes && appsRes.ok && appsContentType.includes('application/json')) {
        const appsData = await appsRes.json();
        setApps(mergeCatalogApps(appsData.apps || [], localPublished));
        setHasBackend(true);

        const metaContentType = metaRes?.headers.get('content-type') || '';
        if (metaRes && metaRes.ok && metaContentType.includes('application/json')) {
          const metaData = await metaRes.json();
          setSiteMeta(metaData.meta || getDefaultSiteMeta());
        } else {
          setSiteMeta(getDefaultSiteMeta());
        }
      } else {
        setHasBackend(false);
        setApps(mergeCatalogApps(DEFAULT_APPS, localPublished));
        setSiteMeta(getDefaultSiteMeta());
      }
    } catch (err) {
      console.warn('Falling back to static catalog:', err);
      setHasBackend(false);
      setApps(mergeCatalogApps(DEFAULT_APPS, getLocalPublishedApps().filter((a) => a.id !== 'camellia-ai')));
      setSiteMeta(getDefaultSiteMeta());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync sharing link from query parameter (?app=id)
  useEffect(() => {
    if (apps.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const appQuery = params.get('app');
      if (appQuery) {
        const found = apps.find((a) => a.id.toLowerCase() === appQuery.toLowerCase());
        if (found) setSelectedApp(found);
      }
    }
  }, [apps]);

  const handleSelectApp = (app: AppItem) => {
    setSelectedApp(app);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('app', app.id);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleCloseDetail = () => {
    setSelectedApp(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('app');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleReviewStatsUpdated = (appId: string, rating: number, reviewsCount: number) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, rating, reviewsCount } : a))
    );
    setSelectedApp((prev) =>
      prev && prev.id === appId ? { ...prev, rating, reviewsCount } : prev
    );
  };

  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          app.category.toLowerCase() === selectedCategory.toLowerCase();

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          app.title.toLowerCase().includes(q) ||
          app.fileName.toLowerCase().includes(q) ||
          app.tagline.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.downloads - a.downloads;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        return 0;
      });
  }, [apps, selectedCategory, searchQuery, sortBy]);

  const featuredApp = useMemo(() => {
    return apps.find((a) => a.featured) || apps[0];
  }, [apps]);

  const categories = useMemo(() => {
    const dynamicCats = Array.from(new Set(apps.map((a) => a.category).filter(Boolean)));
    if (dynamicCats.length === 0) return CATEGORIES;
    return ['All', ...dynamicCats];
  }, [apps]);

  const handleDirectDownload = (app: AppItem) => {
    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, downloads: item.downloads + 1 } : item
      )
    );

    setActiveDownloadNotification(`Downloading ${app.fileName} directly from MRS App Store...`);
    setTimeout(() => setActiveDownloadNotification(null), 4000);

    const staticUrl =
      app.directDownloadUrl &&
      (app.directDownloadUrl.startsWith('http://') || app.directDownloadUrl.startsWith('https://'))
        ? app.directDownloadUrl
        : app.localApkPath && app.localApkPath.startsWith('./apks/')
        ? app.localApkPath
        : `./apks/${getAppLocalApkFile(app.id)}`;

    const link = document.createElement('a');
    link.href = hasBackend ? `./api/download/${app.id}` : staticUrl;
    link.setAttribute('download', app.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'developer' | 'dmca' = 'privacy') => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleMobileNav = (tab: 'discover' | 'categories' | 'publish' | 'legal') => {
    setMobileTab(tab);
    if (tab === 'discover') {
      setSelectedCategory('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'publish') {
      setIsPublishModalOpen(true);
    } else if (tab === 'legal') {
      handleOpenLegal('developer');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-20 md:pb-0">
      <Header
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenLegal={handleOpenLegal}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        activeCategory={selectedCategory}
      />

      {activeDownloadNotification && (
        <div className="fixed top-20 left-3 right-3 sm:left-auto sm:right-8 z-50 pointer-events-none">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900 text-white shadow-2xl flex items-center gap-3 border border-white/15 text-xs font-semibold max-w-md sm:ml-auto">
            <Download className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{activeDownloadNotification}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        {featuredApp && !searchQuery && selectedCategory === 'All' && (
          <HeroFeatured
            app={featuredApp}
            onSelectApp={handleSelectApp}
            onDirectDownload={handleDirectDownload}
            hasBackend={hasBackend}
          />
        )}

        {/* Store Highlights Strip */}
        <section className="my-5 sm:my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Smart TV &amp; Mobile</p>
              <p className="text-zinc-400 text-[11px]">Firestick &amp; Android TV</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Self-Hosted APKs</p>
              <p className="text-zinc-400 text-[11px]">Instant Direct CDN</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">$25 USD Publish</p>
              <p className="text-zinc-400 text-[11px]">Binance &amp; USDT BEP20</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">SHA-256 Verified</p>
              <p className="text-zinc-400 text-[11px]">Inspectable APK Checksums</p>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog-section" className="mt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedCategory === 'All' ? 'Verified Applications' : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Tap any application to view full details, customer ratings, owner info, and sharing links.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps & APKs..."
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-full pl-10 pr-14 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors min-h-[42px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white min-h-[32px] px-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort apps"
                className="w-full sm:w-auto bg-zinc-900 border border-white/[0.08] rounded-full px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 min-h-[42px]"
              >
                <option value="popular">Top Charts</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Latest</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-white/[0.08] rounded-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap min-h-[34px] ${
                    selectedCategory === cat
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Submit New App ($25 USD) ›</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-56 rounded-[1.75rem] bg-zinc-900/50 border border-white/[0.08] animate-pulse p-6" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-[2rem] bg-red-950/30 border border-red-900/50 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-sm font-semibold text-red-300">{error}</p>
              <button
                type="button"
                onClick={fetchData}
                className="px-5 py-2.5 bg-red-800 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center rounded-[2rem] bg-zinc-900/40 border border-white/[0.08] space-y-3">
              <Tv className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No applications match your filter</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Reset filters to view all official M R S IPTV applications.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onSelectApp={handleSelectApp}
                  onDirectDownload={handleDirectDownload}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer
        siteMeta={siteMeta}
        onOpenLegal={handleOpenLegal}
        onOpenPublish={() => setIsPublishModalOpen(true)}
      />

      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileNav}
      />

      <AppDetailModal
        app={selectedApp}
        onClose={handleCloseDetail}
        onDirectDownload={handleDirectDownload}
        hasBackend={hasBackend}
        onReviewStatsUpdated={handleReviewStatsUpdated}
        onOpenLegal={handleOpenLegal}
      />

      <PublishAppModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        hasBackend={hasBackend}
        onAppPublished={(newApp) => {
          const normalized: AppItem = {
            ...newApp,
            icon: normalizeAssetPath(newApp.icon),
            banner: normalizeAssetPath(newApp.banner),
            screenshots: (newApp.screenshots || []).map(normalizeAssetPath),
          };
          setApps((prev) => [normalized, ...prev.filter((a) => a.id !== normalized.id)]);
        }}
        onSelectApp={handleSelectApp}
      />

      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        siteMeta={siteMeta}
        initialTab={legalTab}
      />
    </div>
  );
}
