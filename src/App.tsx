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
  APP_STORE_CATEGORIES,
  DEFAULT_APPS,
  MRS_GRAVATAR_OWNER_PROFILE,
  getDefaultSiteMeta,
  normalizeAssetPath,
  getAppLocalApkUrl,
  getLocalPublishedApps,
  mergeCatalogApps,
} from './data/catalog';
import {
  Search,
  Tv,
  Download,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  ListOrdered,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  UserCheck,
} from 'lucide-react';

const CATEGORIES = ['All', ...APP_STORE_CATEGORIES];

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
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');
  const [showcaseImgError, setShowcaseImgError] = useState(false);

  // Modals
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishInitialCategory, setPublishInitialCategory] = useState<string | undefined>(undefined);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'developer' | 'dmca'>('privacy');
  const [ownerAvatarError, setOwnerAvatarError] = useState(false);

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

  useEffect(() => {
    const anyModalOpen = Boolean(selectedApp || isPublishModalOpen || isLegalModalOpen);
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedApp, isPublishModalOpen, isLegalModalOpen]);

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
    const dynamicCats = apps.map((a) => (a.category || '').trim()).filter(Boolean);
    const metaCats = siteMeta?.categories || [];
    const uniqueAll = Array.from(new Set([...APP_STORE_CATEGORIES, ...metaCats, ...dynamicCats]));
    return ['All', ...uniqueAll];
  }, [apps, siteMeta]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: apps.length };
    for (const app of apps) {
      const cat = (app.category || '').trim();
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [apps]);

  const openPublishWithCategory = (cat?: string) => {
    setPublishInitialCategory(cat && cat !== 'All' ? cat : undefined);
    setIsPublishModalOpen(true);
  };

  const handleDirectDownload = (app: AppItem) => {
    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, downloads: item.downloads + 1 } : item
      )
    );

    setActiveDownloadNotification(`Downloading ${app.fileName} directly from MRS App Store...`);
    setTimeout(() => setActiveDownloadNotification(null), 4000);

    const staticUrl = getAppLocalApkUrl(app);

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
        onOpenPublish={() => openPublishWithCategory(selectedCategory)}
        onOpenLegal={handleOpenLegal}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setViewMode('cards');
        }}
        onOpenCharts={() => {
          setSelectedCategory('All');
          setViewMode('charts');
        }}
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

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        {featuredApp && !searchQuery && selectedCategory === 'All' && (
          <HeroFeatured
            app={featuredApp}
            onSelectApp={handleSelectApp}
            onDirectDownload={handleDirectDownload}
            hasBackend={hasBackend}
          />
        )}

        {/* Apple App Store Catalog Section */}
        <section id="catalog-section" className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedCategory === 'All' ? 'Apps & Smart TV' : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Direct APK releases with SHA-256 checksums, real user reviews, and verified owner profiles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search App Store..."
                  className="w-full bg-[#1c1c1e] border border-white/[0.08] rounded-xl pl-10 pr-14 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0a84ff] transition-colors min-h-[42px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#0a84ff] hover:text-white min-h-[32px] px-1 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort apps"
                className="w-full sm:w-auto bg-[#1c1c1e] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#0a84ff] min-h-[42px]"
              >
                <option value="popular">Top Charts</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Latest</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full min-w-0">
              <div className="inline-flex items-center gap-1 p-1 bg-[#1c1c1e] border border-white/[0.08] rounded-xl shrink-0">
                {categories.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 min-h-[34px] tabular-nums ${
                        selectedCategory === cat
                          ? 'bg-white text-black shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      {count > 0 && (
                        <span className={selectedCategory === cat ? 'text-zinc-600' : 'text-zinc-500'}>
                          · {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                className="inline-flex items-center gap-1 p-1 bg-[#1c1c1e] border border-white/[0.08] rounded-xl shrink-0"
                role="group"
                aria-label="Catalog layout"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[34px] ${
                    viewMode === 'cards' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Featured</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('charts')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[34px] ${
                    viewMode === 'charts' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Top Charts</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openPublishWithCategory(selectedCategory)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a84ff] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Publish Your App ($25 USD) ›</span>
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
            <div className="p-8 sm:p-12 text-center rounded-[24px] bg-[#1c1c1e] border border-white/[0.08] space-y-4">
              <Tv className="w-8 h-8 text-[#0a84ff] mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {selectedCategory !== 'All' && !searchQuery
                    ? `No apps published in ${selectedCategory} yet`
                    : 'No applications match your search'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {selectedCategory !== 'All' && !searchQuery
                    ? `Every listing in MRS App Store is a verified APK submission. Publish the first ${selectedCategory} APK directly with on-chain BEP-20 verification.`
                    : 'Reset your search filter to browse all verified applications across the store.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {selectedCategory !== 'All' && !searchQuery && (
                  <button
                    type="button"
                    onClick={() => openPublishWithCategory(selectedCategory)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0a84ff] text-white rounded-full text-xs font-bold transition-colors min-h-[42px]"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Publish First {selectedCategory} App ($25 USD)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-5 py-2.5 bg-white text-black rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors min-h-[42px]"
                >
                  View All Apps
                </button>
              </div>
            </div>
          ) : viewMode === 'charts' ? (
            <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-[22px] divide-y divide-white/[0.08] overflow-hidden">
              {filteredApps.map((app, idx) => (
                <AppCard
                  key={app.id}
                  app={app}
                  variant="row"
                  rank={idx + 1}
                  onSelectApp={handleSelectApp}
                  onDirectDownload={handleDirectDownload}
                />
              ))}
            </div>
          ) : (
            <div
              className={`grid gap-5 ${
                filteredApps.length === 1
                  ? 'grid-cols-1 max-w-3xl'
                  : filteredApps.length === 2 || filteredApps.length === 4
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredApps.map((app, idx) => (
                <AppCard
                  key={app.id}
                  app={app}
                  variant="card"
                  rank={sortBy === 'popular' ? idx + 1 : undefined}
                  onSelectApp={handleSelectApp}
                  onDirectDownload={handleDirectDownload}
                />
              ))}
            </div>
          )}
        </section>

        {/* Apple Store Editorial Spotlight: Real Verified Store Owner & Developer Publishing */}
        {(() => {
          const storeOwner = siteMeta?.ownerProfile || MRS_GRAVATAR_OWNER_PROFILE;
          return (
            <section className="mt-12">
              <div className="overflow-hidden rounded-[24px] bg-[#1c1c1e] border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[300px] bg-black flex items-center justify-center">
                  {!showcaseImgError ? (
                    <img
                      src={normalizeAssetPath('./assets/apple_tv_showcase.jpg')}
                      alt="Smart TV streaming hardware and remote"
                      onError={() => setShowcaseImgError(true)}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black text-[#0a84ff] p-6">
                      <Tv className="w-12 h-12" />
                      <span className="text-xs font-semibold text-zinc-400">Smart TV &amp; Android SDK</span>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                    <span className="text-[#0a84ff]">Official Store Owner &amp; Developer Program</span>
                    <span aria-hidden="true">·</span>
                    <span>All {categories.length - 1} App Categories Open</span>
                  </div>

                  {/* Real Verified Store Owner Row (No nested box) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {storeOwner.avatarUrl && !ownerAvatarError ? (
                        <img
                          src={storeOwner.avatarUrl}
                          alt={`${storeOwner.displayName} (@${storeOwner.username})`}
                          onError={() => setOwnerAvatarError(true)}
                          className="w-14 h-14 rounded-[22.5%] object-cover ring-1 ring-white/20 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-[22.5%] bg-[#2c2c2e] ring-1 ring-white/20 flex items-center justify-center text-[#0a84ff] shrink-0">
                          <UserCheck className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {storeOwner.displayName}
                          </h2>
                          <span className="text-xs font-mono text-zinc-400">@{storeOwner.username}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">
                          {storeOwner.headline}
                        </p>
                      </div>
                    </div>

                    <a
                      href={storeOwner.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a84ff] hover:underline whitespace-nowrap shrink-0"
                    >
                      <span>gravatar.com/{storeOwner.username}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight text-balance">
                      Publish your Android &amp; Smart TV APK across any store category
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                      Direct marketplace operated by {storeOwner.displayName} (@{storeOwner.username}). Verify your one-time $25.00 USD publishing fee on BNB Smart Chain (BEP-20), inspect your package manifest and SHA-256 signature, and publish live with direct downloads.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-300 font-mono">
                      <a href={`mailto:${storeOwner.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                        <Mail className="w-3.5 h-3.5 text-[#0a84ff]" />
                        <span>{storeOwner.email}</span>
                      </a>
                      {storeOwner.phone && (
                        <a href={`tel:${storeOwner.phone}`} className="inline-flex items-center gap-1.5 hover:text-white">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{storeOwner.phone}</span>
                        </a>
                      )}
                      {storeOwner.calendarUrl && (
                        <a
                          href={storeOwner.calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-sans text-zinc-300 hover:text-white"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#0a84ff]" />
                          <span>Calendly</span>
                        </a>
                      )}
                      {storeOwner.accounts?.map((acc) => (
                        <a
                          key={acc.url}
                          href={acc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-sans text-zinc-400 hover:text-white"
                        >
                          <span>{acc.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openPublishWithCategory(selectedCategory)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0a84ff] text-white text-xs font-bold transition-colors min-h-[42px] whitespace-nowrap"
                    >
                      <span>Start App Submission ($25 USD)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Instant On-Chain BEP-20 Verification</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
      </main>

      <Footer
        siteMeta={siteMeta}
        onOpenLegal={handleOpenLegal}
        onOpenPublish={() => openPublishWithCategory(selectedCategory)}
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
        initialCategory={publishInitialCategory}
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
