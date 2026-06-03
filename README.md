# Hyperlocal Price Tracker 🛒

Compare grocery prices across **Blinkit, BigBasket, JioMart** instantly for Hyderabad pin codes.

## Features
- Compare vegetable, fruit, dairy, grain & essential prices across 3 platforms
- Filter by pin code (Secunderabad, Banjara Hills, Gachibowli, Madhapur, Ameerpet)
- 7-day price trend chart per item & platform
- Cheapest item finder — see which platform is cheapest for your whole basket
- One-click price refresh

## Tech Stack
| Layer    | Technology          |
|----------|---------------------|
| Backend  | Python 3.11 + Flask |
| Database | SQLite              |
| Frontend | HTML + CSS + JS     |
| Charts   | Chart.js            |
| Deploy   | Render / Railway    |

## License
MIT — Free to use, modify, and distribute.

## Run locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/hyperlocal-price-tracker.git
cd hyperlocal-price-tracker

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py

# 5. Open in browser
# http://localhost:5000
```

## Deploy to Render (free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app --workers 2 --bind 0.0.0.0:$PORT`
5. Click Deploy — your live URL is ready in ~2 minutes

## Project structure

```
hyperlocal-price-tracker/
├── app.py               # Flask backend + all API routes
├── requirements.txt     # Python dependencies
├── Procfile             # Deployment start command
├── .gitignore           # Files excluded from git
├── README.md            # This file
├── templates/
│   └── index.html       # Main HTML page
├── static/
│   ├── css/
│   │   └── style.css    # All styles
│   └── js/
│       └── app.js       # Frontend logic + Chart.js
└── data/
    └── prices.db        # SQLite database (auto-created, gitignored)
```

## Note on data
This project uses realistic simulated price data for demonstration.
To use real prices, replace the `seed_data()` function in `app.py`
with API calls or scrapers that comply with each platform's Terms of Service.
