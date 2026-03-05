# Database Migrations

Run migrations in order against Supabase SQL editor.

## Setup
1. Enable PostGIS extension in Supabase dashboard (Database > Extensions)
2. Run `migrations/001_initial_schema.sql` in SQL editor

## Adding migrations
- Name: `NNN_description.sql`
- Always test in Supabase SQL editor first
- Keep DDL idempotent where possible (IF NOT EXISTS)
