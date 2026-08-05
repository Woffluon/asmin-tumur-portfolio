/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Public non-sensitive metadata only
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
