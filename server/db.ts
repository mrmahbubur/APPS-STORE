import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AppItem {
  id: string;
  title: string;
  fileName: string;
  tagline: string;
  category: 'Entertainment' | 'IPTV & Streaming' | 'Smart TV & Video' | 'AI & Virtual Assistant' | string;
  platform: 'Smart TV & Android Mobile' | 'Android Mobile & Smart TV' | 'Android Mobile' | string;
  version: string;
  updatedAt: string;
  size: string;
  rating: number;
  reviewsCount: number;
  downloads: number;
  minAndroid: string;
  ageRating?: string;
  languages?: string;
  chartRank?: string;
  icon: string;
  banner?: string;
  developer: string;
  developerEmail: string;
  ownerName?: string;
  packageId: string;
  sha256: string;
  directDownloadUrl: string;
  downloadUrl: string;
  shareUrl: string;
  localApkPath: string;
  description: string;
  whatsNew: string[];
  features: string[];
  permissions: string[];
  screenshots: string[];
  featured?: boolean;
  editorChoice?: boolean;
}

export interface DeveloperSubmission {
  id: string;
  appTitle: string;
  packageId?: string;
  apkDownloadUrl: string;
  size?: string;
  sha256?: string;
  publishedAppId?: string;
  category: string;
  platform: string;
  version: string;
  description: string;
  developerName: string;
  developerEmail: string;
  targetAdminEmail: string;
  tier: 'Standard' | 'Priority' | 'Enterprise';
  amountPaidUsd: number;
  paymentMethod: string;
  paymentDetails: {
    brand?: string;
    last4?: string;
    cardholderName?: string;
    paypalEmail?: string;
    cryptoTxHash?: string;
    cryptoNetwork?: string;
  };
  invoiceNumber: string;
  transactionId: string;
  status: 'Payment Verified' | 'Under Review' | 'Live';
  submittedAt: string;
}

export interface SiteMeta {
  appName: string;
  tagline: string;
  currentYear: number;
  copyrightNotice: string;
  adminEmail: string;
  submissionFeeUsd: number;
  lastUpdated: string;
  policies: {
    privacy: {
      title: string;
      lastRenewed: string;
      summary: string;
      sections: { heading: string; content: string }[];
    };
    terms: {
      title: string;
      lastRenewed: string;
      summary: string;
      sections: { heading: string; content: string }[];
    };
    developer: {
      title: string;
      lastRenewed: string;
      summary: string;
      sections: { heading: string; content: string }[];
    };
    dmca: {
      title: string;
      lastRenewed: string;
      summary: string;
      sections: { heading: string; content: string }[];
    };
  };
}

