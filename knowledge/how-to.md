# How-to

## Deploy pipeline (Vercel + Supabase)

1. Create Supabase project → Settings → API Keys → copy `anon public` key + Project URL
2. Run `supabase/migrations/001_initial.sql` in SQL Editor → Run query
3. In Vercel: Import GitHub repo → Environment Variables:
   - `VITE_SUPABASE_URL` = `https://<project-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = anon key
4. Deploy — every push to `master` auto-deploys

## webtop API endpoints used
- Login: `POST /server/api/user/LoginByUserNameAndPassword`
- Student data: `POST /server/api/dashboard/InitDashboard` (body: `{}`)
- Homework: `POST /server/api/PupilCard/GetPupilLessonsAndHomework`
- Auth cookie: `webToken=<token>` in Cookie header
- Study year: month >= 8 (September) → current year + 1, else current year
