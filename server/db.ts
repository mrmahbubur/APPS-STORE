import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  AppItem,
  AppOwnerProfile,
  DeveloperSubmission,
  ReviewItem,
  SiteMeta,
  SponsorAdLink,
} from '../shared/types.ts';
import {
  getAppMinOsLabel,
  getBuiltinPackageFile,
  getDefaultPackagePermissions,
  isHybridPackage,
  isWindowsPackage,
  sortReviewsByDate,
} from '../shared/package-utils.ts';
import {
  BUILTIN_APP_IDS,
  APP_STORE_CATEGORIES,
  MRS_GRAVATAR_OWNER_PROFILE,
  buildBuiltinApps,
  buildSiteMeta,
  computeReviewStats,
  createDefaultSponsorLinks,
} from '../shared/store-metadata.ts';

export type {
  AppOwnerAccount,
  AppOwnerProfile,
  AppItem,
  DeveloperSubmission,
  SponsorAdLink,
  OwnerInfo,
  SiteMeta,
  ReviewItem,
} from '../shared/types.ts';
export { APP_STORE_CATEGORIES };

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

/** Read real byte size, SHA-256 hash, and mtime directly from the package binary on disk */
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

let currentOwnerProfile: AppOwnerProfile = { ...MRS_GRAVATAR_OWNER_PROFILE };

function buildGenuineApps(): AppItem[] {
  const mrsFile = getBuiltinPackageFile('m-r-s-iptv') || 'M_R_S_IPTV.apk';
  const mrsTvFile = getBuiltinPackageFile('m-r-s-iptv-pro') || 'M_R_S_IPTV_Pro.apk';
  const camelliaFile = getBuiltinPackageFile('camellia-ai') || 'Camillia_Ai.apk';

  const mrsMeta = readRealApkFileMeta(
    `apks/${mrsFile}`,
    '9.33 MB',
    'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c'
  );
  const mrsTvMeta = readRealApkFileMeta(
    `apks/${mrsTvFile}`,
    '31.93 MB',
    'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92'
  );
  const camelliaMeta = readRealApkFileMeta(
    `apks/${camelliaFile}`,
    '7.68 MB',
    '6ebf12098208a31dbb00a15864d95e966aae11b441975fb240b8ce78a35676cd'
  );

  return buildBuiltinApps({
    relativePaths: false,
    ownerProfile: currentOwnerProfile,
    binaryOverrides: {
      'm-r-s-iptv': mrsMeta,
      'm-r-s-iptv-pro': mrsTvMeta,
      'camellia-ai': camelliaMeta,
    },
  });
}

let memoryStore: AppItem[] = [];
let submissionsStore: DeveloperSubmission[] = [];
let reviewsStore: Record<string, ReviewItem[]> = {};

function ensureDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const existingDownloads: Record<string, number> = {};
    const customPublishedApps: AppItem[] = [];
    const builtInIds = new Set<string>(BUILTIN_APP_IDS);

    if (fs.existsSync(APPS_FILE)) {
      try {
        const oldApps: AppItem[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf-8'));
        for (const old of oldApps) {
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
      const stats = computeReviewStats(appReviews);
      return {
        ...app,
        downloads: existingDownloads[app.id] || 0,
        rating: stats.averageRating,
        reviewsCount: stats.totalReviews,
      };
    });

    const refreshedCustomApps = customPublishedApps.map((app) => {
      const appReviews = reviewsStore[app.id] || [];
      const stats = computeReviewStats(appReviews);
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

    const rawAvatar = entry.thumbnailUrl
      ? `${String(entry.thumbnailUrl)}?s=256`
      : currentOwnerProfile.avatarUrl;

    currentOwnerProfile = {
      displayName: String(entry.displayName || currentOwnerProfile.displayName),
      username: '',
      profileUrl: '',
      avatarUrl: rawAvatar,
      email: '',
    };

    const builtInIds = new Set<string>(BUILTIN_APP_IDS);
    const ownerLabel = currentOwnerProfile.displayName;
    memoryStore = memoryStore.map((app) =>
      builtInIds.has(app.id)
        ? {
            ...app,
            developer: currentOwnerProfile.displayName,
            developerEmail: 'mr216873@gmail.com',
            ownerName: ownerLabel,
            ownerProfile: currentOwnerProfile,
          }
        : app
    );
    writeJsonAtomic(APPS_FILE, memoryStore);
  } catch (err) {
    console.warn(
      'Using verified cached Gravatar owner profile:',
      err instanceof Error ? err.message : err
    );
  }
}

void syncGravatarOwnerProfile();

const sponsorLinksStore: SponsorAdLink[] = createDefaultSponsorLinks();

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
    const list = sortReviewsByDate(reviewsStore[appId] || []);
    return {
      reviews: list,
      stats: computeReviewStats(list),
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

    const sortedList = sortReviewsByDate([newReview, ...list]);
    reviewsStore[appId] = sortedList;

    try {
      writeJsonAtomic(REVIEWS_FILE, reviewsStore);
    } catch (err) {
      console.error('Failed to save review:', err);
    }

    const stats = computeReviewStats(sortedList);
    if (app) {
      app.rating = stats.averageRating;
      app.reviewsCount = stats.totalReviews;
      try {
        writeJsonAtomic(APPS_FILE, memoryStore);
      } catch (e) {}
    }

    return { review: newReview, reviews: sortedList, stats };
  },

  markReviewHelpful(appId: string, reviewId: string) {
    const list = reviewsStore[appId] || [];
    const updated = sortReviewsByDate(
      list.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
    reviewsStore[appId] = updated;
    try {
      writeJsonAtomic(REVIEWS_FILE, reviewsStore);
    } catch (e) {}
    return { reviews: updated, stats: computeReviewStats(updated) };
  },

  readRealApkFileMeta(
    relApkPath: string,
    fallbackSize = 'External APK',
    fallbackSha256 = 'External URL (Not Self-Hosted)'
  ) {
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
    const slugBase =
      input.appTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'custom-app';
    let uniqueId = slugBase;
    if (memoryStore.some((a) => a.id === uniqueId)) {
      uniqueId = `${slugBase}-${Date.now().toString().slice(-5)}`;
    }

    const rawPlatform = input.platform.trim() || 'Smart TV & Android Mobile';
    const cleanLocalPath = input.localApkPath ? input.localApkPath.trim() : '';

    const rawOrLocalName =
      input.fileName?.trim() || (cleanLocalPath ? path.basename(cleanLocalPath) : '');
    const pkgMeta = { platform: rawPlatform, fileName: rawOrLocalName };
    const isWindowsBinary = isWindowsPackage(pkgMeta);
    const isHybridTarget = isHybridPackage(pkgMeta);

    const diskFacts =
      cleanLocalPath && cleanLocalPath.startsWith('/apks/')
        ? readRealApkFileMeta(cleanLocalPath, input.size || 'Unknown', input.sha256 || 'Not Verified')
        : {
            size: input.size || (isWindowsBinary ? 'External Installer' : 'External APK'),
            sha256: input.sha256 || 'Provided by Developer URL',
            updatedAt: new Date().toISOString().split('T')[0],
          };

    const resolvedFileName =
      rawOrLocalName ||
      `${input.appTitle.replace(/\s+/g, '_')}${isWindowsBinary && !isHybridTarget ? '.exe' : '.apk'}`;
    const resolvedPkg =
      input.packageId?.trim() || `com.mrs.${slugBase.replace(/-/g, '')}`;

    const resolvedOwner = (
      input.ownerName ||
      input.ownerProfile?.displayName ||
      input.developerName
    ).trim();
    const resolvedIcon = input.iconUrl?.trim() || '/assets/site-logo-icon.jpg';
    const archLabel = isWindowsBinary ? 'Architectures' : 'Supported ABIs';
    const abiNote =
      input.architectures && input.architectures.length > 0
        ? `${archLabel}: ${input.architectures.join(', ')}`
        : `Target platform: ${rawPlatform}`;

    const finalPkgMeta = { platform: rawPlatform, fileName: resolvedFileName };
    const minOsLabel = getAppMinOsLabel(finalPkgMeta);
    const defaultPermissions = getDefaultPackagePermissions(finalPkgMeta);

    const newApp: AppItem = {
      id: uniqueId,
      title: input.appTitle.trim(),
      fileName: resolvedFileName,
      tagline: `Published by ${resolvedOwner} on MRS App Store.`,
      category: input.category.trim() || 'Entertainment',
      platform: rawPlatform,
      version: input.version.trim() || '1.0.0',
      updatedAt: diskFacts.updatedAt,
      size: diskFacts.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: minOsLabel,
      ageRating: 'Everyone',
      languages: 'System Locale',
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
        `Direct package download (${cleanLocalPath ? 'Self-hosted on MRS App Store' : 'Developer-hosted package URL'})`,
        abiNote,
        `Published by ${resolvedOwner}`,
      ],
      permissions: defaultPermissions,
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
    submission: Omit<
      DeveloperSubmission,
      'id' | 'transactionId' | 'invoiceNumber' | 'status' | 'submittedAt'
    >,
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
    return buildSiteMeta({
      ownerProfile: currentOwnerProfile,
      extraCategories: memoryStore.map((a) => (a.category || '').trim()).filter(Boolean),
    });
  },

  getSponsors(): SponsorAdLink[] {
    return sponsorLinksStore;
  },

  incrementSponsorClick(id: string): number {
    const sponsor = sponsorLinksStore.find((s) => s.id === id || s.zoneId === id);
    if (sponsor) {
      sponsor.clicks = (sponsor.clicks || 0) + 1;
      return sponsor.clicks;
    }
    return 0;
  },
};
