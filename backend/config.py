from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "linkstudio.db"
JSON_FILE = DATA_DIR / "linkstudio.json"
UPLOAD_DIR = DATA_DIR / "uploads"
FRONTEND_DIST = ROOT / "frontend" / "dist"

SECRET_KEY = os.environ.get("LINKSTUDIO_SECRET", "super-linkstudio-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 days

# Ensure data and upload directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
