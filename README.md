# Guestbook Unicorn

React and TypeScript guestbook for GitHub Pages with Supabase Auth and Postgres storage.

## Publish and configure

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Create a Supabase project and run [messages.sql](supabase/messages.sql) once in its SQL Editor.
3. In Supabase, open **Authentication → Sign In / Providers → GitHub** and copy the callback URL. In GitHub Developer Settings, register an OAuth App. Use the Pages URL as its homepage and the Supabase callback URL as its authorization callback. Put the client ID and secret into the Supabase GitHub provider settings, then enable the provider.
4. In Supabase **Authentication → URL Configuration**, set the site URL and add the redirect URL `https://swagissocool.github.io/guestbookunicorn/`.
5. In GitHub **Settings → Secrets and variables → Actions → Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The build exposes these two values to the browser. Keep the GitHub OAuth secret in Supabase.
6. Go to **Actions → Deploy guestbook to GitHub Pages → Run workflow**. When it passes, check the live page by signing in, posting, and reloading.

For local development, run `npm ci` and `npm run dev`. Set both Vite variables in `.env.local` and allow the local redirect URL in Supabase to test sign-in locally.
