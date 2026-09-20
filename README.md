# LinkStudio

FastAPI + React asosidagi Taplink turidagi platforma. Bu loyiha Taplink'ning yopiq kodi, brendi yoki proprietary dizaynini ko'chirmaydi; ommaviy hujjatlar va tariflarda ko'rsatilgan imkoniyatlarga mos mustaqil clone variantini beradi.

## Ishga tushirish

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Admin: `http://127.0.0.1:5173`

Public demo: `http://127.0.0.1:5173/p/demo`

API docs: `http://127.0.0.1:8000/docs`

## Qamrab olingan imkoniyatlar

- Basic: tayyor dizaynlar, custom design, cheksiz linklar, text/custom blocks, messenger/social links, maps, page views, shared access va QR placeholder.
- Pro: templates, image/video/carousel, price/pricing blocks, custom HTML, pixels/custom code, scheduled visibility, click analytics.
- Business: internal pages data modeli, digital products, forms, payment simulation, brandingni yashirish, CRM/leads, notifications settings, countdown timer, custom domain/SSL field, online store/orders.

## Development roadmap

1. Builder ergonomikasi: block-specific inspector, drag-and-drop reorder, live phone preview, theme/template library. Status: done.
2. Production backend: auth, users/workspaces, PostgreSQL, file uploads, media library, role/shared access.
3. Commerce: real payment adapters, order statuses, delivery files, coupons, shipping/tax settings, provider webhooks.
4. Business automation: email templates, Telegram/email notifications, CRM pipeline, lead export.
5. Publishing: custom domain verification, SSL provisioning integration, QR generator, SEO/OpenGraph.
6. Advanced custom block: canvas/grid layer editor with resize, lock/hide layers, element-level actions and responsive rules.

## Asosiy API

- `GET /api/features`
- `GET /api/templates`
- `GET /api/themes`
- `GET|POST /api/pages`
- `GET|PUT /api/pages/{slug}`
- `GET /api/public/{slug}`
- `POST /api/leads`
- `GET /api/leads`
- `POST /api/payments/simulate`
- `GET /api/payments`
- `GET /api/orders`
- `POST /api/track`
- `GET /api/analytics`
