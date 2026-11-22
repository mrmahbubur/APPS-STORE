import type { AppItem, DeveloperSubmission, ReviewItem, SiteMeta, SponsorAdLink } from '../types';
import {
  SUPPORTED_WINDOWS_EXTENSIONS,
  SUPPORTED_PACKAGE_EXTENSIONS,
  LOCAL_PACKAGE_FILE_MAP,
  getPackageExtension,
  getPackageFormatCode,
  getAppPackageFormatLabel,
  getAppShareTitle,
  getAppShareText,
  getAppMinOsLabel,
  getPackageMimeType,
  getBuiltinPackageFile,
  getAppLocalPackageFile,
  getDefaultPackagePermissions,
  getDefaultPlatformForFilter,
  countAppsByPlatform,
  filterCatalogApps,
  sortCatalogApps,
  normalizeCatalogSortOption,
  sortReviewsByDate,
  isAndroidPackage,
  isHybridPackage,
  isSmartTvPackage,
  isWindowsPackage,
  matchesPlatformFilter,
} from '../../shared/package-utils.ts';
import {
  BUILTIN_APP_IDS,
  APP_STORE_CATEGORIES,
  MRS_GRAVATAR_OWNER_PROFILE,
  DEFAULT_SPONSOR_LINKS,
  buildBuiltinApps,
  buildSiteMeta,
  computeReviewStats,
  mapPlatformToSponsorTab,
  filterSponsorsByTab,
  getDetailPageSponsors,
  pickContextualSponsor,
} from '../../shared/store-metadata.ts';

export type {
  PackageFormatCode,
  StorePlatformFilter,
  StorePlatformCategory,
  CatalogSortOption,
  PackageMetadataInput,
  CatalogFilterableApp,
  CatalogFilterOptions,
  PlatformCounts,
} from '../../shared/package-utils.ts';

export {
  SUPPORTED_WINDOWS_EXTENSIONS,
  SUPPORTED_PACKAGE_EXTENSIONS,
  LOCAL_PACKAGE_FILE_MAP,
  BUILTIN_APP_IDS,
  APP_STORE_CATEGORIES,
  MRS_GRAVATAR_OWNER_PROFILE,
  DEFAULT_SPONSOR_LINKS,
  getPackageExtension,
  getPackageFormatCode,
  getAppPackageFormatLabel,
  getAppShareTitle,
  getAppShareText,
  getAppMinOsLabel,
  getPackageMimeType,
  getBuiltinPackageFile,
  getAppLocalPackageFile,
  getDefaultPackagePermissions,
  getDefaultPlatformForFilter,
  countAppsByPlatform,
  filterCatalogApps,
  sortCatalogApps,
  normalizeCatalogSortOption,
  sortReviewsByDate,
  isAndroidPackage,
  isHybridPackage,
  isSmartTvPackage,
  isWindowsPackage,
  matchesPlatformFilter,
  computeReviewStats,
  mapPlatformToSponsorTab,
  filterSponsorsByTab,
  getDetailPageSponsors,
  pickContextualSponsor,
};

export function isGitHubRootStaticMode(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).__MRS_GH_ROOT_MODE__);
}

export function normalizeAssetPath(url: string | undefined): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  let normalized = url.startsWith('./')
    ? url
    : url.startsWith('/')
    ? `.${url}`
    : `./${url}`;

  if (
    isGitHubRootStaticMode() &&
    (normalized.startsWith('./assets/') || normalized.startsWith('./apks/')) &&
    !normalized.startsWith('./public/')
  ) {
    normalized = `./public/${normalized.slice(2)}`;
  }

  return normalized;
}

export function getAppLocalPackageUrl(app: {
  id: string;
  fileName?: string;
  platform?: string;
  localApkPath?: string;
  directDownloadUrl?: string;
}): string {
  if (
    app.directDownloadUrl &&
    (app.directDownloadUrl.startsWith('http://') || app.directDownloadUrl.startsWith('https://'))
  ) {
    return app.directDownloadUrl;
  }
  if (app.localApkPath && (app.localApkPath.startsWith('/apks/') || app.localApkPath.startsWith('./apks/'))) {
    return normalizeAssetPath(app.localApkPath);
  }
  return normalizeAssetPath(`./apks/${getAppLocalPackageFile(app)}`);
}

export function getAppLocalApkFile(appId: string): string {
  return getAppLocalPackageFile(appId);
}

