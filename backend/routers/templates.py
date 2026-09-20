from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from auth_utils import now_ms

router = APIRouter(prefix="/api/templates", tags=["templates"])


TEMPLATES_CATALOG: list[dict[str, Any]] = [
    {
        "id": "business-services",
        "name": "Business & Xizmatlar",
        "category": "business",
        "desc": "Konsalting, marketing agentliklari va xizmat ko'rsatish sohalari uchun",
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
        "blocks": [
            {"id": "hero1", "type": "avatar", "title": "Studio Nova", "subtitle": "Marketing, Brending va Dizayn xizmatlari"},
            {"id": "msg1", "type": "messengers", "title": "Tezkor aloqa", "items": [{"label": "Telegram", "url": "https://t.me/example"}, {"label": "WhatsApp", "url": "https://wa.me/998901234567"}]},
            {"id": "price1", "type": "pricing", "title": "Xizmat Paketlari", "plans": [{"name": "Start", "price": 490000, "features": ["To'liq Audit", "Strategik Reja", "1 Konsultatsiya"], "button": "Tanlash"}, {"name": "Pro Business", "price": 1500000, "features": ["Landing Sahifa", "CRM Forma", "Analitika Integratsiya"], "button": "Buyurtma berish"}]},
            {"id": "reviews1", "type": "reviews", "title": "Mijozlarimiz fikrlari", "items": [{"id": "r1", "name": "Alisher Qodirov", "role": "Tadbirkor", "avatar": "", "verified": True, "rating": 5, "comment": "Ajoyib natija! Xizmatdan juda mamnunmiz."}]},
            {"id": "form1", "type": "form", "title": "Bepul konsultatsiyaga yoziling", "fields": [{"name": "name", "label": "Ismingiz", "required": True}, {"name": "phone", "label": "Telefon raqamingiz", "required": True}], "payment": {"enabled": False, "amount": 0}},
        ],
    },
    {
        "id": "creator-bio",
        "name": "Creator & Bloger Bio",
        "category": "creator",
        "desc": "Blogerlar, ekspertlar va ijtimoiy tarmoq faollari uchun",
        "theme": {
            "backgroundType": "gradient",
            "background": "linear-gradient(135deg, #0f172a 0%, #2e0854 50%, #4c0519 100%)",
            "surface": "rgba(30, 41, 59, 0.75)",
            "text": "#f8fafc",
            "accent": "#38bdf8",
            "radius": 14,
            "blur": 16,
            "overlayOpacity": 20,
            "overlayColor": "#000000",
            "buttonStyle": "solid",
            "animation": "neonGlow",
        },
        "blocks": [
            {"id": "avatar2", "type": "avatar", "title": "Jahongir Mirzo", "subtitle": "Dasturchi, Tech Bloger & Mentor"},
            {"id": "stories2", "type": "stories", "items": [{"id": "s1", "title": "Portfolio", "mediaType": "image", "mediaUrl": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop", "cover": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop", "caption": "Yangi loyihalarim"}, {"id": "s2", "title": "Darslar", "mediaType": "image", "mediaUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop", "cover": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop", "caption": "Master-klasslar"}]},
            {"id": "links2", "type": "links", "title": "Mening havolalarim", "items": [{"label": "YouTube Kanalim", "url": "https://youtube.com"}, {"label": "Telegram Blog", "url": "https://t.me/example"}, {"label": "Instagram Profil", "url": "https://instagram.com"}]},
            {"id": "video2", "type": "video", "title": "Oxirgi darslik videoyim", "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"},
            {"id": "faq2", "type": "faq", "title": "Ko'p beriladigan savollar (FAQ)", "items": [{"q": "Hamkorlik yoki reklama qilasizmi?", "a": "Ha, briefni Telegram botimga yuborishingiz mumkin."}, {"q": "Kurslaringiz qachon boshlanadi?", "a": "Har oyning 1-sanasida yangi guruh ochiladi."}]},
        ],
    },
    {
        "id": "shop-store",
        "name": "E-Commerce & Mini Do'kon",
        "category": "store",
        "desc": "Mahsulotlar katalogi, tezkor xarid, timer va to'lovlar bilan",
        "theme": {
            "backgroundType": "gradient",
            "background": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            "surface": "rgba(255, 255, 255, 0.28)",
            "text": "#ffffff",
            "accent": "#0284c7",
            "radius": 14,
            "blur": 16,
            "overlayOpacity": 10,
            "overlayColor": "#000000",
            "buttonStyle": "glass",
        },
        "blocks": [
            {"id": "avatar3", "type": "avatar", "title": "Trendy Shop", "subtitle": "Sifatli mahsulotlar va butun O'zbekiston bo'ylab tez yetkazib berish"},
            {"id": "timer3", "type": "timer", "title": "Mavsumiy chegirma tugashiga:", "deadline": now_ms() + 172800000},
            {"id": "products3", "type": "products", "title": "Top Mahsulotlar", "layout": "grid", "items": [{"id": "p1", "name": "Premium Smart Soat", "price": 350000, "oldPrice": 490000, "description": "AMOLED ekran, 10 kun batareya"}, {"id": "p2", "name": "Simsiz Quloqchin Pro", "price": 220000, "oldPrice": 320000, "description": "ANC shovqinni bekor qilish"}]},
            {"id": "reviews3", "type": "reviews", "title": "Xaridorlar sharhlari", "items": [{"id": "r2", "name": "Dilnoza R.", "role": "Toshkent", "verified": True, "rating": 5, "comment": "Buyurtma ertasi kuniyoq yetib keldi, sifatiga gap yo'q!"}]},
            {"id": "form3", "type": "form", "title": "Tezkor buyurtma berish", "fields": [{"name": "name", "label": "Ismingiz", "required": True}, {"name": "phone", "label": "Telefon raqamingiz", "required": True}, {"name": "address", "label": "Yetkazish manzili", "required": True}], "payment": {"enabled": True, "amount": 350000}},
        ],
    },
    {
        "id": "beauty-salon",
        "name": "Go'zallik Saloni & Kosmetologiya",
        "category": "beauty",
        "desc": "Spa, kosmetika, makiyaj va go'zallik salonlari uchun",
        "theme": {
            "backgroundType": "gradient",
            "background": "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
            "surface": "rgba(255, 255, 255, 0.45)",
            "text": "#1e293b",
            "accent": "#ec4899",
            "radius": 16,
            "blur": 16,
            "overlayOpacity": 0,
            "overlayColor": "#000000",
            "buttonStyle": "solid",
        },
        "blocks": [
            {"id": "b_avatar", "type": "avatar", "title": "Esthetic Beauty Studio", "subtitle": "Professional kosmetologiya va go'zallik xizmatlari"},
            {"id": "b_links", "type": "links", "title": "Bizning xizmatlar", "items": [{"label": "Yuz parvarishi & Chistka", "url": "#booking"}, {"label": "Lazer epilatsiyasi", "url": "#booking"}, {"label": "Makiyaj va soch turmaklash", "url": "#booking"}]},
            {"id": "b_reviews", "type": "reviews", "title": "Mijozlar minnatdorchiligi", "items": [{"id": "br1", "name": "Madina Karimova", "role": "Mijoz", "verified": True, "rating": 5, "comment": "Ustalar juda e'tiborli va muloyim. Natija a'lo darajada!"}]},
            {"id": "b_form", "type": "form", "title": "Navbatga yozilish", "fields": [{"name": "name", "label": "Ismingiz", "required": True}, {"name": "phone", "label": "Telefoningiz", "required": True}, {"name": "service", "label": "Qaysi xizmat kerak?", "required": True}]},
        ],
    },
    {
        "id": "restaurant-cafe",
        "name": "Restoran & Qahvaxona Menyusi",
        "category": "restaurant",
        "desc": "Restoran, kafe, qahvaxona taomnoma va stol band qilish",
        "theme": {
            "backgroundType": "image",
            "backgroundMedia": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop",
            "background": "#292524",
            "surface": "rgba(255, 255, 255, 0.28)",
            "text": "#ffffff",
            "accent": "#d97706",
            "radius": 14,
            "blur": 16,
            "overlayOpacity": 40,
            "overlayColor": "#1c1917",
            "buttonStyle": "glass",
        },
        "blocks": [
            {"id": "r_avatar", "type": "avatar", "title": "Coffee & Bakery Lounge", "subtitle": "Shinam muhit, yangi qovurilgan qahva va mazali pishiriqlar"},
            {"id": "r_links", "type": "links", "title": "Onlayn menyu", "items": [{"label": "Qahva & Ichimliklar", "url": "https://example.com/drinks"}, {"label": "Shirinliklar & Desertlar", "url": "https://example.com/deserts"}]},
            {"id": "r_map", "type": "map", "title": "Bizning manzil", "address": "Toshkent sh., Amir Temur shox ko'chasi, 45", "url": "https://yandex.uz/maps"},
            {"id": "r_form", "type": "form", "title": "Stol band qilish (Reservation)", "fields": [{"name": "name", "label": "Ismingiz", "required": True}, {"name": "phone", "label": "Telefon", "required": True}, {"name": "guests", "label": "Mehmonlar soni", "required": True}, {"name": "date", "label": "Sana va vaqt", "required": True}]},
        ],
    },
    {
        "id": "fitness-coach",
        "name": "Fitness Trener & Sport",
        "category": "fitness",
        "desc": "Shaxsiy fitnes trenerlar, zal va to'g'ri ovqatlanish kurslari",
        "theme": {
            "backgroundType": "image",
            "backgroundMedia": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop",
            "background": "#09090b",
            "surface": "rgba(24, 24, 27, 0.8)",
            "text": "#fafafa",
            "accent": "#ef4444",
            "radius": 10,
            "blur": 14,
            "overlayOpacity": 45,
            "overlayColor": "#000000",
            "buttonStyle": "solid",
            "animation": "pulse",
        },
        "blocks": [
            {"id": "f_avatar", "type": "avatar", "title": "Coach Rustam", "subtitle": "Professional fitnes trener | 500+ o'quvchilar natijasi"},
            {"id": "f_pricing", "type": "pricing", "title": "Mashg'ulot Dasturlari", "plans": [{"name": "Online Reja", "price": 250000, "features": ["Shaxsiy menyu", "Uy mashqlari", "Telegram nazorat"], "button": "Qo'shilish"}, {"name": "Zalda VIP Trening", "price": 900000, "features": ["Zalda 12 ta dars", "To'liq ratsion", "24/7 aloqa"], "button": "Boshlash"}]},
            {"id": "f_form", "type": "form", "title": "Dasturga ariza qoldiring", "fields": [{"name": "name", "label": "Ismingiz", "required": True}, {"name": "phone", "label": "Telefoningiz", "required": True}, {"name": "goal", "label": "Maqsadingiz (Ozish / Mushak yig'ish)", "required": True}]},
        ],
    },
]


@router.get("")
def get_templates() -> list[dict[str, Any]]:
    return TEMPLATES_CATALOG
