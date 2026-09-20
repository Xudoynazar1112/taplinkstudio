from __future__ import annotations

import mimetypes
import shutil
import uuid
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, File, Header, HTTPException, UploadFile

from config import UPLOAD_DIR
import database
from auth_utils import get_current_user

router = APIRouter(prefix="/api", tags=["assets"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
) -> dict[str, Any]:
    user = get_current_user(authorization)
    first_u = database.get_first_user()
    user_id = user["id"] if user else (first_u["id"] if first_u else None)

    ext = Path(file.filename or "file.bin").suffix.lower()
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm", ".pdf", ".mp3"}
    if ext not in allowed_exts:
        raise HTTPException(400, f"Ruxsat berilmagan fayl formati: {ext}. Ruxsat etilgan: {', '.join(allowed_exts)}")

    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = UPLOAD_DIR / filename

    try:
        with dest_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(500, f"Faylni saqlashda xatolik: {e}")

    file_size = dest_path.stat().st_size
    mime_type, _ = mimetypes.guess_type(dest_path.name)
    url = f"/uploads/{filename}"

    asset = database.save_asset(
        user_id=user_id,
        filename=filename,
        original_name=file.filename or filename,
        url=url,
        size_bytes=file_size,
        mime_type=mime_type or "application/octet-stream",
    )

    return asset


@router.get("/assets")
def list_assets(authorization: Optional[str] = Header(None)) -> list[dict[str, Any]]:
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    return database.get_assets(user_id)


@router.delete("/assets/{asset_id}")
def delete_media_asset(asset_id: str, authorization: Optional[str] = Header(None)) -> dict[str, bool]:
    success = database.delete_asset(asset_id)
    if not success:
        raise HTTPException(404, "Fayl topilmadi")
    return {"ok": True}
