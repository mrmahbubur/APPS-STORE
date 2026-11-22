import type {
  AppItem,
  AppOwnerProfile,
  BinaryMetaOverride,
  BuildBuiltinAppsOptions,
  PackageMetadataInput,
  ReviewItem,
  ReviewStats,
  SiteMeta,
  SponsorAdLink,
  SponsorFilterTab,
  SponsorGroupingOptions,
  SponsorIconKey,
  SponsorSpotlightGroup,
  StorePlatformFilter,
} from './types.ts';
import { isWindowsPackage } from './package-utils.ts';

export type { BinaryMetaOverride, BuildBuiltinAppsOptions } from './types.ts';

export const BUILTIN_APP_IDS = ['m-r-s-iptv', 'm-r-s-iptv-pro', 'camellia-ai'] as const;

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

export function buildBuiltinApps(options: BuildBuiltinAppsOptions = {}): AppItem[] {
  const prefix = options.relativePaths ? '.' : '';
  const ownerProfile = options.ownerProfile || MRS_GRAVATAR_OWNER_PROFILE;
  const ownerLabel = ownerProfile.displayName || MRS_GRAVATAR_OWNER_PROFILE.displayName;
  const overrides = options.binaryOverrides || {};

  const mrsMeta = {
    size: overrides['m-r-s-iptv']?.size || '9.33 MB',
    sha256:
      overrides['m-r-s-iptv']?.sha256 ||
      'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c',
    updatedAt: overrides['m-r-s-iptv']?.updatedAt || '2026-11-12',
  };

  const mrsTvMeta = {
    size: overrides['m-r-s-iptv-pro']?.size || '31.93 MB',
    sha256:
      overrides['m-r-s-iptv-pro']?.sha256 ||
      'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92',
    updatedAt: overrides['m-r-s-iptv-pro']?.updatedAt || '2026-11-12',
  };

  const camelliaMeta = {
    size: overrides['camellia-ai']?.size || '7.68 MB',
    sha256:
      overrides['camellia-ai']?.sha256 ||
      '6ebf12098208a31dbb00a15864d95e966aae11b441975fb240b8ce78a35676cd',
    updatedAt: overrides['camellia-ai']?.updatedAt || '2026-11-17',
  };

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
      icon: `${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`,
      banner: `${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`,
      developer: ownerLabel,
      developerEmail: 'mr216873@gmail.com',
      ownerName: ownerLabel,
      ownerProfile,
      packageId: 'co.median.android.rdalmaa',
      sha256: mrsMeta.sha256,
      directDownloadUrl: options.relativePaths
        ? './apks/M_R_S_IPTV.apk'
        : '/api/download/m-r-s-iptv',
      downloadUrl: options.relativePaths
        ? './apks/M_R_S_IPTV.apk'
        : '/api/download/m-r-s-iptv',
      shareUrl: `${prefix}/?app=m-r-s-iptv`,
      localApkPath: `${prefix}/apks/M_R_S_IPTV.apk`,
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
      screenshots: [`${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`],
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
      icon: `${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`,
      banner: `${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`,
      developer: ownerLabel,
      developerEmail: 'mr216873@gmail.com',
      ownerName: ownerLabel,
      ownerProfile,
      packageId: 'com.wMRSIPTV_20119768',
      sha256: mrsTvMeta.sha256,
      directDownloadUrl: options.relativePaths
        ? './apks/M_R_S_IPTV_Pro.apk'
        : '/api/download/m-r-s-iptv-pro',
      downloadUrl: options.relativePaths
        ? './apks/M_R_S_IPTV_Pro.apk'
        : '/api/download/m-r-s-iptv-pro',
      shareUrl: `${prefix}/?app=m-r-s-iptv-pro`,
      localApkPath: `${prefix}/apks/M_R_S_IPTV_Pro.apk`,
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
      screenshots: [`${prefix}/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png`],
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
      updatedAt: camelliaMeta.updatedAt,
      size: camelliaMeta.size,
      rating: 0,
      reviewsCount: 0,
      downloads: 0,
      minAndroid: 'Android 8.0+ (API 26)',
      ageRating: 'Everyone',
      languages: 'Android System Locale',
      chartRank: 'v1.0.0',
      icon: `${prefix}/assets/aistudio/camellia-logo_e7fcb198.png`,
      banner: `${prefix}/assets/aistudio/camellia-logo_e7fcb198.png`,
      developer: ownerLabel,
      developerEmail: 'mr216873@gmail.com',
      ownerName: ownerLabel,
      ownerProfile,
      packageId: 'co.median.android.krqrjbd',
      sha256: camelliaMeta.sha256,
      directDownloadUrl: options.relativePaths
        ? './apks/Camillia_Ai.apk'
        : '/api/download/camellia-ai',
      downloadUrl: options.relativePaths
        ? './apks/Camillia_Ai.apk'
        : '/api/download/camellia-ai',
      shareUrl: `${prefix}/?app=camellia-ai`,
      localApkPath: `${prefix}/apks/Camillia_Ai.apk`,
      description:
        `Camillia Ai (Camillia Ai.apk) is an Android AI & Virtual Assistant application imported from upload-apk.com (aOOQ4KXgicyfICc) and distributed directly by ${ownerLabel} on MRS App Store with instant APK delivery and SHA-256 checksum verification.`,
      whatsNew: [
        `Direct in-house APK hosting from MRS App Store (${camelliaMeta.size})`,
        'Package co.median.android.krqrjbd (Version 1.0.0) for Android 8.0+ (API 26)',
        'Custom uploaded Camillia app icon and verified SHA-256 binary signature',
      ],
      features: [
        'Instant direct APK download without countdown timers or redirects',
        'Supports Android 8.0 (API 26) and above',
        'Verified binary imported from https://www.upload-apk.com/aOOQ4KXgicyfICc',
        `Listed and maintained by ${ownerLabel}`,
      ],
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.READ_PHONE_STATE',
        'android.permission.VIBRATE',
        'android.permission.DUMP',
        'com.google.android.c2dm.permission.RECEIVE',
      ],
      screenshots: [`${prefix}/assets/aistudio/camellia-logo_e7fcb198.png`],
      featured: false,
      editorChoice: true,
    },
  ];
}

