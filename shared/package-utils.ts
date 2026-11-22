import type {
  CatalogFilterOptions,
  CatalogFilterableApp,
  CatalogSortOption,
  PackageFormatCode,
  PackageMetadataInput,
  PlatformCounts,
  StorePlatformCategory,
  StorePlatformFilter,
} from './types.ts';

export type {
  PackageFormatCode,
  StorePlatformFilter,
  StorePlatformCategory,
  CatalogSortOption,
  PackageMetadataInput,
  CatalogFilterableApp,
  CatalogFilterOptions,
  PlatformCounts,
} from './types.ts';

export const SUPPORTED_WINDOWS_EXTENSIONS = [
  '.exe',
  '.msi',
  '.msix',
  '.msixbundle',
  '.appx',
  '.appxbundle',
  '.zip',
] as const;

export const SUPPORTED_PACKAGE_EXTENSIONS = [
  '.apk',
  '.exe',
  '.msi',
  '.msix',
  '.msixbundle',
  '.appx',
  '.appxbundle',
  '.zip',
] as const;

export const LOCAL_PACKAGE_FILE_MAP: Record<string, string> = {
  'm-r-s-iptv': 'M_R_S_IPTV.apk',
  'm-r-s-iptv-pro': 'M_R_S_IPTV_Pro.apk',
  'camellia-ai': 'Camillia_Ai.apk',
};

const WINDOWS_INSTALLER_EXT_RE = /\.(exe|msi|msix|msixbundle|appx|appxbundle)$/i;
const ANDROID_PLATFORM_RE = /android|mobile/i;
const SMART_TV_PLATFORM_RE = /smart tv|firestick|android tv|google tv/i;

export function getPackageExtension(fileName?: string): string {
  const clean = (fileName || '').trim().toLowerCase();
  const match = clean.match(/\.(apk|exe|msi|msix|msixbundle|appx|appxbundle|zip)$/);
  return match ? match[0] : '';
}

export function isWindowsPackage(app: PackageMetadataInput): boolean {
  const platform = app.platform || '';
  const ext = getPackageExtension(app.fileName);
  if (/windows/i.test(platform)) return true;
  if (WINDOWS_INSTALLER_EXT_RE.test(ext)) return true;
  if (ext === '.zip' && !ANDROID_PLATFORM_RE.test(platform) && !SMART_TV_PLATFORM_RE.test(platform)) {
    return true;
  }
  return false;
}

export function isSmartTvPackage(app: PackageMetadataInput): boolean {
  return SMART_TV_PLATFORM_RE.test(app.platform || '');
}

export function isAndroidPackage(app: PackageMetadataInput): boolean {
  const platform = app.platform || '';
  const ext = getPackageExtension(app.fileName);
  if (ext === '.apk') return true;
  if (ANDROID_PLATFORM_RE.test(platform)) return true;
  return false;
}

export function isHybridPackage(app: PackageMetadataInput): boolean {
  return isWindowsPackage(app) && (isAndroidPackage(app) || isSmartTvPackage(app));
}

export function matchesPlatformFilter(
  app: PackageMetadataInput,
  filter: StorePlatformFilter | StorePlatformCategory | string
): boolean {
  const clean = (filter || '').trim().toLowerCase();
  if (!clean || clean === 'all') return true;
  if (clean === 'windows') return isWindowsPackage(app);
  if (clean === 'smart tv' || clean === 'tv') return isSmartTvPackage(app);
  if (clean === 'android') return isAndroidPackage(app);
  return (app.platform || '').toLowerCase().includes(clean);
}

export function countAppsByPlatform(apps: readonly PackageMetadataInput[]): PlatformCounts {
  return {
    All: apps.length,
    Android: apps.filter((a) => matchesPlatformFilter(a, 'Android')).length,
    'Smart TV': apps.filter((a) => matchesPlatformFilter(a, 'Smart TV')).length,
    Windows: apps.filter((a) => matchesPlatformFilter(a, 'Windows')).length,
  };
}

export function getDefaultPlatformForFilter(filter?: string): string | undefined {
  if (filter === 'Windows') return 'Windows PC (10 / 11)';
  if (filter === 'Smart TV') return 'Smart TV (Firestick / Android TV)';
  if (filter === 'Android') return 'Android Mobile';
  if (filter && filter !== 'All') return filter;
  return undefined;
}

export function normalizeCatalogSortOption(
  raw?: string,
  fallback?: CatalogSortOption
): CatalogSortOption | undefined {
  const clean = (raw || '').trim().toLowerCase();
  if (clean === 'popular' || clean === 'rating' || clean === 'newest') {
    return clean;
  }
  return fallback;
}

export function sortCatalogApps<T extends CatalogFilterableApp>(
  apps: readonly T[],
  sortBy?: CatalogSortOption | string
): T[] {
  const normalizedSort = normalizeCatalogSortOption(sortBy);
  if (!normalizedSort) {
    return [...apps];
  }

  return [...apps].sort((a, b) => {
    if (normalizedSort === 'popular') {
      const dlDiff = (b.downloads || 0) - (a.downloads || 0);
      if (dlDiff !== 0) return dlDiff;
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) return featuredDiff;
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (a.title || '').localeCompare(b.title || '');
    }

    if (normalizedSort === 'rating') {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      const reviewDiff = (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (reviewDiff !== 0) return reviewDiff;
      const dlDiff = (b.downloads || 0) - (a.downloads || 0);
      if (dlDiff !== 0) return dlDiff;
      return (a.title || '').localeCompare(b.title || '');
    }

    const timeDiff =
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
    return (a.title || '').localeCompare(b.title || '');
  });
}

