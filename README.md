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

## Shared Platform Filtering, Package Metadata & Catalog Mapping

Platform classification, catalog search/filtering, store policies, sponsor definitions, and package labeling live in browser- and Node-22-safe shared modules under `shared/` (`shared/package-utils.ts`, `shared/store-metadata.ts`, and `shared/types.ts`), consumed by both Express (`server.ts`, `server/db.ts`, `server/publish-service.ts`) and React (`src/data/catalog.ts`, `src/App.tsx`):

- `SUPPORTED_WINDOWS_EXTENSIONS` & `SUPPORTED_PACKAGE_EXTENSIONS` — `.apk`, `.exe`, `.msi`, `.msix`, `.msixbundle`, `.appx`, `.appxbundle`, `.zip`
- `LOCAL_PACKAGE_FILE_MAP` & `getBuiltinPackageFile(appId)` — canonical mapping of built-in catalog IDs to self-hosted files in `public/apks/`
- `isWindowsPackage(app)` / `isSmartTvPackage(app)` / `isAndroidPackage(app)` / `isHybridPackage(app)` — unified OS and platform classification from `platform` and `fileName`
- `matchesPlatformFilter(app, filter)`, `countAppsByPlatform(apps)`, `filterCatalogApps(apps, opts)`, `sortCatalogApps(apps, sortBy)`, and `sortReviewsByDate(reviews)` — shared server/client catalog filtering, platform counting, and deterministic sorting (`popular`, `rating`, `newest`)
- `getPackageFormatCode(app)`, `getAppPackageFormatLabel(app)`, `getPackageMimeType(fileName)`, `getAppMinOsLabel(app)`, `getDefaultPackagePermissions(app)` — standardized binary format labels (`Direct EXE`, `Direct MSI`, `Direct MSIX`, `Direct APPX`, `Direct ZIP`, `Direct APK`), HTTP `Content-Type` headers, minimum OS strings, and permission defaults
- `getAppShareTitle(app)` & `getAppShareText(app)` — standardized share titles (`Official Windows Package`, `Official Windows & Android Package`, or `Official APK`) used across `AppCard`, `HeroFeatured`, and `AppDetailModal`
- `APP_STORE_CATEGORIES`, `MRS_GRAVATAR_OWNER_PROFILE`, `DEFAULT_SPONSOR_LINKS`, `filterSponsorsByTab()`, `getDetailPageSponsors()`, `buildBuiltinApps()`, and `buildSiteMeta()` — single source of truth for store categories, owner identity, built-in packages, legal policies, and sponsor placements, with all core domain/verification/filter types centralized in `shared/types.ts` (`src/types.ts` and `src/data/catalog.ts` re-export for frontend consumers)

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
| `GET` | `/api/apps` | Filterable & sortable app catalog (`?search=`, `?category=`, `?platform=All\|Android\|Smart TV\|Windows`, `?sortBy=popular\|rating\|newest`) |
| `GET` | `/api/download/:id` | Streams built-in or uploaded `.apk` / Windows binary with download tracking & MIME type |
| `GET` | `/download/:filename` | Direct file download from `public/apks/` |
| `GET` | `/api/meta` | Store metadata, owner profile (`M R S`), 28 store categories, and policies |
| `GET` | `/api/sponsors` | Sponsored placements & `POST /api/sponsors/:id/click` click counter |
| `GET/POST` | `/api/reviews/:appId` | Persistent ratings & device reviews (`Windows 11 PC`, `Android Mobile`, `Android TV`, etc.) |
| `POST` | `/api/publish/verify-payment` | Verifies `$25.00 USD` BEP-20 USDT transfer on BNB Smart Chain or records Binance Pay Order ID |
| `POST` | `/api/publish/upload-apk` / `/api/publish/upload-package` | Accepts `.apk`, `.exe`, `.msi`, `.msix`, `.msixbundle`, `.appx`, `.appxbundle`, or `.zip` binaries up to 150 MB |
| `POST` | `/api/publish/submit` | Finalizes listing creation, SHA-256 auditing, and live catalog persistence |
| `GET` | `/api/health` | Verifies `data/` storage access and SHA-256 integrity across self-hosted packages |
