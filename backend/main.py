from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import database
from config import FRONTEND_DIST, UPLOAD_DIR
from routers import assets, auth, crm, domains, pages, templates, themes

# Initialize database
database.init_db()

app = FastAPI(
    title="LinkStudio Pro API",
    description="Taplink & Linktree Alternative - High Performance Modular Micro-landing & Bio-link Builder API",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded media assets
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(pages.router)
app.include_router(themes.router)
app.include_router(templates.router)
app.include_router(crm.router)
app.include_router(assets.router)
app.include_router(domains.router)


@app.get("/api/health")
def health_check() -> dict[str, Any]:
    return {"status": "ok", "version": "2.0.0", "service": "LinkStudio Pro"}


# Static SPA Fallback for Frontend production build
if FRONTEND_DIST.exists():
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def frontend_app(full_path: str) -> FileResponse:
        index_file = FRONTEND_DIST / "index.html"
        if not index_file.exists():
            raise HTTPException(404, "Frontend build mavjud emas. `npm run dev` orqali frontendni ishga tushiring.")
        return FileResponse(index_file)
