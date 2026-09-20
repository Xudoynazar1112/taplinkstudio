from __future__ import annotations

import json
import urllib.parse
import urllib.request
from typing import Any, Optional


def send_telegram_message(bot_token: str, chat_id: str, text: str) -> bool:
    if not bot_token or not chat_id or not text:
        return False

    url = f"https://api.telegram.org/bot{bot_token.strip()}/sendMessage"
    payload = {
        "chat_id": chat_id.strip(),
        "text": text,
        "parse_mode": "HTML",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status == 200
    except Exception as e:
        print(f"[Telegram Notification Error]: {e}")
        return False


def format_lead_message(page_title: str, page_slug: str, lead: dict[str, Any]) -> str:
    fields = lead.get("fields", {})
    amount = lead.get("amount", 0)
    source = lead.get("source", "form")

    field_lines = []
    for k, v in fields.items():
        field_lines.append(f"• <b>{k}:</b> {v}")

    fields_text = "\n".join(field_lines) if field_lines else "<i>Ma'lumotlar yo'q</i>"
    amount_text = f"\n💰 <b>Summa:</b> {amount:,} so'm" if amount > 0 else ""

    return (
        f"🔔 <b>Yangi Ariza (Lid)!</b>\n"
        f"📄 <b>Sahifa:</b> {page_title} (<code>/p/{page_slug}</code>)\n"
        f"📌 <b>Manba:</b> {source}\n"
        f"{amount_text}\n\n"
        f"👤 <b>Mijoz ma'lumotlari:</b>\n"
        f"{fields_text}\n\n"
        f"⏰ <i>LinkStudio CRM tizimi</i>"
    )


def format_payment_message(page_title: str, page_slug: str, payment: dict[str, Any]) -> str:
    amount = payment.get("amount", 0)
    provider = payment.get("provider", "demo").upper()
    product = payment.get("productId", "Mahsulot")

    return (
        f"🎉 <b>Yangi To'lov Qabul Qilindi!</b>\n"
        f"📄 <b>Sahifa:</b> {page_title} (<code>/p/{page_slug}</code>)\n"
        f"🛍 <b>Mahsulot:</b> {product}\n"
        f"💳 <b>To'lov usuli:</b> {provider}\n"
        f"💰 <b>Summa:</b> {amount:,} so'm\n"
        f"✅ <b>Holati:</b> Muvaffaqiyatli (Paid)\n\n"
        f"⏰ <i>LinkStudio CRM tizimi</i>"
    )
