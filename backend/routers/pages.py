from __future__ import annotations

import secrets
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status

import database
from auth_utils import get_current_user, now_ms
from models import PagePayload, TrackPayload
from routers.templates import TEMPLATES_CATALOG
from routers.themes import THEMES_CATALOG

router = APIRouter(tags=["pages"])


@router.get("/api/user/pages")
def user_pages(authorization: Optional[str] = Header(None)) -> list[dict[str, Any]]:
    user = get_current_user(authorization)
    user_id = user["id"] if user else None
    return database.get_user_pages_summary(user_id)


@router.get("/api/pages")
def list_pages() -> list[dict[str, Any]]:
    return database.get_user_pages_summary(None)


@router.post("/api/pages", status_code=201)
def create_page(payload: PagePayload, authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    user = get_current_user(authorization)
    first_u = database.get_first_user()
    user_id = user["id"] if user else (first_u["id"] if first_u else "user_demo_1")

    slug = payload.slug.strip().lower().replace(" ", "-")
    if not slug:
        slug = f"page-{secrets.token_hex(3)}"

    existing = database.get_page_by_slug(slug)
    if existing:
        raise HTTPException(409, f"'{slug}' nomli sahifa allaqachon mavjud. Boshqa nom tanlang.")

    blocks = payload.blocks
    theme = payload.theme or THEMES_CATALOG[0]
    if payload.templateId:
        for tmpl in TEMPLATES_CATALOG:
            if tmpl["id"] == payload.templateId:
                blocks = tmpl["blocks"]
                if "theme" in tmpl:
                    theme = tmpl["theme"]
                break

    if not blocks:
        blocks = TEMPLATES_CATALOG[0]["blocks"]

    page_data = {
        "id": slug,
        "slug": slug,
        "userId": user_id,
        "title": payload.title.strip() or f"Sahifa {slug}",
        "plan": payload.plan or "business",
        "bio": payload.bio or "",
        "avatar": payload.avatar or "",
        "theme": theme,
        "settings": payload.settings or {
            "customDomain": "",
            "seoTitle": payload.title or slug,
            "seoDescription": "Link-in-bio sahifa",
            "hideBranding": False,
            "pixels": "",
            "notifications": {"email": user["email"] if user else "", "telegramBotToken": "", "telegramChatId": ""},
            "paymentProviders": {
                "manual": {"enabled": True, "cardNumber": "", "cardHolder": ""},
                "click": {"enabled": True, "serviceId": "", "merchantId": ""},
                "payme": {"enabled": True, "merchantId": ""},
            },
        },
        "blocks": blocks,
        "pages": payload.pages or [],
        "createdAt": now_ms(),
        "updatedAt": now_ms(),
    }

    return database.save_page(page_data)


@router.get("/api/pages/{slug}")
def get_page(slug: str) -> dict[str, Any]:
    page = database.get_page_by_slug(slug)
    if not page:
        raise HTTPException(404, "Sahifa topilmadi")
    return page


@router.put("/api/pages/{slug}")
def update_page(slug: str, payload: PagePayload, authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    existing = database.get_page_by_slug(slug)
    if not existing:
        raise HTTPException(404, "Sahifa topilmadi")

    page = payload.model_dump(exclude_unset=True)
    page["id"] = slug
    page["slug"] = slug
    page["userId"] = existing.get("userId", "user_demo_1")
    page["workspaceId"] = existing.get("workspaceId", "ws_demo_1")
    page["createdAt"] = existing.get("createdAt", now_ms())
    page["updatedAt"] = now_ms()

    return database.save_page(page)


@router.delete("/api/pages/{slug}")
def delete_page(slug: str, authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    existing = database.get_page_by_slug(slug)
    if not existing:
        raise HTTPException(404, "Sahifa topilmadi")

    if database.count_pages() <= 1:
        raise HTTPException(400, "So'nggi qolgan sahifani o'chirib bo'lmaydi")

    database.delete_page_by_slug(slug)
    return {"ok": True, "deleted": slug}


# ----------------- Public View & Interactivity -----------------

@router.get("/api/public/{slug}")
def public_page(slug: str) -> dict[str, Any]:
    page = database.get_page_by_slug(slug)
    if not page:
        raise HTTPException(404, "Sahifa topilmadi")
    database.add_event(slug, "view", {})
    return page


@router.post("/api/track", status_code=201)
def track(payload: TrackPayload) -> dict[str, bool]:
    database.add_event(payload.pageSlug, payload.event, payload.meta)
    return {"ok": True}


@router.get("/api/features")
def features_matrix() -> dict[str, list[str]]:
    return {
        "basic": ["tayyor dizaynlar", "custom design", "cheksiz link", "text blocks", "custom block basic", "messenger/social links", "maps", "page views", "shared access", "QR code"],
        "pro": ["landing templates", "images/video/music", "price lists", "custom HTML", "social pixels", "scheduled blocks", "click analytics", "advanced custom block"],
        "business": ["internal pages", "digital products", "forms", "payments", "hide branding", "CRM", "automatic emails", "lead/payment notifications", "countdown timer", "custom domain", "SSL field", "business modules", "online store", "cash register integration placeholder"],
    }
