# 🌟 SahiDeal (सहकारी) - Platform Cooperativism for Local Services
### *Cooperative Gig Services Platform for Household & Community Services*
**Smart India Hackathon (SIH 2026) • Problem Statement ID: 26089 • Team SIRA**  
*Theme: Agriculture, FoodTech & Rural Development / Software*

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/framework-Flask-emerald.svg)](https://flask.palletsprojects.com/)
[![Azure App Service](https://img.shields.io/badge/cloud-Microsoft%20Azure-0078D4.svg)](https://azure.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Overview & Problem Statement

In traditional corporate gig aggregator platforms (e.g. Urban Company, TaskRabbit), service workers face **25%–35% middleman extraction**, arbitrary algorithmic deplatforming, lack of healthcare/social security, and zero ownership.

**SahiDeal** (`पारस्परिक सहकारी`) provides a research-backed cooperative alternative:
1. **Worker-Owned Cooperative (92% Direct Take-Home)**: Workers receive 92% of every service fee directly. Only 8% is pooled into the collective cooperative reserve for healthcare, tool micro-loans, and quarterly patronage dividends.
2. **First-Screen Dual Role Gateway**: Instant choice between **Customer / Resident Login** and **Worker-Owner Login** (with Aadhaar eKYC, PMKVY RPL credentialing, and 1-click fast demo profiles for jury review).
3. **One Booking. Seven Trust Checkpoints**:
   - `01. BOOK` (App / Multilingual Twilio IVR & SMS fallback)
   - `02. MATCH` (Skill + <3km GIS Proximity + Rating)
   - `03. ESCROW` (Razorpay Milestone Escrow held neutrally)
   - `04. TRACK` (Live GPS Dispatch Radar)
   - `05. VERIFY` (Start/End Photo Proof + Dual OTPs)
   - `06. SETTLE` (Instant UPI Payout + 8% Co-op Pool Credit)
   - `07. RATE` (Cryptographically verified rating & community vouches)
4. **Built for Real-World Service Failures**:
   - **No-Show Worker**: Automated trust penalty + instant re-dispatch to nearest pro within <1.2km.
   - **Service Dispute**: Escrow neutral lock + 3-member Citizen Dispute Tribunal peer voting.
   - **First-Time Worker**: PMKVY RPL Level 4 certification + Community vouching.
   - **Low Connectivity**: Twilio IVR voice call in Hindi, Kannada, Tamil, English + SMS OTP fallback.
   - **Women Safety**: Women-provider filter toggle, verified female identities, and 15-minute emergency SOS handyman dispatch.
   - **Review Fraud**: Cryptographic hash-lock requiring verified OTPs and photo proof before ratings unlock.
5. **Resident Welfare Association (RWA) Bulk Buying**: Housing societies pool rooftop solar cleaning, water tank UV sanitation, and balcony waterproofing for **20–30% volume discounts**.
6. **Democratic Co-op Council (1 Member = 1 Vote)**: Transparent public treasury ledger and live democratic voting on fee structures, tool depot loans, and welfare benefits.

---

## 🎨 System Architecture

```
                       +-----------------------------------------------+
                       |       SahiDeal Platform Cooperativism UI      |
                       +-----------------------------------------------+
                         /              |             \            \
                        /               |              \            \
          +-----------------+  +-----------------+  +---------+  +---------+
          |  Consumer Hub   |  | Worker-Owner Hub|  | Co-op   |  | RWA     |
          |  - 7 Checkpoints|  | - Radar GPS Map |  | Council |  | Bulk Hub|
          |  - Fair Calc    |  | - Instant UPI   |  | - Voting|  | - Group |
          |  - Women Filter |  | - Welfare Claims|  | - Ledger|  |   Pledge|
          |  - 15m SOS      |  | - Tool Depot    |  | -Tribunal| - Discount|
          +-----------------+  +-----------------+  +---------+  +---------+
                                        |
                        +-------------------------------+
                        |     Python Flask REST API     |
                        |   (Dynamic Data & Services)   |
                        +-------------------------------+
                                        |
                        +-------------------------------+
                        |   Microsoft Azure App Service |
                        |     (SihNew / Cloud Web App)  |
                        +-------------------------------+
```

---

## 💻 Quickstart Guide (Run Locally)

### 1. Clone Repository & Navigate
```bash
git clone https://github.com/srivatsasoham/Sih-project.git
cd Sih-project
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Flask Web Application
```bash
python app.py
```

Open your browser at: **`http://127.0.0.1:5000`**

### 4. Compile Standalone Static HTML (Optional)
```bash
python build_static.py
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Authenticate Customer or Worker-Owner with Aadhaar eKYC |
| `/api/auth/switch-role` | POST | Switch active portal state between Customer and Worker |
| `/api/services` | GET | Retrieve service catalog with category and `women_only` filtering |
| `/api/book` | POST | Initiate 7-checkpoint escrow booking workflow |
| `/api/worker/job-action` | POST | Worker execution lifecycle (Accept, Start OTP, Photo Proof, Complete OTP) |
| `/api/resilience/ivr-simulate` | POST | Simulate Twilio IVR voice call & SMS fallback |
| `/api/resilience/no-show-simulate` | POST | Simulate pro cancellation, trust penalty, and auto-reassign |
| `/api/sos` | POST | Emergency 15-minute handyman dispatch |
| `/api/governance/vote` | POST | Cast democratic ballot on cooperative policy proposal |
| `/api/governance/dispute-vote` | POST | Citizen tribunal dispute resolution voting |
| `/api/community/join` | POST | Pledge apartment unit to RWA volume discount campaign |
| `/api/calculator` | GET | Calculate fair earnings breakdown (8% co-op fee vs 28% corporate cut) |

---

## 📚 Academic & Policy Research Citations

- **ILO Report (2021)**: *The Role of Digital Labour Platforms in Transforming Work.*
- **Trebor Scholz (2016)**: *Platform Cooperativism: Challenging the Corporate Sharing Economy.*
- **RedSeer Strategy (2023)**: *Home Services Market in India.*
- **IBEF Insights (2024)**: *India Facility Management & Household Services Report.*
- **Ministry of Skill Development & Entrepreneurship (Govt of India)**: *PMKVY Recognition of Prior Learning (RPL) Certification.*
- **Vallas & Schor (2020)**: *What Do Platforms Do? Algorithmic Control vs Democratic Equity.*

---

© 2026 **Team SIRA** • Smart India Hackathon (Problem Statement ID: 26089)
