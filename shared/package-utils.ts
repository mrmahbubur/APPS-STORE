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

export type PackageFormatCode = 'APK' | 'EXE' | 'MSI' | 'MSIX' | 'APPX' | 'ZIP' | 'PACKAGE';
export type StorePlatformCategory = 'All' | 'Android' | 'Smart TV' | 'Windows';

export interface PackageMetadataInput {
  platform?: string;
  fileName?: string;
}

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
  filter: StorePlatformCategory | string
): boolean {
  const clean = (filter || '').trim().toLowerCase();
  if (!clean || clean === 'all') return true;
  if (clean === 'windows') return isWindowsPackage(app);
  if (clean === 'smart tv' || clean === 'tv') return isSmartTvPackage(app);
  if (clean === 'android') return isAndroidPackage(app);
  return (app.platform || '').toLowerCase().includes(clean);
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
