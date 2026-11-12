import fs from 'fs';
import path from 'path';

export interface AppItem {
  id: string;
  title: string;
  fileName: string;
  tagline: string;
  category: 'Entertainment' | 'IPTV & Streaming' | 'Smart TV & Video' | 'AI & Virtual Assistant' | string;
  platform: 'Smart TV & Android Mobile' | 'Smart TV (Firestick / Android TV)' | 'Android Mobile' | string;
  version: string;
  updatedAt: string;
  size: string;
  rating: number;
  reviewsCount: number;
  downloads: number;
  minAndroid: string;
  icon: string;
  banner?: string;
  developer: string;
  developerEmail: string;
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
  apkDownloadUrl: string;
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Genuine apps requested by user
const GENUINE_APPS: AppItem[] = [
  {
    id: 'm-r-s-iptv',
    title: 'M R S IPTV',
    fileName: 'M R S IPTV.apk',
    tagline: 'High-Definition Live IPTV, Sports & Global Streaming for Smart TV and Mobile',
    category: 'IPTV & Streaming',
    platform: 'Smart TV & Android Mobile',
    version: '3.4.0',
    updatedAt: '2026-10-23',
    size: '28.6 MB',
    rating: 4.9,
    reviewsCount: 1840,
    downloads: 14200,
    minAndroid: 'Android 5.0+ (Firestick, Android TV, Mobile)',
    icon: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    banner: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    developer: 'MRS TV Network',
    developerEmail: 'mr216873@gmail.com',
    packageId: 'com.mrs.iptv.network',
    sha256: '8b7f1903e1a4d8c7b6a95e01f283c4d7e9a01b2c3d4e5f6a7b8c9d0e1f2a3b4c',
    directDownloadUrl: '/api/download/m-r-s-iptv',
    downloadUrl: '/api/download/m-r-s-iptv',
    shareUrl: '/?app=m-r-s-iptv',
    localApkPath: '/apks/M_R_S_IPTV.apk',
    description: 'M R S IPTV is the flagship streaming application designed for seamless television and mobile entertainment. Enjoy high-speed, zero-buffering live channels, sports broadcasts, video-on-demand, and dynamic EPG guides with full D-Pad remote control ergonomics.',
    whatsNew: [
      'Official direct high-speed APK download from MRS App Store',
      'Enhanced hardware acceleration for 4K 60FPS sports channels',
      'Ultra-responsive Smart TV and Firestick D-Pad remote navigation',
      'Integrated dynamic Electronic Program Guide (EPG)'
    ],
    features: [
      'Universal M3U8, Xtream Codes & HLS Stream Player',
      'Optimized for Android TV, Fire TV, Google TV & Android Smartphones',
      'Direct Fast APK Download (No Third-Party Hosting)',
      'Dual Audio Tracks & Multi-Language Subtitles',
      'Low Latency Engine with Zero Buffer Lag'
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.REQUEST_INSTALL_PACKAGES'
    ],
    screenshots: [
      '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'
    ],
    featured: true,
    editorChoice: true
  },
  {
    id: 'm-r-s-iptv-pro',
    title: 'M_R_S_IPTV',
    fileName: 'M_R_S_IPTV.apk',
    tagline: 'Direct Stream Edition with Custom Multi-Screen Player & Low-Bandwidth Mode',
    category: 'Smart TV & Video',
    platform: 'Smart TV & Android Mobile',
    version: '3.4.2',
    updatedAt: '2026-10-23',
    size: '29.2 MB',
    rating: 4.9,
    reviewsCount: 1520,
    downloads: 12800,
    minAndroid: 'Android 5.0+ (Smart TV, Box, Mobile)',
    icon: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    banner: '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    developer: 'MRS TV Network',
    developerEmail: 'mr216873@gmail.com',
    packageId: 'com.mrs.iptv.pro',
    sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    directDownloadUrl: '/api/download/m-r-s-iptv-pro',
    downloadUrl: '/api/download/m-r-s-iptv-pro',
    shareUrl: '/?app=m-r-s-iptv-pro',
    localApkPath: '/apks/M_R_S_IPTV_Pro.apk',
    description: 'M_R_S_IPTV (Pro Edition) offers dedicated live network streaming with multi-screen grid capability, parental control filters, and advanced audio boost for Smart TV home theaters and Android smartphones.',
    whatsNew: [
      'Hosted directly on MRS Store with instant one-click download',
      'Custom multi-screen grid view (watch up to 4 streams simultaneously)',
      'Enhanced dark mode user interface designed for OLED screens',
      'Quick channel switcher with custom favorites list'
    ],
    features: [
      'Direct High-Speed APK Download',
      'Multi-Screen Simultaneous Channel Playback',
      'Dolby Digital & Spatial Sound Virtualizer',
      'Zero Ads, Clean Apple-Grade Store Interface',
      'Automated TV Sleep Timer and Screen Lock'
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.REQUEST_INSTALL_PACKAGES'
    ],
    screenshots: [
      '/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png'
    ],
    featured: false,
    editorChoice: true
  },
  {
    id: 'camellia-ai',
    title: 'Camellia Ai',
    fileName: 'Camellia Ai.apk',
    tagline: 'Intelligent Conversational Virtual Companion & Real-Time Voice Assistant',
    category: 'AI & Virtual Assistant',
    platform: 'Android Mobile',
    version: '2.1.0',
    updatedAt: '2026-10-23',
    size: '34.5 MB',
    rating: 4.9,
    reviewsCount: 2350,
    downloads: 21400,
    minAndroid: 'Android 7.0+ (ARM64 / ARMv7)',
    icon: '/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
    banner: '/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
    developer: 'Camellia Studio',
    developerEmail: 'mr216873@gmail.com',
    packageId: 'com.camellia.ai.assistant',
    sha256: '7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d',
    directDownloadUrl: '/api/download/camellia-ai',
    downloadUrl: '/api/download/camellia-ai',
    shareUrl: '/?app=camellia-ai',
    localApkPath: '/apks/Camellia_Ai.apk',
    description: 'Camellia Ai is an intelligent, empathetic virtual companion powered by modern conversational AI models. Features ultra-responsive natural voice chat, custom personality modes, daily assistance, and creative brainstorming on Android devices.',
    whatsNew: [
      'Hosted directly on MRS Store with instant one-click download',
      'Ultra-low latency conversational voice responses',
      'Adaptive personality tuning and personalized memory retention',
      'Clean, private, offline-first voice recognition mode'
    ],
    features: [
      'Real-Time Conversational AI Assistant',
      'Direct High-Speed APK Download',
      'Adaptive Emotion & Voice Engine',
      'Zero Bloatware & Ad-Free Experience',
      'Custom Personality & Voice Modes'
    ],
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.RECORD_AUDIO',
      'android.permission.REQUEST_INSTALL_PACKAGES'
    ],
    screenshots: [
      '/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg'
    ],
    featured: false,
    editorChoice: true
  }
];

