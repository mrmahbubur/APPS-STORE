/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLISHING_FEE_USD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
