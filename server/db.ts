import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AppOwnerAccount {
  name: string;
  username: string;
  url: string;
  verified?: boolean;
}

export interface AppOwnerProfile {
  displayName: string;
  username: string;
  profileUrl: string;
  avatarUrl: string;
  email: string;
  phone?: string;
  headline?: string;
  bio?: string;
  calendarUrl?: string;
  accounts?: AppOwnerAccount[];
}

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
  ownerProfile?: AppOwnerProfile;
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
];

export interface OwnerInfo {
  ownerName: string;
  organization: string;
  email: string;
  role: string;
  location: string;
  supportResponseTime: string;
  publishingFeeUsd: number;
  verificationNote: string;
}

export interface SiteMeta {
  appName: string;
  tagline: string;
  currentYear: number;
  copyrightNotice: string;
  adminEmail: string;
  ownerInfo?: OwnerInfo;
  ownerProfile?: AppOwnerProfile;
  categories?: string[];
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

function writeJsonAtomic(filePath: string, data: unknown) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
    throw err;
  }
}

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

const GRAVATAR_PROFILE_ENDPOINT = 'https://gravatar.com/mrxshahin.json';

let currentOwnerProfile: AppOwnerProfile = {
  displayName: 'M R S',
  username: 'mrxshahin',
  profileUrl: 'https://gravatar.com/mrxshahin',
  avatarUrl:
    'https://1.gravatar.com/avatar/79cb903b47ada0af52e9962551bab25e563cc0a515939789f348aaa0ca135946?s=256',
  email: 'mr216873@gmail.com',
  phone: '+8809611056361',
  headline: 'Available for Remote IT Support, Virtual Assistance & Administrative Work',
  bio: 'Available for Remote IT Support, Virtual Assistance & Administrative Work. Certified 360-hour computer systems coursework; writing technology guides and solutions since 2018 with focus on Android support, web solutions, technical documentation, and AI productivity tools.',
  calendarUrl: 'https://calendly.com/mrxshahin',
  accounts: [
    { name: 'WordPress', username: 'mrxshahin.wordpress.com', url: 'https://mrxshahin.wordpress.com', verified: true },
    { name: 'X', username: '@Mrshahinx', url: 'https://x.com/Mrshahinx', verified: true },
    { name: 'LinkedIn', username: 'mrmahbubur', url: 'https://www.linkedin.com/in/mrmahbubur', verified: true },
    { name: 'Bluesky', username: 'mrxshahin.bsky.social', url: 'https://bsky.app/profile/mrxshahin.bsky.social', verified: true },
  ],
};

function formatOwnerLabel(profile: AppOwnerProfile): string {
  return profile.displayName;
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

  const ownerLabel = formatOwnerLabel(currentOwnerProfile);

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
      developer: currentOwnerProfile.displayName,
      developerEmail: currentOwnerProfile.email,
      ownerName: ownerLabel,
      ownerProfile: currentOwnerProfile,
      packageId: 'co.median.android.rdalmaa',
      sha256: mrsMeta.sha256,
      directDownloadUrl: '/api/download/m-r-s-iptv',
      downloadUrl: '/api/download/m-r-s-iptv',
      shareUrl: '/?app=m-r-s-iptv',
      localApkPath: '/apks/M_R_S_IPTV.apk',
      description:
        `M R S IPTV Android is the official Android application published by ${ownerLabel}. The APK binary (M R S IPTV.apk) is hosted directly in MRS App Store for one-click download and installation on Android 8.0+ devices.`,
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${mrsMeta.size})`,
        'Build 3 (Version 1.0.0) compiled for Android API 26+',
        'Verified SHA-256 binary checksum published on product page',
      ],
      features: [
        'Direct APK download with no third-party redirects',
        'Supports Android 8.0 (API 26) and above',
        `Published and maintained by ${ownerLabel}`,
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
      developer: currentOwnerProfile.displayName,
      developerEmail: currentOwnerProfile.email,
      ownerName: ownerLabel,
      ownerProfile: currentOwnerProfile,
      packageId: 'com.wMRSIPTV_20119768',
      sha256: mrsTvMeta.sha256,
      directDownloadUrl: '/api/download/m-r-s-iptv-pro',
      downloadUrl: '/api/download/m-r-s-iptv-pro',
      shareUrl: '/?app=m-r-s-iptv-pro',
      localApkPath: '/apks/M_R_S_IPTV_Pro.apk',
      description:
        `M R S IPTV TV (M_R_S_IPTV.apk) is the Smart TV and Android edition distributed directly by ${ownerLabel}. Hosted locally on MRS App Store for direct sideloading and mobile installation.`,
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${mrsTvMeta.size})`,
        'Package com.wMRSIPTV_20119768 (Version 1.0)',
        'Verified SHA-256 binary checksum published on product page',
      ],
      features: [
        'Direct APK download with no external hosting redirects',
        'Supports Android 8.0 (API 26) and above',
        `Published and maintained by ${ownerLabel}`,
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
      writeJsonAtomic(REVIEWS_FILE, reviewsStore);
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
    writeJsonAtomic(APPS_FILE, mergedApps);
    memoryStore = mergedApps;

    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const subContent = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      submissionsStore = JSON.parse(subContent);
    } else {
      writeJsonAtomic(SUBMISSIONS_FILE, []);
      submissionsStore = [];
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    memoryStore = buildGenuineApps();
    reviewsStore = {};
  }
}

