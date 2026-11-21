-- Kit file. Copy to scripts/ci/supabase-roles.sql. The migrations job in
-- ci.yml runs it. Standard: https://qiheme.github.io/#/standards/data
--
-- Stand-in for what every Supabase project ships with, so migrations and tests
-- can be exercised against a plain Postgres (the Vitest in-process engine and
-- the CI service container).
--
-- Supabase creates three roles for its auto-generated Data API (PostgREST /
-- GraphQL) and, on existing projects, automatically GRANTs them every
-- privilege on every new table, sequence and function in `public`. That means
-- a new table is reachable through the API the moment it is created, with row
-- level security as the only remaining barrier. This script reproduces
-- exactly that, so the lockdown migration has something real to undo.
--
-- Safe to run repeatedly. Not for production: Supabase already has all of this.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
