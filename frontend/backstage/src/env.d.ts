/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEV_API_TARGET: string
  readonly VITE_DEV_BYPASS_AUTH: string
  readonly VITE_APP_BASE_PATH: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
