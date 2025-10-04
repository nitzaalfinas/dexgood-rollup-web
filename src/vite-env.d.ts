/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string
  readonly VITE_L1_BRIDGE_CONTRACT: string
  readonly VITE_L2_BRIDGE_CONTRACT: string
  readonly VITE_WC_PROJECT_ID: string
  readonly VITE_DOMAIN_EVM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
