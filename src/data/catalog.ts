import { AppItem, AppOwnerProfile, ReviewItem, ReviewStats, SiteMeta, SponsorAdLink } from '../types';

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

export function getAppLocalApkFile(appId: string): string {
  const apkMap: Record<string, string> = {
    'm-r-s-iptv': 'M_R_S_IPTV.apk',
    'm-r-s-iptv-pro': 'M_R_S_IPTV_Pro.apk',
    'camellia-ai': 'Camillia_Ai.apk',
  };
  return apkMap[appId] || `${appId}.apk`;
}

export function getAppLocalApkUrl(app: {
  id: string;
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
  return normalizeAssetPath(`./apks/${getAppLocalApkFile(app.id)}`);
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

export const APP_STORE_CATEGORIES: string[] = [
  'IPTV & Streaming',
  'Smart TV & Video',
  'Entertainment',
  'AI & Virtual Assistant',
  'Games',
  'Productivity',
  'Utilities',
  'Social & Communication',
  'Music & Audio',
  'Photo & Video',
  'Education',
  'Developer Tools',
  'News & Magazines',
  'Finance & Crypto',
  'Shopping',
  'Health & Fitness',
  'Travel & Navigation',
  'Business',
  'Sports',
  'Lifestyle',
  'Books & Reference',
  'Weather',
  'Food & Drink',
  'Medical',
  'Graphics & Design',
  'Kids & Family',
  'Personalization',
  'Auto & Vehicles',
];

// Official owner profile name & avatar from Gravatar (name & avatar only — no username or social links)
export const MRS_GRAVATAR_OWNER_PROFILE: AppOwnerProfile = {
  displayName: 'M R S',
  username: '',
  profileUrl: '',
  avatarUrl:
    'https://1.gravatar.com/avatar/79cb903b47ada0af52e9962551bab25e563cc0a515939789f348aaa0ca135946?s=256',
  email: '',
};

export const DEFAULT_APPS: AppItem[] = [
  {
    id: 'm-r-s-iptv',
    title: 'M R S IPTV Android',
    fileName: 'M R S IPTV.apk',
    tagline: 'Official M R S IPTV Android APK hosted directly on MRS App Store.',
    category: 'IPTV & Streaming',
    platform: 'Android Mobile & Smart TV',
    version: '1.0.0',
    updatedAt: '2026-11-12',
    size: '9.33 MB',
    rating: 0,
    reviewsCount: 0,
    downloads: 0,
    minAndroid: 'Android 8.0+ (API 26)',
    ageRating: 'Everyone',
    languages: 'Android System Locale',
    chartRank: 'v1.0.0',
    icon: './assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    banner: './assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    developer: 'M R S',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'M R S',
    ownerProfile: MRS_GRAVATAR_OWNER_PROFILE,
    packageId: 'co.median.android.rdalmaa',
    sha256: 'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c',
    directDownloadUrl: './apks/M_R_S_IPTV.apk',
    downloadUrl: './apks/M_R_S_IPTV.apk',
    shareUrl: './?app=m-r-s-iptv',
    localApkPath: './apks/M_R_S_IPTV.apk',
    description:
      'M R S IPTV Android is the official Android application published by M R S. The APK binary (M R S IPTV.apk) is hosted directly in MRS App Store for one-click download and installation on Android 8.0+ devices.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (9.33 MB)',
      'Build 3 (Version 1.0.0) compiled for Android API 26+',
      'Verified SHA-256 binary checksum published on product page',
    ],
    features: [
      'Direct APK download with no third-party redirects',
      'Supports Android 8.0 (API 26) and above',
      'Published and maintained by M R S',
      'Shareable app page link and direct APK download URL',
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.VIBRATE',
      'android.permission.DUMP',
    ],
    screenshots: ['./assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'],
    featured: true,
    editorChoice: false,
  },
  {
    id: 'm-r-s-iptv-pro',
    title: 'M R S IPTV TV',
    fileName: 'M_R_S_IPTV.apk',
    tagline: 'Official M R S IPTV TV APK hosted directly on MRS App Store.',
    category: 'Smart TV & Video',
    platform: 'Smart TV & Android Mobile',
    version: '1.0',
    updatedAt: '2026-11-12',
    size: '31.93 MB',
    rating: 0,
    reviewsCount: 0,
    downloads: 0,
    minAndroid: 'Android 8.0+ (API 26)',
    ageRating: 'Everyone',
    languages: 'Android System Locale',
    chartRank: 'v1.0',
    icon: './assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    banner: './assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    developer: 'M R S',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'M R S',
    ownerProfile: MRS_GRAVATAR_OWNER_PROFILE,
    packageId: 'com.wMRSIPTV_20119768',
    sha256: 'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92',
    directDownloadUrl: './apks/M_R_S_IPTV_Pro.apk',
    downloadUrl: './apks/M_R_S_IPTV_Pro.apk',
    shareUrl: './?app=m-r-s-iptv-pro',
    localApkPath: './apks/M_R_S_IPTV_Pro.apk',
    description:
      'M R S IPTV TV (M_R_S_IPTV.apk) is the Smart TV and Android edition distributed directly by M R S. Hosted locally on MRS App Store for direct sideloading and mobile installation.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (31.93 MB)',
      'Package com.wMRSIPTV_20119768 (Version 1.0)',
      'Verified SHA-256 binary checksum published on product page',
    ],
    features: [
      'Direct APK download with no external hosting redirects',
      'Supports Android 8.0 (API 26) and above',
      'Published and maintained by M R S',
      'Shareable app link and direct binary URL',
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.CHANGE_WIFI_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.CAMERA',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.NFC',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.INSTALL_PACKAGES',
      'android.permission.BIND_JOB_SERVICE',
      'android.permission.QUICKBOOT_POWERON',
      'android.permission.READ_APP_BADGE',
      'android.permission.DUMP',
    ],
    screenshots: ['./assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'],
    featured: false,
    editorChoice: false,
  },
  {
    id: 'camellia-ai',
    title: 'Camillia Ai',
    fileName: 'Camillia Ai.apk',
    tagline: 'Intelligent AI chat & productivity assistant Android APK hosted directly on MRS App Store.',
    category: 'AI & Virtual Assistant',
    platform: 'Android Mobile',
    version: '1.0.0',
    updatedAt: '2026-11-17',
    size: '7.68 MB',
    rating: 0,
    reviewsCount: 0,
    downloads: 0,
    minAndroid: 'Android 8.0+ (API 26)',
    ageRating: 'Everyone',
    languages: 'Android System Locale',
    chartRank: 'v1.0.0',
    icon: './assets/aistudio/camellia-logo_e7fcb198.png',
    banner: './assets/aistudio/camellia-logo_e7fcb198.png',
    developer: 'M R S',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'M R S',
    ownerProfile: MRS_GRAVATAR_OWNER_PROFILE,
    packageId: 'co.median.android.krqrjbd',
    sha256: '6ebf12098208a31dbb00a15864d95e966aae11b441975fb240b8ce78a35676cd',
    directDownloadUrl: './apks/Camillia_Ai.apk',
    downloadUrl: './apks/Camillia_Ai.apk',
    shareUrl: './?app=camellia-ai',
    localApkPath: './apks/Camillia_Ai.apk',
    description:
      'Camillia Ai (Camillia Ai.apk) is an Android AI & Virtual Assistant application imported from upload-apk.com (aOOQ4KXgicyfICc) and distributed directly by M R S on MRS App Store with instant APK delivery and SHA-256 checksum verification.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (7.68 MB)',
      'Package co.median.android.krqrjbd (Version 1.0.0) for Android 8.0+ (API 26)',
      'Custom uploaded Camillia app icon and verified SHA-256 binary signature',
    ],
    features: [
      'Instant direct APK download without countdown timers or redirects',
      'Supports Android 8.0 (API 26) and above',
      'Verified binary imported from https://www.upload-apk.com/aOOQ4KXgicyfICc',
      'Listed and maintained by M R S',
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.VIBRATE',
      'android.permission.DUMP',
      'com.google.android.c2dm.permission.RECEIVE',
    ],
    screenshots: ['./assets/aistudio/camellia-logo_e7fcb198.png'],
    featured: false,
    editorChoice: true,
  },
];

