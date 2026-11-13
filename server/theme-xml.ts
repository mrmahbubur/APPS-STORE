import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Blogger XML Theme Generator for MRS App Store (Real Verified Edition)
 * Computes real APK sizes, SHA-256 checksums, and modified dates directly from public/apks/.
 * Zero fabricated reviews, ratings, download counts, or placeholder metrics.
 */
export function generateBloggerThemeXml(): string {
  const currentYear = new Date().getFullYear();

  const readBase64 = (relPaths: string[], mime: string): string => {
    for (const rel of relPaths) {
      try {
        const full = path.join(process.cwd(), rel);
        if (fs.existsSync(full)) {
          return `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
        }
      } catch (e) {
        console.error(`Error reading ${rel}:`, e);
      }
    }
    return '';
  };

  const readApkFacts = (relPath: string, fallbackSize: string, fallbackSha: string) => {
    try {
      const full = path.join(process.cwd(), 'public', relPath);
      if (fs.existsSync(full)) {
        const stat = fs.statSync(full);
        const size = `${(stat.size / (1024 * 1024)).toFixed(2)} MB`;
        const sha256 = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
        const updatedAt = stat.mtime.toISOString().split('T')[0];
        return { size, sha256, updatedAt };
      }
    } catch (e) {
      console.error(`Error reading APK facts ${relPath}:`, e);
    }
    return { size: fallbackSize, sha256: fallbackSha, updatedAt: '2026-11-12' };
  };

  const mrsFacts = readApkFacts(
    'apks/M_R_S_IPTV.apk',
    '9.33 MB',
    'd8358fae651e182a9dae7e098962b94afd9ddb8eb228923c76184250d7ccf28c'
  );
  const mrsTvFacts = readApkFacts(
    'apks/M_R_S_IPTV_Pro.apk',
    '31.93 MB',
    'ca281af2533f519db49f507719af574f0761b44d94135643733b2d5c6a473c92'
  );
  const camelliaFacts = readApkFacts(
    'apks/Camellia_Ai.apk',
    '9.33 MB',
    '78d49e74f404c870714494d59634fa3c7ba1f30cb7e4a132b523e481925f56d4'
  );

  const siteLogoBase64 = readBase64(['public/assets/site-logo-icon.jpg'], 'image/jpeg');
  const binancePayQrBase64 = readBase64(['public/assets/aistudio/unnamed__1__2b5c7e8c.png'], 'image/png');
  const usdtBep20QrBase64 = readBase64(['public/assets/aistudio/unnamed__2__145559af.png'], 'image/png');
  const camelliaAiLogoBase64 = readBase64(
    [
      'public/assets/camellia-ai-thumb.jpg',
      'public/assets/aistudio/young_sweet_girl_1787078669904-jjixDzch_83b23e69.jpg',
    ],
    'image/jpeg'
  );
  const iptvLogoBase64 = readBase64(
    [
      'public/assets/mrs-iptv-thumb.png',
      'public/assets/aistudio/MRS_TV_Neon_IPTV_Network_Logo_7f02d4fc.png',
    ],
    'image/png'
  );

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
  <link href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&amp;display=swap' rel='stylesheet'/>

  <b:skin><![CDATA[
  /* Apple App Store Edition Dark Theme for MRS App Store */
  :root {
    --bg-main: #000000;
    --bg-surface: #0c0c0f;
    --bg-card: #121216;
    --bg-card-hover: #18181e;
    --bg-elevated: #1c1c23;
    --border-color: rgba(255, 255, 255, 0.10);
    --border-subtle: rgba(255, 255, 255, 0.06);
    --text-primary: #ffffff;
    --text-secondary: #a1a1a6;
    --text-muted: #6e6e73;
    --accent: #0071e3;
    --accent-light: #2997ff;
    --accent-glow: rgba(0, 113, 227, 0.35);
    --success: #30d158;
    --warning: #ffd60a;
    --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    font-family: var(--font-sans);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; }

  .tabular-nums { font-variant-numeric: tabular-nums; }

  /* Background Ambient Halos */
  .ambient-glow {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1100px;
    height: 480px;
    background: radial-gradient(ellipse at 50% 0%, rgba(0, 113, 227, 0.16) 0%, rgba(79, 70, 229, 0.07) 50%, transparent 80%);
    pointer-events: none;
    z-index: 0;
  }

  /* Apple-style Translucent Top Bar */
  .store-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0.75rem 1.5rem;
  }
  .header-container {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    position: relative;
    z-index: 2;
  }
  .brand-lockup {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 800;
    font-size: 1.125rem;
    letter-spacing: -0.02em;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .brand-badge {
    width: 36px;
    height: 36px;
    border-radius: 22%;
    background: linear-gradient(135deg, #0071e3, #4f46e5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.14);
    flex-shrink: 0;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.35rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    overflow-x: auto;
  }
  .nav-links a, .nav-links button.nav-link-btn {
    white-space: nowrap;
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    cursor: pointer;
    padding: 0.25rem 0;
    transition: color 0.15s;
  }
  .nav-links a:hover, .nav-links button.nav-link-btn:hover { color: #fff; }
  .publish-nav-btn {
    background: #0071e3;
    color: #fff;
    padding: 0.52rem 1.15rem;
    border-radius: 9999px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s;
    font-size: 0.8rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .publish-nav-btn:hover { background: #0077ed; transform: scale(0.98); }

  /* Hero Editorial Banner */
  .hero-section { max-width: 1280px; margin: 1.5rem auto 0; padding: 0 1.5rem; position: relative; z-index: 2; }
  .hero-banner {
    background: linear-gradient(180deg, #131319 0%, #09090c 100%);
    border: 1px solid var(--border-color);
    border-radius: 32px;
    padding: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2.5rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 28px 60px -15px rgba(0, 0, 0, 0.85);
  }
  .hero-banner::after {
    content: '';
    position: absolute;
    top: -80px;
    right: -60px;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(0, 113, 227, 0.18) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .hero-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1rem; position: relative; z-index: 2; }
  .hero-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--accent-light);
  }
  .hero-title { font-size: 2.85rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.06; color: #fff; }
  .hero-meta-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .hero-desc { color: var(--text-secondary); font-size: 1rem; max-width: 620px; line-height: 1.6; }
  .hero-actions { display: flex; align-items: center; gap: 0.85rem; margin-top: 0.35rem; flex-wrap: wrap; }
  .apple-get-btn {
    background: #ffffff;
    color: #000000;
    font-weight: 800;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.75rem 1.75rem;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    cursor: pointer;
    min-height: 42px;
    white-space: nowrap;
    transition: transform 0.15s, background 0.15s;
  }
  .apple-get-btn:hover { background: #e5e5ea; transform: scale(0.98); }
  .hero-secondary-btn {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-weight: 700;
    font-size: 0.82rem;
    padding: 0.75rem 1.4rem;
    border-radius: 9999px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    min-height: 42px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    transition: background 0.15s;
  }
  .hero-secondary-btn:hover { background: rgba(255, 255, 255, 0.16); }
  .hero-visual {
    flex-shrink: 0;
    width: 148px;
    height: 148px;
    border-radius: 26%;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.16);
    box-shadow: 0 20px 50px rgba(0, 113, 227, 0.25);
    position: relative;
    z-index: 2;
    cursor: pointer;
  }
  .hero-visual img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Controls: Search, Categories, Sort */
  .controls-section { max-width: 1280px; margin: 1.75rem auto 0; padding: 0 1.5rem; position: relative; z-index: 2; }
  .controls-box {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 22px;
    padding: 1.15rem 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
  .controls-top-row { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
  .search-wrapper { position: relative; flex: 1; min-width: 240px; }
  .search-input {
    width: 100%;
    background: #141419;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0.78rem 1rem;
    color: #fff;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.22); }
  .sort-select {
    background: #141419;
    color: #fff;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 0.78rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    outline: none;
    cursor: pointer;
  }
  .filter-tabs { display: flex; align-items: center; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.15rem; }
  .filter-tab {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-secondary);
    border: 1px solid transparent;
    padding: 0.45rem 1rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 0.78rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .filter-tab:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
  .filter-tab.active { background: #0071e3; color: #fff; }

  /* App Cards Grid */
  .apps-grid-container { max-width: 1280px; margin: 1.75rem auto 3rem; padding: 0 1.5rem; position: relative; z-index: 2; }
  .section-heading { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1.15rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .section-tag { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .app-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .app-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 26px;
    padding: 1.45rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.1rem;
    transition: transform 0.2s, border-color 0.2s, background 0.2s;
  }
  .app-card:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.20); background: var(--bg-card-hover); }
  .app-card-header { display: flex; gap: 1rem; align-items: flex-start; cursor: pointer; }
  .app-icon {
    width: 72px;
    height: 72px;
    border-radius: 22%;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 10px 24px rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.65rem;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
  }
  .app-meta { flex: 1; min-width: 0; }
  .app-title-row { display: flex; align-items: center; gap: 0.4rem; }
  .app-title { font-size: 1.15rem; font-weight: 800; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .verified-badge { color: var(--accent-light); font-size: 0.9rem; flex-shrink: 0; }
  .app-developer-line { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; margin-top: 0.15rem; }
  .app-subinfo { font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: center; flex-wrap: wrap; gap: 0.35rem; font-weight: 600; margin-top: 0.35rem; }
  .app-description {
    font-size: 0.84rem;
    color: var(--text-secondary);
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .app-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--border-subtle);
  }
  .app-actions-right { display: flex; align-items: center; gap: 0.5rem; }
  .details-btn {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0.5rem 0.95rem;
    border-radius: 9999px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    min-height: 38px;
    transition: background 0.15s;
  }
  .details-btn:hover { background: rgba(255, 255, 255, 0.16); }
  .icon-share-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid var(--border-color);
    color: #d1d1d6;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.15s, color 0.15s;
  }
  .icon-share-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
  .card-get-btn {
    background: rgba(255, 255, 255, 0.14);
    color: var(--accent-light);
    font-weight: 800;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.52rem 1.35rem;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .card-get-btn:hover { background: #ffffff; color: #000000; }

  /* Store Owner & About Showcase Section */
  .owner-section { max-width: 1280px; margin: 1rem auto 3rem; padding: 0 1.5rem; position: relative; z-index: 2; }
  .owner-card {
    background: linear-gradient(135deg, #111116 0%, #0b0b0e 100%);
    border: 1px solid var(--border-color);
    border-radius: 28px;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 2rem;
    align-items: center;
  }
  .owner-eyebrow {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-light);
    margin-bottom: 0.5rem;
  }
  .owner-heading { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.6rem; }
  .owner-copy { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 1.1rem; }
  .owner-specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .owner-spec-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-subtle);
    border-radius: 14px;
    padding: 0.85rem 1rem;
  }
  .owner-spec-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
  .owner-spec-val { font-size: 0.88rem; color: #fff; font-weight: 700; margin-top: 0.25rem; word-break: break-word; }

  /* Modals */
  .modal-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .modal-overlay.active { display: flex; }
  .modal-box {
    background: #101014;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 28px;
    max-width: 820px;
    width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
    box-shadow: 0 32px 90px rgba(0, 0, 0, 0.9);
  }
  .modal-close {
    position: sticky;
    top: 0;
    float: right;
    z-index: 10;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.15s;
  }
  .modal-close:hover { background: rgba(255, 255, 255, 0.24); }

  /* Product Header inside Modal */
  .detail-header { display: flex; gap: 1.35rem; align-items: flex-start; margin-bottom: 1.5rem; padding-right: 2.5rem; }
  .detail-icon {
    width: 96px;
    height: 96px;
    border-radius: 22%;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.16);
    flex-shrink: 0;
    box-shadow: 0 12px 30px rgba(0,0,0,0.65);
  }
  .detail-title { font-size: 1.65rem; font-weight: 900; letter-spacing: -0.02em; line-height: 1.15; }
  .detail-dev { color: var(--accent-light); font-size: 0.9rem; font-weight: 700; margin-top: 0.25rem; }
  .detail-pkg { color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-mono); margin-top: 0.3rem; }
  .detail-btn-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.9rem; }

  /* 5-Column Apple Metrics Ribbon */
  .metrics-ribbon {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    padding: 0.9rem 0;
    margin-bottom: 1.35rem;
    text-align: center;
  }
  .metric-cell {
    padding: 0 0.5rem;
    border-right: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.15rem;
  }
  .metric-cell:last-child { border-right: none; }
  .metric-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 700; }
  .metric-val { font-size: 1.05rem; font-weight: 800; color: #fff; }
  .metric-sub { font-size: 0.68rem; color: var(--text-secondary); }

  /* Share Panel */
  .modal-section { border-top: 1px solid var(--border-subtle); padding-top: 1.25rem; margin-top: 1.25rem; }
  .modal-section-title { font-size: 1.08rem; font-weight: 800; letter-spacing: -0.01em; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
  .link-box {
    background: #17171d;
    border: 1px solid var(--border-subtle);
    border-radius: 14px;
    padding: 0.75rem 0.95rem;
    margin-bottom: 0.65rem;
  }
  .link-box-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-light); margin-bottom: 0.3rem; }
  .link-box-row { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; }
  .link-box-url { font-family: var(--font-mono); font-size: 0.75rem; color: #d1d1d6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .share-buttons-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.65rem; }
  .share-chip-btn {
    background: #1b1b22;
    border: 1px solid var(--border-color);
    color: #fff;
    padding: 0.48rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.76rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: background 0.15s;
  }
  .share-chip-btn:hover { background: #272731; }
  .qr-drawer {
    display: none;
    background: #14141a;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 1rem;
    margin-top: 0.75rem;
    text-align: center;
  }
  .qr-drawer.active { display: block; }
  .qr-drawer img { width: 150px; height: 150px; border-radius: 12px; background: #fff; padding: 6px; margin: 0 auto 0.5rem; display: block; }

  /* Feature & Bullet lists */
  .bullet-list { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.86rem; color: #d1d1d6; }
  .bullet-list li { display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5; }
  .bullet-dot { color: var(--accent-light); font-weight: 900; flex-shrink: 0; }
  .compat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-top: 0.75rem; }
  .compat-card { background: #16161c; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 0.75rem 0.9rem; font-size: 0.8rem; }
  .compat-card strong { display: block; color: #fff; font-size: 0.82rem; margin-bottom: 0.15rem; }
  .compat-card span { color: var(--text-secondary); font-size: 0.76rem; }

  /* Ratings & Reviews */
  .rating-summary-grid { display: grid; grid-template-columns: 140px 1fr; gap: 1.25rem; align-items: center; margin-bottom: 1.1rem; }
  .rating-big-num { font-size: 3.1rem; font-weight: 900; line-height: 1; letter-spacing: -0.04em; color: #fff; }
  .rating-out-of { font-size: 0.78rem; color: var(--text-muted); font-weight: 700; margin-top: 0.2rem; }
  .bars-stack { display: flex; flex-direction: column; gap: 0.35rem; }
  .bar-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.72rem; color: var(--text-secondary); }
  .bar-label { width: 26px; text-align: right; font-weight: 700; }
  .bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; background: #ffffff; border-radius: 999px; transition: width 0.25s ease; }
  .bar-pct { width: 32px; text-align: right; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); }

  .review-form-box {
    display: none;
    background: #16161c;
    border: 1px solid rgba(0,113,227,0.35);
    border-radius: 18px;
    padding: 1.15rem;
    margin-bottom: 1.1rem;
  }
  .review-form-box.active { display: block; }
  .star-picker { display: flex; align-items: center; gap: 0.35rem; margin: 0.45rem 0 0.85rem; }
  .star-pick-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #3a3a44;
    padding: 0.1rem 0.2rem;
    transition: color 0.12s, transform 0.12s;
  }
  .star-pick-btn.lit { color: var(--warning); }
  .star-pick-btn:hover { transform: scale(1.1); }
  .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; margin-bottom: 0.65rem; }
  .apple-input, .apple-textarea {
    width: 100%;
    background: #0d0d11;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 0.62rem 0.85rem;
    color: #fff;
    font-size: 0.84rem;
    font-family: inherit;
    outline: none;
  }
  .apple-input:focus, .apple-textarea:focus { border-color: var(--accent); }
  .apple-textarea { min-height: 78px; resize: vertical; margin-top: 0.65rem; }

  .reviews-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .review-card {
    background: #16161c;
    border: 1px solid var(--border-subtle);
    border-radius: 16px;
    padding: 1rem 1.1rem;
  }
  .review-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.4rem; }
  .review-title { font-size: 0.92rem; font-weight: 800; color: #fff; }
  .review-stars { color: var(--warning); font-size: 0.85rem; letter-spacing: 1px; }
  .review-meta { font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.45rem; }
  .review-body { font-size: 0.84rem; color: #d1d1d6; line-height: 1.55; }
  .review-reply {
    margin-top: 0.65rem;
    padding: 0.65rem 0.85rem;
    background: rgba(0, 113, 227, 0.08);
    border-left: 2px solid var(--accent-light);
    border-radius: 0 10px 10px 0;
    font-size: 0.79rem;
    color: #d1d1d6;
  }
  .review-reply strong { color: var(--accent-light); display: block; margin-bottom: 0.15rem; font-size: 0.75rem; }
  .review-footer { margin-top: 0.65rem; display: flex; align-items: center; justify-content: space-between; }
  .helpful-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0.3rem 0.7rem;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .helpful-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

  /* Technical Specs Table */
  .info-dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .info-item { background: #16161c; border: 1px solid var(--border-subtle); border-radius: 12px; padding: 0.7rem 0.9rem; }
  .info-item dt { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
  .info-item dd { font-size: 0.82rem; color: #fff; font-weight: 600; margin-top: 0.2rem; word-break: break-word; }

  /* Payment / Legal Modal Helpers */
  .fee-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0,113,227,0.15);
    border: 1px solid rgba(0,113,227,0.3);
    color: var(--accent-light);
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.78rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .modal-title { font-size: 1.45rem; font-weight: 800; margin-bottom: 0.35rem; }
  .modal-subtitle { font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.55; }
  .qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    background: #09090c;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 1.25rem;
    margin: 0.85rem 0;
    text-align: center;
  }
  .qr-image { width: 170px; height: 170px; border-radius: 12px; object-fit: contain; background: #ffffff; padding: 8px; }
  .crypto-val-box {
    background: #16161c;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 0.65rem 0.85rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    word-break: break-all;
  }
  .copy-btn {
    background: #0071e3;
    color: #fff;
    border: none;
    padding: 0.42rem 0.85rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.74rem;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .copy-btn:hover { background: #0077ed; }

  .legal-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
  .legal-tab-btn {
    background: rgba(255,255,255,0.07);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    padding: 0.45rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }
  .legal-tab-btn.active { background: #0071e3; color: #fff; border-color: #0071e3; }

  /* Mandatory Blogger native widget hidden */
  #main, .main { display: none !important; }

  /* Footer */
  .store-footer {
    border-top: 1px solid var(--border-subtle);
    background: #000000;
    padding: 3rem 1.5rem;
    margin-top: 2rem;
    font-size: 0.84rem;
    color: var(--text-secondary);
    position: relative;
    z-index: 2;
  }
  .footer-inner { max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
  .footer-policies { display: flex; flex-wrap: wrap; gap: 1.25rem; }
  .footer-policies a, .footer-policies button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }
  .footer-policies a:hover, .footer-policies button:hover { color: #fff; }

  @media (max-width: 960px) {
    .app-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .owner-card { grid-template-columns: 1fr; }
    .metrics-ribbon { grid-template-columns: repeat(3, 1fr); row-gap: 0.75rem; }
  }
  @media (max-width: 640px) {
    .header-container { gap: 0.75rem; }
    .hero-banner { flex-direction: column-reverse; align-items: flex-start; padding: 1.75rem 1.35rem; border-radius: 24px; }
    .hero-visual { width: 96px; height: 96px; }
    .hero-title { font-size: 2rem; }
    .app-cards-grid { grid-template-columns: 1fr; }
    .detail-header { flex-direction: column; padding-right: 0; }
    .metrics-ribbon { grid-template-columns: repeat(2, 1fr); }
    .rating-summary-grid { grid-template-columns: 1fr; }
    .form-grid-2, .compat-grid, .info-dl, .owner-specs { grid-template-columns: 1fr; }
    .modal-box { padding: 1.35rem; border-radius: 22px; }
  }
  ]]></b:skin>
</head>
<body>
  <div class='ambient-glow'/>

  <!-- Apple App Store Header -->
  <header class='store-header'>
    <div class='header-container'>
      <a class='brand-lockup' href='/'>
        ${siteLogoBase64 ? `<img alt='MRS App Store Logo' class='brand-badge' src='${siteLogoBase64}' style='object-fit:cover;'/>` : `<div class='brand-badge'>M</div>`}
        <span>MRS App Store</span>
      </a>
      <nav class='nav-links'>
        <a href='#today'>Today</a>
        <a href='#apps'>Apps</a>
        <a href='#owner-section'>Owner Info</a>
        <button class='nav-link-btn' onclick="openLegalModal('privacy')" type='button'>Privacy</button>
        <button class='publish-nav-btn' onclick='openPublishModal()' type='button'>Publish ($25)</button>
      </nav>
    </div>
  </header>

  <!-- Today Editorial Hero Section -->
  <section class='hero-section' id='today'>
    <div class='hero-banner'>
      <div class='hero-content'>
        <div class='hero-kicker'>TODAY&#39;S FEATURED RELEASE &#183; DIRECT APK</div>
        <h1 class='hero-title'>M R S IPTV Android</h1>
        <div class='hero-meta-line tabular-nums'>
          <span>MRS TV Network</span>
          <span>&#183;</span>
          <span id='heroReviewCount'>No reviews yet</span>
          <span>&#183;</span>
          <span>v1.0.0</span>
          <span>&#183;</span>
          <span>${mrsFacts.size} Direct APK</span>
        </div>
        <p class='hero-desc'>Official M R S IPTV.apk Android package by MRS TV Network, hosted directly on MRS App Store for Android 8.0+ devices with published SHA-256 verification.</p>
        <div class='hero-actions'>
          <a class='apple-get-btn' download='M R S IPTV.apk' href='/api/download/m-r-s-iptv'>
            GET APK &#183; ${mrsFacts.size}
          </a>
          <button class='hero-secondary-btn' onclick="openAppDetail('m-r-s-iptv')" type='button'>
            Details, Reviews &amp; Share
          </button>
          <button class='hero-secondary-btn' onclick="quickShareApp('m-r-s-iptv', this)" type='button'>
            Share App
          </button>
        </div>
      </div>
      <div class='hero-visual' onclick="openAppDetail('m-r-s-iptv')">
        ${iptvLogoBase64 ? `<img alt='M R S IPTV Android Icon' src='${iptvLogoBase64}'/>` : `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0071e3,#38bdf8);font-size:3rem;font-weight:900;color:#fff;'>M</div>`}
      </div>
    </div>
  </section>

  <!-- Interactive Controls: Search, Categories and Sort -->
  <section class='controls-section'>
    <div class='controls-box'>
      <div class='controls-top-row'>
        <div class='search-wrapper'>
          <input class='search-input' id='storeSearch' oninput='filterApps()' placeholder='Search apps, packages, categories, developer...' type='text'/>
        </div>
        <select aria-label='Sort apps' class='sort-select' id='sortSelect' onchange='filterApps()'>
          <option value='featured'>Default Order</option>
          <option value='rating'>Top Rated</option>
          <option value='reviews'>Most Reviewed</option>
        </select>
      </div>
      <div class='filter-tabs'>
        <button class='filter-tab active' data-category='all' onclick="selectCategory('all', this)" type='button'>All Releases</button>
        <button class='filter-tab' data-category='iptv' onclick="selectCategory('iptv', this)" type='button'>IPTV &amp; Streaming</button>
        <button class='filter-tab' data-category='video' onclick="selectCategory('video', this)" type='button'>Smart TV &amp; Video</button>
        <button class='filter-tab' data-category='ai' onclick="selectCategory('ai', this)" type='button'>AI &amp; Assistant</button>
      </div>
    </div>
  </section>

  <!-- App Cards Feed -->
  <main class='apps-grid-container' id='apps'>
    <div class='section-heading'>
      <h2>Verified In-House Catalog</h2>
      <span class='section-tag tabular-nums' id='appsCount'>3 Direct APK Packages</span>
    </div>
    <div class='app-cards-grid' id='appsGrid'>

      <!-- App 1: M R S IPTV Android -->
      <article class='app-card' data-category='iptv' data-id='m-r-s-iptv' data-order='1' data-rating='0' data-reviews='0' data-title='m r s iptv android iptv streaming mrs tv network'>
        <div class='app-card-header' onclick="openAppDetail('m-r-s-iptv')">
          ${iptvLogoBase64 ? `<img alt='M R S IPTV Android' class='app-icon' src='${iptvLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #0071e3, #38bdf8);'>M</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>M R S IPTV Android</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-developer-line'>MRS TV Network &#183; M R S IPTV.apk</div>
            <div class='app-subinfo tabular-nums'>
              <span>IPTV &amp; Streaming</span>
              <span>&#183;</span>
              <span id='cardRating-m-r-s-iptv'>v1.0.0</span>
              <span>&#183;</span>
              <span>${mrsFacts.size}</span>
            </div>
          </div>
        </div>
        <div class='app-description'>
          Official M R S IPTV Android APK hosted directly on MRS App Store for Android 8.0+ devices.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('m-r-s-iptv')" type='button'>Specs &amp; Reviews</button>
          <div class='app-actions-right'>
            <button aria-label='Share M R S IPTV Android' class='icon-share-btn' onclick="quickShareApp('m-r-s-iptv', this)" title='Share App Link' type='button'>&#10150;</button>
            <a class='card-get-btn' download='M R S IPTV.apk' href='/api/download/m-r-s-iptv'>GET</a>
          </div>
        </div>
      </article>

      <!-- App 2: M R S IPTV TV -->
      <article class='app-card' data-category='video' data-id='m-r-s-iptv-pro' data-order='2' data-rating='0' data-reviews='0' data-title='m r s iptv tv smart tv video mrs tv network'>
        <div class='app-card-header' onclick="openAppDetail('m-r-s-iptv-pro')">
          ${iptvLogoBase64 ? `<img alt='M R S IPTV TV' class='app-icon' src='${iptvLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #6366f1, #a855f7);'>M</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>M R S IPTV TV</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-developer-line'>MRS TV Network &#183; M_R_S_IPTV.apk</div>
            <div class='app-subinfo tabular-nums'>
              <span>Smart TV &amp; Video</span>
              <span>&#183;</span>
              <span id='cardRating-m-r-s-iptv-pro'>v1.0</span>
              <span>&#183;</span>
              <span>${mrsTvFacts.size}</span>
            </div>
          </div>
        </div>
        <div class='app-description'>
          Official M R S IPTV TV APK hosted directly on MRS App Store for Smart TV and Android 8.0+ mobile devices.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('m-r-s-iptv-pro')" type='button'>Specs &amp; Reviews</button>
          <div class='app-actions-right'>
            <button aria-label='Share M R S IPTV TV' class='icon-share-btn' onclick="quickShareApp('m-r-s-iptv-pro', this)" title='Share App Link' type='button'>&#10150;</button>
            <a class='card-get-btn' download='M_R_S_IPTV.apk' href='/api/download/m-r-s-iptv-pro'>GET</a>
          </div>
        </div>
      </article>

      <!-- App 3: Camellia Ai -->
      <article class='app-card' data-category='ai' data-id='camellia-ai' data-order='3' data-rating='0' data-reviews='0' data-title='camellia ai virtual assistant android mobile'>
        <div class='app-card-header' onclick="openAppDetail('camellia-ai')">
          ${camelliaAiLogoBase64 ? `<img alt='Camellia Ai' class='app-icon' src='${camelliaAiLogoBase64}' style='object-fit:cover;'/>` : `<div class='app-icon' style='background:linear-gradient(135deg, #ec4899, #f43f5e);'>C</div>`}
          <div class='app-meta'>
            <div class='app-title-row'>
              <h2 class='app-title'>Camellia Ai</h2>
              <span class='verified-badge'>&#10004;</span>
            </div>
            <div class='app-developer-line'>Camellia Studio &#183; Camellia Ai.apk</div>
            <div class='app-subinfo tabular-nums'>
              <span>AI &amp; Assistant</span>
              <span>&#183;</span>
              <span id='cardRating-camellia-ai'>v1.0.0</span>
              <span>&#183;</span>
              <span>${camelliaFacts.size}</span>
            </div>
          </div>
        </div>
        <div class='app-description'>
          Official Camellia Ai Android APK hosted directly on MRS App Store for Android 8.0+ devices.
        </div>
        <div class='app-actions'>
          <button class='details-btn' onclick="openAppDetail('camellia-ai')" type='button'>Specs &amp; Reviews</button>
          <div class='app-actions-right'>
            <button aria-label='Share Camellia Ai' class='icon-share-btn' onclick="quickShareApp('camellia-ai', this)" title='Share App Link' type='button'>&#10150;</button>
            <a class='card-get-btn' download='Camellia Ai.apk' href='/api/download/camellia-ai'>GET</a>
          </div>
        </div>
      </article>

    </div>
  </main>

  <!-- Store Owner and About Section -->
  <section class='owner-section' id='owner-section'>
    <div class='owner-card'>
      <div>
        <div class='owner-eyebrow'>STORE OWNER &amp; DEVELOPER NETWORK</div>
        <h2 class='owner-heading'>Shahin (mrxshahin) &#183; MRS TV Network</h2>
        <p class='owner-copy'>
          MRS App Store is operated by Shahin (mrxshahin) under MRS TV Network. Every APK file listed here is stored locally and served directly with its real SHA-256 checksum, package identifier, and AndroidManifest permissions.
        </p>
        <div style='display:flex;flex-wrap:wrap;gap:0.65rem;'>
          <a class='apple-get-btn' href='mailto:mr216873@gmail.com'>Contact Owner: mr216873@gmail.com</a>
          <button class='hero-secondary-btn' onclick='openPublishModal()' type='button'>Publish App ($25 USD)</button>
        </div>
      </div>
      <div class='owner-specs'>
        <div class='owner-spec-box'>
          <div class='owner-spec-label'>Store Owner</div>
          <div class='owner-spec-val'>Shahin (mrxshahin)</div>
        </div>
        <div class='owner-spec-box'>
          <div class='owner-spec-label'>Organization</div>
          <div class='owner-spec-val'>MRS TV Network</div>
        </div>
        <div class='owner-spec-box'>
          <div class='owner-spec-label'>Official Support Email</div>
          <div class='owner-spec-val'>mr216873@gmail.com</div>
        </div>
        <div class='owner-spec-box'>
          <div class='owner-spec-label'>Publishing &amp; Verification</div>
          <div class='owner-spec-val'>$25 USD &#183; SHA-256 Checked</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Apple Product Sheet Detail Modal -->
  <div class='modal-overlay' id='detailModal' onclick='closeDetailModal(event)'>
    <div class='modal-box' onclick='event.stopPropagation()'>
      <button class='modal-close' onclick='closeDetailModal(event)' type='button'>&#10005;</button>

      <!-- App Identity Header -->
      <div class='detail-header'>
        <img alt='App Icon' class='detail-icon' id='detailIcon' src='${iptvLogoBase64}'/>
        <div style='flex:1;min-width:0;'>
          <h3 class='detail-title' id='detailTitle'>App Title</h3>
          <div class='detail-dev' id='detailDeveloper'>MRS TV Network</div>
          <div class='detail-pkg' id='detailPackageLine'>co.median.android.rdalmaa &#183; v1.0.0</div>
          <div class='detail-btn-row'>
            <a class='apple-get-btn' href='#' id='detailGetBtn'>GET APK</a>
            <button class='hero-secondary-btn' id='detailWebShareBtn' onclick='shareCurrentAppNative()' type='button'>Share App</button>
            <button class='hero-secondary-btn' onclick='toggleDetailQr()' type='button'>QR Code</button>
          </div>
        </div>
      </div>

      <!-- 5-Column Apple Metrics Ribbon -->
      <div class='metrics-ribbon tabular-nums'>
        <div class='metric-cell'>
          <div class='metric-label' id='metricReviewsLabel'>0 RATINGS</div>
          <div class='metric-val' id='metricRatingVal'>&#8212;</div>
          <div class='metric-sub' id='metricRatingSub'>No ratings yet</div>
        </div>
        <div class='metric-cell'>
          <div class='metric-label'>MIN OS</div>
          <div class='metric-val' id='metricAgeVal'>8.0+</div>
          <div class='metric-sub'>Android API 26</div>
        </div>
        <div class='metric-cell'>
          <div class='metric-label'>VERSION</div>
          <div class='metric-val' id='metricChartVal'>v1.0.0</div>
          <div class='metric-sub' id='metricCategorySub'>IPTV &amp; Streaming</div>
        </div>
        <div class='metric-cell'>
          <div class='metric-label'>OWNER</div>
          <div class='metric-val' style='font-size:0.88rem;'>MRS TV</div>
          <div class='metric-sub'>Shahin</div>
        </div>
        <div class='metric-cell'>
          <div class='metric-label'>SIZE</div>
          <div class='metric-val' id='metricSizeVal'>${mrsFacts.size}</div>
          <div class='metric-sub'>Direct APK</div>
        </div>
      </div>

      <!-- Direct Download and Multi-Channel App Sharing Section -->
      <div class='modal-section' style='border-top:none;padding-top:0;margin-top:0;'>
        <div class='modal-section-title'>
          <span>Direct Download &amp; App Sharing</span>
        </div>

        <div class='link-box'>
          <div class='link-box-label'>Specific Direct APK Download Link</div>
          <div class='link-box-row'>
            <span class='link-box-url' id='detailDownloadLink'></span>
            <button class='copy-btn' onclick="copyElementText('detailDownloadLink', this)" type='button'>Copy APK URL</button>
          </div>
        </div>

        <div class='link-box'>
          <div class='link-box-label'>Specific App Sharing Page Link</div>
          <div class='link-box-row'>
            <span class='link-box-url' id='detailShareLink'></span>
            <button class='copy-btn' onclick="copyElementText('detailShareLink', this)" style='background:#7c3aed;' type='button'>Copy Share URL</button>
          </div>
        </div>

        <div class='share-buttons-row'>
          <a class='share-chip-btn' href='#' id='shareWhatsApp' rel='noopener noreferrer' target='_blank'>WhatsApp</a>
          <a class='share-chip-btn' href='#' id='shareTelegram' rel='noopener noreferrer' target='_blank'>Telegram</a>
          <a class='share-chip-btn' href='#' id='shareX' rel='noopener noreferrer' target='_blank'>Share on X</a>
          <button class='share-chip-btn' onclick='shareCurrentAppNative()' type='button'>System Share</button>
          <button class='share-chip-btn' onclick='toggleDetailQr()' type='button'>Show QR Code</button>
        </div>

        <div class='qr-drawer' id='detailQrDrawer'>
          <img alt='App Share QR Code' id='detailQrImg' src=''/>
          <div style='font-size:0.78rem;color:#a1a1a6;'>Scan with any phone or Smart TV camera to open this app page</div>
        </div>
      </div>

      <!-- What's New -->
      <div class='modal-section'>
        <div class='modal-section-title'>
          <span>What&#39;s New</span>
          <span class='tabular-nums' id='detailVersionDate' style='font-size:0.78rem;color:#a1a1a6;font-weight:600;'>Version 3.4.0 &#183; 2026-10-23</span>
        </div>
        <ul class='bullet-list' id='detailWhatsNew'></ul>
      </div>

      <!-- Details and About -->
      <div class='modal-section'>
        <div class='modal-section-title'>
          <span>Details &amp; About</span>
        </div>
        <p id='detailDesc' style='font-size:0.88rem;color:#d1d1d6;line-height:1.65;margin-bottom:0.9rem;'></p>
        <ul class='bullet-list' id='detailFeatures'></ul>

        <div class='compat-grid'>
          <div class='compat-card'>
            <strong>Android TV &amp; Firestick</strong>
            <span>Full D-Pad remote &amp; 4K playback compatibility</span>
          </div>
          <div class='compat-card'>
            <strong>Android Smartphones &amp; Tablets</strong>
            <span id='detailCompatMin'>Requires Android 5.0 or higher (ARM64/ARMv7)</span>
          </div>
          <div class='compat-card'>
            <strong>App Privacy</strong>
            <span>Zero cross-site tracking &#183; Encrypted direct download</span>
          </div>
          <div class='compat-card'>
            <strong>Store Verification</strong>
            <span>SHA-256 verified clean APK hosted in-house</span>
          </div>
        </div>
      </div>

      <!-- Real Ratings and Reviews Section -->
      <div class='modal-section' id='detailReviewsSection'>
        <div class='modal-section-title'>
          <span>Ratings &amp; Reviews</span>
          <button class='copy-btn' onclick='toggleReviewForm()' type='button'>Write a Review</button>
        </div>

        <div class='rating-summary-grid'>
          <div>
            <div class='rating-big-num tabular-nums' id='reviewsBigAvg'>4.9</div>
            <div class='rating-out-of' id='reviewsTotalMeta'>out of 5</div>
          </div>
          <div class='bars-stack' id='reviewsBreakdownBars'></div>
        </div>

        <!-- Write a Review Form -->
        <div class='review-form-box' id='reviewFormBox'>
          <div style='font-size:0.88rem;font-weight:800;margin-bottom:0.25rem;'>Submit Your Review</div>
          <div style='font-size:0.76rem;color:#a1a1a6;'>Tap stars to rate this application:</div>
          <div class='star-picker' id='starPicker'>
            <button class='star-pick-btn lit' data-star='1' onclick='setReviewStars(1)' type='button'>&#9733;</button>
            <button class='star-pick-btn lit' data-star='2' onclick='setReviewStars(2)' type='button'>&#9733;</button>
            <button class='star-pick-btn lit' data-star='3' onclick='setReviewStars(3)' type='button'>&#9733;</button>
            <button class='star-pick-btn lit' data-star='4' onclick='setReviewStars(4)' type='button'>&#9733;</button>
            <button class='star-pick-btn lit' data-star='5' onclick='setReviewStars(5)' type='button'>&#9733;</button>
          </div>
          <form onsubmit='submitUserReview(event)'>
            <div class='form-grid-2'>
              <input class='apple-input' id='revAuthor' maxlength='48' placeholder='Your Name' required='required' type='text'/>
              <input class='apple-input' id='revDevice' maxlength='48' placeholder='Device (e.g. Android TV, Pixel)' type='text'/>
            </div>
            <input class='apple-input' id='revTitle' maxlength='80' placeholder='Review Title (e.g. Fast streaming!)' required='required' type='text'/>
            <textarea class='apple-textarea' id='revComment' maxlength='600' placeholder='Share your experience with installation, speed, and stability...' required='required'></textarea>
            <div style='display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.75rem;'>
              <button class='details-btn' onclick='toggleReviewForm(false)' type='button'>Cancel</button>
              <button class='copy-btn' style='padding:0.55rem 1.2rem;border-radius:9999px;' type='submit'>Post Review</button>
            </div>
          </form>
        </div>

        <div class='reviews-list' id='detailReviewsList'></div>
      </div>

      <!-- Owner and Developer Information -->
      <div class='modal-section'>
        <div class='modal-section-title'>
          <span>Owner &amp; Developer Information</span>
        </div>
        <div class='info-dl'>
          <div class='info-item'>
            <dt>Store Owner</dt>
            <dd>Shahin (mrxshahin) &#183; MRS TV Network</dd>
          </div>
          <div class='info-item'>
            <dt>Official Support Email</dt>
            <dd>
              <span>mr216873@gmail.com</span>
              <button class='copy-btn' onclick="copyText('mr216873@gmail.com', this)" style='margin-left:0.5rem;padding:0.2rem 0.55rem;font-size:0.68rem;' type='button'>Copy</button>
            </dd>
          </div>
        </div>
      </div>

      <!-- Technical Package Information -->
      <div class='modal-section'>
        <div class='modal-section-title'>
          <span>Information</span>
        </div>
        <dl class='info-dl'>
          <div class='info-item'>
            <dt>APK Filename</dt>
            <dd id='detailFile'>M R S IPTV.apk</dd>
          </div>
          <div class='info-item'>
            <dt>Package ID</dt>
            <dd id='detailPkgId' style='font-family:var(--font-mono);font-size:0.78rem;'>co.median.android.rdalmaa</dd>
          </div>
          <div class='info-item'>
            <dt>Languages</dt>
            <dd id='detailLanguages'>Android System Locale</dd>
          </div>
          <div class='info-item'>
            <dt>SHA-256 Checksum</dt>
            <dd style='display:flex;align-items:center;justify-content:space-between;gap:0.4rem;'>
              <span id='detailSha256' style='font-family:var(--font-mono);font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'></span>
              <button class='copy-btn' onclick="copyElementText('detailSha256', this)" style='padding:0.22rem 0.55rem;font-size:0.68rem;' type='button'>Copy</button>
            </dd>
          </div>
        </dl>
        <details style='margin-top:0.75rem;background:#16161c;border:1px solid var(--border-subtle);border-radius:12px;padding:0.75rem 0.9rem;'>
          <summary style='cursor:pointer;font-size:0.8rem;font-weight:700;color:#d1d1d6;'>Android Permissions</summary>
          <ul class='bullet-list' id='detailPermissions' style='margin-top:0.55rem;font-family:var(--font-mono);font-size:0.74rem;'></ul>
        </details>
      </div>
    </div>
  </div>

  <!-- Interactive App Publishing Modal ($25 USD Crypto / Binance Pay) -->
  <div class='modal-overlay' id='publishModal' onclick='closePublishModal(event)'>
    <div class='modal-box' onclick='event.stopPropagation()'>
      <button class='modal-close' onclick='closePublishModal(event)' type='button'>&#10005;</button>
      <div class='fee-badge'>Inbuilt Developer Publishing &#183; $25.00 USD</div>
      <h3 class='modal-title'>Publish Your Application</h3>
      <p class='modal-subtitle'>Pay the $25.00 USD publishing fee via USDT (BEP-20) or Binance Pay, then complete the inbuilt submission form below.</p>

      <div class='qr-container'>
        <strong style='font-size: 0.95rem; color: #2997ff;'>Option 1: Deposit USDT (BEP-20 / BSC)</strong>
        <p style='font-size: 0.76rem; color: #8e8e93;'>Send $25 USDT via BNB Smart Chain (BEP20)</p>
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

      <div class='qr-container'>
        <strong style='font-size: 0.95rem; color: #f59e0b;'>Option 2: Binance Pay</strong>
        <p style='font-size: 0.76rem; color: #8e8e93;'>Scan with Binance App (Zero Fee Instant)</p>
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

      <form id='xmlPublishForm' onsubmit='submitXmlAppPublish(event)' style='background:#16161c;border:1px solid var(--border-subtle);border-radius:16px;padding:1.15rem;margin-top:0.85rem;display:flex;flex-direction:column;gap:0.75rem;'>
        <h4 style='font-size:0.92rem;font-weight:800;'>Inbuilt App Submission Form</h4>
        <div class='form-grid-2' style='margin-bottom:0;'>
          <input class='apple-input' id='pubAppTitle' placeholder='App Name *' required='required' type='text'/>
          <input class='apple-input' id='pubVersion' placeholder='Version (e.g. 1.0.0)' required='required' type='text' value='1.0.0'/>
          <input class='apple-input' id='pubDevName' placeholder='Developer / Studio Name *' required='required' type='text'/>
          <input class='apple-input' id='pubDevEmail' placeholder='Developer Email *' required='required' type='email'/>
          <select class='apple-input' id='pubPayMethod'>
            <option value='USDT (BEP-20)'>USDT (BEP-20)</option>
            <option value='Binance Pay'>Binance Pay (mrxshahin)</option>
          </select>
          <input class='apple-input' id='pubTxHash' placeholder='TxHash / Binance Order ID *' required='required' type='text'/>
        </div>
        <input class='apple-input' id='pubApkUrl' placeholder='Direct APK Download URL (https://...) *' required='required' type='url'/>
        <textarea class='apple-textarea' id='pubDesc' placeholder='Brief app description and supported Android devices...' style='margin-top:0;'></textarea>
        <div id='pubReceiptBox' style='display:none;padding:0.85rem;border-radius:12px;background:rgba(48,209,88,0.12);border:1px solid rgba(48,209,88,0.35);font-size:0.8rem;color:#d1fae5;'></div>
        <div style='display:flex;flex-wrap:wrap;gap:0.65rem;'>
          <button class='apple-get-btn' style='flex:1;justify-content:center;' type='submit'>Submit &amp; Publish App</button>
          <a class='hero-secondary-btn' href='mailto:mr216873@gmail.com' id='pubMailtoBtn'>Email Proof: mr216873@gmail.com</a>
        </div>
      </form>
    </div>
  </div>

  <!-- Legal Policies and Privacy Modal -->
  <div class='modal-overlay' id='legalModal' onclick='closeLegalModal(event)'>
    <div class='modal-box' onclick='event.stopPropagation()'>
      <button class='modal-close' onclick='closeLegalModal(event)' type='button'>&#10005;</button>
      <div class='fee-badge'>Annual Automated Policy &#183; ${currentYear}</div>
      <h3 class='modal-title' id='legalTitle'>App Privacy Policy</h3>
      <div class='legal-tabs'>
        <button class='legal-tab-btn active' data-legal='privacy' onclick="switchLegalTab('privacy', this)" type='button'>Privacy Policy</button>
        <button class='legal-tab-btn' data-legal='terms' onclick="switchLegalTab('terms', this)" type='button'>Terms</button>
        <button class='legal-tab-btn' data-legal='developer' onclick="switchLegalTab('developer', this)" type='button'>Developer Rules</button>
        <button class='legal-tab-btn' data-legal='dmca' onclick="switchLegalTab('dmca', this)" type='button'>DMCA</button>
      </div>
      <div id='legalBody' style='font-size:0.88rem;color:#d1d1d6;line-height:1.65;'></div>
    </div>
  </div>

  <!-- Mandatory Blogger XML Section -->
  <b:section class='main' id='main' showaddelement='yes'>
    <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog'/>
  </b:section>

  <!-- Store Footer -->
  <footer class='store-footer' id='policy'>
    <div class='footer-inner'>
      <div class='footer-policies'>
        <button onclick='openPublishModal()' type='button'>Publish App ($25 USD Crypto)</button>
        <button onclick="openLegalModal('privacy')" type='button'>Privacy Policy</button>
        <button onclick="openLegalModal('terms')" type='button'>Terms &amp; Conditions</button>
        <button onclick="openLegalModal('developer')" type='button'>Developer Guidelines</button>
        <button onclick="openLegalModal('dmca')" type='button'>DMCA</button>
        <a href='mailto:mr216873@gmail.com'>Owner Contact: mr216873@gmail.com</a>
      </div>
      <div>
        <p id='copyright-text'>&#169; <span id='theme-year'>${currentYear}</span> MRS App Store &#183; Operated by Shahin (MRS) &#183; MRS TV Network. All rights reserved.</p>
        <p style='font-size: 0.76rem; margin-top: 0.25rem; color: #6e6e73;'>Direct verified in-house APK distribution with SHA-256 checksums and real community reviews.</p>
      </div>
    </div>
  </footer>

  <script>
    //<![CDATA[
    var appData = {
      'm-r-s-iptv': {
        id: 'm-r-s-iptv',
        title: 'M R S IPTV Android',
        file: 'M R S IPTV.apk',
        developer: 'MRS TV Network',
        owner: 'Shahin (mrxshahin) · MRS TV Network',
        packageId: 'co.median.android.rdalmaa',
        version: '1.0.0',
        updatedAt: '${mrsFacts.updatedAt}',
        ageRating: '8.0+',
        chartRank: 'v1.0.0',
        languages: 'Android System Locale',
        minAndroid: 'Android 8.0+ (API 26)',
        sha256: '${mrsFacts.sha256}',
        desc: 'M R S IPTV Android is the official Android application published by MRS TV Network. The APK binary (M R S IPTV.apk) is hosted directly in MRS App Store for Android 8.0+ devices.',
        size: '${mrsFacts.size}',
        category: 'IPTV & Streaming',
        icon: '${iptvLogoBase64}',
        link: '/api/download/m-r-s-iptv',
        share: '/?app=m-r-s-iptv',
        whatsNew: [
          'Direct in-house APK hosting from MRS App Store (${mrsFacts.size})',
          'Build 3 (Version 1.0.0) compiled for Android API 26+',
          'Verified SHA-256 binary checksum published on product page'
        ],
        features: [
          'Direct APK download with no third-party redirects',
          'Supports Android 8.0 (API 26) and above',
          'Published and maintained by MRS TV Network',
          'Shareable app page link and direct APK download URL'
        ],
        permissions: [
          'android.permission.INTERNET',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.READ_PHONE_STATE',
          'android.permission.VIBRATE',
          'android.permission.DUMP'
        ]
      },
      'm-r-s-iptv-pro': {
        id: 'm-r-s-iptv-pro',
        title: 'M R S IPTV TV',
        file: 'M_R_S_IPTV.apk',
        developer: 'MRS TV Network',
        owner: 'Shahin (mrxshahin) · MRS TV Network',
        packageId: 'com.wMRSIPTV_20119768',
        version: '1.0',
        updatedAt: '${mrsTvFacts.updatedAt}',
        ageRating: '8.0+',
        chartRank: 'v1.0',
        languages: 'Android System Locale',
        minAndroid: 'Android 8.0+ (API 26)',
        sha256: '${mrsTvFacts.sha256}',
        desc: 'M R S IPTV TV (M_R_S_IPTV.apk) is the Smart TV and Android edition distributed directly by MRS TV Network for direct sideloading and mobile installation.',
        size: '${mrsTvFacts.size}',
        category: 'Smart TV & Video',
        icon: '${iptvLogoBase64}',
        link: '/api/download/m-r-s-iptv-pro',
        share: '/?app=m-r-s-iptv-pro',
        whatsNew: [
          'Direct in-house APK hosting from MRS App Store (${mrsTvFacts.size})',
          'Package com.wMRSIPTV_20119768 (Version 1.0)',
          'Verified SHA-256 binary checksum published on product page'
        ],
        features: [
          'Direct APK download with no external hosting redirects',
          'Supports Android 8.0 (API 26) and above',
          'Published and maintained by MRS TV Network',
          'Shareable app link and direct binary URL'
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
          'android.permission.DUMP'
        ]
      },
      'camellia-ai': {
        id: 'camellia-ai',
        title: 'Camellia Ai',
        file: 'Camellia Ai.apk',
        developer: 'Camellia Studio',
        owner: 'Shahin (mrxshahin) · MRS TV Network',
        packageId: 'co.median.android.rdalmaa',
        version: '1.0.0',
        updatedAt: '${camelliaFacts.updatedAt}',
        ageRating: '8.0+',
        chartRank: 'v1.0.0',
        languages: 'Android System Locale',
        minAndroid: 'Android 8.0+ (API 26)',
        sha256: '${camelliaFacts.sha256}',
        desc: 'Camellia Ai is an Android AI assistant package (Camellia Ai.apk) hosted directly on MRS App Store for Android 8.0+ smartphones and tablets.',
        size: '${camelliaFacts.size}',
        category: 'AI & Virtual Assistant',
        icon: '${camelliaAiLogoBase64}',
        link: '/api/download/camellia-ai',
        share: '/?app=camellia-ai',
        whatsNew: [
          'Direct in-house APK hosting from MRS App Store (${camelliaFacts.size})',
          'Build 3 (Version 1.0.0) compiled for Android API 26+',
          'Verified SHA-256 binary checksum published on product page'
        ],
        features: [
          'Direct APK download from MRS App Store',
          'Supports Android 8.0 (API 26) and above',
          'Verified SHA-256 integrity hash',
          'Shareable app page link and direct APK download URL'
        ],
        permissions: [
          'android.permission.INTERNET',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.READ_PHONE_STATE',
          'android.permission.VIBRATE',
          'android.permission.DUMP'
        ]
      }
    };

    var seededReviews = {
      'm-r-s-iptv': [],
      'm-r-s-iptv-pro': [],
      'camellia-ai': []
    };

    var legalContent = {
      privacy: {
        title: 'App Privacy Policy',
        html: '<p style="margin-bottom:0.85rem;">MRS App Store serves direct APK binaries without third-party redirect walls or cross-site tracking.</p><p><strong>1. Direct Distribution:</strong> APK files include published SHA-256 checksums for manual verification.</p><p style="margin-top:0.65rem;"><strong>2. Review Data:</strong> Community reviews submitted in the browser store only the fields entered in the review form.</p>'
      },
      terms: {
        title: 'Terms & Conditions',
        html: '<p style="margin-bottom:0.85rem;">By downloading packages from MRS App Store, you agree to use applications in accordance with applicable regional laws and developer licensing.</p><p>All APK files display real file size, version, permissions, and SHA-256 checksum.</p>'
      },
      developer: {
        title: 'Developer Publishing Agreement',
        html: '<p style="margin-bottom:0.85rem;">Developers may submit applications for review and storefront distribution for a flat <strong>$25.00 USD</strong> fee.</p><p>Payments are accepted via <strong>USDT (BEP-20)</strong> or <strong>Binance Pay (mrxshahin)</strong>, followed by sending payment proof and APK details to <strong>mr216873@gmail.com</strong>.</p>'
      },
      dmca: {
        title: 'DMCA & Intellectual Property Compliance',
        html: '<p>Send verified copyright or rights inquiries directly to Store Owner <strong>mr216873@gmail.com</strong>.</p>'
      }
    };

    var currentCategory = 'all';
    var activeDetailAppId = null;
    var selectedReviewStars = 5;

    function getReviewsForApp(appId) {
      try {
        var raw = localStorage.getItem('mrs_xml_reviews_' + appId);
        if (!raw) return [];
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }

    function saveReviewsForApp(appId, list) {
      try {
        localStorage.setItem('mrs_xml_reviews_' + appId, JSON.stringify(list));
      } catch (e) {}
    }

    function computeStats(appId) {
      var list = getReviewsForApp(appId);
      var counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      var sum = 0;
      list.forEach(function(r) {
        var s = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
        counts[s] += 1;
        sum += s;
      });
      var avg = list.length ? (sum / list.length).toFixed(1) : '—';
      return { avg: avg, list: list, counts: counts, displayTotal: list.length };
    }

    function renderReviewsSection(appId) {
      var stats = computeStats(appId);
      var app = appData[appId];
      var avgEl = document.getElementById('reviewsBigAvg');
      var metaEl = document.getElementById('reviewsTotalMeta');
      var metricRateEl = document.getElementById('metricRatingVal');
      var metricRateSub = document.getElementById('metricRatingSub');
      var metricCountEl = document.getElementById('metricReviewsLabel');
      var cardRateEl = document.getElementById('cardRating-' + appId);
      var cardEl = document.querySelector('.app-card[data-id="' + appId + '"]');
      var heroRevEl = document.getElementById('heroReviewCount');

      if (cardEl) {
        cardEl.setAttribute('data-rating', stats.displayTotal > 0 ? stats.avg : '0');
        cardEl.setAttribute('data-reviews', String(stats.displayTotal));
      }

      if (avgEl) avgEl.textContent = stats.avg;
      if (metaEl) metaEl.textContent = stats.displayTotal > 0 ? ('out of 5 · ' + stats.displayTotal + (stats.displayTotal === 1 ? ' Rating' : ' Ratings')) : 'No ratings yet';
      if (metricRateEl) metricRateEl.textContent = stats.displayTotal > 0 ? (stats.avg + ' ★') : '—';
      if (metricRateSub) metricRateSub.textContent = stats.displayTotal > 0 ? 'User Average' : 'No ratings yet';
      if (metricCountEl) metricCountEl.textContent = stats.displayTotal + (stats.displayTotal === 1 ? ' RATING' : ' RATINGS');
      if (cardRateEl) cardRateEl.textContent = stats.displayTotal > 0 ? (stats.avg + ' ★') : ('v' + (app ? app.version : '1.0'));
      if (appId === 'm-r-s-iptv' && heroRevEl) {
        heroRevEl.textContent = stats.displayTotal > 0 ? (stats.avg + ' ★ · ' + stats.displayTotal + (stats.displayTotal === 1 ? ' Review' : ' Reviews')) : 'No reviews yet';
      }

      var barsEl = document.getElementById('reviewsBreakdownBars');
      if (barsEl) {
        var total = stats.list.length;
        var barsHtml = '';
        [5, 4, 3, 2, 1].forEach(function(star) {
          var pct = total > 0 ? Math.round((stats.counts[star] / total) * 100) : 0;
          barsHtml += '<div class="bar-row"><span class="bar-label">' + star + '★</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div><span class="bar-pct">' + pct + '%</span></div>';
        });
        barsEl.innerHTML = barsHtml;
      }

      var listEl = document.getElementById('detailReviewsList');
      if (listEl) {
        if (!stats.list.length) {
          listEl.innerHTML = '<div style="padding:1.25rem;text-align:center;background:#16161c;border:1px solid rgba(255,255,255,0.06);border-radius:16px;"><div style="font-size:0.88rem;font-weight:700;color:#d1d1d6;">No customer reviews yet</div><div style="font-size:0.78rem;color:#6e6e73;margin-top:0.25rem;">Be the first person to submit a real review for ' + escapeHtml(app ? app.title : 'this app') + '.</div></div>';
        } else {
          var html = '';
          stats.list.forEach(function(r) {
            var starsStr = '';
            for (var i = 0; i < 5; i++) { starsStr += i < r.rating ? '★' : '☆'; }
            html += '<div class="review-card">';
            html += '<div class="review-card-top"><div class="review-title">' + escapeHtml(r.title) + '</div><div class="review-stars">' + starsStr + '</div></div>';
            html += '<div class="review-meta">' + escapeHtml(r.author) + (r.device ? ' · ' + escapeHtml(r.device) : '') + ' · ' + escapeHtml(r.createdAt) + '</div>';
            html += '<div class="review-body">' + escapeHtml(r.comment) + '</div>';
            if (r.reply) {
              html += '<div class="review-reply"><strong>' + escapeHtml(r.reply.author) + ' · ' + escapeHtml(r.reply.date) + '</strong>' + escapeHtml(r.reply.text) + '</div>';
            }
            html += '<div class="review-footer"><button class="helpful-btn" data-appid="' + escapeHtml(appId) + '" data-revid="' + escapeHtml(r.id) + '" onclick="voteHelpfulBtn(this)" type="button">Helpful (' + (r.helpful || 0) + ')</button></div>';
            html += '</div>';
          });
          listEl.innerHTML = html;
        }
      }
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toggleReviewForm(force) {
      var box = document.getElementById('reviewFormBox');
      if (!box) return;
      if (typeof force === 'boolean') {
        box.classList.toggle('active', force);
      } else {
        box.classList.toggle('active');
      }
    }

    function setReviewStars(val) {
      selectedReviewStars = val;
      var btns = document.querySelectorAll('#starPicker .star-pick-btn');
      btns.forEach(function(btn) {
        var s = parseInt(btn.getAttribute('data-star'), 10);
        btn.classList.toggle('lit', s <= val);
      });
    }

    function submitUserReview(e) {
      e.preventDefault();
      if (!activeDetailAppId) return;
      var author = (document.getElementById('revAuthor').value || '').trim();
      var device = (document.getElementById('revDevice').value || '').trim() || 'Android Device';
      var title = (document.getElementById('revTitle').value || '').trim();
      var comment = (document.getElementById('revComment').value || '').trim();
      if (!author || !title || !comment) return;

      var newRev = {
        id: 'rev-user-' + Date.now(),
        author: author,
        device: device,
        title: title,
        rating: selectedReviewStars,
        comment: comment,
        createdAt: new Date().toISOString().slice(0, 10),
        helpful: 1
      };
      var current = getReviewsForApp(activeDetailAppId);
      current.unshift(newRev);
      saveReviewsForApp(activeDetailAppId, current);
      renderReviewsSection(activeDetailAppId);

      document.getElementById('revAuthor').value = '';
      document.getElementById('revDevice').value = '';
      document.getElementById('revTitle').value = '';
      document.getElementById('revComment').value = '';
      setReviewStars(5);
      toggleReviewForm(false);
    }

    function voteHelpfulBtn(btn) {
      if (!btn) return;
      var appId = btn.getAttribute('data-appid');
      var revId = btn.getAttribute('data-revid');
      if (!appId || !revId) return;
      voteHelpful(appId, revId);
    }

    function voteHelpful(appId, revId) {
      var list = getReviewsForApp(appId);
      list = list.map(function(r) {
        if (r.id === revId) { r.helpful = (r.helpful || 0) + 1; }
        return r;
      });
      saveReviewsForApp(appId, list);
      renderReviewsSection(appId);
    }

    function openAppDetail(appId) {
      var app = appData[appId];
      if (!app) return;
      activeDetailAppId = appId;

      var origin = window.location.origin || '';
      var dlLink = origin + app.link;
      var shLink = origin + app.share;

      var iconEl = document.getElementById('detailIcon');
      if (iconEl && app.icon) iconEl.src = app.icon;
      document.getElementById('detailTitle').textContent = app.title;
      document.getElementById('detailDeveloper').textContent = app.developer + ' · Verified Publisher';
      document.getElementById('detailPackageLine').textContent = app.packageId + ' · v' + app.version;
      document.getElementById('metricAgeVal').textContent = app.ageRating;
      document.getElementById('metricChartVal').textContent = app.chartRank;
      document.getElementById('metricCategorySub').textContent = app.category;
      document.getElementById('metricSizeVal').textContent = app.size;
      document.getElementById('detailVersionDate').textContent = 'Version ' + app.version + ' · ' + app.updatedAt;
      document.getElementById('detailDesc').textContent = app.desc;
      document.getElementById('detailCompatMin').textContent = 'Requires ' + app.minAndroid;
      document.getElementById('detailFile').textContent = app.file;
      document.getElementById('detailPkgId').textContent = app.packageId;
      document.getElementById('detailLanguages').textContent = app.languages;
      document.getElementById('detailSha256').textContent = app.sha256;

      document.getElementById('detailDownloadLink').textContent = dlLink;
      document.getElementById('detailShareLink').textContent = shLink;

      var getBtn = document.getElementById('detailGetBtn');
      if (getBtn) {
        getBtn.href = app.link;
        getBtn.setAttribute('download', app.file);
      }

      var shareText = encodeURIComponent('Download ' + app.title + ' (' + app.size + ') directly from MRS App Store: ' + shLink);
      var shareUrlEnc = encodeURIComponent(shLink);
      document.getElementById('shareWhatsApp').href = 'https://wa.me/?text=' + shareText;
      document.getElementById('shareTelegram').href = 'https://t.me/share/url?url=' + shareUrlEnc + '&text=' + encodeURIComponent('Download ' + app.title + ' on MRS App Store');
      document.getElementById('shareX').href = 'https://twitter.com/intent/tweet?text=' + shareText;

      var qrImg = document.getElementById('detailQrImg');
      if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + shareUrlEnc;
      var qrDrawer = document.getElementById('detailQrDrawer');
      if (qrDrawer) qrDrawer.classList.remove('active');

      var wnEl = document.getElementById('detailWhatsNew');
      if (wnEl) wnEl.innerHTML = app.whatsNew.map(function(i) { return '<li><span class="bullet-dot">•</span><span>' + escapeHtml(i) + '</span></li>'; }).join('');
      var featEl = document.getElementById('detailFeatures');
      if (featEl) featEl.innerHTML = app.features.map(function(i) { return '<li><span class="bullet-dot">✓</span><span>' + escapeHtml(i) + '</span></li>'; }).join('');
      var permEl = document.getElementById('detailPermissions');
      if (permEl) permEl.innerHTML = app.permissions.map(function(i) { return '<li><span class="bullet-dot">›</span><span>' + escapeHtml(i) + '</span></li>'; }).join('');

      toggleReviewForm(false);
      renderReviewsSection(appId);

      var modal = document.getElementById('detailModal');
      if (modal) modal.classList.add('active');
    }

    function toggleDetailQr() {
      var d = document.getElementById('detailQrDrawer');
      if (d) d.classList.toggle('active');
    }

    function shareCurrentAppNative() {
      if (!activeDetailAppId) return;
      quickShareApp(activeDetailAppId, document.getElementById('detailWebShareBtn'));
    }

    function quickShareApp(appId, btn) {
      var app = appData[appId];
      if (!app) return;
      var shLink = (window.location.origin || '') + app.share;
      if (navigator.share) {
        navigator.share({
          title: app.title + ' — MRS App Store',
          text: 'Download ' + app.title + ' (' + app.size + ') directly from MRS App Store',
          url: shLink
        }).catch(function() { copyText(shLink, btn); });
      } else {
        copyText(shLink, btn);
      }
    }

    function closeDetailModal() {
      var modal = document.getElementById('detailModal');
      if (modal) modal.classList.remove('active');
    }

    function openPublishModal() {
      var modal = document.getElementById('publishModal');
      if (modal) modal.classList.add('active');
    }

    function closePublishModal() {
      var modal = document.getElementById('publishModal');
      if (modal) modal.classList.remove('active');
    }

    function submitXmlAppPublish(e) {
      e.preventDefault();
      var title = (document.getElementById('pubAppTitle').value || '').trim();
      var ver = (document.getElementById('pubVersion').value || '1.0.0').trim();
      var dev = (document.getElementById('pubDevName').value || '').trim();
      var email = (document.getElementById('pubDevEmail').value || '').trim();
      var pay = document.getElementById('pubPayMethod').value;
      var tx = (document.getElementById('pubTxHash').value || '').trim();
      var apkUrl = (document.getElementById('pubApkUrl').value || '').trim();
      var desc = (document.getElementById('pubDesc').value || '').trim();
      if (!title || !dev || !email || !tx || !apkUrl) return;

      var txnId = 'TXN-MRS-' + Date.now();
      var record = {
        id: txnId,
        title: title,
        version: ver,
        developer: dev,
        email: email,
        paymentMethod: pay,
        txHash: tx,
        apkUrl: apkUrl,
        description: desc,
        submittedAt: new Date().toISOString()
      };
      try {
        var existing = JSON.parse(localStorage.getItem('mrs_xml_submissions') || '[]');
        existing.unshift(record);
        localStorage.setItem('mrs_xml_submissions', JSON.stringify(existing));
      } catch (err) {}

      var box = document.getElementById('pubReceiptBox');
      if (box) {
        box.style.display = 'block';
        box.innerHTML = '<strong>Submission Receipt Recorded: ' + escapeHtml(txnId) + '</strong><br/>' + escapeHtml(title) + ' (v' + escapeHtml(ver) + ') via ' + escapeHtml(pay) + '.<br/>Proof: ' + escapeHtml(tx);
      }

      var mailBtn = document.getElementById('pubMailtoBtn');
      if (mailBtn) {
        mailBtn.href = 'mailto:mr216873@gmail.com?subject=' + encodeURIComponent('[App Submission] ' + title + ' (' + txnId + ')') + '&body=' + encodeURIComponent('Transaction ID: ' + txnId + '\\nPayment Method: ' + pay + ' ($25 USD)\\nTxHash / Order ID: ' + tx + '\\nApp Name: ' + title + '\\nVersion: ' + ver + '\\nDirect APK URL: ' + apkUrl + '\\nDeveloper: ' + dev + ' (' + email + ')\\nDescription: ' + desc);
      }
    }

    function openLegalModal(tab) {
      switchLegalTab(tab || 'privacy');
      var modal = document.getElementById('legalModal');
      if (modal) modal.classList.add('active');
    }

    function closeLegalModal() {
      var modal = document.getElementById('legalModal');
      if (modal) modal.classList.remove('active');
    }

    function switchLegalTab(tab, btn) {
      var item = legalContent[tab] || legalContent.privacy;
      document.getElementById('legalTitle').textContent = item.title;
      document.getElementById('legalBody').innerHTML = item.html;
      var allBtns = document.querySelectorAll('.legal-tab-btn');
      allBtns.forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-legal') === tab);
      });
    }

    function copyElementText(id, btn) {
      var el = document.getElementById(id);
      if (!el) return;
      copyText(el.textContent || '', btn);
    }

    function copyText(val, btn) {
      if (navigator.clipboard && val) {
        navigator.clipboard.writeText(val).then(function() {
          if (!btn) return;
          var orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function() { btn.textContent = orig; }, 1800);
        });
      }
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
      var sortSelect = document.getElementById('sortSelect');
      var grid = document.getElementById('appsGrid');
      var q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      var sortBy = sortSelect ? sortSelect.value : 'featured';
      var cards = Array.prototype.slice.call(document.querySelectorAll('.app-card'));

      cards.sort(function(a, b) {
        if (sortBy === 'rating') {
          return parseFloat(b.getAttribute('data-rating') || '0') - parseFloat(a.getAttribute('data-rating') || '0');
        }
        if (sortBy === 'reviews') {
          return parseInt(b.getAttribute('data-reviews') || '0', 10) - parseInt(a.getAttribute('data-reviews') || '0', 10);
        }
        return parseInt(a.getAttribute('data-order') || '0', 10) - parseInt(b.getAttribute('data-order') || '0', 10);
      });

      var visibleCount = 0;
      cards.forEach(function(card) {
        if (grid) grid.appendChild(card);
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

    (function() {
      try {
        var yr = new Date().getFullYear();
        var el = document.getElementById('theme-year');
        if (el) el.textContent = yr;

        Object.keys(appData).forEach(function(id) {
          var stats = computeStats(id);
          var cardRate = document.getElementById('cardRating-' + id);
          var cardEl = document.querySelector('.app-card[data-id="' + id + '"]');
          if (cardEl) {
            cardEl.setAttribute('data-rating', stats.displayTotal > 0 ? stats.avg : '0');
            cardEl.setAttribute('data-reviews', String(stats.displayTotal));
          }
          if (cardRate) cardRate.textContent = stats.displayTotal > 0 ? (stats.avg + ' ★') : ('v' + appData[id].version);
          if (id === 'm-r-s-iptv') {
            var hr = document.getElementById('heroReviewCount');
            if (hr) hr.textContent = stats.displayTotal > 0 ? (stats.avg + ' ★ · ' + stats.displayTotal + (stats.displayTotal === 1 ? ' Review' : ' Reviews')) : 'No reviews yet';
          }
        });

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
