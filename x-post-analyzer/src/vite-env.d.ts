/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_X_CLIENT_ID: string;
  readonly VITE_X_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
