from flask import Flask, render_template, jsonify, request
import sqlite3, json, datetime, random, os

app = Flask(__name__)
DB = "data/prices.db"

# ─────────────────────────────────────────
# Database setup
# ─────────────────────────────────────────
def init_db():
    os.makedirs("data", exist_ok=True)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prices (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            item      TEXT NOT NULL,
            category  TEXT NOT NULL,
            platform  TEXT NOT NULL,
            price     REAL NOT NULL,
            unit      TEXT NOT NULL,
            pincode   TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    con.commit()
    con.close()

def get_db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

# ─────────────────────────────────────────
# Seed data (realistic Hyderabad prices ₹)
# ─────────────────────────────────────────
ITEMS = {
    "Vegetables": {
        "Tomato":      {"Blinkit": 28, "BigBasket": 25, "JioMart": 30, "unit": "1 kg"},
        "Onion":       {"Blinkit": 35, "BigBasket": 32, "JioMart": 38, "unit": "1 kg"},
        "Potato":      {"Blinkit": 22, "BigBasket": 20, "JioMart": 24, "unit": "1 kg"},
        "Carrot":      {"Blinkit": 45, "BigBasket": 40, "JioMart": 48, "unit": "500 g"},
        "Capsicum":    {"Blinkit": 60, "BigBasket": 55, "JioMart": 65, "unit": "250 g"},
        "Spinach":     {"Blinkit": 20, "BigBasket": 18, "JioMart": 22, "unit": "250 g"},
    },
    "Fruits": {
        "Banana":      {"Blinkit": 48, "BigBasket": 44, "JioMart": 50, "unit": "1 dozen"},
        "Apple":       {"Blinkit": 120, "BigBasket": 110, "JioMart": 130, "unit": "1 kg"},
        "Mango":       {"Blinkit": 90, "BigBasket": 85, "JioMart": 95, "unit": "1 kg"},
        "Grapes":      {"Blinkit": 80, "BigBasket": 75, "JioMart": 85, "unit": "500 g"},
    },
    "Dairy": {
        "Amul Milk":   {"Blinkit": 66, "BigBasket": 64, "JioMart": 66, "unit": "1 L"},
        "Curd":        {"Blinkit": 50, "BigBasket": 48, "JioMart": 52, "unit": "500 g"},
        "Paneer":      {"Blinkit": 95, "BigBasket": 90, "JioMart": 100, "unit": "200 g"},
        "Butter":      {"Blinkit": 55, "BigBasket": 52, "JioMart": 58, "unit": "100 g"},
    },
    "Grains": {
        "Basmati Rice":{"Blinkit": 120, "BigBasket": 115, "JioMart": 125, "unit": "1 kg"},
        "Atta":        {"Blinkit": 55, "BigBasket": 52, "JioMart": 58, "unit": "1 kg"},
        "Toor Dal":    {"Blinkit": 145, "BigBasket": 140, "JioMart": 150, "unit": "1 kg"},
        "Moong Dal":   {"Blinkit": 130, "BigBasket": 125, "JioMart": 135, "unit": "1 kg"},
    },
    "Essentials": {
        "Sunflower Oil":{"Blinkit": 135, "BigBasket": 128, "JioMart": 140, "unit": "1 L"},
        "Sugar":        {"Blinkit": 45, "BigBasket": 42, "JioMart": 48, "unit": "1 kg"},
        "Salt":         {"Blinkit": 20, "BigBasket": 18, "JioMart": 22, "unit": "1 kg"},
        "Turmeric":     {"Blinkit": 30, "BigBasket": 28, "JioMart": 32, "unit": "100 g"},
    },
}

PLATFORMS = ["Blinkit", "BigBasket", "JioMart"]
PINCODES  = ["500001", "500032", "500072", "500081", "500034"]

def seed_data():
    con = get_db()
    cur = con.cursor()
    cur.execute("SELECT COUNT(*) FROM prices")
    if cur.fetchone()[0] > 0:
        con.close()
        return
    now = datetime.datetime.now()
    rows = []
    for day_offset in range(7):
        ts = (now - datetime.timedelta(days=day_offset)).strftime("%Y-%m-%d %H:%M:%S")
        for pincode in PINCODES:
            for category, items in ITEMS.items():
                for item, data in items.items():
                    for platform in PLATFORMS:
                        base  = data[platform]
                        noise = random.uniform(-0.05, 0.07)
                        price = round(base * (1 + noise), 1)
                        rows.append((item, category, platform, price, data["unit"], pincode, ts))
    cur.executemany(
        "INSERT INTO prices (item,category,platform,price,unit,pincode,timestamp) VALUES (?,?,?,?,?,?,?)",
        rows
    )
    con.commit()
    con.close()

# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/categories")
def categories():
    return jsonify(list(ITEMS.keys()))

@app.route("/api/items")
def items():
    category = request.args.get("category", "Vegetables")
    return jsonify(list(ITEMS.get(category, {}).keys()))

@app.route("/api/compare")
def compare():
    item    = request.args.get("item", "Tomato")
    pincode = request.args.get("pincode", "500001")
    con     = get_db()
    cur     = con.cursor()
    cur.execute("""
        SELECT platform, price, unit, timestamp
        FROM prices
        WHERE item=? AND pincode=?
        ORDER BY timestamp DESC
    """, (item, pincode))
    rows = cur.fetchall()
    con.close()
    latest = {}
    for r in rows:
        if r["platform"] not in latest:
            latest[r["platform"]] = {
                "platform": r["platform"],
                "price":    r["price"],
                "unit":     r["unit"],
                "timestamp": r["timestamp"]
            }
    result = sorted(latest.values(), key=lambda x: x["price"])
    return jsonify(result)

@app.route("/api/history")
def history():
    item     = request.args.get("item", "Tomato")
    platform = request.args.get("platform", "Blinkit")
    pincode  = request.args.get("pincode", "500001")
    con      = get_db()
    cur      = con.cursor()
    cur.execute("""
        SELECT date(timestamp) as day, AVG(price) as avg_price
        FROM prices
        WHERE item=? AND platform=? AND pincode=?
        GROUP BY day ORDER BY day
    """, (item, platform, pincode))
    rows = [{"day": r["day"], "price": round(r["avg_price"], 1)} for r in cur.fetchall()]
    con.close()
    return jsonify(rows)

@app.route("/api/cheapest")
def cheapest():
    pincode  = request.args.get("pincode", "500001")
    category = request.args.get("category", "Vegetables")
    con      = get_db()
    cur      = con.cursor()
    cur.execute("""
        SELECT item, platform, MIN(price) as price, unit
        FROM prices
        WHERE pincode=? AND category=?
        GROUP BY item
        ORDER BY item
    """, (pincode, category))
    rows = [dict(r) for r in cur.fetchall()]
    con.close()
    return jsonify(rows)

@app.route("/api/refresh")
def refresh():
    """Simulate fetching fresh prices (adds small random noise)."""
    con = get_db()
    cur = con.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    rows = []
    for pincode in PINCODES:
        for category, items_data in ITEMS.items():
            for item, data in items_data.items():
                for platform in PLATFORMS:
                    base  = data[platform]
                    noise = random.uniform(-0.06, 0.08)
                    price = round(base * (1 + noise), 1)
                    rows.append((item, category, platform, price, data["unit"], pincode, now))
    cur.executemany(
        "INSERT INTO prices (item,category,platform,price,unit,pincode,timestamp) VALUES (?,?,?,?,?,?,?)",
        rows
    )
    con.commit()
    con.close()
    return jsonify({"status": "refreshed", "timestamp": now})

@app.route("/api/stats")
def stats():
    con = get_db()
    cur = con.cursor()
    cur.execute("SELECT COUNT(DISTINCT item) as items FROM prices")
    items_count = cur.fetchone()["items"]
    cur.execute("SELECT COUNT(DISTINCT platform) as p FROM prices")
    plat_count  = cur.fetchone()["p"]
    cur.execute("SELECT MAX(timestamp) as t FROM prices")
    last_update = cur.fetchone()["t"]
    con.close()
    return jsonify({
        "total_items":     items_count,
        "platforms":       plat_count,
        "pincodes_covered": len(PINCODES),
        "last_update":     last_update
    })

# ─────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    seed_data()
    app.run(debug=True, port=5000)