ensureDatabase();

async function syncGravatarOwnerProfile() {
  try {
    const res = await fetch(GRAVATAR_PROFILE_ENDPOINT, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return;
    const json: any = await res.json();
    const entry = json?.entry?.[0];
    if (!entry) return;

    const cleanBioText = String(entry.aboutMe || '')
      .split(/\r?\n/)
      .map((line: string) => line.replace(/[#*`>_]/g, '').trim())
      .filter(Boolean);
    const headlineLine = cleanBioText[0]
      ?.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, '')
      .trim();

    const accounts: AppOwnerAccount[] = Array.isArray(entry.accounts)
      ? entry.accounts
          .filter((acc: any) => acc?.url && !String(acc.url).toLowerCase().includes('blogspot'))
          .map((acc: any) => ({
            name: String(acc.name || acc.domain || 'Link'),
            username: String(acc.username || acc.display || ''),
            url: String(acc.url),
            verified: Boolean(acc.verified),
          }))
      : currentOwnerProfile.accounts || [];

    const calContact = Array.isArray(entry.contactInfo)
      ? entry.contactInfo.find(
          (c: any) => c?.type === 'calendar' && c?.value && !String(c.value).toLowerCase().includes('blogspot')
        )
      : null;

    const primaryEmail =
      Array.isArray(entry.emails) && entry.emails[0]?.value
        ? String(entry.emails[0].value)
        : currentOwnerProfile.email;

    const phone =
      Array.isArray(entry.phoneNumbers) && entry.phoneNumbers[0]?.value
        ? String(entry.phoneNumbers[0].value)
        : currentOwnerProfile.phone;

    const rawAvatar = entry.thumbnailUrl
      ? `${String(entry.thumbnailUrl)}?s=256`
      : currentOwnerProfile.avatarUrl;

    currentOwnerProfile = {
      displayName: String(entry.displayName || currentOwnerProfile.displayName),
      username: String(entry.preferredUsername || currentOwnerProfile.username),
      profileUrl: String(entry.profileUrl || currentOwnerProfile.profileUrl),
      avatarUrl: rawAvatar,
      email: primaryEmail,
      phone,
      headline: headlineLine || currentOwnerProfile.headline,
      bio: currentOwnerProfile.bio,
      calendarUrl: calContact ? String(calContact.value) : currentOwnerProfile.calendarUrl,
      accounts: accounts.length > 0 ? accounts : currentOwnerProfile.accounts,
    };

    const builtInIds = new Set(['m-r-s-iptv', 'm-r-s-iptv-pro']);
    const ownerLabel = formatOwnerLabel(currentOwnerProfile);
    memoryStore = memoryStore.map((app) =>
      builtInIds.has(app.id)
        ? {
            ...app,
            developer: currentOwnerProfile.displayName,
            developerEmail: currentOwnerProfile.email,
            ownerName: ownerLabel,
            ownerProfile: currentOwnerProfile,
          }
        : app
    );
    writeJsonAtomic(APPS_FILE, memoryStore);
  } catch (err) {
    console.warn('Using verified cached Gravatar owner profile:', err instanceof Error ? err.message : err);
  }
}

void syncGravatarOwnerProfile();

export const AppDatabase = {
  getAllApps(): AppItem[] {
    return memoryStore;
  },

  getOwnerProfile(): AppOwnerProfile {
    return currentOwnerProfile;
  },

  async refreshOwnerProfile(): Promise<AppOwnerProfile> {
    await syncGravatarOwnerProfile();
    return currentOwnerProfile;
  },

  getCategoriesWithCounts(): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const cat of APP_STORE_CATEGORIES) {
      counts.set(cat, 0);
    }
    for (const app of memoryStore) {
      const cat = (app.category || 'Entertainment').trim();
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
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
      writeJsonAtomic(REVIEWS_FILE, reviewsStore);
    } catch (err) {
      console.error('Failed to save review:', err);
    }

    const stats = computeStats(list);
    if (app) {
      app.rating = stats.averageRating;
      app.reviewsCount = stats.totalReviews;
      try {
        writeJsonAtomic(APPS_FILE, memoryStore);
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
      writeJsonAtomic(REVIEWS_FILE, reviewsStore);
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
    ownerProfile?: AppOwnerProfile;
    developerEmail: string;
    iconUrl?: string;
    apkDownloadUrl: string;
    localApkPath?: string;
    size?: string;
    sha256?: string;
    architectures?: string[];
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

    const resolvedOwner = (input.ownerName || input.ownerProfile?.displayName || input.developerName).trim();
    const resolvedIcon = input.iconUrl?.trim() || '/assets/site-logo-icon.jpg';
    const abiNote =
      input.architectures && input.architectures.length > 0
        ? `Supported ABIs: ${input.architectures.join(', ')}`
        : `Target platform: ${input.platform.trim() || 'Smart TV & Android Mobile'}`;

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
      icon: resolvedIcon,
      banner: resolvedIcon,
      developer: input.developerName.trim(),
      developerEmail: input.developerEmail.trim(),
      ownerName: resolvedOwner,
      ownerProfile: input.ownerProfile,
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
        abiNote,
        `Owner contact: ${input.developerEmail.trim()}`,
      ],
      permissions: ['android.permission.INTERNET'],
      screenshots: [resolvedIcon],
      featured: false,
      editorChoice: false,
    };

    memoryStore = [...memoryStore, newApp];
    try {
      writeJsonAtomic(APPS_FILE, memoryStore);
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
      writeJsonAtomic(SUBMISSIONS_FILE, submissionsStore);
    } catch (err) {
      console.error('Failed to save submission:', err);
    }
    return newSubmission;
  },

  getAllSubmissions(): DeveloperSubmission[] {
    return submissionsStore;
  },

  isPaymentProofUsed(txHashOrOrderId: string): boolean {
    const clean = txHashOrOrderId.trim().toLowerCase();
    if (!clean) return false;
    return submissionsStore.some(
      (s) => (s.paymentDetails?.cryptoTxHash || '').trim().toLowerCase() === clean
    );
  },

  incrementDownload(id: string): number {
    const app = memoryStore.find((a) => a.id === id);
    if (app) {
      app.downloads = (app.downloads || 0) + 1;
      try {
        writeJsonAtomic(APPS_FILE, memoryStore);
      } catch (e) {}
      return app.downloads;
    }
    return 0;
  },

  getHealthReport() {
    let dataDirWritable = false;
    try {
      fs.accessSync(DATA_DIR, fs.constants.W_OK | fs.constants.R_OK);
      dataDirWritable = true;
    } catch {
      dataDirWritable = false;
    }

    const apksRoot = path.resolve(process.cwd(), 'public/apks');
    const apkChecks = memoryStore.map((app) => {
      if (!app.localApkPath || !app.localApkPath.startsWith('/apks/')) {
        return {
          appId: app.id,
          source: 'external',
          exists: true,
          sha256Match: true,
          size: app.size,
        };
      }
      const safeRel = app.localApkPath.replace(/^\/apks\//, '').replace(/\.\./g, '');
      const fullPath = path.resolve(apksRoot, safeRel);
      const insideRoot = fullPath.startsWith(apksRoot + path.sep) || fullPath === apksRoot;
      const exists = insideRoot && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
      if (!exists) {
        return {
          appId: app.id,
          source: 'local',
          exists: false,
          sha256Match: false,
          size: app.size,
        };
      }
      const stat = fs.statSync(fullPath);
      const buf = fs.readFileSync(fullPath);
      const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
      return {
        appId: app.id,
        source: 'local',
        exists: true,
        bytes: stat.size,
        size: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
        sha256Match: actualSha256 === app.sha256,
      };
    });

    const allApksHealthy = apkChecks.every((c) => c.exists && c.sha256Match);
    return {
      ok: dataDirWritable && allApksHealthy && memoryStore.length > 0,
      dataDirWritable,
      totalApps: memoryStore.length,
      totalSubmissions: submissionsStore.length,
      totalReviewThreads: Object.keys(reviewsStore).length,
      apkChecks,
    };
  },

  getSiteMeta(): SiteMeta {
    const currentYear = new Date().getFullYear();
    const ownerLabel = formatOwnerLabel(currentOwnerProfile);
    const dynamicCategories = Array.from(
      new Set([
        ...APP_STORE_CATEGORIES,
        ...memoryStore.map((a) => (a.category || '').trim()).filter(Boolean),
      ])
    );

    return {
      appName: 'MRS App Store',
      tagline: `Official Direct APK Storefront Owned by ${ownerLabel}`,
      currentYear,
      copyrightNotice: `© ${currentYear} ${ownerLabel}. All rights reserved.`,
      adminEmail: currentOwnerProfile.email,
      ownerInfo: {
        ownerName: ownerLabel,
        organization: ownerLabel,
        email: currentOwnerProfile.email,
        role: 'Store Owner & Lead Administrator',
        location: 'Global Remote Operations',
        supportResponseTime: 'Within 24 hours',
        publishingFeeUsd: 25.0,
        verificationNote: 'Verified Store Owner Profile',
      },
      ownerProfile: currentOwnerProfile,
      categories: dynamicCategories,
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
            'Developers may submit applications for review at mr216873@gmail.com after completing the $25.00 USD publishing fee via Binance Pay or USDT BEP-20.',
          sections: [
            {
              heading: '1. Submission Fee & Payment Options ($25 USD)',
              content:
                'A one-time publishing fee of $25.00 USD is accepted via Binance Pay QR (M R S) or USDT (BNB Smart Chain BEP20: 0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e).',
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
