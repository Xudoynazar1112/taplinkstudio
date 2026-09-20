from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


class RegisterPayload(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginPayload(BaseModel):
    email: str
    password: str


class PagePayload(BaseModel):
    title: str
    slug: str
    plan: str = "business"
    bio: str = ""
    avatar: str = ""
    theme: dict[str, Any] = Field(default_factory=dict)
    settings: dict[str, Any] = Field(default_factory=dict)
    blocks: list[dict[str, Any]] = Field(default_factory=list)
    pages: list[dict[str, Any]] = Field(default_factory=list)
    templateId: Optional[str] = None


class LeadPayload(BaseModel):
    pageSlug: str
    blockId: str = ""
    fields: dict[str, Any] = Field(default_factory=dict)
    amount: int = 0
    source: str = "form"


class TrackPayload(BaseModel):
    pageSlug: str
    event: str
    meta: dict[str, Any] = Field(default_factory=dict)


class PaymentPayload(BaseModel):
    pageSlug: str
    leadId: str = ""
    productId: str = ""
    provider: str = "demo"
    amount: int = 0


class CheckoutPayload(BaseModel):
    pageSlug: str
    blockId: str = ""
    productId: str = ""
    productName: str = ""
    amount: int = 0
    provider: str = "manual"  # manual | payme | click
    fields: dict[str, Any] = Field(default_factory=dict)


class DomainPayload(BaseModel):
    domain: str
    pageSlug: str


class TestTelegramPayload(BaseModel):
    botToken: str
    chatId: str