export function getAppLocalApkUrl(app: {
  id: string;
  fileName?: string;
  platform?: string;
  localApkPath?: string;
  directDownloadUrl?: string;
}): string {
  return getAppLocalPackageUrl(app);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export const DEFAULT_APPS: AppItem[] = buildBuiltinApps({ relativePaths: true });

// No fabricated seeded reviews — starts empty and populates strictly from real user submissions
export const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {};

export const LOCAL_PUBLISHED_APPS_KEY = 'mrs_published_apps';
export const LOCAL_SUBMISSIONS_KEY = 'mrs_developer_submissions';

export function getLocalPublishedApps(): AppItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHED_APPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((app: any) => app && typeof app === 'object' && app.id)
      .map((app: AppItem) => {
        const isWin = isWindowsPackage(app);
        const isHyb = isHybridPackage(app);
        return {
          ...app,
          title: app.title || 'Untitled App',
          fileName: app.fileName || (isWin && !isHyb ? 'app.exe' : 'app.apk'),
          tagline: app.tagline || '',
          category: app.category || 'Entertainment',
          platform: app.platform || (isWin ? 'Windows PC (10 / 11)' : 'Android Mobile'),
          version: app.version || '1.0.0',
          size: app.size || (isWin ? 'Windows Package' : 'APK'),
          rating: typeof app.rating === 'number' ? app.rating : 0,
          reviewsCount: typeof app.reviewsCount === 'number' ? app.reviewsCount : 0,
          downloads: typeof app.downloads === 'number' ? app.downloads : 0,
          minAndroid: app.minAndroid || getAppMinOsLabel(app),
          developer: app.developer || 'Developer',
          developerEmail: app.developerEmail || '',
          packageId: app.packageId || 'com.mrs.app',
          sha256: app.sha256 || '',
          directDownloadUrl: app.directDownloadUrl || '',
          description: app.description || '',
          whatsNew: Array.isArray(app.whatsNew) ? app.whatsNew : [],
          features: Array.isArray(app.features) ? app.features : [],
          permissions: Array.isArray(app.permissions) ? app.permissions : [],
          icon: normalizeAssetPath(app.icon) || normalizeAssetPath('./assets/site-logo-icon.jpg'),
          banner: normalizeAssetPath(app.banner) || normalizeAssetPath('./assets/site-logo-icon.jpg'),
          screenshots: (
            Array.isArray(app.screenshots) ? app.screenshots : ['./assets/site-logo-icon.jpg']
          ).map(normalizeAssetPath),
        };
      });
  } catch {
    return [];
  }
}

export function saveLocalPublishedApp(app: AppItem): AppItem[] {
  const existing = getLocalPublishedApps().filter((item) => item.id !== app.id);
  const updated = [app, ...existing];
  try {
    localStorage.setItem(LOCAL_PUBLISHED_APPS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getLocalSubmissions(): DeveloperSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSubmission(submission: DeveloperSubmission): DeveloperSubmission[] {
  const existing = getLocalSubmissions().filter((item) => item.id !== submission.id);
  const updated = [submission, ...existing];
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function mergeCatalogApps(primaryApps: AppItem[], localApps: AppItem[]): AppItem[] {
  const seen = new Set<string>();
  const merged: AppItem[] = [];

  for (const app of primaryApps) {
    if (app && app.id && !seen.has(app.id)) {
      seen.add(app.id);
      merged.push({
        ...app,
        whatsNew: Array.isArray(app.whatsNew) ? app.whatsNew : [],
        features: Array.isArray(app.features) ? app.features : [],
        permissions: Array.isArray(app.permissions) ? app.permissions : [],
        icon: normalizeAssetPath(app.icon),
        banner: normalizeAssetPath(app.banner),
        screenshots: (Array.isArray(app.screenshots) ? app.screenshots : []).map(normalizeAssetPath),
      });
    }
  }

  for (const app of localApps) {
    if (app && app.id && !seen.has(app.id)) {
      seen.add(app.id);
      merged.push({
        ...app,
        whatsNew: Array.isArray(app.whatsNew) ? app.whatsNew : [],
        features: Array.isArray(app.features) ? app.features : [],
        permissions: Array.isArray(app.permissions) ? app.permissions : [],
        icon: normalizeAssetPath(app.icon) || normalizeAssetPath('./assets/site-logo-icon.jpg'),
        banner: normalizeAssetPath(app.banner) || normalizeAssetPath('./assets/site-logo-icon.jpg'),
        screenshots: (
          Array.isArray(app.screenshots) ? app.screenshots : ['./assets/site-logo-icon.jpg']
        ).map(normalizeAssetPath),
      });
    }
  }

  return merged;
}

export function getLocalReviews(appId: string): ReviewItem[] {
  try {
    const raw = localStorage.getItem(`mrs_reviews_${appId}`);
    if (!raw) return [];
    const saved: ReviewItem[] = JSON.parse(raw);
    return sortReviewsByDate(Array.isArray(saved) ? saved : []);
  } catch {
    return [];
  }
}

export function saveLocalReview(appId: string, review: ReviewItem): ReviewItem[] {
  const existing = getLocalReviews(appId);
  const updated = [review, ...existing];
  try {
    localStorage.setItem(`mrs_reviews_${appId}`, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function markLocalReviewHelpful(appId: string, reviewId: string): ReviewItem[] {
  const existing = getLocalReviews(appId);
  const updated = existing.map((r) =>
    r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
  );
  try {
    localStorage.setItem(`mrs_reviews_${appId}`, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getDefaultSiteMeta(): SiteMeta {
  return buildSiteMeta({ ownerProfile: MRS_GRAVATAR_OWNER_PROFILE });
}

export type { SponsorAdLink };