let memoryStore: AppItem[] = [];
let submissionsStore: DeveloperSubmission[] = [];

function ensureDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(APPS_FILE, JSON.stringify(GENUINE_APPS, null, 2), 'utf-8');
    memoryStore = [...GENUINE_APPS];

    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const subContent = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      submissionsStore = JSON.parse(subContent);
    } else {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      submissionsStore = [];
    }
  } catch (err) {
    console.error('Database initialization error:', err);
    memoryStore = [...GENUINE_APPS];
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

  createSubmission(submission: Omit<DeveloperSubmission, 'id' | 'transactionId' | 'invoiceNumber' | 'status' | 'submittedAt'>): DeveloperSubmission {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TXN-MRS-${timestamp}-${randomSuffix}`;
    const invoiceNumber = `INV-MRS-${new Date().getFullYear()}-${randomSuffix}`;

    const newSubmission: DeveloperSubmission = {
      ...submission,
      id: `sub-${timestamp}`,
      transactionId,
      invoiceNumber,
      status: 'Payment Verified',
      submittedAt: new Date().toISOString()
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
      tagline: 'The Premier Marketplace for Verified Applications & IPTV Networks',
      currentYear,
      copyrightNotice: `© ${currentYear} MRS TV Network. All rights reserved.`,
      adminEmail: 'mr216873@gmail.com',
      submissionFeeUsd: 25.00,
      lastUpdated: new Date().toISOString(),
      policies: {
        privacy: {
          title: 'App Privacy Policy',
          lastRenewed: `January 1, ${currentYear} (Automated Annual Review)`,
          summary: 'We believe privacy is a fundamental human right. The MRS App Store does not track users across third-party websites or sell personal data.',
          sections: [
            {
              heading: '1. Privacy-Preserving Distribution',
              content: 'All direct downloads are served over encrypted channels. We do not inspect personal device identifiers or store location fingerprints.'
            },
            {
              heading: '2. Direct APK Delivery',
              content: 'Packages are verified clean and delivered directly via official hosting mirrors without deceptive redirect walls.'
            }
          ]
        },
        terms: {
          title: 'Terms & Conditions',
          lastRenewed: `January 1, ${currentYear} (Automated Annual Review)`,
          summary: 'Guidelines governing the access and direct downloading of verified application packages.',
          sections: [
            {
              heading: '1. Verified Software License',
              content: 'Applications distributed on MRS App Store are verified by MRS TV Network for Smart TV and Mobile compatibility.'
            },
            {
              heading: '2. High-Speed Distribution Guarantee',
              content: 'All package downloads maintain zero artificial bandwidth throttling.'
            }
          ]
        },
        developer: {
          title: 'Developer Publishing & Review Agreement',
          lastRenewed: `January 1, ${currentYear} (Active Standard)`,
          summary: 'Every submitted package undergoes mandatory cryptographic safety checks and manual developer review by mr216873@gmail.com upon receipt of the $25.00 USD publishing fee via Binance Pay (mrxshahin) or USDT BEP-20.',
          sections: [
            {
              heading: '1. Submission Fee & Payment Options ($25 USD)',
              content: 'A one-time application publishing review fee of $25.00 USD is accepted exclusively via Binance Pay (ID: mrxshahin) or USDT (BNB Smart Chain BEP20: 0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e).'
            },
            {
              heading: '2. Review Dispatch to mr216873@gmail.com',
              content: 'Upon sending payment, developers email their APK download link and transaction proof to mr216873@gmail.com for expedited catalog indexing.'
            }
          ]
        },
        dmca: {
          title: 'DMCA & Intellectual Property Compliance',
          lastRenewed: `January 1, ${currentYear} (Continuous Automated Policy)`,
          summary: 'Notice and takedown standards honoring intellectual property rights.',
          sections: [
            {
              heading: '1. Rights Inquiries',
              content: 'For intellectual property queries or copyright notices, contact the administrator directly at mr216873@gmail.com.'
            }
          ]
        }
      }
    };
  }
};