export function buildSiteMeta(options?: {
  ownerProfile?: AppOwnerProfile;
  extraCategories?: string[];
}): SiteMeta {
  const currentYear = new Date().getFullYear();
  const ownerProfile = options?.ownerProfile || MRS_GRAVATAR_OWNER_PROFILE;
  const ownerLabel = ownerProfile.displayName || MRS_GRAVATAR_OWNER_PROFILE.displayName;
  const categories = options?.extraCategories
    ? Array.from(new Set([...APP_STORE_CATEGORIES, ...options.extraCategories.filter(Boolean)]))
    : [...APP_STORE_CATEGORIES];

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
    ownerProfile,
    categories,
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
              'Android (.apk) and Windows (.exe, .msi, .msix, .appx, .zip) binaries listed in the store are hosted directly on MRS App Store storage with published SHA-256 hashes.',
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
        summary:
          'Intellectual property and package takedown compliance for Android, Smart TV, and Windows releases.',
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
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
    clicks: 0,
  },
];

export function createDefaultSponsorLinks(): SponsorAdLink[] {
  return DEFAULT_SPONSOR_LINKS.map((item) => ({ ...item }));
}

export const SPONSOR_FILTER_TABS: readonly SponsorFilterTab[] = [
  'All Partners',
  'Android & TV',
  'Windows PC',
] as const;

export function resolveSpotlightDevice(
  platform?: StorePlatformFilter | string
): StorePlatformFilter {
  const clean = (platform || '').trim().toLowerCase();
  if (!clean || clean === 'all' || clean === 'all partners') return 'All';
  if (/windows/.test(clean)) return 'Windows';
  if (/smart tv|\btv\b|firestick|google tv|android tv/.test(clean)) return 'Smart TV';
  if (/android|mobile/.test(clean)) return 'Android';
  return 'All';
}

