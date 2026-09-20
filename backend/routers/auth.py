from __future__ import annotations

import secrets
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status

import database
from auth_utils import (
    get_current_user,
    hash_password,
    now_ms,
    sanitize_user,
    verify_password,
)
from models import LoginPayload, RegisterPayload

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(payload: RegisterPayload) -> dict[str, Any]:
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "To'g'ri email kiriting")
    if len(payload.password) < 6:
        raise HTTPException(400, "Parol kamida 6 belgidan iborat bo'lishi kerak")

    existing = database.get_user_by_email(email)
    if existing:
        raise HTTPException(409, "Ushbu email bilan ro'yxatdan o'tilgan")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    workspace_id = f"ws_{uuid.uuid4().hex[:12]}"
    token = secrets.token_urlsafe(32)

    user_obj = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip() or email.split("@")[0].capitalize(),
        "password_hash": hash_password(payload.password),
        "role": "user",
        "createdAt": now_ms(),
    }

    workspace_obj = {
        "id": workspace_id,
        "name": f"{user_obj['name']}'s Workspace",
        "ownerId": user_id,
        "createdAt": now_ms(),
    }

    database.create_user(user_obj, workspace_obj, token)

    # Starter page
    user_slug = f"page-{secrets.token_hex(3)}"
    initial_page = {
        "id": user_slug,
        "slug": user_slug,
        "userId": user_id,
        "workspaceId": workspace_id,
        "plan": "business",
        "title": f"{user_obj['name']} Sahifasi",
        "bio": "LinkStudio orqali yaratilgan yangi link-in-bio sahifasi.",
        "avatar": "",
        "theme": {
            "backgroundType": "solid",
            "background": "#f8fafc",
            "surface": "#ffffff",
            "text": "#0f172a",
            "accent": "#0f766e",
            "radius": 12,
            "blur": 0,
            "overlayOpacity": 0,
            "overlayColor": "#000000",
            "buttonStyle": "solid",
        },
        "settings": {
            "customDomain": "",
            "seoTitle": f"{user_obj['name']} Sahifasi",
            "seoDescription": "Link-in-bio mini sayti",
            "hideBranding": False,
            "pixels": "",
            "notifications": {"email": email, "telegramBotToken": "", "telegramChatId": ""},
            "paymentProviders": {
                "manual": {"enabled": True, "cardNumber": "", "cardHolder": ""},
                "click": {"enabled": True, "serviceId": "", "merchantId": ""},
                "payme": {"enabled": True, "merchantId": ""},
            },
        },
        "blocks": [
            {"id": "hero1", "type": "avatar", "title": user_obj["name"], "subtitle": "Mening havolalarim"},
            {"id": "link1", "type": "link", "title": "Telegram Kanalim", "url": "https://t.me/example"},
            {"id": "link2", "type": "link", "title": "Instagram Profil", "url": "https://instagram.com/example"},
        ],
        "pages": [],
        "createdAt": now_ms(),
        "updatedAt": now_ms(),
    }
    database.save_page(initial_page)

    return {
        "token": token,
        "user": sanitize_user(user_obj),
        "firstSlug": user_slug,
    }


@router.post("/login")
def login(payload: LoginPayload) -> dict[str, Any]:
    email = payload.email.strip().lower()
    target_user = database.get_user_by_email(email)

    if not target_user or not verify_password(payload.password, target_user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")

    token = secrets.token_urlsafe(32)
    database.create_token(token, target_user["id"])

    return {
        "token": token,
        "user": sanitize_user(target_user),
    }


@router.get("/me")
def get_me(authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    user = get_current_user(authorization)
    if not user:
        user = database.get_first_user()
        if not user:
            raise HTTPException(401, "Autentifikatsiyadan o'tilmagan")

    workspaces = database.get_workspaces_for_user(user["id"])
    return {
        "user": sanitize_user(user),
        "workspaces": workspaces,
    }


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    if authorization:
        token = authorization.strip()
        if token.lower().startswith("bearer "):
            token = token[7:].strip()
        database.delete_token(token)
    return {"message": "Tizimdan muvaffaqiyatli chiqildi"}
