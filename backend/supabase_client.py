import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def _headers(use_service_role=False):
    key = SUPABASE_SERVICE_ROLE_KEY if use_service_role else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def supabase_get(table: str, params: dict = None, use_service_role=False):
    """GET from Supabase REST API (PostgREST)."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.get(url, headers=_headers(use_service_role), params=params or {}, timeout=15)
    resp.raise_for_status()
    return resp.json()


def supabase_post(table: str, data: dict, use_service_role=True):
    """POST to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = _headers(use_service_role)
    headers["Prefer"] = "return=representation"
    resp = requests.post(url, headers=headers, json=data, timeout=15)
    resp.raise_for_status()
    return resp.json()
