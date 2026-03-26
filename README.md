# Fitness Playground — GitHub Pages + Supabase

This version keeps the existing frontend design, uses Firebase Authentication for the admin login, and uses Supabase for content and image storage.

## What changed
- Firebase Authentication is used for the admin login.
- Image uploads now go to the Supabase storage bucket `SITE-IMAGES`.
- Website content, services, rates, and gallery use Supabase tables.
- The **Join Now** button can now open a Google Form link.
- Facebook and Instagram links are editable from the admin dashboard.

## Included files
- `index.html` — public website
- `admin.html` — admin dashboard
- `assets/styles.css` — unchanged design styling
- `assets/js/*` — Supabase frontend logic
- `supabase-setup.sql` — SQL for tables, policies, and bucket setup
- `client-folder/*` — project notes and docs

## Important Supabase values already added in code
- Project URL: `https://zgzepzrrksownfyfjqmx.supabase.co`
- Bucket: `SITE-IMAGES`

## Setup steps
1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Run the whole `supabase-setup.sql` file.
4. Go to **Authentication > Users**.
5. Create your admin email and password.
6. Upload this project to GitHub.
7. Enable GitHub Pages.

## Local testing
Use a local server because the project uses ES modules.

### Python
```bash
python -m http.server 5500
```

Then open:
- `http://localhost:5500/`
- `http://localhost:5500/admin.html`

## How image upload works
1. Log in to `admin.html`.
2. Upload an image in the left sidebar.
3. Copy the generated public URL.
4. Paste that URL into any image field.
5. Save.
6. The image will show on the public website.

## Notes
- The bucket name must be exactly `SITE-IMAGES`.
- If images upload but do not display, make sure the bucket is public and the storage policies from `supabase-setup.sql` were applied.
- If the site says tables do not exist, run the SQL file first.


## Important security note
Because the site is a static frontend and the admin login now uses Firebase instead of Supabase Auth, the included Supabase SQL opens write access to the anon role so the frontend can still save content and upload images. This keeps the requested architecture working without a custom backend, but it is not a secure production setup. For stronger security, add a backend or Supabase Edge Function that verifies Firebase users before writing to Supabase.
