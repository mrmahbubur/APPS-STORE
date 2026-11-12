import { AppItem, OwnerInfo, ReviewItem, ReviewStats, SiteMeta } from '../types';

export function normalizeAssetPath(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('./')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `.${url}`;
  }
  return `./${url}`;
}

export function getAppLocalApkFile(appId: string): string {
  const apkMap: Record<string, string> = {
    'm-r-s-iptv': 'M_R_S_IPTV.apk',
    'm-r-s-iptv-pro': 'M_R_S_IPTV_Pro.apk',
    'camellia-ai': 'Camellia_Ai.apk',
  };
  return apkMap[appId] || `${appId}.apk`;
}

export const STORE_OWNER_INFO: OwnerInfo = {
  ownerName: 'Shahin (mrxshahin)',
  organization: 'MRS TV Network',
  email: 'mr216873@gmail.com',
  role: 'Store Owner & App Publisher',
  location: 'MRS App Store',
  supportResponseTime: 'Direct Email Support',
  publishingFeeUsd: 25.0,
  verificationNote:
    'Every APK file hosted on MRS App Store is served directly from local server storage with its real SHA-256 cryptographic checksum.',
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
    developer: 'MRS TV Network',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'Shahin (mrxshahin)',
    packageId: 'co.median.android.rdalmaa',
    sha256: 'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c',
    directDownloadUrl: './apks/M_R_S_IPTV.apk',
    downloadUrl: './apks/M_R_S_IPTV.apk',
    shareUrl: './?app=m-r-s-iptv',
    localApkPath: './apks/M_R_S_IPTV.apk',
    description:
      'M R S IPTV Android is the official Android application published by MRS TV Network. The APK binary (M R S IPTV.apk) is hosted directly in MRS App Store for one-click download and installation on Android 8.0+ devices.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (9.33 MB)',
      'Build 3 (Version 1.0.0) compiled for Android API 26+',
      'Verified SHA-256 binary checksum published on product page',
    ],
    features: [
      'Direct APK download with no third-party redirects',
      'Supports Android 8.0 (API 26) and above',
      'Published and maintained by MRS TV Network',
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
    developer: 'MRS TV Network',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'Shahin (mrxshahin)',
    packageId: 'com.wMRSIPTV_20119768',
    sha256: 'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92',
    directDownloadUrl: './apks/M_R_S_IPTV_Pro.apk',
    downloadUrl: './apks/M_R_S_IPTV_Pro.apk',
    shareUrl: './?app=m-r-s-iptv-pro',
    localApkPath: './apks/M_R_S_IPTV_Pro.apk',
    description:
      'M R S IPTV TV (M_R_S_IPTV.apk) is the Smart TV and Android edition distributed directly by MRS TV Network. Hosted locally on MRS App Store for direct sideloading and mobile installation.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (31.93 MB)',
      'Package com.wMRSIPTV_20119768 (Version 1.0)',
      'Verified SHA-256 binary checksum published on product page',
    ],
    features: [
      'Direct APK download with no external hosting redirects',
      'Supports Android 8.0 (API 26) and above',
      'Published and maintained by MRS TV Network',
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
    title: 'Camellia Ai',
    fileName: 'Camellia Ai.apk',
    tagline: 'Official Camellia Ai Android APK hosted directly on MRS App Store.',
    category: 'AI & Virtual Assistant',
    platform: 'Android Mobile',
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
    icon: './assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
    banner: './assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
    developer: 'Camellia Studio',
    developerEmail: 'mr216873@gmail.com',
    ownerName: 'Shahin (mrxshahin)',
    packageId: 'co.median.android.rdalmaa',
    sha256: '78d49e74f404c870714494d59634fa3c7ba1f30cb7e4a132b523e481925f56d4',
    directDownloadUrl: './apks/Camellia_Ai.apk',
    downloadUrl: './apks/Camellia_Ai.apk',
    shareUrl: './?app=camellia-ai',
    localApkPath: './apks/Camellia_Ai.apk',
    description:
      'Camellia Ai is an Android AI assistant package (Camellia Ai.apk) hosted directly on MRS App Store for Android 8.0+ smartphones and tablets.',
    whatsNew: [
      'Direct in-house APK hosting from MRS App Store (9.33 MB)',
      'Build 3 (Version 1.0.0) compiled for Android API 26+',
      'Verified SHA-256 binary checksum published on product page',
    ],
    features: [
      'Direct APK download from MRS App Store',
      'Supports Android 8.0 (API 26) and above',
      'Verified SHA-256 integrity hash',
      'Shareable app page link and direct APK download URL',
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.VIBRATE',
      'android.permission.DUMP',
    ],
    screenshots: ['./assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg'],
    featured: false,
    editorChoice: false,
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
  return {
    appName: 'MRS App Store',
    tagline: 'Direct APK Marketplace by MRS TV Network',
    currentYear,
    copyrightNotice: `© ${currentYear} MRS TV Network. All rights reserved.`,
    adminEmail: 'mr216873@gmail.com',
    ownerInfo: STORE_OWNER_INFO,
    submissionFeeUsd: 25.0,
    lastUpdated: new Date().toISOString(),
    policies: {
      privacy: {
        title: 'App Privacy Policy',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'MRS App Store serves direct APK files without third-party redirect walls or cross-site tracking.',
        sections: [
          {
            heading: '1. Direct APK Distribution',
            content:
              'APK binaries listed in the store are hosted directly on MRS App Store storage with published SHA-256 hashes.',
          },
          {
            heading: '2. Submitted Reviews',
            content:
              'User reviews submitted on app pages store only the name, device type, rating, and review text entered by the reviewer.',
          },
        ],
      },
      terms: {
        title: 'Terms & Conditions',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'Terms governing access to applications and APK binaries hosted on MRS App Store.',
        sections: [
          {
            heading: '1. Direct Package Downloads',
            content:
              'Users can inspect APK file size, version, permissions, and SHA-256 hash prior to downloading.',
          },
        ],
      },
      developer: {
        title: 'Developer Publishing & Review Agreement',
        lastRenewed: `January 1, ${currentYear}`,
        summary:
          'Developers may submit applications for review at mr216873@gmail.com after completing the $25.00 USD publishing fee via Binance Pay (mrxshahin) or USDT BEP-20.',
        sections: [
          {
            heading: '1. Submission Fee & Payment Options ($25 USD)',
            content:
              'A one-time publishing fee of $25.00 USD is accepted via Binance Pay (ID: mrxshahin) or USDT (BNB Smart Chain BEP20: 0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e).',
          },
          {
            heading: '2. Submission Dispatch',
            content:
              'Send your APK link and payment transaction proof to mr216873@gmail.com for review.',
          },
        ],
      },
      dmca: {
        title: 'DMCA & Intellectual Property Compliance',
        lastRenewed: `January 1, ${currentYear}`,
        summary: 'Intellectual property and takedown contact information.',
        sections: [
          {
            heading: '1. Contact',
            content:
              'Direct any copyright or package verification queries to mr216873@gmail.com.',
          },
        ],
      },
    },
  };
}
