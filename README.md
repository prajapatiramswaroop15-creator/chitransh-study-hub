# Chitransh Study Hub — V3

V3 connects the GitHub Pages frontend to Supabase.

## Features
- Online tests loaded from Supabase
- Secure email/password admin login
- Admin-only test creation and deletion
- Admin-only question creation and deletion
- Mock test timer and question palette
- 1/3-style negative marking support via decimal `0.333`
- Automatic result calculation
- Results can be saved for logged-in students
- Founder branding: Chitransh • Anil • Kanhaiya

## Setup order
1. In Supabase SQL Editor, run the earlier V3 database SQL you already used.
2. Then run `supabase_admin_policies.sql` once.
3. Create your account from `admin.html` using the Create Account button.
4. In Supabase SQL Editor, promote your own account to admin by replacing YOUR_EMAIL:

   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');

5. In `config.js`, paste your Supabase Project URL and Publishable key.
6. Upload all V3 files to the GitHub repository root and wait for Pages to deploy.

## Security
Do NOT put a Supabase secret/service_role key in `config.js`. The browser should use only the publishable key. RLS policies protect data access.