export function mapPlatformToSponsorTab(platform?: StorePlatformFilter | string): SponsorFilterTab {
  const resolved = resolveSpotlightDevice(platform);
  if (resolved === 'Windows') return 'Windows PC';
  if (resolved === 'Android' || resolved === 'Smart TV') return 'Android & TV';
  return 'All Partners';
}

export function normalizeSponsorFilterTab(
  raw?: string,
  platform?: StorePlatformFilter | string
): SponsorFilterTab {
  const clean = (raw || '').trim().toLowerCase();
  if (clean === 'windows' || clean === 'windows pc') return 'Windows PC';
  if (clean === 'android & tv' || clean === 'android' || clean === 'smart tv' || clean === 'tv') {
    return 'Android & TV';
  }
  if (clean === 'all' || clean === 'all partners') return 'All Partners';
  if (platform) return mapPlatformToSponsorTab(platform);
  return 'All Partners';
}

export function filterSponsorsByTab(
  sponsors: readonly SponsorAdLink[],
  tab: SponsorFilterTab
): SponsorAdLink[] {
  const pool = sponsors && sponsors.length > 0 ? [...sponsors] : DEFAULT_SPONSOR_LINKS;
  if (tab === 'All Partners') return pool;
  return pool.filter((item) => item.platformHint === tab || item.platformHint === 'All Devices');
}

function getSponsorDeviceAffinityScore(
  sponsor: SponsorAdLink,
  device: StorePlatformFilter
): number {
  if (device === 'All') return 0;
  const targetTab = mapPlatformToSponsorTab(device);
  let score = sponsor.platformHint === targetTab ? 20 : sponsor.platformHint === 'All Devices' ? 5 : 0;

  const text = `${sponsor.title} ${sponsor.category} ${sponsor.subtitle}`.toLowerCase();
  if (device === 'Smart TV' && /tv|stream|cast/.test(text)) score += 10;
  if (device === 'Android' && /android|apk|mobile/.test(text)) score += 10;
  if (device === 'Windows' && /windows|pc|desktop|driver|codec/.test(text)) score += 10;
  return score;
}

export function getSponsorIconKey(
  sponsor: Pick<SponsorAdLink, 'zoneId' | 'platformHint' | 'category'>,
  devicePlatform?: StorePlatformFilter | string
): SponsorIconKey {
  const resolvedDevice = resolveSpotlightDevice(devicePlatform);

  // Device-adaptive spotlight icons for platform-spanning featured or device-aware slots
  if (sponsor.zoneId === '11226634') {
    return resolvedDevice === 'Android' ? 'smartphone' : 'tv';
  }
  if (sponsor.zoneId === '11683565') {
    return 'monitor';
  }

  switch (sponsor.zoneId) {
    case '11242745':
      return 'lock';
    case '11242069':
      return resolvedDevice === 'Android' ? 'smartphone' : 'cast';
    case '11242067':
      return 'smartphone';
    case '11242742':
      return 'cpu';
    case '11230440':
      return 'cloud';
    case '11683560':
      return 'gamepad';
    case '9912130':
      return 'server';
    case '11242744':
      return 'shield';
    default: {
      if (resolvedDevice === 'Windows' || sponsor.platformHint === 'Windows PC') return 'monitor';
      if (resolvedDevice === 'Smart TV') return 'tv';
      if (resolvedDevice === 'Android' || sponsor.platformHint === 'Android & TV') {
        return 'smartphone';
      }
      return 'shield';
    }
  }
}

