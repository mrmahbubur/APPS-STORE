import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { AppCard } from './components/AppCard';
import { AppDetailModal } from './components/AppDetailModal';
import { PublishAppModal } from './components/PublishAppModal';
import { LegalPoliciesModal } from './components/LegalPoliciesModal';
import { ThemeExportModal } from './components/ThemeExportModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AppItem, SiteMeta } from './types';
import {
  Search,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Tv,
  Download,
  AlertCircle,
  DollarSign,
  Mail,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'IPTV & Streaming',
  'Smart TV & Video',
  'AI & Virtual Assistant',
];

export default function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [siteMeta, setSiteMeta] = useState<SiteMeta | null>(null);
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
  const [isThemeExportOpen, setIsThemeExportOpen] = useState(false);

  // Mobile navigation
  const [mobileTab, setMobileTab] = useState<'discover' | 'categories' | 'publish' | 'legal'>('discover');

  // Download notification toast
  const [activeDownloadNotification, setActiveDownloadNotification] = useState<string | null>(null);

  // Load apps and site metadata
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, metaRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/meta')
      ]);

      if (!appsRes.ok) throw new Error('Failed to retrieve applications catalog');
      const appsData = await appsRes.json();
      setApps(appsData.apps || []);

      if (metaRes.ok) {
        const metaData = await metaRes.json();
        setSiteMeta(metaData.meta || null);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Unable to connect to application server.');
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
        const found = apps.find(
          (a) => a.id.toLowerCase() === appQuery.toLowerCase()
        );
        if (found) {
          setSelectedApp(found);
        }
      }
    }
  }, [apps]);

  const handleSelectApp = (app: AppItem) => {
    setSelectedApp(app);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('app', app.id);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  const handleCloseDetail = () => {
    setSelectedApp(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('app');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  // Filtered and sorted apps
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

  // Featured App for Apple-style Today section
  const featuredApp = useMemo(() => {
    return apps.find((a) => a.featured) || apps[0];
  }, [apps]);

  // Direct In-House APK Download Handler
  const handleDirectDownload = (app: AppItem) => {
    // Optimistically increment download count
    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, downloads: item.downloads + 1 } : item
      )
    );

    // Show toast feedback
    setActiveDownloadNotification(`Downloading ${app.fileName} directly from MRS App Store...`);
    setTimeout(() => setActiveDownloadNotification(null), 4000);

    // Trigger direct in-browser download
    const link = document.createElement('a');
    link.href = `/api/download/${app.id}`;
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
      {/* Top Header */}
      <Header
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenLegal={handleOpenLegal}
        onOpenThemeExport={() => setIsThemeExportOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        activeCategory={selectedCategory}
      />

      {/* Download Alert Toast */}
      {activeDownloadNotification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-2xl bg-zinc-900 text-white shadow-2xl flex items-center gap-3 border border-white/15 text-xs font-semibold">
            <Download className="w-4 h-4 text-blue-400 animate-bounce" />
            <span>{activeDownloadNotification}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Apple Store "Today" Editorial Hero Section */}
        {featuredApp && !searchQuery && selectedCategory === 'All' && (
          <HeroFeatured
            app={featuredApp}
            onSelectApp={handleSelectApp}
            onDirectDownload={handleDirectDownload}
          />
        )}

        {/* Verification & Developer Network Strip */}
        <section className="my-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Smart TV Optimized</p>
              <p className="text-zinc-400 text-[11px]">Firestick &amp; Android TV</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Direct Download Link</p>
              <p className="text-zinc-400 text-[11px]">upload-apk.com Host</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">$25 USD Publish</p>
              <p className="text-zinc-400 text-[11px]">Developer Review</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">mr216873@gmail.com</p>
              <p className="text-zinc-400 text-[11px]">Administrator Dispatch</p>
            </div>
          </div>
        </section>

        {/* Catalog Section: Search, Category Filters & App Grid */}
        <section id="catalog-section" className="mt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedCategory === 'All' ? 'Featured Applications' : selectedCategory}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Official verified APKs from MRS TV Network with direct download channel.
              </p>
            </div>

            {/* Apple-style Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search M R S IPTV..."
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Apple Store Filter Segmented Bar */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-white/[0.08] rounded-full">
              {CATEGORIES.map((cat) => (
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

            {/* Developer Publish Action shortcut */}
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Submit New App ($25 USD) ›</span>
            </button>
          </div>

          {/* Genuine Apps Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8">
              {[1, 2].map((n) => (
                <div key={n} className="h-56 rounded-[2rem] bg-zinc-900/50 border border-white/[0.08] animate-pulse p-6" />
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
                Select 'All' to view all official M R S IPTV applications.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

      {/* Footer */}
      <Footer
        siteMeta={siteMeta}
        onOpenLegal={handleOpenLegal}
        onOpenThemeExport={() => setIsThemeExportOpen(true)}
        onOpenPublish={() => setIsPublishModalOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileNav}
      />

      {/* App Details Modal */}
      <AppDetailModal
        app={selectedApp}
        onClose={handleCloseDetail}
        onDirectDownload={handleDirectDownload}
      />

      {/* Developer Publishing Modal ($25 USD Payment + Email to mr216873@gmail.com) */}
      <PublishAppModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Legal & Policies Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        siteMeta={siteMeta}
        initialTab={legalTab}
      />

      {/* Theme XML Export Modal */}
      <ThemeExportModal
        isOpen={isThemeExportOpen}
        onClose={() => setIsThemeExportOpen(false)}
      />
    </div>
  );
}
