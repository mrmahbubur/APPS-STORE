import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppDatabase } from './server/db.ts';
import {
  checkBscRpcHealth,
  fetchGravatarProfileByHandle,
  inspectApkArchive,
  issuePaymentVerificationToken,
  verifyBscUsdtPayment,
  verifyExternalApkUrl,
  verifyPaymentVerificationToken,
} from './server/publish-service.ts';

const app = express();
const rawPort =
  process.env.PORT && process.env.PORT !== process.env.NGINX_PORT
    ? process.env.PORT
    : process.env.DEFAULT_APP_PORT || '3000';
const PORT = parseInt(rawPort, 10) || 3000;

// Security and performance middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security & caching headers (allow AI Studio iframe embedding)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes

// 1. Get apps catalog (exclusively genuine M R S IPTV apps)
app.get('/api/apps', (req: Request, res: Response) => {
  const { search, category, platform } = req.query;
  let apps = [...AppDatabase.getAllApps()];

  if (category && typeof category === 'string' && category !== 'All') {
    apps = apps.filter((app) => app.category.toLowerCase() === category.toLowerCase());
  }

  if (platform && typeof platform === 'string' && platform !== 'All') {
    apps = apps.filter((app) => app.platform.toLowerCase().includes(platform.toLowerCase()));
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    apps = apps.filter(
      (app) =>
        app.title.toLowerCase().includes(q) ||
        app.fileName.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
    );
  }

  res.setHeader('Cache-Control', 'public, max-age=5');
  res.json({
    success: true,
    total: apps.length,
    apps
  });
});

// Static route for direct APK files with correct MIME type
app.use('/apks', express.static(path.resolve(process.cwd(), 'public/apks'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  }
}));

// Static route for dynamically uploaded app icons in both dev and production
app.use('/assets/uploads', express.static(path.resolve(process.cwd(), 'public/assets/uploads')));

// 2. Direct download handling - streams APK directly from server storage
app.get('/api/download/:id', (req: Request, res: Response) => {
  const appItem = AppDatabase.getAppById(req.params.id);
  if (!appItem) {
    return res.status(404).send('Application package not found.');
  }

  // Increment download counter
  AppDatabase.incrementDownload(appItem.id);

  const apkMap: Record<string, string> = {
    'm-r-s-iptv': 'M_R_S_IPTV.apk',
    'm-r-s-iptv-pro': 'M_R_S_IPTV_Pro.apk',
  };

  if (apkMap[appItem.id]) {
    const filePath = path.resolve(process.cwd(), 'public/apks', apkMap[appItem.id]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${appItem.fileName}"`);
      return res.sendFile(filePath);
    }
  }

  // Serve developer-uploaded local APKs stored inside public/apks/
  if (appItem.localApkPath && appItem.localApkPath.startsWith('/apks/')) {
    const safeRel = appItem.localApkPath.replace(/^\/apks\//, '').replace(/\.\./g, '');
    const apksRoot = path.resolve(process.cwd(), 'public/apks');
    const filePath = path.resolve(apksRoot, safeRel);
    if (
      (filePath.startsWith(apksRoot + path.sep) || filePath === apksRoot) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${appItem.fileName}"`);
      return res.sendFile(filePath);
    }
  }

  // External HTTPS fallback only if it is a safe absolute HTTP(S) URL
  if (
    appItem.directDownloadUrl &&
    (appItem.directDownloadUrl.startsWith('https://') || appItem.directDownloadUrl.startsWith('http://'))
  ) {
    return res.redirect(302, appItem.directDownloadUrl);
  }

  return res.status(404).send('APK binary file not found on server storage.');
});

// Direct APK download route by filename
app.get('/download/:filename', (req: Request, res: Response) => {
  const safeName = path.basename(req.params.filename);
  const filePath = path.resolve(process.cwd(), 'public/apks', safeName);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    return res.sendFile(filePath);
  }
  return res.status(404).send('APK file not found.');
});

