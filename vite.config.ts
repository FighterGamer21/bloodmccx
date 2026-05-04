// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode: no server runtime needed (Supabase handles the backend).
// This produces a static client build that deploys to Vercel as plain
// static files — no Vercel framework adapter required.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
  },
});
