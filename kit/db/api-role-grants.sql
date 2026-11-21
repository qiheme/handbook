-- Kit file. Copy to scripts/ci/api-role-grants.sql in a server-only
-- (Drizzle) repo. Standard: https://qiheme.github.io/#/standards/data
--
-- One row for every (Supabase Data API role, table in public) pair where the
-- role holds ANY privilege on the table, including on just some of its columns
-- (has_table_privilege is false for column-only grants, which still expose
-- data). Zero rows means the Data API is locked out. Use it from the
-- migrations CI job and from the test suite, so both enforce the same rule.
SELECT r.rolname || ' on ' || c.relname AS pair
FROM pg_roles r
CROSS JOIN pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
  AND (   has_table_privilege(r.rolname, c.oid, 'SELECT')
       OR has_table_privilege(r.rolname, c.oid, 'INSERT')
       OR has_table_privilege(r.rolname, c.oid, 'UPDATE')
       OR has_table_privilege(r.rolname, c.oid, 'DELETE')
       OR has_table_privilege(r.rolname, c.oid, 'TRUNCATE')
       OR has_table_privilege(r.rolname, c.oid, 'REFERENCES')
       OR has_table_privilege(r.rolname, c.oid, 'TRIGGER')
       OR has_any_column_privilege(r.rolname, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'))
ORDER BY 1;