export function filterCatalogApps<T extends CatalogFilterableApp>(
  apps: readonly T[],
  options: CatalogFilterOptions = {}
): T[] {
  const category = (options.category || '').trim();
  const platform = (options.platform || '').trim();
  const query = (options.search || '').trim().toLowerCase();

  const filtered = apps.filter((app) => {
    const matchesCategory =
      !category ||
      category.toLowerCase() === 'all' ||
      (app.category || '').toLowerCase() === category.toLowerCase();

    if (!matchesCategory) return false;

    if (platform && !matchesPlatformFilter(app, platform)) {
      return false;
    }

    if (!query) return true;

    return (
      (app.title || '').toLowerCase().includes(query) ||
      (app.fileName || '').toLowerCase().includes(query) ||
      (app.tagline || '').toLowerCase().includes(query) ||
      (app.description || '').toLowerCase().includes(query) ||
      (app.developer || '').toLowerCase().includes(query) ||
      (app.platform || '').toLowerCase().includes(query)
    );
  });

  return options.sortBy ? sortCatalogApps(filtered, options.sortBy) : filtered;
}

export function sortReviewsByDate<
  T extends { createdAt?: string; helpfulCount?: number }
>(reviews: readonly T[]): T[] {
  return [...reviews].sort((a, b) => {
    const dateDiff =
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (!Number.isNaN(dateDiff) && dateDiff !== 0) return dateDiff;
    return (b.helpfulCount || 0) - (a.helpfulCount || 0);
  });
}

export function getPackageFormatCode(app: PackageMetadataInput): PackageFormatCode {
  const ext = getPackageExtension(app.fileName);
  if (ext === '.exe') return 'EXE';
  if (ext === '.msi') return 'MSI';
  if (ext === '.msix' || ext === '.msixbundle') return 'MSIX';
  if (ext === '.appx' || ext === '.appxbundle') return 'APPX';
  if (ext === '.zip') return 'ZIP';
  if (ext === '.apk') return 'APK';
  return isWindowsPackage(app) ? 'PACKAGE' : 'APK';
}

export function getAppPackageFormatLabel(app: PackageMetadataInput): string {
  const code = getPackageFormatCode(app);
  switch (code) {
    case 'EXE':
      return 'Direct EXE';
    case 'MSI':
      return 'Direct MSI';
    case 'MSIX':
      return 'Direct MSIX';
    case 'APPX':
      return 'Direct APPX';
    case 'ZIP':
      return 'Direct ZIP';
    case 'APK':
      return 'Direct APK';
    case 'PACKAGE':
    default:
      return 'Direct Package';
  }
}

export function getPackageMimeType(fileName?: string): string {
  const ext = getPackageExtension(fileName);
  if (ext === '.exe') return 'application/vnd.microsoft.portable-executable';
  if (ext === '.msi') return 'application/x-msi';
  if (ext === '.msix' || ext === '.msixbundle') return 'application/msix';
  if (ext === '.appx' || ext === '.appxbundle') return 'application/appx';
  if (ext === '.zip') return 'application/zip';
  return 'application/vnd.android.package-archive';
}

export function getBuiltinPackageFile(appId: string): string | undefined {
  return LOCAL_PACKAGE_FILE_MAP[appId];
}

export function getAppLocalPackageFile(
  appOrId: string | { id: string; fileName?: string; platform?: string }
): string {
  const appId = typeof appOrId === 'string' ? appOrId : appOrId.id;
  if (LOCAL_PACKAGE_FILE_MAP[appId]) {
    return LOCAL_PACKAGE_FILE_MAP[appId];
  }
  if (typeof appOrId !== 'string') {
    const ext = getPackageExtension(appOrId.fileName);
    if (ext) {
      return `${appId}${ext}`;
    }
    if (isWindowsPackage(appOrId) && !isHybridPackage(appOrId)) {
      return `${appId}.exe`;
    }
  }
  return `${appId}.apk`;
}

export function getDefaultPackagePermissions(app: PackageMetadataInput): string[] {
  if (isWindowsPackage(app) && !isHybridPackage(app)) {
    return ['Windows Desktop Runtime', 'Direct Installer / Executable'];
  }
  return ['android.permission.INTERNET'];
}

export function getAppShareTitle(app: {
  title: string;
  platform?: string;
  fileName?: string;
}): string {
  if (isHybridPackage(app)) {
    return `${app.title} — Official Windows & Android Package`;
  }
  if (isWindowsPackage(app)) {
    return `${app.title} — Official Windows Package`;
  }
  return `${app.title} — Official APK`;
}

export function getAppShareText(app: {
  title: string;
  fileName?: string;
  size?: string;
  platform?: string;
}): string {
  const formatLabel = getAppPackageFormatLabel(app);
  const metaParts = [app.fileName, app.size, formatLabel].filter(Boolean).join(' · ');
  return `Download ${app.title}${metaParts ? ` (${metaParts})` : ''} directly from MRS App Store.`;
}

export function getAppMinOsLabel(app: PackageMetadataInput): string {
  if (isHybridPackage(app)) {
    return 'Windows 10/11 · Android 8.0+';
  }
  if (isWindowsPackage(app)) {
    return 'Windows 10 / 11 (x64 / ARM64)';
  }
  return 'Android 8.0+ (API 26)';
}