// 3. Real Inbuilt App Publishing Pipeline: Details -> Payment Verification -> APK Upload -> Publish Live

// 3a-0. Lookup optional Gravatar profile for app owner
app.get('/api/publish/gravatar/:handle', async (req: Request, res: Response) => {
  const result = await fetchGravatarProfileByHandle(req.params.handle || '');
  if (!result.success) {
    return res.status(404).json({ success: false, message: result.message });
  }
  return res.json({ success: true, profile: result.profile });
});

// 3a-1. Real Payment Verification Gate ($25 USD USDT BEP-20 On-Chain or Binance Pay Order Record)
app.post('/api/publish/verify-payment', async (req: Request, res: Response) => {
  try {
    const { paymentMethod, txHash, appDetails } = req.body || {};
    const cleanTx = String(txHash || '').trim();

    if (paymentMethod !== 'USDT (BEP-20)' && paymentMethod !== 'Binance Pay') {
      return res.status(400).json({
        success: false,
        message: 'Select either USDT (BEP-20) or Binance Pay.',
      });
    }

    if (!cleanTx) {
      return res.status(400).json({
        success: false,
        message: 'Enter your transaction hash or Binance Pay Order ID to verify payment.',
      });
    }

    if (AppDatabase.isPaymentProofUsed(cleanTx)) {
      return res.status(409).json({
        success: false,
        message: 'This transaction hash / order ID has already been redeemed for a prior submission.',
      });
    }

    if (paymentMethod === 'USDT (BEP-20)') {
      const check = await verifyBscUsdtPayment(cleanTx);
      if (!check.verified) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: check.message,
        });
      }

      const token = issuePaymentVerificationToken({
        txHash: cleanTx,
        paymentMethod,
        amountPaidUsd: check.amountPaidUsd || 25.0,
        fromAddress: check.fromAddress,
        blockNumber: check.blockNumber,
        confirmations: check.confirmations,
        explorerUrl: check.explorerUrl,
        issuedAt: Date.now(),
      });

      return res.json({
        success: true,
        verified: true,
        verificationToken: token,
        verification: check,
        message: check.message,
      });
    }

    // Binance Pay Order ID check (no unauthenticated public Binance Pay API without private merchant credentials)
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(cleanTx)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Enter a valid Binance Pay Order ID (8–64 alphanumeric characters).',
      });
    }

    const appTitle = String(appDetails?.appTitle || '').trim();
    const developerName = String(appDetails?.developerName || appTitle).trim();
    const developerEmail = String(appDetails?.developerEmail || '').trim();

    if (!appTitle || !developerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(developerEmail)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Complete Step 1 (App Name and Owner Email) before submitting a Binance Pay Order ID.',
      });
    }

    const submission = AppDatabase.createSubmission(
      {
        appTitle,
        packageId: appDetails?.packageId ? String(appDetails.packageId).trim() : undefined,
        apkDownloadUrl: 'Awaiting owner payment confirmation before APK upload',
        category: appDetails?.category ? String(appDetails.category).trim() : 'Entertainment',
        platform: appDetails?.platform ? String(appDetails.platform).trim() : 'Smart TV & Android Mobile',
        version: appDetails?.version ? String(appDetails.version).trim() : '1.0.0',
        description: appDetails?.description ? String(appDetails.description).trim() : `${appTitle} Android package.`,
        developerName: developerName || appTitle,
        developerEmail,
        targetAdminEmail: 'mr216873@gmail.com',
        tier: 'Standard',
        amountPaidUsd: 25.0,
        paymentMethod: 'Binance Pay',
        paymentDetails: {
          cryptoTxHash: cleanTx,
          cryptoNetwork: 'Binance Pay',
        },
      },
      'Under Review'
    );

    const mailtoUrl = `mailto:mr216873@gmail.com?subject=${encodeURIComponent(
      `[Binance Pay Verification] ${submission.appTitle} (${submission.invoiceNumber})`
    )}&body=${encodeURIComponent(
      `Dear Store Owner (mr216873@gmail.com),\n\nA developer submitted a Binance Pay Order ID for payment confirmation.\n\nInvoice Number: ${submission.invoiceNumber}\nTransaction ID: ${submission.transactionId}\nRecipient: M R S\nBinance Pay Order ID: ${cleanTx}\nAmount: $25.00 USD\nApp Name: ${submission.appTitle}\nVersion: ${submission.version}\nDeveloper / Owner: ${submission.developerName} (${submission.developerEmail})\nSubmitted At: ${submission.submittedAt}`
    )}`;

    return res.json({
      success: true,
      verified: false,
      pendingOwnerReview: true,
      submission,
      mailtoUrl,
      message:
        'Binance Pay Order ID recorded under review. Personal Binance Pay orders require manual confirmation by M R S (mr216873@gmail.com); for instant automated on-chain verification and immediate APK upload, pay with USDT (BEP-20).',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Payment verification failed.',
    });
  }
});

