# Deploying BloodMC to Vercel

Use these settings in Vercel:

- Framework Preset: Other
- Install Command: `npm install --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: `dist/client`

Add these Environment Variables in the Vercel project settings before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Before testing admin product plan type or direct image uploads, apply all Supabase migrations, including the latest `site-media` storage migration. It creates the `billing_type` product column and the public `site-media` bucket used by admin uploads.

The project builds as a TanStack Start SPA. The `postbuild` script creates `dist/client/index.html` from the TanStack `_shell.html` file, and `vercel.json` rewrites all routes to `index.html` so `/`, `/store`, `/admin`, product pages, and refreshes on deep links work on Vercel.
