from __future__ import annotations

import csv
import io
import time
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Response

import database
import notifications
from auth_utils import maybe_send_telegram_notification
from models import CheckoutPayload, LeadPayload, PaymentPayload, TestTelegramPayload

router = APIRouter(tags=["crm"])


# ----------------- Leads -----------------

@router.post("/api/leads", status_code=201)
def create_lead(payload: LeadPayload) -> dict[str, Any]:
    lead = database.create_lead(
        page_slug=payload.pageSlug,
        block_id=payload.blockId,
        fields=payload.fields,
        amount=payload.amount,
        source=payload.source,
    )
    # Trigger Telegram alert
    maybe_send_telegram_notification(payload.pageSlug, "lead", lead)
    return lead


@router.get("/api/leads")
def get_leads(slug: Optional[str] = None) -> list[dict[str, Any]]:
    return database.get_leads(slug)


@router.patch("/api/leads/{lead_id}")
def update_lead_status(lead_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updated = database.update_lead(lead_id, payload)
    if not updated:
        raise HTTPException(404, "Lid topilmadi")
    return updated


@router.get("/api/leads/export")
def export_leads_csv(slug: Optional[str] = None) -> Response:
    leads_list = database.get_leads(slug)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Sana", "Sahifa", "Manba", "Summa", "Holat", "Mijoz Maydonlari"])
    for l in leads_list:
        created_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(l["createdAt"] / 1000))
        fields_summary = "; ".join(f"{k}: {v}" for k, v in l["fields"].items())
        writer.writerow([
            l["id"],
            created_str,
            l["pageSlug"],
            l["source"],
            l["amount"],
            l["status"],
            fields_summary,
        ])

    csv_data = "\ufeff" + output.getvalue()  # UTF-8 BOM for Excel compatibility
    filename = f"leads_{slug or 'all'}_{int(time.time())}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ----------------- Payments & Checkout -----------------

@router.post("/api/payments/checkout", status_code=201)
def create_checkout(payload: CheckoutPayload) -> dict[str, Any]:
    page = database.get_page_by_slug(payload.pageSlug)
    if not page:
        raise HTTPException(404, "Sahifa topilmadi")

    # If contact fields provided, create lead first
    lead_id = ""
    if payload.fields:
        lead = database.create_lead(
            page_slug=payload.pageSlug,
            block_id=payload.blockId,
            fields=payload.fields,
            amount=payload.amount,
            source=f"checkout_{payload.provider}",
        )
        lead_id = lead["id"]
        maybe_send_telegram_notification(payload.pageSlug, "lead", lead)

    payment = database.create_payment(
        page_slug=payload.pageSlug,
        lead_id=lead_id,
        product_id=payload.productId or payload.productName or "General",
        provider=payload.provider,
        amount=payload.amount,
    )

    # Trigger Telegram payment alert
    maybe_send_telegram_notification(payload.pageSlug, "payment", payment)

    # Provider specific info
    settings = page.get("settings", {})
    if not isinstance(settings, dict):
        settings = {}
    payment_providers = settings.get("paymentProviders", {})
    if not isinstance(payment_providers, dict):
        payment_providers = {}
    provider_settings = payment_providers.get(payload.provider, {})
    if not isinstance(provider_settings, dict):
        provider_settings = {}

    return {
        "payment": payment,
        "provider": payload.provider,
        "details": provider_settings,
        "message": "To'lov qabul qilindi va buyurtma CRM ga tushdi!",
    }


@router.post("/api/payments/simulate", status_code=201)
def simulate_payment(payload: PaymentPayload) -> dict[str, Any]:
    payment = database.create_payment(
        page_slug=payload.pageSlug,
        lead_id=payload.leadId,
        product_id=payload.productId,
        provider=payload.provider,
        amount=payload.amount,
    )
    maybe_send_telegram_notification(payload.pageSlug, "payment", payment)
    return payment


@router.get("/api/payments")
def get_payments(slug: Optional[str] = None) -> list[dict[str, Any]]:
    return database.get_payments(slug)


@router.patch("/api/payments/{payment_id}")
def update_payment_status(payment_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updated = database.update_payment(payment_id, payload)
    if not updated:
        raise HTTPException(404, "To'lov topilmadi")
    return updated


@router.get("/api/orders")
def get_orders(slug: Optional[str] = None) -> list[dict[str, Any]]:
    return database.get_orders(slug)


@router.patch("/api/orders/{order_id}")
def update_order_status(order_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    updated = database.update_order(order_id, payload)
    if not updated:
        raise HTTPException(404, "Buyurtma topilmadi")
    return updated


# ----------------- Webhooks -----------------

@router.post("/api/webhooks/payme")
def payme_webhook(payload: dict[str, Any]) -> dict[str, Any]:
    return {"result": {"state": 2, "message": "Payme webhook processed successfully"}}


@router.post("/api/webhooks/click")
def click_webhook(payload: dict[str, Any]) -> dict[str, Any]:
    return {"error": 0, "error_note": "Click webhook processed successfully"}


# ----------------- Notifications Test -----------------

@router.post("/api/notifications/test-telegram")
def test_telegram_notification(payload: TestTelegramPayload) -> dict[str, Any]:
    test_msg = (
        "✅ <b>LinkStudio Telegram Bot Integratsiyasi Muvaffaqiyatli!</b>\n\n"
        "Ushbu bot sahifangizga kelgan yangi lidlar, xaridlar va to'lovlar haqida sizga avtomatik xabar beradi.\n\n"
        "⏰ <i>Sana: " + time.strftime("%Y-%m-%d %H:%M:%S") + "</i>"
    )
    ok = notifications.send_telegram_message(payload.botToken, payload.chatId, test_msg)
    if not ok:
        raise HTTPException(400, "Telegram xabar yuborishda xatolik yuz berdi. Bot Token yoki Chat ID ni tekshiring.")
    return {"ok": True, "message": "Test xabar muvaffaqiyatli yuborildi! 🚀"}


# ----------------- Analytics -----------------

@router.get("/api/analytics")
def get_analytics(slug: Optional[str] = None) -> dict[str, Any]:
    return database.get_analytics(slug)
