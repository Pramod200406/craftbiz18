# 🎨 CRAFTBIZ AI
### AI-Powered Virtual Business Manager & Digital Commerce Ecosystem for Indian Artisans
**Designed for Smart India Hackathon 2026**

---

## 🌟 Executive Summary

**CRAFTBIZ AI** bridges the digital divide for millions of rural and traditional Indian craftspeople. Handcrafted art, handlooms, and heritage GI crafts represent India's rich cultural legacy, yet artisans frequently face exploitation by middlemen, lack professional product photography, encounter language barriers when cataloging products, struggle with fair pricing, and face logistical hurdles reaching national buyers.

CRAFTBIZ AI solves this with a **unified AI ecosystem**:
1. **🌐 First-Screen Trilingual Experience**: Instant selection between **English**, **ಕನ್ನಡ (Kannada)**, and **हिन्दी (Hindi)** with a centralized dynamic translation system.
2. **🎙 Multilingual Voice Catalogue**: Artisans speak naturally in regional languages. **OpenAI Whisper** transcribes speech and our NLP engine extracts product entities (name, material, cost, selling price, stock).
3. **🎨 4-Step AI Product Studio**: Transforms casual smartphone photos into e-commerce studio-grade listings via **Pillow ImageEnhance** (color, contrast, sharpness) and **rembg** (background removal with luxury neutral studio canvas).
4. **💰 Algorithmic Smart Pricing**: Computes fair pricing based on production costs, craft category multipliers (e.g., Terracotta, Bamboo, Handloom, Woodcraft, Bidriware, Jewellery, Jute), and market demand indices (Low, Medium, High).
5. **🛍 Flipkart/Amazon-Inspired Marketplace**: With **Deal of the Day** carousel, promotional banners, 7 craft categories, search, price/authenticity filters, and persistent cart checkout.
6. **🤝 Multi-Dimensional AI Buyer Matching**: Recommends artisan products to corporate buyers based on budget brackets, bulk quantity requirements, artisan capacity, and regional proximity with compatibility scores (e.g. 94%).
7. **🚚 Courier Logistics Hub & Animated Live Tracker**: Rural first-mile cluster pickup feed, express dispatch, 5-stage animated tracking pipeline with moving truck, and **secure 4-digit OTP handover verification (Demo OTP: `1234`)**.

---

## 🏗️ Architecture & Technology Stack

```
CRAFTBIZ_AI/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, routes & auto-seeder
│   ├── database.py             # SQLite / SQLAlchemy engine configuration
│   ├── models.py               # Artisan, Buyer, Courier, Product, Order ORM
│   ├── schemas.py              # Pydantic models for validation & serialization
│   ├── seed.py                 # Pre-seeded Indian crafts across 7 categories
│   ├── requirements.txt        # Python backend dependencies
│   ├── routes/
│   │   ├── artisan.py          # Registration, login, dashboard analytics
│   │   ├── buyer.py            # Registration, login, dashboard metrics
│   │   ├── courier.py          # Available pickups, accept, ship, deliver with OTP
│   │   ├── products.py         # Product CRUD, image upload, enhance, rembg studio
│   │   ├── orders.py           # Order creation, status updates, tracking
│   │   ├── pricing.py          # Algorithmic smart pricing endpoint
│   │   ├── voice.py            # Whisper audio transcription & entity parsing
│   │   └── matching.py         # Multi-factor AI recommendation engine
│   ├── services/
│   │   ├── image_service.py    # Pillow ImageEnhance + rembg background cutout
│   │   ├── pricing_service.py  # Category & demand economic pricing model
│   │   ├── matching_service.py # Vector compatibility scoring (0-100%)
│   │   └── voice_service.py    # OpenAI Whisper speech-to-entities pipeline
│   └── uploads/                # Processed images and audio files
└── frontend/
    ├── src/
    │   ├── translations/       # Centralized dictionaries (en.json, kn.json, hi.json)
    │   ├── context/            # LanguageContext with persistent storage
    │   ├── services/           # Centralized API service client (api.js)
    │   ├── components/
    │   │   ├── LanguageModal.jsx     # First screen: 3-language selector
    │   │   ├── Navbar.jsx            # Brand, language dropdown, role switcher, cart
    │   │   ├── Homepage.jsx          # Hero, SIH 2026 badges, 3 user roles
    │   │   ├── ArtisanDashboard.jsx  # AI Studio, Voice Catalogue, Pricing, Orders
    │   │   ├── BuyerDashboard.jsx    # Marketplace, Deal of the Day, AI Matching
    │   │   ├── CartDrawer.jsx        # Persistent cart, address checkout, confetti
    │   │   └── CourierDashboard.jsx  # Available pickups, animated logistics tracker
    │   ├── App.jsx
    │   └── index.css           # Tailwind CSS v4 & custom glassmorphism styling
    ├── package.json
    └── vite.config.js
```