// 3a-2. Upload App Icon Image (PNG / JPEG / WebP up to 3 MB)
app.post(
  '/api/publish/upload-icon',
  express.raw({ type: 'application/octet-stream', limit: '4mb' }),
  (req: Request, res: Response) => {
    try {
      const buf = req.body as Buffer;
      if (!Buffer.isBuffer(buf) || buf.length < 32) {
        return res.status(400).json({ success: false, message: 'Invalid image file.' });
      }

      let ext = '';
      if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
        ext = 'png';
      } else if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        ext = 'jpg';
      } else if (
        buf.toString('ascii', 0, 4) === 'RIFF' &&
        buf.toString('ascii', 8, 12) === 'WEBP'
      ) {
        ext = 'webp';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported icon format. Upload a PNG, JPG, or WebP image.',
        });
      }

      const iconDir = path.resolve(process.cwd(), 'public/assets/uploads');
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      const storedName = `app-icon-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(iconDir, storedName), buf);

      return res.status(201).json({
        success: true,
        iconUrl: `/assets/uploads/${storedName}`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || 'Failed to upload app icon.',
      });
    }
  }
);

// 3b. Inbuilt Binary APK Upload Endpoint (payment-token gated + real ZIP/AndroidManifest inspection + SHA-256)
app.post(
  '/api/publish/upload-apk',
  express.raw({ type: 'application/octet-stream', limit: '150mb' }),
  (req: Request, res: Response) => {
    try {
      const token = String(req.headers['x-payment-token'] || '');
      const txHash = String(req.headers['x-tx-hash'] || '');
      const paymentMethod = String(req.headers['x-payment-method'] || 'USDT (BEP-20)');

      const tokenCheck = verifyPaymentVerificationToken(token, txHash, paymentMethod);
      if (!tokenCheck.valid) {
        return res.status(403).json({
          success: false,
          message: tokenCheck.message || 'Complete payment verification in Step 2 before uploading your APK.',
        });
      }
      if (AppDatabase.isPaymentProofUsed(txHash)) {
        return res.status(409).json({
          success: false,
          message: 'Payment transaction hash has already been redeemed.',
        });
      }

      const buf = req.body as Buffer;
      if (!Buffer.isBuffer(buf) || buf.length < 128) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a valid .apk package file.',
        });
      }

      const inspection = inspectApkArchive(buf);
      if (!inspection.isValidZip) {
        return res.status(400).json({
          success: false,
          message: 'Invalid APK binary signature. Expected a valid Android .apk archive.',
        });
      }
      if (!inspection.hasAndroidManifest) {
        return res.status(400).json({
          success: false,
          message: 'Archive does not contain AndroidManifest.xml. Please upload a valid Android .apk.',
        });
      }

      const rawHeaderName = String(req.headers['x-file-name'] || 'app.apk');
      const decodedName = decodeURIComponent(rawHeaderName);
      const cleanBase = path
        .basename(decodedName)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.apk$/i, '');
      const originalFileName = `${cleanBase || 'app'}.apk`;
      const storedFileName = `${Date.now()}-${originalFileName}`;

      const uploadsDir = path.resolve(process.cwd(), 'public/apks/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const targetPath = path.join(uploadsDir, storedFileName);
      fs.writeFileSync(targetPath, buf);

      const bytes = buf.length;
      const size = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
      const updatedAt = new Date().toISOString().split('T')[0];

      return res.status(201).json({
        success: true,
        fileName: originalFileName,
        localApkPath: `/apks/uploads/${storedFileName}`,
        directDownloadUrl: `/apks/uploads/${storedFileName}`,
        size,
        bytes,
        sha256,
        hasManifest: inspection.hasAndroidManifest,
        hasClassesDex: inspection.hasClassesDex,
        hasResources: inspection.hasResources,
        architectures: inspection.architectures,
        entryCount: inspection.totalEntries,
        updatedAt,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err?.message || 'Failed to store APK upload.',
      });
    }
  }
);

// 3c. List real developer submissions & receipts
app.get('/api/publish/submissions', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    submissions: AppDatabase.getAllSubmissions(),
  });
});

// 3d. Finalize App Publishing (enforces verified HMAC payment token + replay check + server-side APK/URL verification)
app.post('/api/publish/submit', async (req: Request, res: Response) => {
  try {
    const {
      appTitle,
      packageId,
      apkDownloadUrl,
      localApkPath,
      fileName,
      iconUrl,
      size,
      sha256,
      architectures,
      category,
      platform,
      version,
      description,
      developerName,
      ownerName,
      ownerProfile,
      developerEmail,
      paymentMethod,
      verificationToken,
      tier = 'Standard',
      paymentDetails = {},
    } = req.body || {};

    const cleanTitle = String(appTitle || '').trim();
    const cleanEmail = String(developerEmail || '').trim();
    const cleanLocalPath = String(localApkPath || '').trim();
    const cleanUrl = String(apkDownloadUrl || '').trim();
    const txHash = String(paymentDetails?.cryptoTxHash || '').trim();

    if (!cleanTitle) {
      return res.status(400).json({ success: false, message: 'Application name is required.' });
    }
    if (!cleanLocalPath && !cleanUrl) {
      return res.status(400).json({
        success: false,
        message: 'Upload your .apk file in Step 3 or provide a valid direct APK download URL.',
      });
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid owner contact email address is required.',
      });
    }

    if (AppDatabase.isPaymentProofUsed(txHash)) {
      return res.status(409).json({
        success: false,
        message: 'This transaction hash / order ID has already been redeemed.',
      });
    }

    const tokenCheck = verifyPaymentVerificationToken(
      String(verificationToken || ''),
      txHash,
      String(paymentMethod || '')
    );
    if (!tokenCheck.valid || !tokenCheck.payload) {
      return res.status(403).json({
        success: false,
        message:
          tokenCheck.message ||
          'Payment must be verified on BNB Smart Chain (Step 2) before publishing to the store.',
      });
    }

    let authoritativeSize = size ? String(size).trim() : undefined;
    let authoritativeSha256 = sha256 ? String(sha256).trim() : undefined;
    let authoritativeAbis = Array.isArray(architectures) ? architectures.map(String) : undefined;
    let verifiedLocalPath: string | undefined;
    let verifiedExternalUrl = cleanUrl;

    if (cleanLocalPath) {
      if (!cleanLocalPath.startsWith('/apks/uploads/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid uploaded APK storage path.',
        });
      }
      const uploadsRoot = path.resolve(process.cwd(), 'public/apks/uploads');
      const relUpload = path.basename(cleanLocalPath);
      const diskPath = path.resolve(uploadsRoot, relUpload);
      if (
        !diskPath.startsWith(uploadsRoot + path.sep) ||
        !fs.existsSync(diskPath) ||
        !fs.statSync(diskPath).isFile()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Uploaded APK file could not be located on server storage. Please upload again.',
        });
      }
      const diskBuf = fs.readFileSync(diskPath);
      const inspection = inspectApkArchive(diskBuf);
      if (!inspection.isValidZip || !inspection.hasAndroidManifest) {
        return res.status(400).json({
          success: false,
          message: 'Stored APK package failed server integrity inspection.',
        });
      }
      authoritativeSize = `${(diskBuf.length / (1024 * 1024)).toFixed(2)} MB`;
      authoritativeSha256 = crypto.createHash('sha256').update(diskBuf).digest('hex');
      if (inspection.architectures.length > 0) {
        authoritativeAbis = inspection.architectures;
      }
      verifiedLocalPath = `/apks/uploads/${relUpload}`;
    } else {
      const urlCheck = await verifyExternalApkUrl(cleanUrl);
      if (!urlCheck.valid || !urlCheck.reachable) {
        return res.status(400).json({
          success: false,
          message: urlCheck.message,
        });
      }
      verifiedExternalUrl = urlCheck.finalUrl || cleanUrl;
      if (!authoritativeSize && urlCheck.size) {
        authoritativeSize = urlCheck.size;
      }
    }

    const publishedApp = AppDatabase.publishApp({
      appTitle: cleanTitle,
      fileName: fileName ? String(fileName).trim() : undefined,
      packageId: packageId ? String(packageId).trim() : undefined,
      category: category ? String(category).trim() : 'Entertainment',
      platform: platform ? String(platform).trim() : 'Smart TV & Android Mobile',
      version: version ? String(version).trim() : '1.0.0',
      description: description ? String(description).trim() : `${cleanTitle} Android application package.`,
      developerName: developerName ? String(developerName).trim() : cleanTitle,
      ownerName: ownerName
        ? String(ownerName).trim()
        : developerName
        ? String(developerName).trim()
        : cleanTitle,
      ownerProfile: ownerProfile && typeof ownerProfile === 'object' ? ownerProfile : undefined,
      developerEmail: cleanEmail,
      iconUrl: iconUrl ? String(iconUrl).trim() : undefined,
      apkDownloadUrl: verifiedLocalPath ? verifiedLocalPath : verifiedExternalUrl,
      localApkPath: verifiedLocalPath,
      size: authoritativeSize,
      sha256: authoritativeSha256,
      architectures: authoritativeAbis,
    });

    const submission = AppDatabase.createSubmission(
      {
        appTitle: publishedApp.title,
        packageId: publishedApp.packageId,
        apkDownloadUrl: publishedApp.directDownloadUrl,
        size: publishedApp.size,
        sha256: publishedApp.sha256,
        publishedAppId: publishedApp.id,
        category: publishedApp.category,
        platform: publishedApp.platform,
        version: publishedApp.version,
        description: publishedApp.description,
        developerName: publishedApp.developer,
        developerEmail: publishedApp.developerEmail,
        targetAdminEmail: 'mr216873@gmail.com',
        tier: tier as any,
        amountPaidUsd: Number(tokenCheck.payload.amountPaidUsd) || 25.0,
        paymentMethod: String(paymentMethod),
        paymentDetails: {
          cryptoTxHash: txHash,
          cryptoNetwork: `BNB Smart Chain (BEP20 · Block #${tokenCheck.payload.blockNumber || 'Verified'})`,
        },
      },
      'Live'
    );

    const mailtoUrl = `mailto:mr216873@gmail.com?subject=${encodeURIComponent(
      `[App Published] ${submission.appTitle} (${submission.transactionId})`
    )}&body=${encodeURIComponent(
      `Dear MRS App Store Owner (mr216873@gmail.com),\n\nA new application has been verified on-chain, uploaded, and published via MRS App Store.\n\nInvoice Number: ${submission.invoiceNumber}\nTransaction ID: ${submission.transactionId}\nFee Verified: $${submission.amountPaidUsd.toFixed(2)} USD\nPayment Method: ${submission.paymentMethod}\nNetwork: ${submission.paymentDetails.cryptoNetwork || ''}\nTxHash: ${txHash}\nExplorer: ${tokenCheck.payload.explorerUrl || ''}\n\nApp Name: ${publishedApp.title}\nPackage ID: ${publishedApp.packageId}\nVersion: ${publishedApp.version}\nSize: ${publishedApp.size}\nSHA-256: ${publishedApp.sha256}\nDownload URL: ${publishedApp.directDownloadUrl}\nOwner: ${publishedApp.ownerName} (${publishedApp.developerEmail})\nSubmitted At: ${submission.submittedAt}`
    )}`;

    return res.status(201).json({
      success: true,
      message: `${publishedApp.title} verified, uploaded, and published live!`,
      submission,
      app: publishedApp,
      explorerUrl: tokenCheck.payload.explorerUrl,
      mailtoUrl,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to process publication.',
    });
  }
});

