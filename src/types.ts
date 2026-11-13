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

export interface ReviewBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: ReviewBreakdown;
}

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
  downloadUrl?: string;
  shareUrl?: string;
  localApkPath?: string;
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
  ownerInfo?: OwnerInfo;
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