export function groupSponsorsForSpotlight(
  sponsors: readonly SponsorAdLink[],
  tabOrOptions: SponsorFilterTab | SponsorGroupingOptions = 'All Partners'
): SponsorSpotlightGroup {
  const options: SponsorGroupingOptions =
    typeof tabOrOptions === 'string' ? { tab: tabOrOptions } : tabOrOptions || {};

  const activeTab = normalizeSponsorFilterTab(options.tab, options.platform);
  const resolvedFromPlatform = resolveSpotlightDevice(options.platform || options.tab);
  const resolvedDevice =
    resolvedFromPlatform !== 'All'
      ? resolvedFromPlatform
      : resolveSpotlightDevice(options.preferredDevice);

  const filteredBase = filterSponsorsByTab(sponsors, activeTab);
  const filtered =
    resolvedDevice === 'All'
      ? filteredBase
      : [...filteredBase].sort(
          (a, b) =>
            getSponsorDeviceAffinityScore(b, resolvedDevice) -
            getSponsorDeviceAffinityScore(a, resolvedDevice)
        );

  const featured = filtered.filter((item) => item.placement === 'featured');
  const list = filtered.filter((item) => item.placement !== 'featured');
  const detail = filtered.filter((item) => item.placement === 'detail');

  return {
    activeTab,
    resolvedDevice,
    filtered,
    featured,
    list,
    detail,
    primaryFeatured: featured[0] || filtered[0] || null,
  };
}

export function getDetailPageSponsors(
  sponsors: readonly SponsorAdLink[],
  app: PackageMetadataInput,
  limit = 2
): SponsorAdLink[] {
  const pool = sponsors && sponsors.length > 0 ? sponsors : DEFAULT_SPONSOR_LINKS;
  const isWindowsPkg = isWindowsPackage(app);
  const targetTab: SponsorFilterTab = isWindowsPkg ? 'Windows PC' : 'Android & TV';
  const grouped = groupSponsorsForSpotlight(pool, {
    tab: targetTab,
    preferredDevice: app.platform,
  });
  const platformSpecific = grouped.filtered.filter((item) => item.platformHint === targetTab);
  const prioritized = isWindowsPkg
    ? [...platformSpecific, ...grouped.detail, ...pool]
    : [...grouped.detail, ...platformSpecific, ...pool];

  const selected: SponsorAdLink[] = [];
  const seen = new Set<string>();
  for (const item of prioritized) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      selected.push(item);
    }
    if (selected.length >= limit) break;
  }
  return selected;
}

export function pickContextualSponsor(
  sponsors: readonly SponsorAdLink[],
  opts: { platform?: string; category?: string; excludeIds?: string[] }
): SponsorAdLink | null {
  const rawPool = (sponsors && sponsors.length > 0 ? sponsors : DEFAULT_SPONSOR_LINKS).filter(
    (item) => !(opts.excludeIds || []).includes(item.id)
  );
  if (rawPool.length === 0) return null;

  const resolvedDevice = resolveSpotlightDevice(opts.platform);
  const grouped = groupSponsorsForSpotlight(rawPool, {
    preferredDevice: resolvedDevice,
  });
  const pool = grouped.filtered;
  const cat = (opts.category || '').toLowerCase();

  const findById = (id: string) => pool.find((s) => s.id === id);

  if (cat.includes('game')) {
    return findById('sponsor-11683560') || grouped.primaryFeatured || pool[0];
  }
  if (cat.includes('developer')) {
    return findById('sponsor-9912130') || grouped.primaryFeatured || pool[0];
  }
  if (cat.includes('productivity') || cat.includes('business')) {
    return findById('sponsor-11230440') || grouped.primaryFeatured || pool[0];
  }
  if (cat.includes('utilit') && resolvedDevice === 'Windows') {
    return findById('sponsor-11242742') || findById('sponsor-11683565') || grouped.primaryFeatured || pool[0];
  }
  if (cat.includes('utilit')) {
    return findById('sponsor-11242067') || findById('sponsor-11242744') || grouped.primaryFeatured || pool[0];
  }
  if (resolvedDevice === 'Windows') {
    return findById('sponsor-11683565') || findById('sponsor-11242742') || grouped.primaryFeatured || pool[0];
  }
  if (resolvedDevice === 'Smart TV' || cat.includes('iptv') || cat.includes('stream')) {
    return findById('sponsor-11242069') || findById('sponsor-11226634') || grouped.primaryFeatured || pool[0];
  }
  if (resolvedDevice === 'Android') {
    return findById('sponsor-11242067') || findById('sponsor-11226634') || grouped.primaryFeatured || pool[0];
  }

  return findById('sponsor-11242745') || grouped.primaryFeatured || pool[0];
}

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

  return {
    averageRating: Number((sum / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
    breakdown,
  };
}
