"""
Run WhereToWork migration SQL against the database.

Uses the same database.py connection helper from the backend.
Requires DATABASE_URL or DATABASE_POOLER_URL in backend/.env.

Usage:
    conda run -n pyds python db/run_migration.py
    conda run -n pyds python db/run_migration.py --file db/migrations/001_initial_schema.sql
    conda run -n pyds python db/run_migration.py --dry-run
"""

import sys
import os
import argparse
import logging

# Add backend to path so we can import database.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

DEFAULT_MIGRATION = os.path.join(
    os.path.dirname(__file__), 'migrations', '001_initial_schema.sql'
)


def run_migration(sql_file: str, dry_run: bool = False, use_pooler: bool = False):
    """Read and execute a SQL migration file."""
    if not os.path.exists(sql_file):
        logger.error(f"Migration file not found: {sql_file}")
        sys.exit(1)

    with open(sql_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    logger.info(f"Read migration: {sql_file} ({len(sql)} chars)")

    if dry_run:
        logger.info("DRY RUN - SQL that would be executed:")
        print(sql)
        return

    # Import here so --dry-run works without DB connection
    from database import get_db_connection

    conn = None
    try:
        conn = get_db_connection(use_pooler=use_pooler)
        conn.autocommit = False
        cur = conn.cursor()

        logger.info("Executing migration...")
        cur.execute(sql)
        conn.commit()

        logger.info("Migration completed successfully.")
        cur.close()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()


def main():
    parser = argparse.ArgumentParser(description='Run WhereToWork DB migrations')
    parser.add_argument(
        '--file', '-f',
        default=DEFAULT_MIGRATION,
        help=f'SQL file to run (default: {DEFAULT_MIGRATION})'
    )
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Print SQL without executing'
    )
    parser.add_argument(
        '--use-pooler',
        action='store_true',
        help='Use pooler connection URL instead of direct'
    )
    args = parser.parse_args()

    run_migration(args.file, dry_run=args.dry_run, use_pooler=args.use_pooler)


if __name__ == '__main__':
    main()