// No fabricated seeded reviews — starts empty and populates strictly from real user submissions
export const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {};

export function computeReviewStats(reviews: ReviewItem[]): ReviewStats {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown,
    };
  }

  let sum = 0;
  for (const rev of reviews) {
    const clamped = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[clamped] += 1;
    sum += clamped;
  }

  const averageRating = Number((sum / reviews.length).toFixed(1));
  return {
    averageRating,
    totalReviews: reviews.length,
    breakdown,
  };
}

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
        const isWin =
          /windows/i.test(app.platform || '') ||
          /\.(exe|msi|msix|msixbundle|appx|appxbundle|zip)$/i.test(app.fileName || '');
        return {
          ...app,
          title: app.title || 'Untitled App',
          fileName: app.fileName || (isWin ? 'app.exe' : 'app.apk'),
          tagline: app.tagline || '',
          category: app.category || 'Entertainment',
          platform: app.platform || 'Android Mobile',
          version: app.version || '1.0.0',
          size: app.size || (isWin ? 'Windows Package' : 'APK'),
          rating: typeof app.rating === 'number' ? app.rating : 0,
          reviewsCount: typeof app.reviewsCount === 'number' ? app.reviewsCount : 0,
          downloads: typeof app.downloads === 'number' ? app.downloads : 0,
          minAndroid: app.minAndroid || (isWin ? 'Windows 10 / 11 (x64 / ARM64)' : 'Android 8.0+ (API 26)'),
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
          screenshots: (Array.isArray(app.screenshots) ? app.screenshots : ['./assets/site-logo-icon.jpg']).map(normalizeAssetPath),
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

export function getLocalSubmissions(): import('../types').DeveloperSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSubmission(
  submission: import('../types').DeveloperSubmission
): import('../types').DeveloperSubmission[] {
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
        screenshots: (Array.isArray(app.screenshots) ? app.screenshots : ['./assets/site-logo-icon.jpg']).map(normalizeAssetPath),
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
    return saved.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
  const currentYear = new Date().getFullYear();
  const ownerLabel = MRS_GRAVATAR_OWNER_PROFILE.displayName;
  return {
    appName: 'MRS App Store',
    tagline: `Official Android, Smart TV & Windows App Store Owned by ${ownerLabel}`,
    currentYear,
    copyrightNotice: `© ${currentYear} ${ownerLabel}. All rights reserved.`,
    adminEmail: 'mr216873@gmail.com',
    ownerInfo: {
      ownerName: ownerLabel,
      organization: ownerLabel,
      email: '',
      role: 'Store Owner',
      location: '',
      supportResponseTime: '',
      publishingFeeUsd: 25.0,
      verificationNote: 'Store Owner',
    },
    ownerProfile: MRS_GRAVATAR_OWNER_PROFILE,
    categories: APP_STORE_CATEGORIES,
    submissionFeeUsd: 25.0,
    lastUpdated: new Date().toISOString(),
    policies: {
      privacy: {
        title: 'App Privacy Policy',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'MRS App Store serves direct Android APK and Windows installer files without third-party redirect walls or cross-site tracking.',
        sections: [
          {
            heading: '1. Direct Package Distribution',
            content:
              'Android APK and Windows (.exe, .msi, .msix, .zip) binaries listed in the store are hosted directly on MRS App Store storage with published SHA-256 hashes.',
          },
          {
            heading: '2. Submitted Reviews',
            content:
              'User reviews submitted on app pages store only the name, device type, rating, and review text entered by the reviewer.',
          },
          {
            heading: '3. Sponsored Partner Links',
            content:
              'Clearly labeled Sponsored partner placements link to external sponsor destinations (uplcm.com) in a separate tab and remain independent from direct APK and Windows installer downloads.',
          },
        ],
      },
      terms: {
        title: 'Terms & Conditions',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'Terms governing access to Android, Smart TV, and Windows packages hosted on MRS App Store.',
        sections: [
          {
            heading: '1. Direct Package Downloads',
            content:
              'Users can inspect package file size, version, permissions, and SHA-256 hash prior to downloading.',
          },
        ],
      },
      developer: {
        title: 'Developer Publishing & Review Agreement',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'Developers may publish Android APKs, Smart TV apps, and Windows (.exe, .msi, .msix, .appx, .zip) packages across all 28 categories after completing the $25.00 USD publishing fee via Binance Pay or USDT BEP-20.',
        sections: [
          {
            heading: '1. Submission Fee & Payment Options ($25 USD)',
            content:
              'A one-time publishing fee of $25.00 USD is accepted via Binance Pay QR (M R S) or USDT (BNB Smart Chain BEP20: 0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e).',
          },
          {
            heading: '2. Supported Packages & Binary Inspection',
            content:
              'Upload verified Android (.apk) binaries or Windows installers and portable executables (.exe PE, .msi MSI, .msix/.appx, .zip) for automatic header inspection and SHA-256 checksum generation, or dispatch external package links and payment proof to mr216873@gmail.com for review.',
          },
        ],
      },
      dmca: {
        title: 'DMCA & Intellectual Property Compliance',
        lastRenewed: `January 1, ${currentYear}`,
        summary: 'Intellectual property and package takedown compliance for Android, Smart TV, and Windows releases.',
        sections: [
          {
            heading: '1. Contact',
            content:
              'Direct any copyright or package verification queries for Android or Windows binaries to mr216873@gmail.com.',
          },
        ],
      },
    },
  };
}

export const DEFAULT_SPONSOR_LINKS: SponsorAdLink[] = [
  {
    id: 'sponsor-11226634',
    zoneId: '11226634',
    title: 'Streaming & Smart TV Partners',
    subtitle: 'Live TV channels, smart player add-ons, and 4K streaming tools.',
    category: 'Streaming & TV',
    platformHint: 'Android & TV',
    placement: 'featured',
    url: 'https://uplcm.com/4/11226634',
    ctaLabel: 'Open',
  },
  {
    id: 'sponsor-11683565',
    zoneId: '11683565',
    title: 'Windows PC Software Spotlight',
    subtitle: 'Featured desktop utilities, media suites, and Windows 11 tools.',
    category: 'Windows PC',
    platformHint: 'Windows PC',
    placement: 'featured',
    url: 'https://uplcm.com/4/11683565',
    ctaLabel: 'Open',
  },
  {
    id: 'sponsor-11242745',
    zoneId: '11242745',
    title: 'VPN & Network Privacy',
    subtitle: 'Fast encrypted routing for Smart TV, Android, and desktop.',
    category: 'Privacy & VPN',
    platformHint: 'All Devices',
    placement: 'catalog',
    url: 'https://uplcm.com/4/11242745',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11242069',
    zoneId: '11242069',
    title: 'Smart TV Remote & Cast Tools',
    subtitle: 'Companion casting helpers and playlist management utilities.',
    category: 'Smart TV',
    platformHint: 'Android & TV',
    placement: 'catalog',
    url: 'https://uplcm.com/4/11242069',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11242067',
    zoneId: '11242067',
    title: 'Android Device Optimizer',
    subtitle: 'Storage cleanup, APK backup, and system performance tools.',
    category: 'Android Utilities',
    platformHint: 'Android & TV',
    placement: 'catalog',
    url: 'https://uplcm.com/4/11242067',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11242742',
    zoneId: '11242742',
    title: 'Windows Driver & Codec Pack',
    subtitle: 'Essential desktop media codecs and hardware runtime helpers.',
    category: 'Windows Utilities',
    platformHint: 'Windows PC',
    placement: 'catalog',
    url: 'https://uplcm.com/4/11242742',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11230440',
    zoneId: '11230440',
    title: 'Cloud Storage & Fast Sync',
    subtitle: 'Encrypted cross-device file transfers across PC and mobile.',
    category: 'Productivity',
    platformHint: 'All Devices',
    placement: 'detail',
    url: 'https://uplcm.com/4/11230440',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11683560',
    zoneId: '11683560',
    title: 'Games & Controller Hub',
    subtitle: 'Featured casual games and gamepad mapping companions.',
    category: 'Games',
    platformHint: 'All Devices',
    placement: 'detail',
    url: 'https://uplcm.com/4/11683560',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-9912130',
    zoneId: '9912130',
    title: 'Cloud Hosting & CDN Suite',
    subtitle: 'High-speed edge delivery and developer infrastructure.',
    category: 'Developer Tools',
    platformHint: 'All Devices',
    placement: 'catalog',
    url: 'https://uplcm.com/4/9912130',
    ctaLabel: 'Visit',
  },
  {
    id: 'sponsor-11242744',
    zoneId: '11242744',
    title: 'Security & Ad-Shield Pro',
    subtitle: 'Web protection and anti-tracking shields for all screens.',
    category: 'Security',
    platformHint: 'All Devices',
    placement: 'catalog',
    url: 'https://uplcm.com/4/11242744',
    ctaLabel: 'Visit',
  },
];

export function pickContextualSponsor(
  sponsors: SponsorAdLink[],
  opts: { platform?: string; category?: string; excludeIds?: string[] }
): SponsorAdLink | null {
  const pool = (sponsors && sponsors.length > 0 ? sponsors : DEFAULT_SPONSOR_LINKS).filter(
    (item) => !(opts.excludeIds || []).includes(item.id)
  );
  if (pool.length === 0) return null;

  const plat = (opts.platform || '').toLowerCase();
  const cat = (opts.category || '').toLowerCase();

  const findById = (id: string) => pool.find((s) => s.id === id);

  if (cat.includes('game')) {
    return findById('sponsor-11683560') || pool[0];
  }
  if (cat.includes('developer')) {
    return findById('sponsor-9912130') || pool[0];
  }
  if (cat.includes('productivity') || cat.includes('business')) {
    return findById('sponsor-11230440') || pool[0];
  }
  if (cat.includes('utilit') && plat.includes('windows')) {
    return findById('sponsor-11242742') || findById('sponsor-11683565') || pool[0];
  }
  if (cat.includes('utilit')) {
    return findById('sponsor-11242067') || findById('sponsor-11242744') || pool[0];
  }
  if (plat.includes('windows')) {
    return findById('sponsor-11683565') || findById('sponsor-11242742') || pool[0];
  }
  if (plat.includes('smart tv') || plat.includes('tv') || cat.includes('iptv') || cat.includes('stream')) {
    return findById('sponsor-11242069') || findById('sponsor-11226634') || pool[0];
  }
  if (plat.includes('android')) {
    return findById('sponsor-11242067') || findById('sponsor-11226634') || pool[0];
  }

  return findById('sponsor-11242745') || pool[0];
}

