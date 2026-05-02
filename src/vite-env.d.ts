/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_APP_CLIENT_ID?: string;
  readonly VITE_GITHUB_APP_REDIRECT_URI?: string;
  readonly VITE_GITHUB_APP_EXCHANGE_URL?: string;
  readonly VITE_GITHUB_GRAPHQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
