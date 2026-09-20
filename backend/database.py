from __future__ import annotations

import json
import sqlite3
import time
import uuid
from pathlib import Path
from typing import Any, Optional

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "linkstudio.db"
JSON_FILE = DATA_DIR / "linkstudio.json"
UPLOAD_DIR = DATA_DIR / "uploads"


def now_ms() -> int:
    return int(time.time() * 1000)


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db(default_db_provider=None) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(exist_ok=True)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at INTEGER NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS pages (
        slug TEXT PRIMARY KEY,
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        workspace_id TEXT,
        title TEXT NOT NULL,
        plan TEXT DEFAULT 'business',
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        theme TEXT NOT NULL,
        settings TEXT NOT NULL,
        blocks TEXT NOT NULL,
        sub_pages TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        page_slug TEXT NOT NULL,
        block_id TEXT,
        fields TEXT NOT NULL,
        amount INTEGER DEFAULT 0,
        source TEXT DEFAULT 'form',
        status TEXT DEFAULT 'new',
        created_at INTEGER NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        payment_id TEXT,
        page_slug TEXT NOT NULL,
        status TEXT DEFAULT 'paid',
        amount INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        page_slug TEXT NOT NULL,
        lead_id TEXT,
        product_id TEXT,
        provider TEXT DEFAULT 'demo',
        amount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'paid',
        created_at INTEGER NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        page_slug TEXT NOT NULL,
        event TEXT NOT NULL,
        meta TEXT NOT NULL,
        created_at INTEGER NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        url TEXT NOT NULL,
        size_bytes INTEGER DEFAULT 0,
        mime_type TEXT DEFAULT '',
        created_at INTEGER NOT NULL
    );
    """)

    conn.commit()

    # Check if migration from JSON or initial seed is needed
    cur.execute("SELECT COUNT(*) as count FROM users")
    if cur.fetchone()["count"] == 0:
        if JSON_FILE.exists():
            migrate_from_json(conn)
        elif default_db_provider:
            seed_initial_data(conn, default_db_provider())

    conn.close()


def migrate_from_json(conn: sqlite3.Connection) -> None:
    try:
        data = json.loads(JSON_FILE.read_text("utf-8"))
        seed_initial_data(conn, data)
    except Exception as e:
        print(f"Error migrating from JSON: {e}")


def seed_initial_data(conn: sqlite3.Connection, data: dict[str, Any]) -> None:
    cur = conn.cursor()

    # Users
    for u in data.get("users", []):
        cur.execute("""
        INSERT OR IGNORE INTO users (id, email, name, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (u["id"], u["email"], u.get("name", ""), u["password_hash"], u.get("role", "user"), u.get("createdAt", now_ms())))

    # Workspaces
    for w in data.get("workspaces", []):
        cur.execute("""
        INSERT OR IGNORE INTO workspaces (id, name, owner_id, created_at)
        VALUES (?, ?, ?, ?)
        """, (w["id"], w["name"], w["ownerId"], w.get("createdAt", now_ms())))

    # Tokens
    tokens_dict = data.get("tokens", {})
    for token_str, tdata in tokens_dict.items():
        cur.execute("""
        INSERT OR IGNORE INTO tokens (token, user_id, created_at)
        VALUES (?, ?, ?)
        """, (token_str, tdata["userId"], tdata.get("createdAt", now_ms())))

    # Pages
    pages_dict = data.get("pages", {})
    for slug, p in pages_dict.items():
        cur.execute("""
        INSERT OR REPLACE INTO pages (slug, id, user_id, workspace_id, title, plan, bio, avatar, theme, settings, blocks, sub_pages, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            slug,
            p.get("id", slug),
            p.get("userId", "user_demo_1"),
            p.get("workspaceId", "ws_demo_1"),
            p.get("title", slug),
            p.get("plan", "business"),
            p.get("bio", ""),
            p.get("avatar", ""),
            json.dumps(p.get("theme", {})),
            json.dumps(p.get("settings", {})),
            json.dumps(p.get("blocks", [])),
            json.dumps(p.get("pages", [])),
            p.get("createdAt", now_ms()),
            p.get("updatedAt", now_ms()),
        ))

    # Leads
    for l in data.get("leads", []):
        cur.execute("""
        INSERT OR IGNORE INTO leads (id, page_slug, block_id, fields, amount, source, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            l["id"],
            l.get("pageSlug", ""),
            l.get("blockId", ""),
            json.dumps(l.get("fields", {})),
            l.get("amount", 0),
            l.get("source", "form"),
            l.get("status", "new"),
            l.get("createdAt", now_ms()),
        ))

    # Orders
    for o in data.get("orders", []):
        cur.execute("""
        INSERT OR IGNORE INTO orders (id, payment_id, page_slug, status, amount, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (o["id"], o.get("paymentId", ""), o.get("pageSlug", ""), o.get("status", "paid"), o.get("amount", 0), o.get("createdAt", now_ms())))

    # Payments
    for pay in data.get("payments", []):
        cur.execute("""
        INSERT OR IGNORE INTO payments (id, page_slug, lead_id, product_id, provider, amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pay["id"],
            pay.get("pageSlug", ""),
            pay.get("leadId", ""),
            pay.get("productId", ""),
            pay.get("provider", "demo"),
            pay.get("amount", 0),
            pay.get("status", "paid"),
            pay.get("createdAt", now_ms()),
        ))

    # Events
    for e in data.get("events", []):
        cur.execute("""
        INSERT OR IGNORE INTO events (id, page_slug, event, meta, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (e["id"], e.get("pageSlug", ""), e.get("event", ""), json.dumps(e.get("meta", {})), e.get("createdAt", now_ms())))

    conn.commit()


# ----------------- DB Operations -----------------

def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(user: dict[str, Any], workspace: dict[str, Any], token: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO users (id, email, name, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user["id"], user["email"], user["name"], user["password_hash"], user.get("role", "user"), user["createdAt"]))

    cur.execute("""
    INSERT INTO workspaces (id, name, owner_id, created_at)
    VALUES (?, ?, ?, ?)
    """, (workspace["id"], workspace["name"], workspace["ownerId"], workspace["createdAt"]))

    cur.execute("""
    INSERT INTO tokens (token, user_id, created_at)
    VALUES (?, ?, ?)
    """, (token, user["id"], now_ms()))

    conn.commit()
    conn.close()


def create_token(token: str, user_id: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO tokens (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now_ms()))
    conn.commit()
    conn.close()


def delete_token(token: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def get_user_by_token(token: str) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT u.* FROM users u
    JOIN tokens t ON u.id = t.user_id
    WHERE t.token = ?
    """, (token,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_first_user() -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users ORDER BY created_at ASC LIMIT 1")
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def get_workspaces_for_user(user_id: str) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM workspaces WHERE owner_id = ?", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_pages_summary(user_id: Optional[str]) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()

    if user_id:
        cur.execute("SELECT * FROM pages WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
    else:
        cur.execute("SELECT * FROM pages ORDER BY updated_at DESC")
    pages = cur.fetchall()

    results = []
    for p in pages:
        slug = p["slug"]
        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE page_slug = ? AND event = 'view'", (slug,))
        views = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE page_slug = ? AND event = 'click'", (slug,))
        clicks = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM leads WHERE page_slug = ?", (slug,))
        lead_count = cur.fetchone()["cnt"]

        blocks = json.loads(p["blocks"])

        results.append({
            "id": p["id"],
            "slug": p["slug"],
            "title": p["title"],
            "bio": p["bio"],
            "plan": p["plan"],
            "avatar": p["avatar"],
            "blocksCount": len(blocks),
            "views": views,
            "clicks": clicks,
            "leads": lead_count,
            "updatedAt": p["updated_at"],
            "createdAt": p["created_at"],
        })

    conn.close()
    return results


def get_page_by_slug(slug: str) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM pages WHERE slug = ?", (slug,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None

    return {
        "id": row["id"],
        "slug": row["slug"],
        "userId": row["user_id"],
        "workspaceId": row["workspace_id"],
        "title": row["title"],
        "plan": row["plan"],
        "bio": row["bio"],
        "avatar": row["avatar"],
        "theme": json.loads(row["theme"]),
        "settings": json.loads(row["settings"]),
        "blocks": json.loads(row["blocks"]),
        "pages": json.loads(row["sub_pages"]),
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def save_page(page: dict[str, Any]) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()

    slug = page["slug"]
    now = now_ms()
    created_at = page.get("createdAt", now)
    updated_at = now

    cur.execute("""
    INSERT INTO pages (slug, id, user_id, workspace_id, title, plan, bio, avatar, theme, settings, blocks, sub_pages, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
        title=excluded.title,
        plan=excluded.plan,
        bio=excluded.bio,
        avatar=excluded.avatar,
        theme=excluded.theme,
        settings=excluded.settings,
        blocks=excluded.blocks,
        sub_pages=excluded.sub_pages,
        updated_at=excluded.updated_at
    """, (
        slug,
        page.get("id", slug),
        page.get("userId", "user_demo_1"),
        page.get("workspaceId", "ws_demo_1"),
        page["title"],
        page.get("plan", "business"),
        page.get("bio", ""),
        page.get("avatar", ""),
        json.dumps(page.get("theme", {})),
        json.dumps(page.get("settings", {})),
        json.dumps(page.get("blocks", [])),
        json.dumps(page.get("pages", [])),
        created_at,
        updated_at,
    ))

    conn.commit()
    conn.close()
    return get_page_by_slug(slug)


def delete_page_by_slug(slug: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM pages WHERE slug = ?", (slug,))
    conn.commit()
    conn.close()


def count_pages() -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM pages")
    cnt = cur.fetchone()["cnt"]
    conn.close()
    return cnt


# ----------------- Events, Leads, Orders, Payments -----------------

def add_event(page_slug: str, event: str, meta: dict[str, Any]) -> None:
    conn = get_connection()
    cur = conn.cursor()
    event_id = uuid.uuid4().hex
    cur.execute("""
    INSERT INTO events (id, page_slug, event, meta, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (event_id, page_slug, event, json.dumps(meta), now_ms()))
    conn.commit()
    conn.close()


def create_lead(page_slug: str, block_id: str, fields: dict[str, Any], amount: int, source: str) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    lead_id = uuid.uuid4().hex
    created_at = now_ms()

    cur.execute("""
    INSERT INTO leads (id, page_slug, block_id, fields, amount, source, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    """, (lead_id, page_slug, block_id, json.dumps(fields), amount, source, created_at))

    cur.execute("""
    INSERT INTO events (id, page_slug, event, meta, created_at)
    VALUES (?, ?, 'lead', ?, ?)
    """, (uuid.uuid4().hex, page_slug, json.dumps({"leadId": lead_id, "source": source}), created_at))

    conn.commit()
    conn.close()

    return {
        "id": lead_id,
        "pageSlug": page_slug,
        "blockId": block_id,
        "fields": fields,
        "amount": amount,
        "source": source,
        "status": "new",
        "createdAt": created_at,
    }


def get_leads(slug: Optional[str] = None) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    if slug:
        cur.execute("SELECT * FROM leads WHERE page_slug = ? ORDER BY created_at DESC", (slug,))
    else:
        cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()

    return [{
        "id": r["id"],
        "pageSlug": r["page_slug"],
        "blockId": r["block_id"],
        "fields": json.loads(r["fields"]),
        "amount": r["amount"],
        "source": r["source"],
        "status": r["status"],
        "createdAt": r["created_at"],
    } for r in rows]


def update_lead(lead_id: str, patch: dict[str, Any]) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    status = patch.get("status", row["status"])
    cur.execute("UPDATE leads SET status = ? WHERE id = ?", (status, lead_id))
    conn.commit()
    conn.close()

    return {
        "id": row["id"],
        "pageSlug": row["page_slug"],
        "blockId": row["block_id"],
        "fields": json.loads(row["fields"]),
        "amount": row["amount"],
        "source": row["source"],
        "status": status,
        "createdAt": row["created_at"],
    }


def create_payment(page_slug: str, lead_id: str, product_id: str, provider: str, amount: int) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    payment_id = uuid.uuid4().hex
    order_id = uuid.uuid4().hex
    created_at = now_ms()

    cur.execute("""
    INSERT INTO payments (id, page_slug, lead_id, product_id, provider, amount, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)
    """, (payment_id, page_slug, lead_id, product_id, provider, amount, created_at))

    cur.execute("""
    INSERT INTO orders (id, payment_id, page_slug, status, amount, created_at)
    VALUES (?, ?, ?, 'paid', ?, ?)
    """, (order_id, payment_id, page_slug, amount, created_at))

    cur.execute("""
    INSERT INTO events (id, page_slug, event, meta, created_at)
    VALUES (?, ?, 'payment', ?, ?)
    """, (uuid.uuid4().hex, page_slug, json.dumps({"paymentId": payment_id, "amount": amount}), created_at))

    conn.commit()
    conn.close()

    return {
        "id": payment_id,
        "pageSlug": page_slug,
        "leadId": lead_id,
        "productId": product_id,
        "provider": provider,
        "amount": amount,
        "status": "paid",
        "createdAt": created_at,
    }


def get_payments(slug: Optional[str] = None) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    if slug:
        cur.execute("SELECT * FROM payments WHERE page_slug = ? ORDER BY created_at DESC", (slug,))
    else:
        cur.execute("SELECT * FROM payments ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": r["id"],
        "pageSlug": r["page_slug"],
        "leadId": r["lead_id"],
        "productId": r["product_id"],
        "provider": r["provider"],
        "amount": r["amount"],
        "status": r["status"],
        "createdAt": r["created_at"],
    } for r in rows]


def get_orders(slug: Optional[str] = None) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    if slug:
        cur.execute("SELECT * FROM orders WHERE page_slug = ? ORDER BY created_at DESC", (slug,))
    else:
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [{
        "id": r["id"],
        "paymentId": r["payment_id"],
        "pageSlug": r["page_slug"],
        "status": r["status"],
        "amount": r["amount"],
        "createdAt": r["created_at"],
    } for r in rows]


def update_order(order_id: str, patch: dict[str, Any]) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    status = patch.get("status", row["status"])
    cur.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()
    conn.close()

    return {
        "id": row["id"],
        "paymentId": row["payment_id"],
        "pageSlug": row["page_slug"],
        "status": status,
        "amount": row["amount"],
        "createdAt": row["created_at"],
    }


def update_payment(payment_id: str, patch: dict[str, Any]) -> Optional[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    status = patch.get("status", row["status"])
    cur.execute("UPDATE payments SET status = ? WHERE id = ?", (status, payment_id))
    conn.commit()
    conn.close()

    return {
        "id": row["id"],
        "pageSlug": row["page_slug"],
        "leadId": row["lead_id"],
        "productId": row["product_id"],
        "provider": row["provider"],
        "amount": row["amount"],
        "status": status,
        "createdAt": row["created_at"],
    }


def get_analytics(slug: Optional[str] = None) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()

    if slug:
        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE page_slug = ? AND event = 'view'", (slug,))
        views = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE page_slug = ? AND event = 'click'", (slug,))
        clicks = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM leads WHERE page_slug = ?", (slug,))
        lead_cnt = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as rev FROM payments WHERE page_slug = ? AND status = 'paid'", (slug,))
        pay_res = cur.fetchone()
        pay_cnt = pay_res["cnt"]
        revenue = pay_res["rev"]

        cur.execute("SELECT COUNT(*) as cnt FROM orders WHERE page_slug = ?", (slug,))
        order_cnt = cur.fetchone()["cnt"]

        cur.execute("SELECT * FROM events WHERE page_slug = ? ORDER BY created_at DESC LIMIT 100", (slug,))
        events_rows = cur.fetchall()
    else:
        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE event = 'view'")
        views = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM events WHERE event = 'click'")
        clicks = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt FROM leads")
        lead_cnt = cur.fetchone()["cnt"]

        cur.execute("SELECT COUNT(*) as cnt, COALESCE(SUM(amount), 0) as rev FROM payments WHERE status = 'paid'")
        pay_res = cur.fetchone()
        pay_cnt = pay_res["cnt"]
        revenue = pay_res["rev"]

        cur.execute("SELECT COUNT(*) as cnt FROM orders")
        order_cnt = cur.fetchone()["cnt"]

        cur.execute("SELECT * FROM events ORDER BY created_at DESC LIMIT 100")
        events_rows = cur.fetchall()

    conn.close()

    return {
        "views": views,
        "clicks": clicks,
        "leads": lead_cnt,
        "payments": pay_cnt,
        "orders": order_cnt,
        "revenue": revenue,
        "events": [{
            "id": r["id"],
            "pageSlug": r["page_slug"],
            "event": r["event"],
            "meta": json.loads(r["meta"]),
            "createdAt": r["created_at"],
        } for r in events_rows],
    }


# ----------------- Assets (Media Library) -----------------

def save_asset(user_id: Optional[str], filename: str, original_name: str, url: str, size_bytes: int, mime_type: str) -> dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    asset_id = uuid.uuid4().hex
    created_at = now_ms()

    cur.execute("""
    INSERT INTO assets (id, user_id, filename, original_name, url, size_bytes, mime_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (asset_id, user_id, filename, original_name, url, size_bytes, mime_type, created_at))

    conn.commit()
    conn.close()

    return {
        "id": asset_id,
        "userId": user_id,
        "filename": filename,
        "originalName": original_name,
        "url": url,
        "sizeBytes": size_bytes,
        "mimeType": mime_type,
        "createdAt": created_at,
    }


def get_assets(user_id: Optional[str] = None) -> list[dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    if user_id:
        cur.execute("SELECT * FROM assets WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC", (user_id,))
    else:
        cur.execute("SELECT * FROM assets ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()

    return [{
        "id": r["id"],
        "userId": r["user_id"],
        "filename": r["filename"],
        "originalName": r["original_name"],
        "url": r["url"],
        "sizeBytes": r["size_bytes"],
        "mimeType": r["mime_type"],
        "createdAt": r["created_at"],
    } for r in rows]


def delete_asset(asset_id: str) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM assets WHERE id = ?", (asset_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return False

    filename = row["filename"]
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass

    cur.execute("DELETE FROM assets WHERE id = ?", (asset_id,))
    conn.commit()
    conn.close()
    return True
