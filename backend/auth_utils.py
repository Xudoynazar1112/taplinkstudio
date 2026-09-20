from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Any, Optional

from fastapi import Header, HTTPException, status
import database
import notifications


def now_ms() -> int:
    return int(time.time() * 1000)


def hash_password(password: str, salt: Optional[str] = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    if not hashed or ":" not in hashed:
        return False
    salt, key_hex = hashed.split(":", 1)
    expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return hmac.compare_digest(key_hex, expected.hex())


def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict[str, Any]]:
    if not authorization:
        return None
    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    user = database.get_user_by_token(token)
    if not user:
        user = database.get_user_by_id(token)
    return user


def require_current_user(authorization: Optional[str] = Header(None)) -> dict[str, Any]:
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tizimga kirish talab qilinadi.",
        )
    return user


def sanitize_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "createdAt": user.get("created_at", now_ms()),
    }


def maybe_send_telegram_notification(page_slug: str, notif_type: str, payload: dict[str, Any]) -> None:
    try:
        page = database.get_page_by_slug(page_slug)
        if not page:
            return
        settings = page.get("settings", {})
        if not isinstance(settings, dict):
            settings = {}

        alerts = settings.get("telegramAlerts") or settings.get("notifications") or {}
        if not isinstance(alerts, dict):
            alerts = {}

        if alerts.get("enabled") is False:
            return

        bot_token = (alerts.get("botToken") or alerts.get("telegramBotToken") or "").strip()
        chat_id = (alerts.get("chatId") or alerts.get("telegramChatId") or "").strip()

        if not bot_token or not chat_id:
            return

        page_title = page.get("title", page_slug)

        if notif_type == "lead":
            msg = notifications.format_lead_message(page_title, page_slug, payload)
        elif notif_type == "payment":
            msg = notifications.format_payment_message(page_title, page_slug, payload)
        else:
            return

        notifications.send_telegram_message(bot_token, chat_id, msg)
    except Exception as e:
        print(f"Telegram notification dispatch error: {e}")
