/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_MAPBOX_TOKEN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