// 4. Backend site metadata, real store owner profile, categories & policies
app.get('/api/meta', (_req: Request, res: Response) => {
  const meta = AppDatabase.getSiteMeta();
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({
    success: true,
    meta
  });
});

app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = AppDatabase.getCategoriesWithCounts();
  res.setHeader('Cache-Control', 'public, max-age=15');
  res.json({
    success: true,
    categories,
  });
});

app.get('/api/owner', async (req: Request, res: Response) => {
  const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
  const profile = forceRefresh
    ? await AppDatabase.refreshOwnerProfile()
    : AppDatabase.getOwnerProfile();
  res.setHeader('Cache-Control', forceRefresh ? 'no-cache' : 'public, max-age=60');
  res.json({
    success: true,
    owner: profile,
  });
});

// 4b. Real Ratings & Reviews API (list, submit, mark helpful)
app.get('/api/reviews/:appId', (req: Request, res: Response) => {
  const result = AppDatabase.getReviewsByApp(req.params.appId);
  res.json({
    success: true,
    ...result
  });
});

app.post('/api/reviews/:appId', (req: Request, res: Response) => {
  const { author, title, rating, comment, device } = req.body || {};
  if (!author || !comment || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Author name, star rating, and review comment are required.'
    });
  }
  const result = AppDatabase.addReview(req.params.appId, {
    author: String(author),
    title: String(title || 'App Review'),
    rating: Number(rating),
    comment: String(comment),
    device: device ? String(device) : 'Android Device'
  });
  return res.status(201).json({
    success: true,
    ...result
  });
});

app.post('/api/reviews/:appId/:reviewId/helpful', (req: Request, res: Response) => {
  const result = AppDatabase.markReviewHelpful(req.params.appId, req.params.reviewId);
  return res.json({
    success: true,
    ...result
  });
});

// 5. Backend Health & Integrity Diagnostics Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const dbHealth = AppDatabase.getHealthReport();
  const includeRpc = req.query.checkRpc === '1' || req.query.checkRpc === 'true';
  const rpc = includeRpc ? await checkBscRpcHealth() : undefined;

  res.status(dbHealth.ok ? 200 : 503).json({
    success: dbHealth.ok,
    timestamp: new Date().toISOString(),
    ...dbHealth,
    ...(rpc ? { bscRpc: rpc } : {}),
  });
});

// Structured JSON error middleware for API requests (e.g. malformed JSON payloads)
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || (err instanceof SyntaxError ? 400 : 500);
  const message =
    err instanceof SyntaxError
      ? 'Invalid JSON request body.'
      : err?.message || 'Internal backend error.';
  return res.status(status).json({
    success: false,
    message,
  });
});

// Start dev or production server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MRS App Store] Server running on port ${PORT} (Node env: ${process.env.NODE_ENV || 'development'})`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
