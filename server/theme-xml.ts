import fs from 'fs';
import path from 'path';

/**
 * Blogger XML Theme Generator for MRS App Store (Pro Apple Edition)
 * Includes:
 * - Monetag tag.min.js script & verification tag
 * - Apple-grade dark glassmorphism UI & glowing accents
 * - Live instant search & category filtering in pure vanilla JS
 * - App Detail Preview modals
 * - Developer Crypto Publishing modal ($25 USD)
 * - 100% Blogger v3 XML validation compliant
 */
export function generateBloggerThemeXml(): string {
  const currentYear = new Date().getFullYear();

  let binancePayQrBase64 = '';
  let usdtBep20QrBase64 = '';
  let siteLogoBase64 = '';
  let camelliaAiLogoBase64 = '';
  let iptvLogoBase64 = '';

  try {
    const siteLogoPath = path.join(process.cwd(), 'public/assets/site-logo-icon.jpg');
    if (fs.existsSync(siteLogoPath)) {
      siteLogoBase64 = `data:image/jpeg;base64,${fs.readFileSync(siteLogoPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading site logo icon:', e);
  }

  try {
    const binancePayPath = path.join(process.cwd(), 'public/assets/aistudio/unnamed__1__2b5c7e8c.png');
    if (fs.existsSync(binancePayPath)) {
      binancePayQrBase64 = `data:image/png;base64,${fs.readFileSync(binancePayPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading Binance Pay QR image:', e);
  }

  try {
    const usdtPath = path.join(process.cwd(), 'public/assets/aistudio/unnamed__2__145559af.png');
    if (fs.existsSync(usdtPath)) {
      usdtBep20QrBase64 = `data:image/png;base64,${fs.readFileSync(usdtPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading USDT QR image:', e);
  }

  try {
    const camelliaPath = path.join(process.cwd(), 'public/assets/camellia-ai-thumb.jpg');
    if (fs.existsSync(camelliaPath)) {
      camelliaAiLogoBase64 = `data:image/jpeg;base64,${fs.readFileSync(camelliaPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading Camellia Ai thumb:', e);
  }

  try {
    const iptvPath = path.join(process.cwd(), 'public/assets/mrs-iptv-thumb.png');
    if (fs.existsSync(iptvPath)) {
      iptvLogoBase64 = `data:image/png;base64,${fs.readFileSync(iptvPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading IPTV thumb:', e);
  }

  return `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <!-- Monetag Script (Placed right after head) -->
  <script async='async' data-cfasync='false' data-zone='300912' src='https://quge5.com/88/tag.min.js'></script>
  
  <meta content='text/html; charset=UTF-8' http-equiv='Content-Type'/>
  <meta content='width=device-width, initial-scale=1.0, maximum-scale=5.0' name='viewport'/>
  <!-- Monetag Verification Meta Tag -->
  <meta content='43bce6afdc53e6d304c43c5ea69a3c25' name='monetag'/>
  <title><data:view.title.escaped/></title>
  <b:include data='blog' name='all-head-content'/>
  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&amp;display=swap' rel='stylesheet'/>
  
  <b:skin><![CDATA[
  /* Apple Pro App Store Dark Theme for MRS Store */
  :root {
    --bg-main: #000000;
    --bg-surface: #0a0a0c;
    --bg-card: #111115;
    --bg-card-hover: #18181f;
    --border-color: rgba(255, 255, 255, 0.09);
    --border-focus: rgba(0, 113, 227, 0.6);
    --text-primary: #ffffff;
    --text-secondary: #a1a1a6;
    --text-muted: #6e6e73;
    --accent: #0071e3;
    --accent-glow: rgba(0, 113, 227, 0.35);
    --success: #30d158;
    --warning: #ffd60a;
    --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: var(--bg-main); color: var(--text-primary); font-family: var(--font-sans); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  a { color: inherit; text-decoration: none; }

  /* Background Ambient Halos */
  .ambient-glow { position: fixed; top: 0; left: 50%; transform: translateX(-50%); width: 1000px; height: 450px; background: radial-gradient(ellipse at 50% 0%, rgba(0, 113, 227, 0.18) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%); pointer-events: none; z-index: 0; }

  /* Apple-style Translucent Top Bar */
  .store-header { position: sticky; top: 0; z-index: 50; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-bottom: 1px solid var(--border-color); padding: 0.85rem 1.5rem; }
  .header-container { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; position: relative; z-index: 2; }
  .brand-lockup { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; }
  .brand-badge { width: 38px; height: 38px; border-radius: 22%; background: linear-gradient(135deg, #0071e3, #4f46e5); display: flex; align-items: center; justify-content: center; font-weight: 900; color: #fff; box-shadow: 0 4px 18px var(--accent-glow); }
  .nav-links { display: flex; align-items: center; gap: 1.25rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
  .nav-links a:hover, .nav-links button:hover { color: #fff; }
  .publish-nav-btn { background: linear-gradient(135deg, #0071e3, #2563eb); color: #fff; padding: 0.5rem 1.2rem; border-radius: 9999px; font-weight: 700; border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; font-size: 0.8rem; box-shadow: 0 4px 14px var(--accent-glow); }
  .publish-nav-btn:hover { transform: scale(0.98); box-shadow: 0 6px 20px rgba(0, 113, 227, 0.5); }

  /* Hero Editorial Banner */
  .hero-section { max-width: 1280px; margin: 1.5rem auto; padding: 0 1.5rem; position: relative; z-index: 2; }
  .hero-banner { background: linear-gradient(180deg, #121217 0%, #060608 100%); border: 1px solid var(--border-color); border-radius: 36px; padding: 3.5rem; display: flex; flex-direction: column; gap: 1.25rem; position: relative; overflow: hidden; box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8); }
  .hero-banner::after { content: ''; position: absolute; top: -60px; right: -60px; width: 360px; height: 360px; background: radial-gradient(circle, rgba(0, 113, 227, 0.22) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
  .hero-badges-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .hero-pill { background: rgba(0, 113, 227, 0.15); border: 1px solid rgba(0, 113, 227, 0.35); color: #2997ff; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.35rem 0.85rem; border-radius: 9999px; }
  .hero-stats-pill { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.85rem; border-radius: 9999px; }
  .hero-title { font-size: 3rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.05; max-width: 700px; }
  .hero-desc { color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; line-height: 1.6; }
  .hero-actions { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
  .apple-get-btn { background: #ffffff; color: #000000; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.8rem 2rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.6rem; transition: transform 0.15s, background 0.15s; }
  .apple-get-btn:hover { background: #e5e5ea; transform: scale(0.98); }
  .hero-secondary-btn { background: rgba(255, 255, 255, 0.1); color: #fff; font-weight: 700; font-size: 0.85rem; padding: 0.8rem 1.6rem; border-radius: 9999px; border: 1px solid var(--border-color); cursor: pointer; transition: background 0.15s; }
  .hero-secondary-btn:hover { background: rgba(255, 255, 255, 0.18); }

  /* Interactive Search & Filter Controls */
  .controls-section { max-width: 1280px; margin: 2rem auto 0; padding: 0 1.5rem; position: relative; z-index: 2; }
  .controls-box { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 24px; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .search-wrapper { position: relative; width: 100%; }
  .search-input { width: 100%; background: #141419; border: 1px solid var(--border-color); border-radius: 14px; padding: 0.85rem 1.2rem; color: #fff; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .search-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.25); }
  .filter-tabs { display: flex; align-items: center; gap: 0.6rem; overflow-x: auto; padding-bottom: 0.25rem; }
  .filter-tab { background: rgba(255, 255, 255, 0.07); color: var(--text-secondary); border: 1px solid transparent; padding: 0.5rem 1.1rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
  .filter-tab:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
  .filter-tab.active { background: #0071e3; color: #fff; box-shadow: 0 4px 12px var(--accent-glow); }

  /* App Cards Grid */
  .apps-grid-container { max-width: 1280px; margin: 1.5rem auto 4rem; padding: 0 1.5rem; position: relative; z-index: 2; }
  .section-heading { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; }
  .section-tag { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .app-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
  .app-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 28px; padding: 1.6rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem; transition: transform 0.2s, border-color 0.2s, background 0.2s; box-shadow: 0 12px 32px rgba(0,0,0,0.5); }
  .app-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.18); background: var(--bg-card-hover); }
  .app-card-header { display: flex; gap: 1.25rem; align-items: flex-start; }
  .app-icon { width: 76px; height: 76px; border-radius: 22%; object-fit: cover; background: linear-gradient(135deg, #0071e3, #6366f1); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 10px 24px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 900; color: #fff; flex-shrink: 0; }
  .app-meta { flex: 1; min-width: 0; }
  .app-title-row { display: flex; align-items: center; gap: 0.4rem; }
  .app-title { font-size: 1.3rem; font-weight: 800; line-height: 1.25; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .verified-badge { color: #2997ff; font-size: 0.95rem; }
  .app-subinfo { font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.45rem; font-weight: 600; margin-bottom: 0.35rem; }
  .app-platform-tag { font-size: 0.7rem; color: #34c759; background: rgba(52, 199, 89, 0.12); border: 1px solid rgba(52, 199, 89, 0.25); padding: 0.2rem 0.55rem; border-radius: 6px; font-weight: 700; width: fit-content; }
  .app-description { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .app-actions { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
  .details-btn { background: rgba(255, 255, 255, 0.08); color: #fff; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; padding: 0.5rem 1.1rem; border-radius: 9999px; border: 1px solid var(--border-color); cursor: pointer; transition: background 0.15s; }
  .details-btn:hover { background: rgba(255, 255, 255, 0.16); }
  .card-get-btn { background: rgba(255, 255, 255, 0.15); color: #2997ff; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.55rem 1.6rem; border-radius: 9999px; border: none; cursor: pointer; transition: background 0.15s, color 0.15s; }
  .card-get-btn:hover { background: #ffffff; color: #000000; }

  /* Modals */
  .modal-overlay { display: none; position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); align-items: center; justify-content: center; padding: 1.25rem; }
  .modal-overlay.active { display: flex; }
  .modal-box { background: #0c0c0f; border: 1px solid rgba(255,255,255,0.12); border-radius: 32px; max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2.25rem; position: relative; box-shadow: 0 30px 80px rgba(0,0,0,0.85); }
  .modal-close { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem; transition: background 0.15s; }
  .modal-close:hover { background: rgba(255,255,255,0.2); }
  .modal-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.35rem; }
  .modal-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
  .fee-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0,113,227,0.15); border: 1px solid rgba(0,113,227,0.3); color: #2997ff; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 800; margin-bottom: 1.25rem; }
  
  .qr-container { display: flex; flex-direction: column; align-items: center; gap: 1rem; background: #060608; border: 1px solid var(--border-color); border-radius: 20px; padding: 1.5rem; margin: 1rem 0; text-align: center; }
  .qr-image { width: 180px; height: 180px; border-radius: 14px; object-fit: contain; background: #ffffff; padding: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
  .crypto-val-box { background: #16161c; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0.75rem 1rem; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-family: monospace; font-size: 0.8rem; word-break: break-all; }
  .copy-btn { background: #0071e3; color: #fff; border: none; padding: 0.45rem 0.95rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
  .copy-btn:hover { background: #0077ed; }

  /* App Details Modal Specs */
  .spec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1.25rem 0; }
  .spec-card { background: #141419; border: 1px solid var(--border-color); border-radius: 14px; padding: 0.85rem 1rem; }
  .spec-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
  .spec-value { font-size: 0.9rem; font-weight: 700; color: #fff; margin-top: 0.25rem; }

  /* Mandatory Blogger native widget hidden to maintain pristine store interface */
  #main, .main { display: none !important; }

  /* Footer */
  .store-footer { border-top: 1px solid var(--border-color); background: #000000; padding: 4rem 1.5rem 3rem; margin-top: 5rem; font-size: 0.85rem; color: var(--text-secondary); position: relative; z-index: 2; }
  .footer-inner { max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem; }
  .footer-policies { display: flex; flex-wrap: wrap; gap: 1.5rem; }
  .footer-policies a:hover { color: #fff; }

  @media (max-width: 640px) {
    .header-container { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    .hero-banner { padding: 2rem 1.5rem; border-radius: 24px; }
    .hero-title { font-size: 2rem; }
    .app-cards-grid { grid-template-columns: 1fr; }
    .spec-grid { grid-template-columns: 1fr; }
    .modal-box { padding: 1.5rem; }
  }
  ]]></b:skin>
</head>
<body>
  <!-- Background Glow -->
  <div class='ambient-glow'/>

  <!-- Apple App Store Header -->
  <header class='store-header'>
    <div class='header-container'>
      <a class='brand-lockup' href='/'>
        ${siteLogoBase64 ? `<img alt='MRS App Store Official Logo' class='brand-badge' src='${siteLogoBase64}' style='object-fit:cover;'/>` : `<div class='brand-badge'>M</div>`}
        <span>MRS Store</span>
      </a>
      <nav class='nav-links'>
        <a href='/'>Today</a>
        <a href='#apps'>Apps</a>
        <button class='publish-nav-btn' onclick='openPublishModal()'>Publish ($25 USD)</button>
        <a href='javascript:openLegalModal("privacy")'>Privacy</a>
      </nav>
    </div>
  </header>

  <!-- Today Editorial Hero Section -->
  <section class='hero-section'>
    <div class='hero-banner'>
      <div class='hero-badges-row'>
        <div class='hero-pill'>Featured &#183; Today</div>
        <div class='hero-stats-pill'>Verified Clean APK &#183; Direct CDN</div>
      </div>
      <h1 class='hero-title'>M R S IPTV</h1>
      <p class='hero-desc'>High-definition live channels, sports broadcasts &amp; global entertainment. Direct APK download hosted via upload-apk.com.</p>
      <div class='hero-actions'>
        <a class='apple-get-btn' href='/api/download/m-r-s-iptv' target='_blank'>
          GET DIRECT APK (28.6 MB)
        </a>
        <button class='hero-secondary-btn' onclick="openAppDetail('m-r-s-iptv')">
          View Specifications &amp; Links
        </button>
      </div>
    </div>
  </section>

  <!-- Interactive Controls: Live Search & Category Filtering -->
  <section class='controls-section'>
    <div class='controls-box'>
      <div class='search-wrapper'>
        <input class='search-input' id='storeSearch' oninput='filterApps()' placeholder='Search apps, packages, categories...' type='text'/>
      </div>
      <div class='filter-tabs'>
        <button class='filter-tab active' data-category='all' onclick="selectCategory('all', this)">All Releases</button>
        <button class='filter-tab' data-category='iptv' onclick="selectCategory('iptv', this)">IPTV &amp; Streaming</button>
        <button class='filter-tab' data-category='video' onclick="selectCategory('video', this)">Smart TV &amp; Video</button>
        <button class='filter-tab' data-category='ai' onclick="selectCategory('ai', this)">AI &amp; Assistant</button>
      </div>
    </div>
  </section>

  <!-- App Cards Feed -->
  <main class='apps-grid-container' id='apps'>
    <div class='section-heading'>
      <h2>Verified In-House Catalog</h2>
      <span class='section-tag' id='appsCount'>3 Direct APK Packages</span>
    </div>
    <div class='app-cards-grid' id='appsGrid'>

      <!-- App 1: M R S IPTV.apk -->
      <article class='app-card' data-category='iptv' data-id='m-r-s-iptv' data-title='m r s iptv'>
        <div class='app-card-header'>
          ${iptvLogoBase64 ? `<img alt='M R S IPTV' class='app-icon' src='${iptvLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #0071e3, #38bdf8);'>M</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>M R S IPTV</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-subinfo'>
              <span>IPTV &amp; Streaming</span>
              <span>&#183;</span>
              <span>4.9 &#9733;</span>
              <span>&#183;</span>
              <span>28.6 MB</span>
            </div>
            <div class='app-platform-tag'>Smart TV &amp; Mobile</div>
          </div>
        </div>
        <div class='app-description'>
          Official M R S IPTV.apk package for Smart TV, Firestick, and Android mobile devices with hardware acceleration.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('m-r-s-iptv')" type='button'>Specs &amp; Share</button>
          <a class='card-get-btn' href='/api/download/m-r-s-iptv' target='_blank'>GET</a>
        </div>
      </article>

      <!-- App 2: M_R_S_IPTV.apk -->
      <article class='app-card' data-category='video' data-id='m-r-s-iptv-pro' data-title='m_r_s_iptv'>
        <div class='app-card-header'>
          ${iptvLogoBase64 ? `<img alt='M_R_S_IPTV' class='app-icon' src='${iptvLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #6366f1, #a855f7);'>M</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>M_R_S_IPTV</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-subinfo'>
              <span>Smart TV &amp; Video</span>
              <span>&#183;</span>
              <span>4.9 &#9733;</span>
              <span>&#183;</span>
              <span>29.2 MB</span>
            </div>
            <div class='app-platform-tag'>Multi-Screen Edition</div>
          </div>
        </div>
        <div class='app-description'>
          Official M_R_S_IPTV.apk multi-screen edition with low-bandwidth optimization and custom player engine.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('m-r-s-iptv-pro')" type='button'>Specs &amp; Share</button>
          <a class='card-get-btn' href='/api/download/m-r-s-iptv-pro' target='_blank'>GET</a>
        </div>
      </article>

      <!-- App 3: Camellia Ai.apk -->
      <article class='app-card' data-category='ai' data-id='camellia-ai' data-title='camellia ai'>
        <div class='app-card-header'>
          ${camelliaAiLogoBase64 ? `<img alt='Camellia Ai' class='app-icon' src='${camelliaAiLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #ec4899, #f43f5e);'>C</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>Camellia Ai</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-subinfo'>
              <span>AI &amp; Assistant</span>
              <span>&#183;</span>
              <span>4.9 &#9733;</span>
              <span>&#183;</span>
              <span>34.5 MB</span>
            </div>
            <div class='app-platform-tag'>Android Mobile</div>
          </div>
        </div>
        <div class='app-description'>
          Official Camellia Ai.apk conversational companion &amp; smart voice assistant with ultra-responsive natural language intelligence.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('camellia-ai')" type='button'>Specs &amp; Share</button>
          <a class='card-get-btn' href='/api/download/camellia-ai' target='_blank'>GET</a>
        </div>
      </article>

    </div>
  </main>

  <!-- Interactive App Details Preview Modal -->
  <div class='modal-overlay' id='detailModal' onclick='closeDetailModal(event)'>
    <div class='modal-box' onclick='event.stopPropagation()'>
      <button class='modal-close' onclick='closeDetailModal(event)' type='button'>&#10005;</button>
      <div class='fee-badge' id='detailCategory'>Category</div>
      <h3 class='modal-title' id='detailTitle'>App Title</h3>
      <p class='modal-subtitle' id='detailDesc'>App Description</p>

      <div class='spec-grid'>
        <div class='spec-card'>
          <div class='spec-label'>File Package</div>
          <div class='spec-value' id='detailFile'>package.apk</div>
        </div>
        <div class='spec-card'>
          <div class='spec-label'>Download Size</div>
          <div class='spec-value' id='detailSize'>0.0 MB</div>
        </div>
        <div class='spec-card'>
          <div class='spec-label'>Rating</div>
          <div class='spec-value' id='detailRating'>4.9 &#9733;</div>
        </div>
        <div class='spec-card'>
          <div class='spec-label'>Hosting Provider</div>
          <div class='spec-value' style='color:#34c759;'>Direct In-House CDN</div>
        </div>
      </div>

      <!-- Specific Download & Sharing Links -->
      <div style='display:flex;flex-direction:column;gap:0.75rem;margin:1.25rem 0;'>
        <div style='background:#141419;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:0.85rem 1rem;'>
          <div style='font-size:0.7rem;color:#38bdf8;font-weight:700;text-transform:uppercase;'>Specific Direct APK Download Link</div>
          <div style='display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-top:0.35rem;'>
            <span id='detailDownloadLink' style='font-family:monospace;font-size:0.75rem;color:#a1a1a6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'></span>
            <button class='copy-btn' onclick="copyElementText('detailDownloadLink', this)" type='button'>Copy Link</button>
          </div>
        </div>

        <div style='background:#141419;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:0.85rem 1rem;'>
          <div style='font-size:0.7rem;color:#c084fc;font-weight:700;text-transform:uppercase;'>Specific App Sharing Link</div>
          <div style='display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-top:0.35rem;'>
            <span id='detailShareLink' style='font-family:monospace;font-size:0.75rem;color:#a1a1a6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'></span>
            <button class='copy-btn' onclick="copyElementText('detailShareLink', this)" style='background:#9333ea;' type='button'>Copy Share</button>
          </div>
        </div>
      </div>

      <div style='margin-top:1.25rem;display:flex;gap:0.75rem;'>
        <a class='apple-get-btn' href='#' id='detailGetBtn' style='flex:1;justify-content:center;' target='_blank'>
          DOWNLOAD APK DIRECTLY
        </a>
      </div>
    </div>
  </div>

  <!-- Interactive App Publishing Modal (Crypto / Binance Pay Only) -->
  <div class='modal-overlay' id='publishModal' onclick='closePublishModal(event)'>
    <div class='modal-box' onclick='event.stopPropagation()'>
      <button class='modal-close' onclick='closePublishModal(event)' type='button'>&#10005;</button>
      <div class='fee-badge'>Publishing Review Fee: $25.00 USD</div>
      <h3 class='modal-title'>Publish Your Application</h3>
      <p class='modal-subtitle'>We accept developer submissions exclusively via Crypto (USDT BEP-20) or Binance Pay. Review fee is strictly $25 USD.</p>

      <!-- Payment Method 1: USDT BEP-20 -->
      <div class='qr-container'>
        <strong style='font-size: 0.95rem; color: #2997ff;'>Option 1: Deposit USDT (BEP-20 / BSC)</strong>
        <p style='font-size: 0.75rem; color: #8e8e93;'>Deposit $25 USDT via BNB Smart Chain (BEP20)</p>
        ${
          usdtBep20QrBase64
            ? `<img alt='USDT BEP20 QR' class='qr-image' src='${usdtBep20QrBase64}'/>`
            : `<img alt='USDT BEP20 QR' class='qr-image' src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&amp;data=0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e'/>`
        }
        <div class='crypto-val-box'>
          <span id='usdtAddress'>0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e</span>
          <button class='copy-btn' onclick="copyText('0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e', this)" type='button'>Copy Address</button>
        </div>
      </div>

      <!-- Payment Method 2: Binance Pay -->
      <div class='qr-container'>
        <strong style='font-size: 0.95rem; color: #f59e0b;'>Option 2: Binance Pay</strong>
        <p style='font-size: 0.75rem; color: #8e8e93;'>Scan with Binance App (Zero Fee Instant)</p>
        ${
          binancePayQrBase64
            ? `<img alt='Binance Pay QR' class='qr-image' src='${binancePayQrBase64}'/>`
            : `<img alt='Binance Pay QR' class='qr-image' src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&amp;data=mrxshahin'/>`
        }
        <div class='crypto-val-box'>
          <span id='binancePayId'>mrxshahin</span>
          <button class='copy-btn' onclick="copyText('mrxshahin', this)" type='button'>Copy Binance ID</button>
        </div>
      </div>

      <!-- Next Steps & Mailto -->
      <div style='background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.25rem;margin-top:1rem;'>
        <h4 style='font-size:0.9rem;font-weight:800;margin-bottom:0.5rem;'>After Payment Verification:</h4>
        <p style='font-size:0.8rem;color:#8e8e93;line-height:1.6;'>
          Send your APK file/link and payment proof (Transaction Hash or Binance Order ID) directly to:
          <br/>
          <strong style='color:#fff;'>mr216873@gmail.com</strong>
        </p>
        <div style='margin-top:1rem;display:flex;gap:0.75rem;'>
          <a class='apple-get-btn' href='mailto:mr216873@gmail.com?subject=App%20Publishing%20Payment%20Proof%20($25%20USD)&amp;body=Hello%20MRS%20App%20Store%2C%0A%0AI%20have%20paid%20the%20%2425%20USD%20publishing%20fee.%0A%0AApp%20Name%3A%20%0ADirect%20APK%20Link%3A%20%0APayment%20Method%3A%20%5BUSDT%20BEP-20%20%2F%20Binance%20Pay%5D%0ATransaction%20Hash%20%2F%20Order%20ID%3A%20%0A%0APlease%20publish%20my%20application.' style='width:100%;justify-content:center;' target='_blank'>
            Email Submission to mr216873@gmail.com
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Mandatory Blogger XML Section with Self-Closing Widget for 100% Parser Compatibility -->
  <b:section class='main' id='main' showaddelement='yes'>
    <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog'/>
  </b:section>

  <!-- Footer with Auto-Renewing Year Script -->
  <footer class='store-footer' id='policy'>
    <div class='footer-inner'>
      <div class='footer-policies'>
        <a href='javascript:openPublishModal()'>Developer Publishing ($25 USD Crypto)</a>
        <a href='mailto:mr216873@gmail.com'>Contact: mr216873@gmail.com</a>
        <a href='https://www.upload-apk.com' target='_blank'>Hosting Provider (upload-apk.com)</a>
      </div>
      <div>
        <p id='copyright-text'>&#169; <span id='theme-year'>${currentYear}</span> MRS TV Network. All rights reserved.</p>
        <p style='font-size: 0.75rem; margin-top: 0.25rem; color: #636366;'>Direct verified downloads hosted on upload-apk.com. Auto-renewed yearly policy compliance.</p>
      </div>
    </div>
  </footer>

  <script>
    //<![CDATA[
    var appData = {
      'm-r-s-iptv': {
        title: 'M R S IPTV',
        file: 'M R S IPTV.apk',
        desc: 'High-definition live channels, sports broadcasts & global entertainment with zero-buffer player engine.',
        size: '28.6 MB',
        category: 'IPTV & Streaming',
        platform: 'Smart TV, Firestick & Android Mobile',
        rating: '4.9 ★ (1,840 reviews)',
        link: '/api/download/m-r-s-iptv',
        share: '/?app=m-r-s-iptv'
      },
      'm-r-s-iptv-pro': {
        title: 'M_R_S_IPTV',
        file: 'M_R_S_IPTV.apk',
        desc: 'Custom multi-screen grid playback (watch up to 4 streams simultaneously) with low-bandwidth optimization.',
        size: '29.2 MB',
        category: 'Smart TV & Video',
        platform: 'Smart TV, TV Box & Android Mobile',
        rating: '4.9 ★ (1,520 reviews)',
        link: '/api/download/m-r-s-iptv-pro',
        share: '/?app=m-r-s-iptv-pro'
      },
      'camellia-ai': {
        title: 'Camellia Ai',
        file: 'Camellia Ai.apk',
        desc: 'Empathetic conversational AI companion with real-time natural voice, memory retention and productivity tools.',
        size: '34.5 MB',
        category: 'AI & Virtual Assistant',
        platform: 'Android Mobile (ARM64 / ARMv7)',
        rating: '4.9 ★ (2,350 reviews)',
        link: '/api/download/camellia-ai',
        share: '/?app=camellia-ai'
      }
    };

    var currentCategory = 'all';

    function openPublishModal() {
      var modal = document.getElementById('publishModal');
      if (modal) modal.classList.add('active');
    }

    function closePublishModal(e) {
      var modal = document.getElementById('publishModal');
      if (modal) modal.classList.remove('active');
    }

    function openAppDetail(appId) {
      var app = appData[appId];
      if (!app) return;
      document.getElementById('detailTitle').textContent = app.title;
      document.getElementById('detailDesc').textContent = app.desc;
      document.getElementById('detailFile').textContent = app.file;
      document.getElementById('detailSize').textContent = app.size;
      document.getElementById('detailRating').textContent = app.rating;
      document.getElementById('detailCategory').textContent = app.category;
      
      var origin = window.location.origin || '';
      var dlLink = origin + app.link;
      var shLink = origin + app.share;

      var dlEl = document.getElementById('detailDownloadLink');
      if (dlEl) dlEl.textContent = dlLink;
      var shEl = document.getElementById('detailShareLink');
      if (shEl) shEl.textContent = shLink;

      var getBtn = document.getElementById('detailGetBtn');
      if (getBtn) {
        getBtn.href = app.link;
        getBtn.setAttribute('download', app.file);
      }

      var modal = document.getElementById('detailModal');
      if (modal) modal.classList.add('active');
    }

    function copyElementText(id, btn) {
      var el = document.getElementById(id);
      if (!el) return;
      var text = el.textContent || '';
      copyText(text, btn);
    }

    function closeDetailModal(e) {
      var modal = document.getElementById('detailModal');
      if (modal) modal.classList.remove('active');
    }

    function selectCategory(cat, btn) {
      currentCategory = cat;
      var tabs = document.querySelectorAll('.filter-tab');
      tabs.forEach(function(t) { t.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      filterApps();
    }

    function filterApps() {
      var searchInput = document.getElementById('storeSearch');
      var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      var cards = document.querySelectorAll('.app-card');
      var visibleCount = 0;

      cards.forEach(function(card) {
        var cardCat = card.getAttribute('data-category');
        var cardTitle = card.getAttribute('data-title') || '';
        var matchesCat = (currentCategory === 'all') || (cardCat === currentCategory);
        var matchesQuery = !q || cardTitle.indexOf(q) !== -1;

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      var countEl = document.getElementById('appsCount');
      if (countEl) {
        countEl.textContent = visibleCount + (visibleCount === 1 ? ' Verified Package' : ' Verified Packages');
      }
    }

    function copyText(val, btn) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(val).then(function() {
          var original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function() { btn.textContent = original; }, 2000);
        });
      }
    }

    (function() {
      try {
        var yr = new Date().getFullYear();
        var el = document.getElementById('theme-year');
        if (el) el.textContent = yr;

        var urlParams = new URLSearchParams(window.location.search);
        var appParam = urlParams.get('app');
        if (appParam && appData[appParam]) {
          openAppDetail(appParam);
        }
      } catch(e) {}
    })();
    //]]>
  </script>
</body>
</html>`;
}
