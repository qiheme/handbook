-- Kit file. Copy to scripts/ci/supabase-auth-stub.sql. The migrations job in
-- ci.yml runs it after supabase-roles.sql.
-- Standard: https://qiheme.github.io/#/standards/data
--
-- Stand-in for the parts of Supabase Auth that migrations refer to, so CI can
-- apply them to a plain Postgres container: the auth schema, auth.users (for
-- foreign keys), and auth.uid(), auth.role() and auth.jwt() (for row-level
-- security policies). The helpers read the same request settings Supabase's
-- own do, so a test can act as a user with
--   set local role authenticated;
--   set local request.jwt.claim.sub = '<user uuid>';
--
-- NEVER run this against a real Supabase project: there these objects already
-- exist and are owned by Supabase. Safe to run repeatedly. If a migration
-- needs more of Supabase than this, add it here.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text
);

CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    auth.jwt() ->> 'sub'
  )::uuid
$$;

CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    auth.jwt() ->> 'role'
  )
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.jwt(), auth.uid(), auth.role() TO anon, authenticated, service_role;
