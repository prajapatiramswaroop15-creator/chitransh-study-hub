-- Run AFTER the first V3 database SQL you already ran.
-- This removes the unsafe client-side profile update policy and allows only users
-- whose profiles have role='admin' to manage tests/questions.

revoke all on table public.profiles from anon;

drop policy if exists "Users can update own profile" on public.profiles;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admin policies for tests
DROP POLICY IF EXISTS "Admins can insert tests" ON public.tests;
CREATE POLICY "Admins can insert tests" ON public.tests
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tests" ON public.tests;
CREATE POLICY "Admins can update tests" ON public.tests
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete tests" ON public.tests;
CREATE POLICY "Admins can delete tests" ON public.tests
FOR DELETE TO authenticated USING (public.is_admin());

-- Admin policies for questions
DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
CREATE POLICY "Admins can insert questions" ON public.questions
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
CREATE POLICY "Admins can update questions" ON public.questions
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;
CREATE POLICY "Admins can delete questions" ON public.questions
FOR DELETE TO authenticated USING (public.is_admin());

-- Useful grants for browser client roles
GRANT SELECT ON public.tests, public.questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tests, public.questions TO authenticated;
GRANT SELECT, INSERT ON public.test_results TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