---

## 👥 Three Dedicated Dashboards

The platform strictly features three tailored operational dashboards (no admin or judge dashboards):

1. **🎨 Artisan Dashboard**:
   - Total products, orders, pending pickups, delivered items, total revenue.
   - Revenue analytics chart & product health metrics.
   - **AI Product Studio**: 4-stage visual pipeline with before/after previews.
   - **Voice Catalogue**: Live recording, presets (Kannada, Hindi, English), entity extraction.
   - **Smart Pricing**: Interactive cost & demand sliders with Fair Wage Index.
   - Order management with one-click **"Mark Ready for Pickup"**.

2. **🛍️ Buyer Dashboard**:
   - Deal of the Day carousel with ratings and discount badges.
   - 7 Indian heritage craft categories: *Terracotta, Bamboo Crafts, Handloom, Woodcraft, Jewellery, Metal Crafts, Jute Crafts*.
   - Search, filter by price/authenticity score, sort options.
   - Product details modal with GI Authenticity (95%+), Visual Quality (90%+), and Fair Price Index (9.4/10).
   - **AI Buyer Matching**: Compatibility match scores (e.g. 96%) with AI rationale.
   - Multi-item shopping cart with persistent state and one-click checkout.

3. **🚚 Courier Dashboard**:
   - Real-time **Available Cluster Pickups** waiting at artisan workshops.
   - One-click pickup acceptance into active fleet.
   - **Ship Consignment** status trigger.
   - **Animated Logistics Tracker**: Moving truck across 5 stages (*Pending ➔ Ready for Pickup ➔ Accepted by Courier ➔ Shipped ➔ Delivered*).
   - **Delivery Handover with OTP**: Secure 4-digit verification (**Demo OTP: `1234`**).

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** & **npm**

### 2. Backend Setup

```bash
cd backend

# Optional: create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database seeder (seeds authentic Indian crafts & users)
python seed.py

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API Base: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Frontend App: `http://localhost:5173`

---

## 🔄 Complete End-to-End Demonstration Journey

1. **🌐 Select Language**:
   - On opening the app, select your preferred language: **🇬🇧 English**, **🇮🇳 ಕನ್ನಡ**, or **🇮🇳 हिन्दी**.
2. **👤 Choose Role**:
   - Explore the **Homepage** and click **"I am an Artisan"**, **"I am a Buyer"**, or **"I am a Courier"**.
3. **🎨 Artisan Flow**:
   - Go to **Voice Catalogue** ➔ Click one of the 1-click sample presets (e.g. *Channapatna Woodcraft in Kannada*) ➔ Watch Whisper AI transcribe and extract product details ➔ Click **Publish**.
   - Go to **AI Product Studio** ➔ Click **Apply AI Enhancement** (Pillow) ➔ Click **Remove Background** (rembg) ➔ View studio-grade certification.
   - Check **Recent Orders** ➔ Click **Mark Ready for Pickup** for pending orders.
4. **🛍 Buyer Flow**:
   - Switch to **Buyer Marketplace** ➔ Browse **Deal of the Day** and craft categories.
   - Open **🤝 AI Buyer Matching** tab ➔ Review compatibility scores (94%) and AI explanations.
   - Click **Add to Cart** ➔ Open Cart drawer ➔ Enter delivery address ➔ Click **Place Verified Order** (enjoy the celebration confetti 🎉).
5. **🚚 Courier Flow**:
   - Switch to **Courier Logistics** ➔ Go to **Available Pickups** ➔ Click **Accept Pickup**.
   - Under **My Deliveries**, click **Mark as Shipped** ➔ Watch the animated truck and progress bar move to "In Transit".
   - Click **Verify OTP & Deliver** ➔ Enter Demo OTP: `1234` ➔ Confirm delivery!

---

## 🛡️ Hackathon Submission Details

- **Event**: Smart India Hackathon (SIH) 2026
- **Project**: CRAFTBIZ AI
- **Demonstration Credentials**: Pre-seeded with authentic master artisans from Channapatna (Karnataka), Bankura (West Bengal), Bidar (Karnataka), Madhubani (Bihar), and Mayurbhanj (Odisha).
- **Demo Delivery OTP**: `1234`
