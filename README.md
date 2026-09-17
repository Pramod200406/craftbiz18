# 🎨 CRAFTBIZ AI
### AI-Powered Virtual Business Manager & Cross-Platform Digital Commerce Ecosystem for Indian Artisans
**Built for Smart India Hackathon (SIH) 2026**

---

## 🌟 Executive Summary

**CRAFTBIZ AI** bridges the digital divide for millions of rural and traditional Indian craftspeople. Handcrafted art, handlooms, and heritage GI crafts represent India's rich cultural legacy, yet artisans frequently face exploitation by middlemen, lack professional product photography, encounter language barriers when cataloging products, struggle with fair pricing, and face logistical hurdles reaching national buyers.

CRAFTBIZ AI solves this with a **robust, scalable, and cross-platform mobile-friendly AI ecosystem**:
1. **🌐 Bilingual Experience (English & हिन्दी)**: Clean, high-impact language switcher across the entire platform with instant translation.
2. **🎙 NLP Voice-to-SEO Description Engine**: Artisans describe their craft via voice notes in regional languages or English. **OpenAI Whisper AI** transcribes and an advanced NLP engine automatically generates **SEO-friendly, professional, high-converting product descriptions in both English and Hindi**, complete with SEO titles, bullet points, hashtags, and care instructions.
3. **🎨 4-Step AI Product Studio**: Transforms smartphone photos into e-commerce studio-grade listings via **Pillow ImageEnhance** (color, contrast, sharpness) and **rembg** (background removal with luxury neutral studio canvas).
4. **💰 Algorithmic Smart Pricing & Automated Demand Forecasting**: Backend AI automatically forecasts market demand based on upcoming 30-day festival schedules (Navratri, Dussehra, Diwali, wedding season) and craft category velocity, ensuring fair living wages (Fair Wage Index 9.5+/10).
5. **🛍 Meesho/Flipkart-Inspired Marketplace**: With **Deal of the Day** carousel, promotional badges, 7 craft categories, search, price/authenticity filters, and persistent cart checkout.
6. **🤝 Multi-Dimensional AI Buyer Matching**: Recommends artisan products to retail and bulk buyers based on budget brackets, volume requirements, artisan capacity, and regional proximity with compatibility scores (e.g. 96%).
7. **🚚 Shipment Partner Logistics Hub & Animated Live Tracker**: Rural first-mile cluster pickup feed, express dispatch, 5-stage animated tracking pipeline with moving truck, and **secure 4-digit OTP delivery handover verification (Demo OTP: `1234`)**.
8. **🛡️ Ecosystem Admin Control Center**: Real-time governance dashboard providing full visibility into artisan registrations, order fulfillment, GI authenticity verification, and catalogue moderation.
9. **📱 Mobile-First & Accessible for Low-Literacy Users**: Clean minimalist visual hierarchy with a persistent **Mobile Bottom Navigation Bar (`MobileBottomNav.jsx`)**, tactile touch targets, clear iconography, and voice-forward guidance.

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
│   │   ├── pricing.py          # Algorithmic smart pricing & demand forecast
│   │   ├── voice.py            # Whisper audio transcription & NLP SEO engine
│   │   ├── admin.py            # Platform metrics, catalogue moderation, system reset
│   │   └── matching.py         # Multi-factor AI recommendation engine
│   ├── services/
│   │   ├── image_service.py    # Pillow ImageEnhance + rembg background cutout
│   │   ├── pricing_service.py  # Future-days festival demand engine & pricing
│   │   ├── matching_service.py # Vector compatibility scoring (0-100%)
│   │   └── voice_service.py    # Whisper transcription + bilingual NLP SEO engine
│   └── uploads/                # Processed images and voice audio files
└── frontend/
    ├── src/
    │   ├── translations/       # Centralized dictionaries (en.json, hi.json)
    │   ├── context/            # LanguageContext with persistent storage
    │   ├── services/           # Centralized API service client (api.js)
    │   ├── components/
    │   │   ├── LanguageModal.jsx     # First screen: English & Hindi selector
    │   │   ├── Navbar.jsx            # Brand, language toggle, role switcher, cart
    │   │   ├── MobileBottomNav.jsx   # Mobile bottom navigation bar for low-literacy
    │   │   ├── Homepage.jsx          # Hero, SIH 2026 badges, 4 user roles
    │   │   ├── ArtisanDashboard.jsx  # AI Studio, Voice Catalogue, NLP SEO, Pricing
    │   │   ├── BuyerDashboard.jsx    # Marketplace, Deal of the Day, AI Matching
    │   │   ├── CartDrawer.jsx        # Persistent cart, address checkout, confetti
    │   │   ├── CourierDashboard.jsx  # Shipment partner portal & logistics tracker
    │   │   └── AdminDashboard.jsx    # Ecosystem governance & moderation center
    │   ├── App.jsx
    │   └── index.css           # Tailwind CSS v4 & custom glassmorphism styling
    ├── index.html              # PWA and cross-platform mobile viewport configuration
    ├── package.json
    └── vite.config.js
