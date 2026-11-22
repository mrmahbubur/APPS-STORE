export type PackageFormatCode = 'APK' | 'EXE' | 'MSI' | 'MSIX' | 'APPX' | 'ZIP' | 'PACKAGE';
export type StorePlatformFilter = 'All' | 'Android' | 'Smart TV' | 'Windows';
export type StorePlatformCategory = StorePlatformFilter;
export type CatalogSortOption = 'popular' | 'rating' | 'newest';
export type LegalPolicyTab = 'privacy' | 'terms' | 'developer' | 'dmca';
export type SponsorPlatformHint = 'Android & TV' | 'Windows PC' | 'All Devices';
export type SponsorPlacement = 'featured' | 'catalog' | 'detail';
export type SponsorFilterTab = 'All Partners' | 'Android & TV' | 'Windows PC';
export type PublishingPaymentMethod = 'USDT (BEP-20)' | 'Binance Pay';

export interface PackageMetadataInput {
  platform?: string;
  fileName?: string;
}

export interface CatalogFilterableApp extends PackageMetadataInput {
  title: string;
  tagline?: string;
  description?: string;
  developer?: string;
  category?: string;
  updatedAt?: string;
  downloads?: number;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
}

export interface CatalogFilterOptions {
  category?: string;
  platform?: StorePlatformFilter | string;
  search?: string;
  sortBy?: CatalogSortOption | string;
}

export interface PlatformCounts {
  All: number;
  Android: number;
  'Smart TV': number;
  Windows: number;
}

export interface BinaryMetaOverride {
  size?: string;
  sha256?: string;
  updatedAt?: string;
}

export interface BuildBuiltinAppsOptions {
  relativePaths?: boolean;
  ownerProfile?: AppOwnerProfile;
  binaryOverrides?: Record<string, BinaryMetaOverride>;
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
  category:
    | 'Entertainment'
    | 'IPTV & Streaming'
    | 'Smart TV & Video'
    | 'AI & Virtual Assistant'
    | string;
  platform:
    | 'Smart TV & Android Mobile'
    | 'Smart TV (Firestick / Android TV)'
    | 'Android Mobile & Smart TV'
    | 'Android Mobile'
    | 'Windows PC (10 / 11)'
    | 'Windows PC & Android'
    | string;
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

export interface PolicySection {
  heading: string;
  content: string;
}

export interface PolicyDocument {
  title: string;
  lastRenewed: string;
  summary: string;
  sections: PolicySection[];
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
  policies: Record<LegalPolicyTab, PolicyDocument>;
}

export interface SponsorAdLink {
  id: string;
  zoneId: string;
  title: string;
  subtitle: string;
  category: string;
  platformHint: SponsorPlatformHint;
  placement: SponsorPlacement;
  url: string;
  ctaLabel: string;
  clicks?: number;
}

export interface VerifiedPaymentInfo {
  tokenSymbol?: string;
  amountPaidUsd?: number;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
  txHash: string;
  paymentMethod: PublishingPaymentMethod;
}

export interface PaymentVerificationTokenPayload {
  txHash: string;
  paymentMethod: string;
  amountPaidUsd: number;
  fromAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
  issuedAt: number;
}

export interface BscVerificationResult {
  verified: boolean;
  message: string;
  tokenSymbol?: string;
  amountPaidUsd?: number;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
}

export interface UploadedPackageTelemetry {
  fileName: string;
  localApkPath?: string;
  directDownloadUrl: string;
  size: string;
  sha256: string;
  platformKind?: string;
  packageType?: string;
  hasManifest?: boolean;
  hasWindowsManifest?: boolean;
  isPeExecutable?: boolean;
  isMsiInstaller?: boolean;
  hasClassesDex?: boolean;
  hasResources?: boolean;
  architectures?: string[];
  entryCount?: number;
}

export type UploadedApkTelemetry = UploadedPackageTelemetry;

export interface ApkInspectionResult {
  isValidZip: boolean;
  totalEntries: number;
  hasAndroidManifest: boolean;
  hasClassesDex: boolean;
  hasResources: boolean;
  architectures: string[];
}

export interface PackageInspectionResult {
  isValid: boolean;
  platformKind: 'android' | 'windows' | 'unknown';
  packageType: 'APK' | 'EXE' | 'MSI' | 'MSIX' | 'APPX' | 'ZIP' | 'UNKNOWN';
  totalEntries: number;
  hasManifest: boolean;
  hasAndroidManifest: boolean;
  hasClassesDex: boolean;
  hasResources: boolean;
  hasWindowsManifest: boolean;
  isPeExecutable: boolean;
  isMsiInstaller: boolean;
  architectures: string[];
  reason?: string;
}
