import psycopg2
from psycopg2.extras import RealDictCursor
import os
import logging
from urllib.parse import urlparse, urlunparse, urlencode, parse_qs
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db_connection(use_pooler=True):
    pooler_url = os.getenv("DATABASE_POOLER_URL")
    if pooler_url and use_pooler:
        db_url = pooler_url
    else:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL or DATABASE_POOLER_URL must be set")

    try:
        parsed = urlparse(db_url)
        query_params = parse_qs(parsed.query)
        if 'sslmode' not in query_params:
            sslmode = 'disable' if use_pooler else 'require'
            query_params['sslmode'] = [sslmode]
            new_query = urlencode(query_params, doseq=True)
            db_url = urlunparse((
                parsed.scheme, parsed.netloc, parsed.path,
                parsed.params, new_query, parsed.fragment
            ))

        conn = psycopg2.connect(db_url, connect_timeout=10)
        logger.info("Database connection established")
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise ConnectionError(f"Failed to connect to database: {e}")