```

---

## 👥 Four Tailored Portals

### 1. 🎨 Artisan Command Center
- **NLP Voice-to-SEO Engine**: Speak in Hindi, English, or any regional dialect. The AI extracts structured entities and drafts **SEO-optimized listings in both English and Hindi** with 1-tap form application.
- **AI Product Studio**: 4-stage visual pipeline with before/after previews (original ➔ Pillow enhanced ➔ rembg cutout ➔ marketplace ready).
- **Backend-Driven Dynamic Pricing**: Automatically accounts for raw material indices, GI heritage authenticity, master craftsmanship wages, and upcoming festival season demand surges.
- Order management with one-click **"Mark Ready for Pickup"**.

### 2. 🛍️ Buyer Marketplace (B2B & Retail)
- Deal of the Day carousel with ratings and discount badges.
- 7 Indian heritage craft categories: *Terracotta, Bamboo Crafts, Handloom, Woodcraft, Jewellery, Metal Crafts, Jute Crafts*.
- Search, filter by price/authenticity score, sort options.
- Product details modal with GI Authenticity (95%+), Visual Quality (90%+), and Fair Price Index (9.5/10).
- **AI Buyer Matching**: Compatibility match scores (e.g. 96%) with explainable recommendation rationale.
- Multi-item shopping cart with persistent state and one-click checkout.

### 3. 🚚 Shipment Partner Portal
- Real-time **Available Cluster Pickups** waiting at artisan workshops.
- One-click pickup acceptance into active fleet.
- **Mark Shipped** status trigger.
- **Animated Logistics Tracker**: Moving truck across 5 stages (*Pending ➔ Ready for Pickup ➔ Accepted by Shipment Partner ➔ In Express Transit ➔ Delivered to Buyer*).
- **Delivery Handover with OTP**: Secure 4-digit verification (**Demo OTP: `1234`**).

### 4. 🛡️ Ecosystem Admin Control Center
- Real-time KPIs: Registered Artisans, Active Catalogue, Total Orders, Platform GMV, Average Fair Wage Rating.
- Multi-stakeholder lifecycle audit from artisan creation to shipment handover.
- Regional heritage cluster monitoring (Channapatna, Bankura, Varanasi, Bidar, Kutch).
- Catalogue moderation and demonstration dataset presets.

---

## 📱 Mobile-First Design & Low-Literacy Accessibility

- **Mobile Bottom Navigation Bar (`MobileBottomNav.jsx`)**: Designed with native mobile app ergonomics (56px touch height, clear icons, bilingual labels).
- **Voice-First Prompts**: High-visibility microphone badges (**"🎙️ Voice / बोलें"**) guide low-literacy artisans to speak instead of typing.
- **Cross-Platform PWA Ready**: Configured with `viewport-fit=cover`, `mobile-web-app-capable`, and instant tap response (`touch-manipulation`). Users can install it directly to their smartphone home screens.
- **Native App Packaging**: Fully compatible with **Capacitor / React Native** to export native Android `.apk` and iOS `.ipa` builds.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** & **npm**

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed authentic Indian crafts & master artisans
python seed.py

# Start FastAPI server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API Base: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev -- --host
```

- Frontend App: `http://localhost:5173`

---

## 🛡️ Hackathon Submission Details

- **Event**: Smart India Hackathon (SIH) 2026
- **Project**: CRAFTBIZ AI
- **GitHub Repository**: [https://github.com/Pramod200406/craftbiz18.git](https://github.com/Pramod200406/craftbiz18.git)
- **Demo Delivery OTP**: `1234`
- **Zero Middlemen Guarantee**: 100% direct fair wages paid to artisan clusters.
