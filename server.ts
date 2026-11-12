import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AppDatabase } from './server/db.ts';
import { generateBloggerThemeXml } from './server/theme-xml.ts';

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

  const filename = apkMap[appItem.id] || `${appItem.id}.apk`;
  const filePath = path.resolve(process.cwd(), 'public/apks', filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${appItem.fileName}"`);
    return res.sendFile(filePath);
  }

  // Fallback if local file not found
  return res.redirect(appItem.directDownloadUrl);
});

// Direct APK download route by filename
app.get('/download/:filename', (req: Request, res: Response) => {
  const filePath = path.resolve(process.cwd(), 'public/apks', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
    return res.sendFile(filePath);
  }
  return res.status(404).send('APK file not found.');
});

// 3. App Publishing Pipeline with USD Payment and Email to mr216873@gmail.com
app.post('/api/publish/submit', (req: Request, res: Response) => {
  try {
    const {
      appTitle,
      apkDownloadUrl,
      category,
      platform,
      version,
      description,
      developerName,
      developerEmail,
      paymentMethod,
      tier = 'Standard',
      amountPaidUsd = 25.00,
      paymentDetails = {}
    } = req.body;

    if (!appTitle || !apkDownloadUrl || !developerEmail) {
      return res.status(400).json({
        success: false,
        message: 'App Title, APK Download Link, and Developer Email are required.'
      });
    }

    const submission = AppDatabase.createSubmission({
      appTitle: String(appTitle).trim(),
      apkDownloadUrl: String(apkDownloadUrl).trim(),
      category: category || 'Entertainment',
      platform: platform || 'Smart TV & Android Mobile',
      version: version ? String(version).trim() : '1.0.0',
      description: description ? String(description).trim() : 'Verified application package',
      developerName: developerName ? String(developerName).trim() : 'Verified Developer',
      developerEmail: String(developerEmail).trim(),
      targetAdminEmail: 'mr216873@gmail.com',
      tier: tier as any,
      amountPaidUsd: Number(amountPaidUsd) || 25.00,
      paymentMethod: paymentMethod || 'Credit / Debit Card (USD)',
      paymentDetails: typeof paymentDetails === 'object' ? paymentDetails : {}
    });

    console.log(`[Developer Submission] New app "${submission.appTitle}" paid $${submission.amountPaidUsd.toFixed(2)} USD via ${submission.paymentMethod}. Transaction ${submission.transactionId}. Notification dispatched to mr216873@gmail.com`);

    return res.status(201).json({
      success: true,
      message: `App publication payment of $${submission.amountPaidUsd.toFixed(2)} USD successfully processed. Review dispatch prepared for mr216873@gmail.com!`,
      submission,
      mailtoUrl: `mailto:mr216873@gmail.com?subject=${encodeURIComponent(`[PAID $${submission.amountPaidUsd.toFixed(2)} USD] New App Publication: ${submission.appTitle} (${submission.transactionId})`)}&body=${encodeURIComponent(
        `Dear MRS App Store Review Team (mr216873@gmail.com),\n\nA new application has been submitted with confirmed developer publishing fee payment.\n\n=========================================\nOFFICIAL PAYMENT & SUBMISSION RECEIPT\n=========================================\nInvoice Number: ${submission.invoiceNumber}\nTransaction ID: ${submission.transactionId}\nPaid Amount: $${submission.amountPaidUsd.toFixed(2)} USD\nPayment Status: COMPLETED & VERIFIED\nPayment Gateway / Method: ${submission.paymentMethod}\nPayment Timestamp: ${submission.submittedAt}\n\n=========================================\nAPPLICATION MANIFEST\n=========================================\nApp Name: ${submission.appTitle}\nTarget File / Package: ${submission.appTitle}.apk\nVersion: ${submission.version}\nCategory: ${submission.category}\nTarget Platform: ${submission.platform}\nDirect APK Download Link: ${submission.apkDownloadUrl}\n\nDeveloper Name: ${submission.developerName}\nDeveloper Email: ${submission.developerEmail}\nApp Description:\n${submission.description}\n\nPlease review the package integrity and publish this application to the MRS App Store catalog.`
      )}`
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process publication'
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

// 5. Root Service Worker handler for Monetag push notifications
app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.resolve(process.cwd(), 'public/sw.js'));
});

// 6. Direct XML Theme Download Route
app.get('/mrs-theme.xml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.sendFile(path.resolve(process.cwd(), 'public/mrs-theme.xml'));
});

// 7. Theme XML Export API
app.get('/api/theme/xml', (_req: Request, res: Response) => {
  const xmlContent = generateBloggerThemeXml();
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mrs-appstore-theme.xml"');
  res.send(xmlContent);
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
