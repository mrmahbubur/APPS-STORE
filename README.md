# MRS App Store

Official application marketplace operated by **M R S** for distributing verified **Android (`.apk`)**, **Smart TV**, and **Windows (`.exe`, `.msi`, `.msix`, `.appx`, `.zip`)** packages with SHA-256 checksums, real user reviews, and on-chain BEP-20 developer publishing.

---

## Supported Package Formats & Binary Verification

MRS App Store validates uploaded binaries on the server (`server/publish-service.ts`) before storing them under `public/apks/` and serves every format with its proper `Content-Type` header:

| Platform | Extensions | Header / Signature Inspection | MIME Type |
| --- | --- | --- | --- |
| **Android & Smart TV** | `.apk` | ZIP central directory + `AndroidManifest.xml` + `classes.dex` / ABI detection | `application/vnd.android.package-archive` |
| **Windows Executable** | `.exe` | PE/MZ signature (`0x4D 0x5A` + `PE\0\0` COFF header, `x64` / `x86` / `ARM64`) | `application/vnd.microsoft.portable-executable` |
| **Windows Installer** | `.msi` | OLE Compound Document signature (`D0 CF 11 E0 A1 B1 1A E1`) | `application/x-msi` |
| **Windows Modern Store** | `.msix`, `.msixbundle` | ZIP container + `AppxManifest.xml` / `AppxBundleManifest.xml` | `application/msix` |
| **Windows AppX Package** | `.appx`, `.appxbundle` | ZIP container + `AppxManifest.xml` / `AppxBundleManifest.xml` | `application/appx` |
| **Portable Archive** | `.zip` | ZIP archive inspection for portable desktop apps & Windows tools | `application/zip` |

> Every package uploaded or registered is hashed with **SHA-256** and checked for integrity via `/api/health`.

---

## Catalog Mapping & UI Share Helpers

Shared catalog mapping helpers live in `src/data/catalog.ts`:

- `SUPPORTED_WINDOWS_EXTENSIONS` — `.exe`, `.msi`, `.msix`, `.msixbundle`, `.appx`, `.appxbundle`, `.zip`
- `LOCAL_PACKAGE_FILE_MAP` — maps built-in catalog IDs to self-hosted files in `public/apks/`
- `isWindowsPackage(app)` / `isHybridPackage(app)` — detects Windows or cross-platform Windows + Android/Smart TV builds from `platform` and `fileName` (`.exe`, `.msi`, `.msix`, `.appx`, `.zip`)
- `getAppPackageFormatLabel(app)` — returns display labels (`Direct EXE`, `Direct MSI`, `Direct MSIX`, `Direct APPX`, `Direct ZIP`, `Direct APK`, or `Direct Package`)
- `getAppShareTitle(app)` — standardized share titles (`Official Windows Package`, `Official Windows & Android Package`, or `Official APK`) used across `AppCard`, `HeroFeatured`, and `AppDetailModal`
- `getAppLocalPackageFile(app)` & `getAppLocalPackageUrl(app)` — resolves local or external package download paths for both backend mode and GitHub Pages static fallback (`getAppLocalApkFile` / `getAppLocalApkUrl` remain exported aliases)

---

## Local Development

Requires **Node.js 22+** (see `.node-version`).

```bash
npm install --legacy-peer-deps
npm run dev
```

### Server CLI Flags & Environment Detection

`server.ts` runs natively under Node 22+ (`node server.ts`) or with `tsx server.ts`:

- `--port <number>` / `-p <number>` (or `--port=<number>`) — override listen port (defaults to `DEFAULT_APP_PORT` in dev, `PORT` in production, or `3000`)
- `--host <host>` / `-H <host>` — override bind address (default `0.0.0.0`)
- `--prod` / `--production` — force production mode serving compiled static files from `dist/`
- `--dev` / `--development` — force development mode with Vite middleware attached (`hmr: false`)

Auto-production detection also activates when `NODE_ENV=production`, `RENDER=true` / `RENDER_SERVICE_ID` / `K_SERVICE` / `RAILWAY_ENVIRONMENT` is present, or when running `npm start` with a built `dist/index.html`.

---

## Build & Deployment

### Dual Static + Production Bundle

```bash
npm run build
```

1. Builds `dist/` for Express production serving (`npm start` -> `node server.ts`).
2. Builds `gh-pages/` via `vite.gh.config.ts` with static JSON/localStorage fallbacks when no Node API server is present.

### Render Deployment

`render.yaml` is preconfigured for Render Web Services:

- **Runtime**: Node 22 (`.node-version`)
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start` (`node server.ts`)
- **Health Check**: `/api/health`

---

## Key Backend Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/apps` | Filterable app catalog (`?search=`, `?category=`, `?platform=All\|Android\|Smart TV\|Windows`) |
| `GET` | `/api/download/:id` | Streams built-in or uploaded `.apk` / Windows binary with download tracking & MIME type |
| `GET` | `/download/:filename` | Direct file download from `public/apks/` |
| `GET` | `/api/meta` | Store metadata, owner profile (`M R S`), 28 store categories, and policies |
| `GET` | `/api/sponsors` | Sponsored placements & `POST /api/sponsors/:id/click` click counter |
| `GET/POST` | `/api/reviews/:appId` | Persistent ratings & device reviews (`Windows 11 PC`, `Android Mobile`, `Android TV`, etc.) |
| `POST` | `/api/publish/verify-payment` | Verifies `$25.00 USD` BEP-20 USDT transfer on BNB Smart Chain or records Binance Pay Order ID |
| `POST` | `/api/publish/upload-apk` / `/api/publish/upload-package` | Accepts `.apk`, `.exe`, `.msi`, `.msix`, `.msixbundle`, `.appx`, `.appxbundle`, or `.zip` binaries up to 150 MB |
| `POST` | `/api/publish/submit` | Finalizes listing creation, SHA-256 auditing, and live catalog persistence |
| `GET` | `/api/health` | Verifies `data/` storage access and SHA-256 integrity across self-hosted packages |
