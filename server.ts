import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppDatabase } from './server/db.ts';

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
    'camellia-ai': 'Camellia_Ai.apk',
  };

  if (apkMap[appItem.id]) {
    const filePath = path.resolve(process.cwd(), 'public/apks', apkMap[appItem.id]);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${appItem.fileName}"`);
      return res.sendFile(filePath);
    }
  }

  // Serve developer-uploaded local APKs stored inside public/apks/
  if (appItem.localApkPath && appItem.localApkPath.startsWith('/apks/')) {
    const safeRel = appItem.localApkPath.replace(/^\/apks\//, '').replace(/\.\./g, '');
    const filePath = path.resolve(process.cwd(), 'public/apks', safeRel);
    const apksRoot = path.resolve(process.cwd(), 'public/apks');
    if (filePath.startsWith(apksRoot) && fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${appItem.fileName}"`);
      return res.sendFile(filePath);
    }
  }

  // External HTTPS fallback if submitted with an external direct APK link
  return res.redirect(appItem.directDownloadUrl);
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

// 3a. Inbuilt Binary APK Upload Endpoint (computes real size + SHA-256)
app.post(
  '/api/publish/upload-apk',
  express.raw({ type: 'application/octet-stream', limit: '150mb' }),
  (req: Request, res: Response) => {
    try {
      const buf = req.body as Buffer;
      if (!Buffer.isBuffer(buf) || buf.length < 128) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a valid .apk package file.',
        });
      }

      // Every Android .apk archive is a ZIP binary starting with PK\x03\x04 (0x50 0x4B)
      if (buf[0] !== 0x50 || buf[1] !== 0x4b) {
        return res.status(400).json({
          success: false,
          message: 'Invalid APK binary signature. Expected a valid Android .apk archive.',
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
      const hasManifest = buf.includes(Buffer.from('AndroidManifest.xml'));

      return res.status(201).json({
        success: true,
        fileName: originalFileName,
        localApkPath: `/apks/uploads/${storedFileName}`,
        directDownloadUrl: `/apks/uploads/${storedFileName}`,
        size,
        bytes,
        sha256,
        hasManifest,
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

// 3b. List real developer submissions & receipts
app.get('/api/publish/submissions', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    submissions: AppDatabase.getAllSubmissions(),
  });
});

// 3c. Inbuilt App Publishing Pipeline (USDT BEP-20 & Binance Pay $25 USD)
app.post('/api/publish/submit', (req: Request, res: Response) => {
  try {
    const {
      appTitle,
      packageId,
      apkDownloadUrl,
      localApkPath,
      fileName,
      size,
      sha256,
      category,
      platform,
      version,
      description,
      developerName,
      ownerName,
      developerEmail,
      paymentMethod,
      tier = 'Standard',
      amountPaidUsd = 25.0,
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
        message: 'Upload an .apk file or enter a direct APK download URL.',
      });
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'A valid developer contact email address is required.',
      });
    }
    if (paymentMethod !== 'USDT (BEP-20)' && paymentMethod !== 'Binance Pay') {
      return res.status(400).json({
        success: false,
        message: 'Select either USDT (BEP-20) or Binance Pay.',
      });
    }
    if (txHash.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Enter your valid USDT BEP-20 TxHash or Binance Pay Order ID (minimum 6 characters).',
      });
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
      ownerName: ownerName ? String(ownerName).trim() : (developerName ? String(developerName).trim() : cleanTitle),
      developerEmail: cleanEmail,
      apkDownloadUrl: cleanUrl || cleanLocalPath,
      localApkPath: cleanLocalPath || undefined,
      size: size ? String(size).trim() : undefined,
      sha256: sha256 ? String(sha256).trim() : undefined,
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
        amountPaidUsd: Number(amountPaidUsd) || 25.0,
        paymentMethod,
        paymentDetails: {
          cryptoTxHash: txHash,
          cryptoNetwork:
            paymentMethod === 'USDT (BEP-20)'
              ? 'BNB Smart Chain (BEP20)'
              : 'Binance Pay (mrxshahin)',
        },
      },
      'Live'
    );

    const mailtoUrl = `mailto:mr216873@gmail.com?subject=${encodeURIComponent(
      `[App Published] ${submission.appTitle} (${submission.transactionId})`
    )}&body=${encodeURIComponent(
      `Dear MRS App Store Owner (mr216873@gmail.com),\n\nA new application has been submitted and published via the inbuilt MRS App Store Publishing System.\n\nInvoice Number: ${submission.invoiceNumber}\nTransaction ID: ${submission.transactionId}\nFee: $${submission.amountPaidUsd.toFixed(2)} USD\nPayment Method: ${submission.paymentMethod}\nNetwork: ${submission.paymentDetails.cryptoNetwork || ''}\nTxHash / Order ID: ${txHash}\n\nApp Name: ${publishedApp.title}\nPackage ID: ${publishedApp.packageId}\nVersion: ${publishedApp.version}\nSize: ${publishedApp.size}\nSHA-256: ${publishedApp.sha256}\nDownload URL: ${publishedApp.directDownloadUrl}\nDeveloper: ${publishedApp.developer} (${publishedApp.developerEmail})\nSubmitted At: ${submission.submittedAt}`
    )}`;

    return res.status(201).json({
      success: true,
      message: `${publishedApp.title} is now published in MRS App Store!`,
      submission,
      app: publishedApp,
      mailtoUrl,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to process publication.',
    });
  }
});

// 4. Backend site metadata, auto-renewed copyright & policies
app.get('/api/meta', (_req: Request, res: Response) => {
  const meta = AppDatabase.getSiteMeta();
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({
    success: true,
    meta
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

// 5. Root Service Worker handler for Monetag push notifications
app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.resolve(process.cwd(), 'public/sw.js'));
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