export interface ReviewItem {
  id: string;
  appId: string;
  author: string;
  title: string;
  rating: number;
  comment: string;
  device: string;
  helpfulCount: number;
  createdAt: string;
  developerReply?: {
    author: string;
    text: string;
    date: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

/** Read real byte size, SHA-256 hash, and mtime directly from the APK binary on disk */
function readRealApkFileMeta(relApkPath: string, fallbackSize: string, fallbackSha256: string) {
  try {
    const cleanRel = relApkPath.replace(/^\//, '');
    const fullPath = path.resolve(process.cwd(), 'public', cleanRel);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      const mb = (stat.size / (1024 * 1024)).toFixed(2);
      const buf = fs.readFileSync(fullPath);
      const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
      const updatedAt = stat.mtime.toISOString().split('T')[0];
      return { size: `${mb} MB`, sha256, updatedAt };
    }
  } catch (err) {
    console.error('Error reading real APK stats:', err);
  }
  return { size: fallbackSize, sha256: fallbackSha256, updatedAt: '2026-11-12' };
}

function buildGenuineApps(): AppItem[] {
  const mrsMeta = readRealApkFileMeta(
    'apks/M_R_S_IPTV.apk',
    '9.33 MB',
    'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c'
  );
  const mrsTvMeta = readRealApkFileMeta(
    'apks/M_R_S_IPTV_Pro.apk',
    '31.93 MB',
    'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92'
  );
  const camelliaMeta = readRealApkFileMeta(
    'apks/Camellia_Ai.apk',
    '9.33 MB',
    '78d49e74f404c870714494d59634fa3c7ba1f30cb7e4a132b523e481925f56d4'
  );

  return [
    {
      id: 'm-r-s-iptv',
      title: 'M R S IPTV Android',
      fileName: 'M R S IPTV.apk',
      tagline: 'Official M R S IPTV Android APK hosted directly on MRS App Store.',
      category: 'IPTV & Streaming',
      platform: 'Android Mobile & Smart TV',
      version: '1.0.0',
      updatedAt: mrsMeta.updatedAt,
      size: mrsMeta.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: 'Android 8.0+ (API 26)',
      ageRating: 'Everyone',
      languages: 'Android System Locale',
      chartRank: 'v1.0.0',
      icon: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
      banner: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
      developer: 'MRS TV Network',
      developerEmail: 'mr216873@gmail.com',
      ownerName: 'Shahin (mrxshahin)',
      packageId: 'co.median.android.rdalmaa',
      sha256: mrsMeta.sha256,
      directDownloadUrl: '/api/download/m-r-s-iptv',
      downloadUrl: '/api/download/m-r-s-iptv',
      shareUrl: '/?app=m-r-s-iptv',
      localApkPath: '/apks/M_R_S_IPTV.apk',
      description:
        'M R S IPTV Android is the official Android application published by MRS TV Network. The APK binary (M R S IPTV.apk) is hosted directly in MRS App Store for one-click download and installation on Android 8.0+ devices.',
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${mrsMeta.size})`,
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
      screenshots: ['/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'],
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
      updatedAt: mrsTvMeta.updatedAt,
      size: mrsTvMeta.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: 'Android 8.0+ (API 26)',
      ageRating: 'Everyone',
      languages: 'Android System Locale',
      chartRank: 'v1.0',
      icon: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
      banner: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
      developer: 'MRS TV Network',
      developerEmail: 'mr216873@gmail.com',
      ownerName: 'Shahin (mrxshahin)',
      packageId: 'com.wMRSIPTV_20119768',
      sha256: mrsTvMeta.sha256,
      directDownloadUrl: '/api/download/m-r-s-iptv-pro',
      downloadUrl: '/api/download/m-r-s-iptv-pro',
      shareUrl: '/?app=m-r-s-iptv-pro',
      localApkPath: '/apks/M_R_S_IPTV_Pro.apk',
      description:
        'M R S IPTV TV (M_R_S_IPTV.apk) is the Smart TV and Android edition distributed directly by MRS TV Network. Hosted locally on MRS App Store for direct sideloading and mobile installation.',
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${mrsTvMeta.size})`,
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
      screenshots: ['/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'],
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
      updatedAt: camelliaMeta.updatedAt,
      size: camelliaMeta.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: 'Android 8.0+ (API 26)',
      ageRating: 'Everyone',
      languages: 'Android System Locale',
      chartRank: 'v1.0.0',
      icon: '/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
      banner: '/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
      developer: 'Camellia Studio',
      developerEmail: 'mr216873@gmail.com',
      ownerName: 'Shahin (mrxshahin)',
      packageId: 'co.median.android.rdalmaa',
      sha256: camelliaMeta.sha256,
      directDownloadUrl: '/api/download/camellia-ai',
      downloadUrl: '/api/download/camellia-ai',
      shareUrl: '/?app=camellia-ai',
      localApkPath: '/apks/Camellia_Ai.apk',
      description:
        'Camellia Ai is an Android AI assistant package (Camellia Ai.apk) hosted directly on MRS App Store for Android 8.0+ smartphones and tablets.',
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${camelliaMeta.size})`,
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
      screenshots: ['/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg'],
      featured: false,
      editorChoice: false,
    },
  ];
}

let memoryStore: AppItem[] = [];
let submissionsStore: DeveloperSubmission[] = [];
let reviewsStore: Record<string, ReviewItem[]> = {};

function computeStats(reviews: ReviewItem[]) {
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews.length) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown,
    };
  }
  let total = 0;
  for (const r of reviews) {
    const score = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    breakdown[score] += 1;
    total += score;
  }
  return {
    averageRating: Number((total / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
    breakdown,
  };
}

function ensureDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Preserve any real download counts and any developer-published custom apps from apps.json
    const existingDownloads: Record<string, number> = {};
    const customPublishedApps: AppItem[] = [];
    const builtInIds = new Set(['m-r-s-iptv', 'm-r-s-iptv-pro', 'camellia-ai']);

    if (fs.existsSync(APPS_FILE)) {
      try {
        const oldApps: AppItem[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf-8'));
        for (const old of oldApps) {
          // Discard previously seeded fake counts (14200, 12800, 21400)
          if (
            typeof old.downloads === 'number' &&
            old.downloads > 0 &&
            old.downloads !== 14200 &&
            old.downloads !== 12800 &&
            old.downloads !== 21400
          ) {
            existingDownloads[old.id] = old.downloads;
          }
          if (!builtInIds.has(old.id)) {
            customPublishedApps.push(old);
          }
        }
      } catch {}
    }

    if (fs.existsSync(REVIEWS_FILE)) {
      const revContent = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      reviewsStore = JSON.parse(revContent);
    } else {
      reviewsStore = {};
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsStore, null, 2), 'utf-8');
    }

    const genuineApps = buildGenuineApps().map((app) => {
      const appReviews = reviewsStore[app.id] || [];
      const stats = computeStats(appReviews);
      return {
        ...app,
        downloads: existingDownloads[app.id] || 0,
        rating: stats.averageRating,
        reviewsCount: stats.totalReviews,
      };
    });

    const refreshedCustomApps = customPublishedApps.map((app) => {
      const appReviews = reviewsStore[app.id] || [];
      const stats = computeStats(appReviews);
      const localMeta =
        app.localApkPath && app.localApkPath.startsWith('/apks/')
          ? readRealApkFileMeta(app.localApkPath, app.size, app.sha256)
          : { size: app.size, sha256: app.sha256, updatedAt: app.updatedAt };
      return {
        ...app,
        size: localMeta.size,
        sha256: localMeta.sha256,
        updatedAt: localMeta.updatedAt,
        downloads: existingDownloads[app.id] || app.downloads || 0,
        rating: stats.averageRating,
        reviewsCount: stats.totalReviews,
      };
    });

    const mergedApps = [...genuineApps, ...refreshedCustomApps];
    fs.writeFileSync(APPS_FILE, JSON.stringify(mergedApps, null, 2), 'utf-8');
    memoryStore = mergedApps;

    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const subContent = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      submissionsStore = JSON.parse(subContent);
    } else {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      submissionsStore = [];
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    memoryStore = buildGenuineApps();
    reviewsStore = {};
  }
}

ensureDatabase();

export const AppDatabase = {
  getAllApps(): AppItem[] {
    return memoryStore;
  },

  getAppById(id: string): AppItem | undefined {
    return memoryStore.find((a) => a.id === id);
  },

  getReviewsByApp(appId: string) {
    const list = reviewsStore[appId] || [];
    return {
      reviews: list,
      stats: computeStats(list),
    };
  },

  addReview(
    appId: string,
    payload: { author: string; title: string; rating: number; comment: string; device?: string }
  ) {
    const app = this.getAppById(appId);
    const list = reviewsStore[appId] ? [...reviewsStore[appId]] : [];
    const cleanRating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      appId,
      author: String(payload.author || 'User').trim().slice(0, 60),
      title: String(payload.title || 'App Review').trim().slice(0, 100),
      rating: cleanRating,
      comment: String(payload.comment || '').trim().slice(0, 1200),
      device: String(payload.device || 'Android Device').trim().slice(0, 60),
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    list.unshift(newReview);
    reviewsStore[appId] = list;

    try {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save review:', err);
    }

    const stats = computeStats(list);
    if (app) {
      app.rating = stats.averageRating;
      app.reviewsCount = stats.totalReviews;
      try {
        fs.writeFileSync(APPS_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
      } catch (e) {}
    }

    return { review: newReview, reviews: list, stats };
  },

  markReviewHelpful(appId: string, reviewId: string) {
    const list = reviewsStore[appId] || [];
    const updated = list.map((r) =>
      r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
    );
    reviewsStore[appId] = updated;
    try {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviewsStore, null, 2), 'utf-8');
    } catch (e) {}
    return { reviews: updated, stats: computeStats(updated) };
  },

  readRealApkFileMeta(relApkPath: string, fallbackSize = 'External APK', fallbackSha256 = 'External URL (Not Self-Hosted)') {
    return readRealApkFileMeta(relApkPath, fallbackSize, fallbackSha256);
  },

  publishApp(input: {
    appTitle: string;
    fileName?: string;
    packageId?: string;
    category: string;
    platform: string;
    version: string;
    description: string;
    developerName: string;
    ownerName?: string;
    developerEmail: string;
    apkDownloadUrl: string;
    localApkPath?: string;
    size?: string;
    sha256?: string;
  }): AppItem {
    const slugBase = input.appTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'custom-app';
    let uniqueId = slugBase;
    if (memoryStore.some((a) => a.id === uniqueId)) {
      uniqueId = `${slugBase}-${Date.now().toString().slice(-5)}`;
    }

    const cleanLocalPath = input.localApkPath ? input.localApkPath.trim() : '';
    const diskFacts =
      cleanLocalPath && cleanLocalPath.startsWith('/apks/')
        ? readRealApkFileMeta(cleanLocalPath, input.size || 'Unknown', input.sha256 || 'Not Verified')
        : {
            size: input.size || 'External APK',
            sha256: input.sha256 || 'Provided by Developer URL',
            updatedAt: new Date().toISOString().split('T')[0],
          };

    const resolvedFileName =
      input.fileName?.trim() ||
      (cleanLocalPath ? path.basename(cleanLocalPath) : `${input.appTitle.replace(/\s+/g, '_')}.apk`);
    const resolvedPkg =
      input.packageId?.trim() || `com.mrs.${slugBase.replace(/-/g, '')}`;

    const resolvedOwner = (input.ownerName || input.developerName).trim();

    const newApp: AppItem = {
      id: uniqueId,
      title: input.appTitle.trim(),
      fileName: resolvedFileName,
      tagline: `Published by ${resolvedOwner} on MRS App Store.`,
      category: input.category.trim() || 'Entertainment',
      platform: input.platform.trim() || 'Smart TV & Android Mobile',
      version: input.version.trim() || '1.0.0',
      updatedAt: diskFacts.updatedAt,
      size: diskFacts.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: 'Android 8.0+ (API 26)',
      ageRating: 'Everyone',
      languages: 'Android System Locale',
      chartRank: `v${input.version.trim() || '1.0.0'}`,
      icon: '/assets/site-logo-icon.jpg',
      banner: '/assets/site-logo-icon.jpg',
      developer: input.developerName.trim(),
      developerEmail: input.developerEmail.trim(),
      ownerName: resolvedOwner,
      packageId: resolvedPkg,
      sha256: diskFacts.sha256,
      directDownloadUrl: cleanLocalPath ? `/api/download/${uniqueId}` : input.apkDownloadUrl.trim(),
      downloadUrl: cleanLocalPath ? `/api/download/${uniqueId}` : input.apkDownloadUrl.trim(),
      shareUrl: `/?app=${uniqueId}`,
      localApkPath: cleanLocalPath || input.apkDownloadUrl.trim(),
      description: input.description.trim(),
      whatsNew: [
        `Published to MRS App Store on ${diskFacts.updatedAt}`,
        `Version ${input.version.trim() || '1.0.0'} (${diskFacts.size})`,
      ],
      features: [
        `Direct download link (${cleanLocalPath ? 'Self-hosted on MRS App Store' : 'Developer-hosted APK URL'})`,
        `Target platform: ${input.platform.trim() || 'Smart TV & Android Mobile'}`,
        `Developer contact: ${input.developerEmail.trim()}`,
      ],
      permissions: ['android.permission.INTERNET'],
      screenshots: ['/assets/site-logo-icon.jpg'],
      featured: false,
      editorChoice: false,
    };

    memoryStore = [...memoryStore, newApp];
    try {
      fs.writeFileSync(APPS_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist published app:', err);
    }
    return newApp;
  },

  createSubmission(
    submission: Omit<DeveloperSubmission, 'id' | 'transactionId' | 'invoiceNumber' | 'status' | 'submittedAt'>,
    statusOverride: DeveloperSubmission['status'] = 'Live'
  ): DeveloperSubmission {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TXN-MRS-${timestamp}-${randomSuffix}`;
    const invoiceNumber = `INV-MRS-${new Date().getFullYear()}-${randomSuffix}`;

    const newSubmission: DeveloperSubmission = {
      ...submission,
      id: `sub-${timestamp}`,
      transactionId,
      invoiceNumber,
      status: statusOverride,
      submittedAt: new Date().toISOString(),
    };

    submissionsStore.unshift(newSubmission);
    try {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissionsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save submission:', err);
    }
    return newSubmission;
  },

  getAllSubmissions(): DeveloperSubmission[] {
    return submissionsStore;
  },

  incrementDownload(id: string): number {
    const app = memoryStore.find((a) => a.id === id);
    if (app) {
      app.downloads = (app.downloads || 0) + 1;
      try {
        fs.writeFileSync(APPS_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
      } catch (e) {}
      return app.downloads;
    }
    return 0;
  },

  getSiteMeta(): SiteMeta {
    const currentYear = new Date().getFullYear();
    return {
      appName: 'MRS App Store',
      tagline: 'Direct APK Marketplace by MRS TV Network',
      currentYear,
      copyrightNotice: `© ${currentYear} MRS TV Network. All rights reserved.`,
      adminEmail: 'mr216873@gmail.com',
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
          summary: 'Terms governing access to applications and APK binaries hosted on MRS App Store.',
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
              content: 'Direct any copyright or package verification queries to mr216873@gmail.com.',
            },
          ],
        },
      },
    };
  },
};
