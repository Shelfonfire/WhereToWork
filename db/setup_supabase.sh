#!/usr/bin/env bash
# WhereToWork Supabase Setup Script
# Creates project, runs migration, outputs connection strings.
#
# Prerequisites:
#   - Supabase CLI installed: npm install -g supabase
#   - Logged in: supabase login
#
# Usage: bash db/setup_supabase.sh [--migrate-only]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="wheretowork"
REGION="eu-west-2"
MIGRATION_FILE="$SCRIPT_DIR/migrations/001_initial_schema.sql"
ORG_ID=""  # Set your Supabase org ID here, or pass via env: SUPABASE_ORG_ID

# ---------- helpers ----------
info()  { echo "[INFO]  $*"; }
error() { echo "[ERROR] $*" >&2; }
die()   { error "$*"; exit 1; }

check_cli() {
    if ! command -v supabase &>/dev/null; then
        error "Supabase CLI not found. Install with: npm install -g supabase"
        error "Then login with: supabase login"
        exit 1
    fi
    info "Supabase CLI version: $(supabase --version)"
}

# ---------- create project ----------
create_project() {
    local org="${SUPABASE_ORG_ID:-$ORG_ID}"
    if [ -z "$org" ]; then
        info "Listing orgs to find your org ID..."
        supabase orgs list
        echo ""
        read -rp "Enter your org ID from above: " org
    fi

    info "Creating Supabase project '$PROJECT_NAME' in $REGION..."
    read -rsp "Enter a database password (min 12 chars): " db_password
    echo ""

    supabase projects create "$PROJECT_NAME" \
        --org-id "$org" \
        --region "$REGION" \
        --db-password "$db_password"

    info "Project created. Waiting 30s for provisioning..."
    sleep 30

    # Get project ref
    local project_ref
    project_ref=$(supabase projects list | grep "$PROJECT_NAME" | awk '{print $1}' | head -1)

    if [ -z "$project_ref" ]; then
        die "Could not find project ref. Check 'supabase projects list'."
    fi

    info "Project ref: $project_ref"
    echo ""
    echo "=========================================="
    echo "CONNECTION STRINGS FOR .env FILES"
    echo "=========================================="
    echo ""
    echo "# backend/.env"
    echo "DATABASE_URL=postgresql://postgres:${db_password}@db.${project_ref}.supabase.co:5432/postgres"
    echo "DATABASE_POOLER_URL=postgresql://postgres.${project_ref}:${db_password}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?sslmode=disable"
    echo ""
    echo "# frontend/.env.local (if needed)"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://${project_ref}.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard -> Settings -> API>"
    echo ""
    echo "=========================================="

    export PROJECT_REF="$project_ref"
    export DB_PASSWORD="$db_password"
}

# ---------- run migration ----------
run_migration() {
    if [ ! -f "$MIGRATION_FILE" ]; then
        die "Migration file not found: $MIGRATION_FILE"
    fi

    local db_url="${DATABASE_URL:-}"
    if [ -z "$db_url" ]; then
        # Try to build from project ref + password
        if [ -n "${PROJECT_REF:-}" ] && [ -n "${DB_PASSWORD:-}" ]; then
            db_url="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
        else
            error "DATABASE_URL not set and no project ref available."
            error "Set DATABASE_URL env var or run without --migrate-only to create project first."
            exit 1
        fi
    fi

    info "Running migration: $MIGRATION_FILE"
    psql "$db_url" -f "$MIGRATION_FILE"
    info "Migration complete."
}

# ---------- main ----------
main() {
    check_cli

    if [ "${1:-}" = "--migrate-only" ]; then
        run_migration
    else
        create_project
        run_migration
    fi

    info "Done. Next steps:"
    info "  1. Copy connection strings above into backend/.env"
    info "  2. Get anon key from Supabase dashboard for frontend/.env.local"
    info "  3. Enable PostGIS extension in Supabase dashboard -> Database -> Extensions"
}

main "$@"
