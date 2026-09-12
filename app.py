import os
import json
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "cowork-coop-sih-2026-secret-key")

# -------------------------------------------------------------
# Metadata & Hackathon Identification
# -------------------------------------------------------------
PLATFORM_INFO = {
    "brand_name": "SahiDeal",
    "hindi_tagline": "पारस्परिक सहकारी",
    "tagline": "Transforming Informal Labour Through Accountable Commerce",
    "subtitle": "The cooperative-owned local service network for accountable commerce",
    "problem_id": "26089",
    "problem_title": "Cooperative Gig Services Platform for Household & Community Services",
    "theme": "Agriculture, FoodTech & Rural Development / Software",
    "team_name": "SIRA",
    "edition": "Smart India Hackathon 2026",
    "take_rate_pct": 8,  # 8% platform fee vs 25-35% traditional aggregators
    "worker_take_home_pct": 92,
}

# -------------------------------------------------------------
# Mock Database / Seed Data
# -------------------------------------------------------------

SERVICES = [
    {
        "id": "elec-01",
        "title": "Full Home Electrical Safety & Wiring Audit",
        "category": "electrical",
        "category_name": "Electrical & Power",
        "icon": "fa-bolt",
        "badge_color": "emerald",
        "price": 699,
        "market_price": 1150,
        "duration": "60-90 mins",
        "rating": 4.9,
        "reviews_count": 348,
        "worker_share": 643,
        "welfare_share": 56,
        "women_pro_available": True,
        "description": "Comprehensive diagnostic check for short circuits, MCB testing, inverter wiring, and grounding safety with digital audit report.",
        "popular": True,
        "features": ["Infrared heat check for load", "Surge protector test", "Child-safe switch verification", "Free 30-day Co-op warranty"],
        "cert_tag": "PMKVY RPL Level 4 & ITI Certified"
    },
    {
        "id": "elec-02",
        "title": "Smart Switch & BLDC Ceiling Fan Installation",
        "category": "electrical",
        "category_name": "Electrical & Power",
        "icon": "fa-lightbulb",
        "badge_color": "emerald",
        "price": 449,
        "market_price": 750,
        "duration": "45 mins",
        "rating": 4.8,
        "reviews_count": 210,
        "worker_share": 413,
        "welfare_share": 36,
        "women_pro_available": False,
        "description": "Installation of IoT smart switch modules, heavy BLDC energy-saving fans, and dimmer calibration.",
        "popular": False,
        "features": ["Neutral wire testing", "Wi-Fi app pairing support", "Neat conduit concealing"],
        "cert_tag": "Govt NCVT Certified"
    },
    {
        "id": "plumb-01",
        "title": "Precision Leak Detection & Hydro Pipeline Unclogging",
        "category": "plumbing",
        "category_name": "Plumbing & Water",
        "icon": "fa-faucet-drip",
        "badge_color": "cyan",
        "price": 499,
        "market_price": 899,
        "duration": "45-60 mins",
        "rating": 4.9,
        "reviews_count": 512,
        "worker_share": 459,
        "welfare_share": 40,
        "women_pro_available": True,
        "description": "High-pressure hydro jetting and acoustic sensor leak detection for concealed bathroom & kitchen pipelines.",
        "popular": True,
        "features": ["Non-invasive sonic sensor probe", "Heavy blockage snake clear", "O-ring & seal replacement", "Post-work dry clean"],
        "cert_tag": "PMKVY RPL Certified Plumber"
    },
    {
        "id": "plumb-02",
        "title": "Overhead Water Tank Deep UV Sanitization",
        "category": "plumbing",
        "category_name": "Plumbing & Water",
        "icon": "fa-water",
        "badge_color": "cyan",
        "price": 849,
        "market_price": 1400,
        "duration": "90 mins",
        "rating": 4.9,
        "reviews_count": 184,
        "worker_share": 781,
        "welfare_share": 68,
        "women_pro_available": False,
        "description": "6-stage German UV & pressure rotary tank cleaning removing sludge, algae, and bacterial biofilm.",
        "popular": False,
        "features": ["Sludge extraction pump", "Anti-bacterial organic spray", "UV germicidal lamp scan"],
        "cert_tag": "Water Health Board Vetted"
    },
    {
        "id": "clean-01",
        "title": "Eco-Friendly Deep Home & Kitchen Sanitization",
        "category": "cleaning",
        "category_name": "Home Cleaning",
        "icon": "fa-broom",
        "badge_color": "amber",
        "price": 1299,
        "market_price": 2200,
        "duration": "3-4 hrs",
        "rating": 4.95,
        "reviews_count": 620,
        "worker_share": 1195,
        "welfare_share": 104,
        "women_pro_available": True,
        "description": "Zero-toxic plant-based enzymatic cleaning for kitchens, tile grout, living rooms, and upholstery sanitization.",
        "popular": True,
        "features": ["Non-toxic child & pet safe", "Steam sanitization at 140°C", "Window track grime extraction", "All-women SHG certified crew available"],
        "cert_tag": "SHG Collective & PMKVY Certified"
    },
    {
        "id": "clean-02",
        "title": "Intensive Kitchen Oil & Chimney Degreasing",
        "category": "cleaning",
        "category_name": "Home Cleaning",
        "icon": "fa-kitchen-set",
        "badge_color": "amber",
        "price": 799,
        "market_price": 1350,
        "duration": "90 mins",
        "rating": 4.85,
        "reviews_count": 290,
        "worker_share": 735,
        "welfare_share": 64,
        "women_pro_available": True,
        "description": "Baffle filter decarbonization, motor rotor degreasing, and stove backsplash restoration.",
        "popular": False,
        "features": ["Food-grade degreaser", "Exhaust duct inspection", "Stove burner unclogging"],
        "cert_tag": "Sanitation Guild Vetted"
    },
    {
        "id": "appliance-01",
        "title": "Master AC Jet Servicing & Eco Gas Optimization",
        "category": "appliances",
        "category_name": "Appliance Repair",
        "icon": "fa-snowflake",
        "badge_color": "blue",
        "price": 549,
        "market_price": 999,
        "duration": "45 mins",
        "rating": 4.9,
        "reviews_count": 890,
        "worker_share": 505,
        "welfare_share": 44,
        "women_pro_available": False,
        "description": "High-velocity foam jacket pressure wash for indoor cooling coils and outdoor condenser cleaning with PSI check.",
        "popular": True,
        "features": ["Foam coil wash", "Gas pressure test", "Drain anti-fungal flush", "Power consumption check"],
        "cert_tag": "HVAC Certified Technician"
    },
    {
        "id": "appliance-02",
        "title": "Inverter Refrigerator & Washing Machine Tuning",
        "category": "appliances",
        "category_name": "Appliance Repair",
        "icon": "fa-blender-phone",
        "badge_color": "blue",
        "price": 499,
        "market_price": 850,
        "duration": "60 mins",
        "rating": 4.8,
        "reviews_count": 315,
        "worker_share": 459,
        "welfare_share": 40,
        "women_pro_available": False,
        "description": "Motherboard PCB diagnosis, motor capacitor test, drum vibration dampening, and defrost timer calibration.",
        "popular": False,
        "features": ["Transparent parts rate-card", "Digital multimeter testing", "OEM spare warranty"],
        "cert_tag": "PMKVY Consumer Electronics"
    },
    {
        "id": "carp-01",
        "title": "Custom Woodwork, Door Alignment & Lock Fitting",
        "category": "carpentry",
        "category_name": "Carpentry & Repairs",
        "icon": "fa-hammer",
        "badge_color": "orange",
        "price": 449,
        "market_price": 750,
        "duration": "60 mins",
        "rating": 4.9,
        "reviews_count": 270,
        "worker_share": 413,
        "welfare_share": 36,
        "women_pro_available": False,
        "description": "Hydraulic soft-close hinge replacements, squeaking door repairs, sliding wardrobe wheel calibration, and custom fittings.",
        "popular": False,
        "features": ["Laser level alignment", "Heavy duty stainless screws", "Clean sawdust vacuuming"],
        "cert_tag": "Master Carpentry Guild"
    },
    {
        "id": "elder-01",
        "title": "Community Elder Assist & Tech Handyman",
        "category": "community",
        "category_name": "Community & Care",
        "icon": "fa-hands-holding-child",
        "badge_color": "rose",
        "price": 349,
        "market_price": 600,
        "duration": "60 mins",
        "rating": 5.0,
        "reviews_count": 412,
        "worker_share": 321,
        "welfare_share": 28,
        "women_pro_available": True,
        "description": "Vetted compassionate neighborhood assistants for groceries lifting, smartphone troubleshooting, medicine organization, and mobility aid assembly.",
        "popular": True,
        "features": ["Police & Aadhaar eKYC Vetted", "Patience-first certified", "Emergency contact syncing", "Compassion guarantee"],
        "cert_tag": "Community Care & First-Aid Certified"
    },
    {
        "id": "green-01",
        "title": "Solar Panel Microfiber Cleaning & Terrace Garden Care",
        "category": "community",
        "category_name": "Community & Care",
        "icon": "fa-seedling",
        "badge_color": "emerald",
        "price": 599,
        "market_price": 1050,
        "duration": "75 mins",
        "rating": 4.9,
        "reviews_count": 165,
        "worker_share": 551,
        "welfare_share": 48,
        "women_pro_available": True,
        "description": "De-ionized water wash for rooftop solar photovoltaic arrays (+18% power generation boost) and organic terrace pruning.",
        "popular": False,
        "features": ["Solar efficiency test", "Scratchless rotary microfiber", "Organic vermicompost blend"],
        "cert_tag": "Solar Rooftop Certified PMKVY"
    }
]

WORKER_PROFILES = [
    {
        "id": "pro-101",
        "name": "Ramesh Kumar Sharma",
        "role": "Master Electrician & Solar Specialist",
        "category": "electrical",
        "gender": "male",
        "experience": "12 Years",
        "rating": 4.94,
        "jobs_completed": 1420,
        "shares_owned": 142,
        "dividend_earned": 28400,
        "location": "Indiranagar (1.2 km away)",
        "distance_km": 1.2,
        "badge": "Co-op Founding Steward",
        "avatar": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
        "vouched_by": 84,
        "status": "Available Now",
        "welfare_insured": True,
        "aadhaar_verified": True,
        "skills": ["PMKVY RPL Level 4", "ITI Electrical", "Solar Grid Tie", "First Aid"],
        "trust_score": 98
    },
    {
        "id": "pro-102",
        "name": "Lakshmi Devi Murugan",
        "role": "Sanitation Lead & Deep Cleaning Expert",
        "category": "cleaning",
        "gender": "female",
        "experience": "8 Years",
        "rating": 4.98,
        "jobs_completed": 980,
        "shares_owned": 98,
        "dividend_earned": 19600,
        "location": "Koramangala (2.1 km away)",
        "distance_km": 2.1,
        "badge": "Women Safety Council Lead",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "vouched_by": 112,
        "status": "Available in 15m",
        "welfare_insured": True,
        "aadhaar_verified": True,
        "skills": ["SHG Guild President", "PMKVY Sanitation", "Steam Protocol", "Women Safety Certified"],
        "trust_score": 99
    },
    {
        "id": "pro-103",
        "name": "Arun Prakash V.",
        "role": "HVAC & Master Refrigeration Technician",
        "category": "appliances",
        "gender": "male",
        "experience": "10 Years",
        "rating": 4.89,
        "jobs_completed": 1150,
        "shares_owned": 115,
        "dividend_earned": 23000,
        "location": "HSR Layout (0.8 km away)",
        "distance_km": 0.8,
        "badge": "Peer Trainer",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "vouched_by": 67,
        "status": "Available Now",
        "welfare_insured": True,
        "aadhaar_verified": True,
        "skills": ["ITI Refrigeration", "Inverter PCB Board", "PMKVY RPL", "Gas Safety"],
        "trust_score": 96
    },
    {
        "id": "pro-104",
        "name": "Sunita Rani Verma",
        "role": "Elder Care Specialist & Precision Handyman",
        "category": "community",
        "gender": "female",
        "experience": "7 Years",
        "rating": 4.97,
        "jobs_completed": 640,
        "shares_owned": 64,
        "dividend_earned": 12800,
        "location": "Domlur (1.7 km away)",
        "distance_km": 1.7,
        "badge": "Compassion Star",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "vouched_by": 89,
        "status": "Available Now",
        "welfare_insured": True,
        "aadhaar_verified": True,
        "skills": ["Red Cross First Aid", "Geriatric Care", "Aadhaar eKYC", "PMKVY Soft Skills"],
        "trust_score": 99
    },
    {
        "id": "pro-105",
        "name": "Suresh Patel",
        "role": "Hydro-Plumbing & Sewerage Specialist",
        "category": "plumbing",
        "gender": "male",
        "experience": "14 Years",
        "rating": 4.92,
        "jobs_completed": 1670,
        "shares_owned": 167,
        "dividend_earned": 33400,
        "location": "BTM Layout (1.9 km away)",
        "distance_km": 1.9,
        "badge": "Dispute Tribunal Member",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "vouched_by": 95,
        "status": "Available in 20m",
        "welfare_insured": True,
        "aadhaar_verified": True,
        "skills": ["Master Hydro Pipe Guild", "PMKVY RPL", "Sonic Sensor", "Water Audit"],
        "trust_score": 97
    }
]

GOVERNANCE_PROPOSALS = [
    {
        "id": "PROP-2026-08",
        "title": "Subsidize Electric 2-Wheeler Transition for 200 Co-op Members",
        "proposer": "Lakshmi Devi & Transport Working Group",
        "category": "Welfare & Sustainability",
        "status": "ACTIVE_VOTING",
        "yes_votes": 348,
        "no_votes": 28,
        "total_quorum_pct": 76,
        "deadline_hours": 36,
        "impact": "Allocates ₹1,20,000 from Q2 Co-op Surplus to provide zero-interest ₹15,000 EV battery down-payment subsidies, cutting worker fuel expenses by ₹2,400/month.",
        "badge": "High Priority"
    },
    {
        "id": "PROP-2026-09",
        "title": "Lower Platform Maintenance Reserve from 8.0% to 6.5% for Monsoon Months",
        "proposer": "Ramesh Kumar & Bangalore South Chapter",
        "category": "Fee Structure & Payouts",
        "status": "ACTIVE_VOTING",
        "yes_votes": 312,
        "no_votes": 61,
        "total_quorum_pct": 72,
        "deadline_hours": 58,
        "impact": "Increases direct worker take-home to 93.5% during July-September when seasonal household plumbing and cleaning surges occur.",
        "badge": "Economic Reform"
    },
    {
        "id": "PROP-2026-07",
        "title": "Approve Community Tool-Bank Depot at Sector 4 Community Hall",
        "proposer": "Arun Prakash V.",
        "category": "Shared Resources",
        "status": "PASSED_IMPLEMENTED",
        "yes_votes": 412,
        "no_votes": 12,
        "total_quorum_pct": 92,
        "deadline_hours": 0,
        "impact": "Purchased 4 heavy-duty core cutting machines and 6 thermal imaging sensors for shared free member checkout.",
        "badge": "Passed (97% Yes)"
    }
]

DISPUTE_CASES = [
    {
        "id": "DISP-401",
        "booking_id": "SG-884210",
        "service": "Tile Grouting & Waterproofing",
        "customer": "Kunal Sen",
        "worker": "Suresh Patel",
        "amount": 1200,
        "issue_text": "Customer reported minor grout color mismatch in utility balcony area.",
        "worker_defense": "Tile substrate had dampness; polymer sealant used as per safety code. Touch-up offered.",
        "status": "TRIBUNAL_REVIEW",
        "before_photo": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80",
        "after_photo": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80",
        "peer_votes_resolve": 24,
        "peer_votes_refund": 3
    }
]

COMMUNITY_CAMPAIGNS = [
    {
        "id": "CAMP-01",
        "society_name": "Palm Meadows Resident Welfare Association (RWA)",
        "location": "Whitefield, Bangalore",
        "service_title": "Society-Wide Rooftop Solar & Tank Deep Sanitation",
        "discount_percent": 25,
        "current_pledges": 44,
        "target_pledges": 50,
        "regular_price_per_unit": 1400,
        "group_price_per_unit": 1050,
        "savings_total": 15400,
        "worker_crew_assigned": "Whitefield Co-op Pod (6 Specialists)",
        "days_left": 3,
        "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": "CAMP-02",
        "society_name": "Sobha Moonstone Apartment Community",
        "location": "Bellandur Outer Ring Road",
        "service_title": "Pre-Monsoon Balcony Waterproofing & Drain Shield",
        "discount_percent": 20,
        "current_pledges": 29,
        "target_pledges": 30,
        "regular_price_per_unit": 950,
        "group_price_per_unit": 760,
        "savings_total": 5510,
        "worker_crew_assigned": "Bellandur Plumbing Guild",
        "days_left": 1,
        "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80"
    },
    {
        "id": "CAMP-03",
        "society_name": "Green Glen Layout Villa Association",
        "location": "HSR Sector 2",
        "service_title": "Comprehensive Air Conditioner Energy Optimization",
        "discount_percent": 30,
        "current_pledges": 65,
        "target_pledges": 60,
        "regular_price_per_unit": 999,
        "group_price_per_unit": 699,
        "savings_total": 19500,
        "worker_crew_assigned": "HSR HVAC Collective",
        "days_left": 5,
        "image": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80"
    }
]

LIVE_FEED_EVENTS = [
    {"time": "Just now", "text": "Priya S. booked 'Full Home Electrical Safety Audit' in Indiranagar", "icon": "fa-bolt", "color": "text-emerald-400"},
    {"time": "2 mins ago", "text": "Worker-Owner Ramesh K. completed job, received ₹643 direct instant payout (8% co-op fee)", "icon": "fa-wallet", "color": "text-emerald-400"},
    {"time": "4 mins ago", "text": "Palm Meadows RWA added 2 new pledges to Solar Sanitation drive", "icon": "fa-users", "color": "text-indigo-400"},
    {"time": "6 mins ago", "text": "IVR Fallback: Senior citizen booked via phone call (+91 98***) in Kannada", "icon": "fa-phone-volume", "color": "text-cyan-400"},
    {"time": "8 mins ago", "text": "Co-op Member Vote: 14 new ballots cast for EV Subsidies Proposal #08", "icon": "fa-check-to-slot", "color": "text-amber-400"},
    {"time": "11 mins ago", "text": "Emergency SOS Handyman arrived at Indiranagar within 12 mins", "icon": "fa-truck-fast", "color": "text-rose-400"}
]

# -------------------------------------------------------------
# Active Session / Demo Users
# -------------------------------------------------------------
DEMO_USERS = {
    "customer": {
        "id": "cust-01",
        "name": "Priya Sharma",
        "role": "customer",
        "phone": "+91 98450 12345",
        "email": "priya.sharma@example.com",
        "address": "Flat 402, Palm Heights, Indiranagar 100ft Road, Bangalore",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "society": "Palm Meadows RWA",
        "trust_score": 100
    },
    "worker": {
        "id": "pro-101",
        "name": "Ramesh Kumar Sharma",
        "role": "worker",
        "phone": "+91 98860 54321",
        "email": "ramesh.electrician@coop.cowork.in",
        "trade": "Master Electrician & Solar Specialist",
        "avatar": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'%3E%3Crect width='100' height='100' fill='%230f172a'/%3E%3Cpath d='M50 48a18 18 0 1 0 0-36 18 18 0 0 0 0 36zm0 10c-20 0-36 12-36 28v6h72v-6c0-16-16-28-36-28z' fill='%23475569'/%3E%3C/svg%3E",
        "aadhaar_verified": True,
        "shares_owned": 142,
        "dividend_earned": 28400,
        "wallet_balance": 4850,
        "trust_score": 98
    }
}

# -------------------------------------------------------------
# Global Cross-Device Synchronized Cooperative State
# -------------------------------------------------------------
DEFAULT_SHADOW_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'%3E%3Crect width='100' height='100' fill='%230f172a'/%3E%3Cpath d='M50 48a18 18 0 1 0 0-36 18 18 0 0 0 0 36zm0 10c-20 0-36 12-36 28v6h72v-6c0-16-16-28-36-28z' fill='%23475569'/%3E%3C/svg%3E"

GLOBAL_SYNC_STATE = {
    "isWorkerOnline": True,
    "activeJobs": [],
    "completedJobs": [],
    "workerUser": {
        "name": "Ramesh Kumar",
        "phone": "+91 98860 54321",
        "trade": "Master Electrician & Plumber",
        "experience": "8 Years",
        "location": "Indiranagar (1.2 km radius)",
        "avatar": DEFAULT_SHADOW_AVATAR
    },
    "customerUser": None,
    "workerWallet": {
        "balance": 4850,
        "earningsToday": 0,
        "totalJobs": 142,
        "shares": 14,
        "dividendsAccrued": 2840,
        "transactions": [
            { "id": "TXN-801", "title": "Full Home Electrical Safety Audit", "amount": 643, "fee": 56, "time": "Today, 2:30 PM", "customer": "Rahul V." },
            { "id": "TXN-800", "title": "BLDC Fan Installation", "amount": 413, "fee": 36, "time": "Yesterday", "customer": "Meera K." }
        ]
    }
}

# -------------------------------------------------------------
# Web Page Routes
# -------------------------------------------------------------

@app.context_processor
def inject_global_vars():
    current_role = session.get("user_role", "customer")
    current_user = DEMO_USERS.get(current_role, DEMO_USERS["customer"])
    return dict(
        platform=PLATFORM_INFO,
        current_role=current_role,
        current_user=current_user,
        now_year=2026
    )

@app.route("/")
def index():
    categories = [
        {"id": "all", "name": "All Services", "icon": "fa-layer-group"},
        {"id": "electrical", "name": "Electrical & Power", "icon": "fa-bolt"},
        {"id": "plumbing", "name": "Plumbing & Water", "icon": "fa-faucet-drip"},
        {"id": "cleaning", "name": "Deep Cleaning", "icon": "fa-broom"},
        {"id": "appliances", "name": "Appliance Care", "icon": "fa-snowflake"},
        {"id": "carpentry", "name": "Carpentry", "icon": "fa-hammer"},
        {"id": "community", "name": "Community & Elder Care", "icon": "fa-hands-holding-child"}
    ]
    return render_template(
        "index.html",
        services=SERVICES,
        categories=categories,
        workers=WORKER_PROFILES,
        campaigns=COMMUNITY_CAMPAIGNS,
        proposals=GOVERNANCE_PROPOSALS[:2],
        disputes=DISPUTE_CASES,
        live_feed=LIVE_FEED_EVENTS
    )

@app.route("/worker")
def worker_dashboard():
    active_worker = WORKER_PROFILES[0]  # Ramesh Kumar Sharma
    radar_jobs = [
        {
            "id": "JOB-9021",
            "title": "Emergency Circuit Breaker Tripping Diagnostic",
            "customer": "Vikram Sethi",
            "distance": "1.2 km (Indiranagar 12th Main)",
            "payout": 643,
            "welfare_credit": 56,
            "time_estimate": "35 mins",
            "urgency": "High Urgency",
            "tags": ["Tools Ready", "Instant UPI Payout", "Escrow Funded"],
            "start_otp": "4819",
            "complete_otp": "7392"
        },
        {
            "id": "JOB-9022",
            "title": "Inverter Load Balancing & Smart Meter Calibration",
            "customer": "Ananya R.",
            "distance": "2.1 km (Defence Colony)",
            "payout": 820,
            "welfare_credit": 71,
            "time_estimate": "50 mins",
            "urgency": "Scheduled Today 5:30 PM",
            "tags": ["Pre-paid Escrow", "RWA Society Member"],
            "start_otp": "5920",
            "complete_otp": "8104"
        }
    ]
    return render_template(
        "worker.html",
        worker=active_worker,
        radar_jobs=radar_jobs,
        proposals=GOVERNANCE_PROPOSALS,
        disputes=DISPUTE_CASES
    )

@app.route("/governance")
def governance():
    treasury = {
        "total_revenue": 2485600,
        "worker_disbursed": 2286752,  # 92%
        "coop_reserve_pool": 198848,   # 8%
        "dividend_payout_fund": 95000,
        "healthcare_grants_paid": 48000,
        "tool_micro_loans_active": 32000,
        "member_count": 4200,
        "voter_turnout_pct": 82.4
    }
    return render_template(
        "governance.html",
        proposals=GOVERNANCE_PROPOSALS,
        treasury=treasury,
        workers=WORKER_PROFILES,
        disputes=DISPUTE_CASES
    )

@app.route("/community")
def community():
    return render_template(
        "community.html",
        campaigns=COMMUNITY_CAMPAIGNS
    )

@app.route("/about")
def about():
    return render_template("about.html")

# -------------------------------------------------------------
# Authentication & Role Switcher
# -------------------------------------------------------------

@app.route("/api/auth/switch-role", methods=["POST"])
def switch_role():
    data = request.json or {}
    role = data.get("role", "customer")
    if role in ["customer", "worker"]:
        session["user_role"] = role
        user = DEMO_USERS[role]
        return jsonify({
            "success": True,
            "role": role,
            "user": user,
            "message": f"Switched to {role.upper()} portal mode."
        })
    return jsonify({"success": False, "error": "Invalid role"}), 400

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    role = data.get("role", "customer")
    phone = data.get("phone", "+91 98450 12345")
    aadhaar = data.get("aadhaar", "")
    
    session["user_role"] = role
    user = DEMO_USERS.get(role, DEMO_USERS["customer"])
    
    return jsonify({
        "success": True,
        "role": role,
        "user": user,
        "aadhaar_verified": bool(aadhaar) or user.get("aadhaar_verified", False),
        "message": f"Successfully authenticated as {user['name']} ({role.capitalize()})"
    })

# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------

@app.route("/api/services", methods=["GET"])
def get_services():
    category = request.args.get("category", "all")
    query = request.args.get("q", "").strip().lower()
    women_only = request.args.get("women_only", "false").lower() == "true"
    
    filtered = SERVICES
    if category != "all":
        filtered = [s for s in filtered if s["category"] == category]
    if women_only:
        filtered = [s for s in filtered if s.get("women_pro_available", False)]
    if query:
        filtered = [s for s in filtered if (
            query in s["title"].lower() or 
            query in s["description"].lower() or 
            query in s["category_name"].lower() or
            query in s.get("cert_tag", "").lower()
        )]
        
    return jsonify({"success": True, "count": len(filtered), "services": filtered})

@app.route("/api/book", methods=["POST"])
def book_service():
    data = request.json or {}
    service_id = data.get("service_id")
    customer_name = data.get("name", "Priya Sharma")
    phone = data.get("phone", "+91 98450 12345")
    address = data.get("address", "Flat 402, Palm Heights, Indiranagar, Bangalore")
    time_slot = data.get("time_slot", "Immediate / Next Pro")
    women_pro_pref = data.get("women_pro", False)

    service = next((s for s in SERVICES if s["id"] == service_id), SERVICES[0])
    
    # Match pro based on preference and category
    candidates = [p for p in WORKER_PROFILES if p["category"] == service["category"]]
    if women_pro_pref:
        female_candidates = [p for p in candidates if p["gender"] == "female"]
        matched_pro = female_candidates[0] if female_candidates else WORKER_PROFILES[1]
    else:
        matched_pro = candidates[0] if candidates else WORKER_PROFILES[0]
    
    booking_reference = f"SG-{random.randint(100000, 999999)}"
    start_otp = f"{random.randint(1000, 9999)}"
    complete_otp = f"{random.randint(1000, 9999)}"
    
    # 7-Checkpoints Status
    checkpoints = [
        {"step": 1, "name": "BOOK", "desc": "App / IVR Booking Submitted", "status": "COMPLETED"},
        {"step": 2, "name": "MATCH", "desc": f"Matched with {matched_pro['name']} ({matched_pro['distance_km']}km)", "status": "COMPLETED"},
        {"step": 3, "name": "ESCROW", "desc": f"₹{service['price']} held securely in Razorpay Escrow", "status": "COMPLETED"},
        {"step": 4, "name": "TRACK", "desc": "Live Pro GPS Dispatch Active", "status": "IN_PROGRESS"},
        {"step": 5, "name": "VERIFY", "desc": "Photo + Start/End OTP Required", "status": "PENDING"},
        {"step": 6, "name": "SETTLE", "desc": f"92% (₹{service['worker_share']}) direct pay + 8% (₹{service['welfare_share']}) co-op pool", "status": "PENDING"},
        {"step": 7, "name": "RATE", "desc": "Hyperlocal trust score update", "status": "PENDING"}
    ]

    response_data = {
        "success": True,
        "booking_id": booking_reference,
        "service": service,
        "customer": {"name": customer_name, "phone": phone, "address": address},
        "time_slot": time_slot,
        "matched_worker": matched_pro,
        "start_otp": start_otp,
        "complete_otp": complete_otp,
        "checkpoints": checkpoints,
        "breakdown": {
            "total_price": service["price"],
            "worker_earnings_92pct": service["worker_share"],
            "coop_fee_8pct": service["welfare_share"],
            "market_corporate_price": service["market_price"],
            "customer_savings": service["market_price"] - service["price"]
        },
        "estimated_arrival": f"{random.randint(12, 22)} minutes",
        "message": f"Co-op Pro {matched_pro['name']} assigned! Escrow funded with zero corporate middleman surcharge."
    }
    return jsonify(response_data)

@app.route("/api/worker/job-action", methods=["POST"])
def worker_job_action():
    data = request.json or {}
    job_id = data.get("job_id", "JOB-9021")
    action = data.get("action")  # 'accept', 'start_otp', 'upload_photo', 'complete_otp'
    otp = data.get("otp", "")

    if action == "accept":
        return jsonify({
            "success": True,
            "status": "ACCEPTED",
            "message": f"Gig {job_id} accepted! Customer notified. GIS navigation active."
        })
    elif action == "start_otp":
        return jsonify({
            "success": True,
            "status": "IN_PROGRESS",
            "message": "Start OTP verified successfully! Timer and work safety checklist started."
        })
    elif action == "upload_photo":
        return jsonify({
            "success": True,
            "status": "PHOTO_VERIFIED",
            "message": "Before/After work proof photo uploaded to permanent Co-op audit trail."
        })
    elif action == "complete_otp":
        return jsonify({
            "success": True,
            "status": "SETTLED",
            "payout_amount": 643,
            "dividend_credit": 56,
            "message": "Job successfully completed! ₹643 disbursed instantly via UPI to worker wallet."
        })

    return jsonify({"success": False, "error": "Unknown action"}), 400

# -------------------------------------------------------------
# Cross-Device Real-Time Sync REST APIs (PC <-> Mobile)
# -------------------------------------------------------------

@app.route("/api/jobs", methods=["GET"])
def get_sync_state():
    return jsonify({
        "success": True,
        "activeJobs": GLOBAL_SYNC_STATE["activeJobs"],
        "completedJobs": GLOBAL_SYNC_STATE["completedJobs"],
        "isWorkerOnline": GLOBAL_SYNC_STATE["isWorkerOnline"],
        "workerUser": GLOBAL_SYNC_STATE["workerUser"],
        "customerUser": GLOBAL_SYNC_STATE["customerUser"],
        "workerWallet": GLOBAL_SYNC_STATE["workerWallet"]
    })

@app.route("/api/jobs/post", methods=["POST"])
def post_job_sync():
    data = request.json or {}
    job_id = data.get("id") or f"GIG-{random.randint(1000, 9999)}"
    price = data.get("price", 499)
    worker_payout = data.get("workerPayout", round(price * 0.92))
    coop_fee = price - worker_payout

    job = {
        "id": job_id,
        "serviceTitle": data.get("title") or data.get("serviceTitle", "Service Request"),
        "category": data.get("category", "plumbing"),
        "problemDescription": data.get("description") or data.get("problemDescription", "Customer request"),
        "customerName": data.get("customerName", "Valued Customer"),
        "customerPhone": data.get("customerPhone", "+91 98450 12345"),
        "customerAddress": data.get("customerAddress", "Indiranagar, Bangalore"),
        "urgency": data.get("urgency", "⚡ Immediate (<20 mins)"),
        "price": price,
        "workerPayout": worker_payout,
        "coopFee": coop_fee,
        "startOtp": data.get("startOtp") or f"{random.randint(1000, 9999)}",
        "completeOtp": data.get("completeOtp") or f"{random.randint(1000, 9999)}",
        "status": "OPEN",
        "createdAt": datetime.now().strftime("%I:%M %p"),
        "createdAtTimestamp": datetime.now().timestamp() * 1000,
        "workerName": None,
        "workerPhone": None,
        "workerTrade": None,
        "workerAvatar": None,
        "workPhotoProof": None,
        "customerRating": None,
        "customerReview": None
    }

    # Add to activeJobs list at start
    GLOBAL_SYNC_STATE["activeJobs"].insert(0, job)
    return jsonify({"success": True, "job": job})

@app.route("/api/jobs/accept", methods=["POST"])
def accept_job_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    worker = data.get("worker") or GLOBAL_SYNC_STATE["workerUser"]

    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if not job:
        return jsonify({"success": False, "message": "Job not found"}), 404

    if job["status"] != "OPEN":
        return jsonify({"success": False, "message": "Task already accepted by another specialist!"}), 400

    job["status"] = "ACCEPTED"
    job["workerName"] = worker.get("name", "Co-op Specialist")
    job["workerPhone"] = worker.get("phone", "+91 98860 54321")
    job["workerTrade"] = worker.get("trade", "Master Specialist")
    job["workerAvatar"] = worker.get("avatar", DEFAULT_SHADOW_AVATAR)
    job["acceptedAt"] = datetime.now().strftime("%I:%M %p")
    job["etaMinutes"] = 12

    return jsonify({"success": True, "job": job})

@app.route("/api/jobs/start-otp", methods=["POST"])
def start_otp_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    otp = str(data.get("otp", "")).strip()

    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if not job:
        return jsonify({"success": False, "message": "Job not found"}), 404

    if job["startOtp"] != otp:
        return jsonify({"success": False, "message": "Invalid Start OTP! Ask customer for the 4-digit code shown on their screen."}), 400

    job["status"] = "IN_PROGRESS"
    job["startedAt"] = datetime.now().strftime("%I:%M %p")
    return jsonify({"success": True, "job": job})

@app.route("/api/jobs/photo-proof", methods=["POST"])
def photo_proof_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    photo = data.get("photo", "")

    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if not job:
        return jsonify({"success": False, "message": "Job not found"}), 404

    job["workPhotoProof"] = photo
    return jsonify({"success": True, "job": job})

@app.route("/api/jobs/complete-otp", methods=["POST"])
def complete_otp_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    otp = str(data.get("otp", "")).strip()

    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if not job:
        return jsonify({"success": False, "message": "Job not found"}), 404

    if job["completeOtp"] != otp:
        return jsonify({"success": False, "message": "Invalid Completion OTP! Customer will provide this code after inspecting your work."}), 400

    job["status"] = "COMPLETED"
    job["completedAt"] = datetime.now().strftime("%I:%M %p")

    # Update Wallet
    payout = job.get("workerPayout", 459)
    fee = job.get("coopFee", 40)
    GLOBAL_SYNC_STATE["workerWallet"]["balance"] += payout
    GLOBAL_SYNC_STATE["workerWallet"]["earningsToday"] += payout
    GLOBAL_SYNC_STATE["workerWallet"]["totalJobs"] += 1
    GLOBAL_SYNC_STATE["workerWallet"]["dividendsAccrued"] += fee

    GLOBAL_SYNC_STATE["workerWallet"]["transactions"].insert(0, {
        "id": f"TXN-{random.randint(1000, 9999)}",
        "title": job["serviceTitle"],
        "amount": payout,
        "fee": fee,
        "time": "Just Now",
        "customer": job["customerName"]
    })

    # Move from active to completed
    GLOBAL_SYNC_STATE["activeJobs"] = [j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] != job_id]
    GLOBAL_SYNC_STATE["completedJobs"].insert(0, job)

    return jsonify({"success": True, "job": job, "wallet": GLOBAL_SYNC_STATE["workerWallet"]})

@app.route("/api/jobs/rate", methods=["POST"])
def rate_job_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    rating = data.get("rating", 5)
    review = data.get("review", "")

    job = next((j for j in GLOBAL_SYNC_STATE["completedJobs"] if j["id"] == job_id), None)
    if not job:
        job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)

    if job:
        job["customerRating"] = rating
        job["customerReview"] = review
        return jsonify({"success": True, "job": job})

    return jsonify({"success": False, "message": "Job not found"}), 404

@app.route("/api/jobs/timeout", methods=["POST"])
def timeout_job_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if job and job["status"] == "OPEN":
        job["status"] = "TIMEOUT"
        return jsonify({"success": True, "job": job})
    return jsonify({"success": False, "message": "Job not found or not open"}), 404

@app.route("/api/jobs/retry", methods=["POST"])
def retry_job_sync():
    data = request.json or {}
    job_id = data.get("job_id")
    job = next((j for j in GLOBAL_SYNC_STATE["activeJobs"] if j["id"] == job_id), None)
    if job:
        job["status"] = "OPEN"
        job["createdAtTimestamp"] = datetime.now().timestamp() * 1000
        return jsonify({"success": True, "job": job})
    return jsonify({"success": False, "message": "Job not found"}), 404

@app.route("/api/worker/status", methods=["POST"])
def set_worker_status_sync():
    data = request.json or {}
    is_online = data.get("isOnline", True)
    GLOBAL_SYNC_STATE["isWorkerOnline"] = is_online
    return jsonify({"success": True, "isOnline": is_online})

@app.route("/api/worker/profile", methods=["POST"])
def set_worker_profile_sync():
    data = request.json or {}
    if data:
        GLOBAL_SYNC_STATE["workerUser"].update(data)
    return jsonify({"success": True, "workerUser": GLOBAL_SYNC_STATE["workerUser"]})

@app.route("/api/customer/profile", methods=["POST"])
def set_customer_profile_sync():
    data = request.json or {}
    GLOBAL_SYNC_STATE["customerUser"] = data
    return jsonify({"success": True, "customerUser": GLOBAL_SYNC_STATE["customerUser"]})

# -------------------------------------------------------------
# Resilience & Governance APIs
# -------------------------------------------------------------

@app.route("/api/resilience/ivr-simulate", methods=["POST"])
def simulate_ivr_call():
    data = request.json or {}
    phone = data.get("phone", "+91 98450 12345")
    language = data.get("lang", "hi")  # hi, en, kn, ta
    service_type = data.get("service", "electrical")

    messages = {
        "hi": "नमस्ते, को-वर्क (Co-Work) पारस्परिक सहकारी में आपका स्वागत है। आपके बिजली कार्य हेतु मास्टर इलेक्ट्रीशियन रमेश कुमार (1.2 किमी) को बुक कर दिया गया है। ओटीपी: 4819। कोई बिचौलिया शुल्क नहीं।",
        "en": "Welcome to Co-Work Cooperative. Your request for electrical service is confirmed. Master Pro Ramesh Kumar (1.2km away) has been dispatched. Start OTP: 4819.",
        "kn": "ನಮಸ್ಕಾರ, ಕೋ-ವರ್ಕ್ ಸಹಕಾರಿ ಸೇವೆಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಸೇವೆಗೆ ರಮೇಶ್ ಕುಮಾರ್ ನಿಯೋಜಿಸಲಾಗಿದೆ. OTP: 4819.",
        "ta": "வணக்கம், கோ-வொர்க் கூட்டுறவு சேவைக்கு நல்வரவு. உங்கள் மின்சார பணிக்கு ரமேஷ் குமார் நியமிக்கப்பட்டுள்ளார். OTP: 4819."
    }

    sms_text = messages.get(language, messages["en"])

    return jsonify({
        "success": True,
        "channel": "TWILIO_IVR_SMS_GATEWAY",
        "phone": phone,
        "language": language,
        "voice_script": sms_text,
        "sms_dispatched": True,
        "booking_id": f"IVR-{random.randint(1000, 9999)}",
        "status": "DISPATCHED_OFFLINE_READY",
        "message": f"IVR Voice & SMS fallback successfully simulated for {phone} in {language.upper()}!"
    })

@app.route("/api/resilience/no-show-simulate", methods=["POST"])
def simulate_no_show():
    data = request.json or {}
    booking_id = data.get("booking_id", "SG-884210")
    original_pro = WORKER_PROFILES[0]  # Ramesh
    backup_pro = WORKER_PROFILES[2]    # Arun Prakash

    return jsonify({
        "success": True,
        "event": "NO_SHOW_DETECTED",
        "booking_id": booking_id,
        "penalized_worker": {
            "name": original_pro["name"],
            "trust_penalty": "-10 Trust Score Points",
            "coop_warning": "Warning registered on Co-op peer tribunal"
        },
        "auto_reassigned_worker": {
            "name": backup_pro["name"],
            "role": backup_pro["role"],
            "distance": backup_pro["location"],
            "rating": backup_pro["rating"],
            "eta": "14 minutes"
        },
        "message": f"Zero-Downtime Guarantee: Original pro timed out. Instantly re-routed to nearest Co-op Pro {backup_pro['name']} ({backup_pro['distance_km']}km)!"
    })

@app.route("/api/sos", methods=["POST"])
def emergency_sos():
    data = request.json or {}
    service_type = data.get("service_type", "Electrical / Plumbing Emergency")
    location = data.get("location", "Indiranagar 100ft Road")
    contact = data.get("contact", "+91 99000 11223")

    assigned_pro = WORKER_PROFILES[0]
    sos_id = f"SOS-{random.randint(1000, 9999)}"

    return jsonify({
        "success": True,
        "sos_id": sos_id,
        "status": "DISPATCHED",
        "pro": assigned_pro,
        "estimated_eta": "12 minutes",
        "live_lat": 12.9716,
        "live_lng": 77.5946,
        "message": f"Rapid SOS dispatched! Master Pro {assigned_pro['name']} is 1.2km away and en route with emergency kit."
    })

@app.route("/api/governance/vote", methods=["POST"])
def cast_vote():
    data = request.json or {}
    proposal_id = data.get("proposal_id")
    vote_choice = data.get("choice")  # 'yes' or 'no'

    proposal = next((p for p in GOVERNANCE_PROPOSALS if p["id"] == proposal_id), None)
    if not proposal:
        return jsonify({"success": False, "error": "Proposal not found"}), 404

    if vote_choice == "yes":
        proposal["yes_votes"] += 1
    elif vote_choice == "no":
        proposal["no_votes"] += 1

    total_votes = proposal["yes_votes"] + proposal["no_votes"]
    yes_pct = round((proposal["yes_votes"] / total_votes) * 100, 1)

    return jsonify({
        "success": True,
        "proposal_id": proposal_id,
        "yes_votes": proposal["yes_votes"],
        "no_votes": proposal["no_votes"],
        "yes_pct": yes_pct,
        "message": f"Your democratic member vote '{vote_choice.upper()}' has been recorded on the Co-op Ledger!"
    })

@app.route("/api/governance/dispute-vote", methods=["POST"])
def vote_dispute():
    data = request.json or {}
    dispute_id = data.get("dispute_id")
    decision = data.get("decision")  # 'resolve' or 'refund'

    dispute = next((d for d in DISPUTE_CASES if d["id"] == dispute_id), None)
    if not dispute:
        return jsonify({"success": False, "error": "Dispute case not found"}), 404

    if decision == "resolve":
        dispute["peer_votes_resolve"] += 1
    else:
        dispute["peer_votes_refund"] += 1

    return jsonify({
        "success": True,
        "dispute_id": dispute_id,
        "resolve_votes": dispute["peer_votes_resolve"],
        "refund_votes": dispute["peer_votes_refund"],
        "message": "Citizen peer vote recorded! Co-op Escrow tribunal decision updated."
    })

@app.route("/api/community/join", methods=["POST"])
def join_campaign():
    data = request.json or {}
    campaign_id = data.get("campaign_id")
    flat_no = data.get("flat_no", "Tower B - 402")
    
    campaign = next((c for c in COMMUNITY_CAMPAIGNS if c["id"] == campaign_id), None)
    if not campaign:
        return jsonify({"success": False, "error": "Campaign not found"}), 404

    campaign["current_pledges"] += 1
    pct_reached = min(100, round((campaign["current_pledges"] / campaign["target_pledges"]) * 100))

    return jsonify({
        "success": True,
        "campaign_id": campaign_id,
        "current_pledges": campaign["current_pledges"],
        "target_pledges": campaign["target_pledges"],
        "pct_reached": pct_reached,
        "message": f"Added pledge for {flat_no}! Society discount tier activated."
    })

@app.route("/api/calculator", methods=["GET"])
def calculate_breakdown():
    amount = float(request.args.get("amount", 1000))
    corporate_fee_pct = 0.28  # 28% standard aggregator cut + commissions
    coop_fee_pct = 0.08       # 8% target co-op platform fee

    corporate_worker_payout = amount * (1.0 - corporate_fee_pct)
    corporate_middleman_cut = amount * corporate_fee_pct

    coop_worker_payout = amount * (1.0 - coop_fee_pct)
    coop_reserve_contribution = amount * coop_fee_pct

    extra_worker_income = coop_worker_payout - corporate_worker_payout

    return jsonify({
        "order_amount": amount,
        "corporate": {
            "worker_payout": round(corporate_worker_payout, 2),
            "middleman_cut": round(corporate_middleman_cut, 2),
            "worker_welfare_pool": 0,
            "worker_voice": "0% (Zero ownership or vote)"
        },
        "sahideal_coop": {
            "worker_payout": round(coop_worker_payout, 2),
            "platform_middleman_cut": 0,
            "coop_reserve_pool": round(coop_reserve_contribution, 2),
            "worker_voice": "100% Democratic Co-op Ownership (1 Member = 1 Vote)"
        },
        "extra_in_worker_pocket": round(extra_worker_income, 2),
        "percentage_gain_for_worker": f"+{round((extra_worker_income / corporate_worker_payout) * 100, 1)}%"
    })

# -------------------------------------------------------------
# 7 Trust Checkpoints & Extended Co-Op APIs
# -------------------------------------------------------------

@app.route("/api/ekyc/verify", methods=["POST"])
def verify_ekyc():
    data = request.json or {}
    aadhaar = data.get("aadhaar", "").replace(" ", "")
    name = data.get("name", "Verified Member")
    role = data.get("role", "customer")

    is_valid = len(aadhaar) == 12 or aadhaar.isdigit() or len(aadhaar) >= 4
    if not is_valid and aadhaar != "DEMO":
        return jsonify({"success": False, "error": "Invalid 12-digit Aadhaar / e-KYC credentials"}), 400

    ekyc_id = f"UIDAI-EKYC-{random.randint(100000, 999999)}"
    return jsonify({
        "success": True,
        "ekyc_id": ekyc_id,
        "name": name,
        "role": role,
        "status": "AADHAAR_EKYC_VERIFIED",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "verification_badge": "Government e-KYC Verified Co-op Member",
        "message": f"e-KYC identity authorized for {name} ({role.upper()}) via DigiLocker/UIDAI Gateway."
    })

@app.route("/api/escrow/lock", methods=["POST"])
def lock_escrow_payment():
    data = request.json or {}
    job_id = data.get("job_id", f"JOB-{random.randint(1000, 9999)}")
    amount = float(data.get("amount", 499))
    customer_name = data.get("customer_name", "Customer")
    service_title = data.get("service_title", "General Maintenance")

    worker_share = round(amount * 0.92, 2)
    coop_reserve = round(amount * 0.08, 2)

    escrow_record = {
        "escrow_id": f"ESC-RZP-{random.randint(10000, 99999)}",
        "job_id": job_id,
        "customer": customer_name,
        "service": service_title,
        "total_amount": amount,
        "worker_payout_92": worker_share,
        "coop_reserve_8": coop_reserve,
        "status": "FUNDS_LOCKED_IN_ESCROW",
        "payment_gateway": "Razorpay Escrow Sandbox (Instant UPI/NetBanking)",
        "locked_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify({
        "success": True,
        "escrow": escrow_record,
        "message": f"₹{amount} safely locked in Co-op Escrow via Razorpay. Worker payout guaranteed upon dual OTP verification."
    })

@app.route("/api/feedback/post-service", methods=["POST"])
def post_service_feedback():
    data = request.json or {}
    job_id = data.get("job_id", "JOB-101")
    durability_score = data.get("durability_rating", 5)
    worker_skill_score = data.get("worker_skill_rating", 5)
    asset_damage_reported = data.get("asset_damage", False)
    notes = data.get("notes", "Repair holding strong! Excellent service.")

    return jsonify({
        "success": True,
        "job_id": job_id,
        "feedback_logged_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "durability_score": durability_score,
        "worker_skill_score": worker_skill_score,
        "asset_damage_reported": asset_damage_reported,
        "trust_score_bonus": "+2 Co-op Trust Points awarded to worker ledger",
        "message": "7-Day Post-Service validation saved to permanent Co-op quality ledger."
    })

@app.route("/api/community/bulk-book", methods=["POST"])
def book_bulk_service():
    data = request.json or {}
    society_name = data.get("society_name", "Greenwood Residency RWA")
    service_title = data.get("service_title", "Apartment Water Line Audit")
    flats_count = int(data.get("flats_count", 25))
    contact_person = data.get("contact_person", "RWA Secretary")
    phone = data.get("phone", "+91 98450 00000")

    base_price = 499
    discounted_price = 375  # 25% off bulk rate
    total_savings = (base_price - discounted_price) * flats_count
    batch_id = f"RWA-BULK-{random.randint(1000, 9999)}"

    return jsonify({
        "success": True,
        "batch_id": batch_id,
        "society_name": society_name,
        "service_title": service_title,
        "flats_pooled": flats_count,
        "discount_applied": "25% Bulk Co-op Tier",
        "unit_price": discounted_price,
        "total_society_savings": total_savings,
        "status": "POD_ASSIGNED_DISPATCH_SCHEDULED",
        "message": f"Bulk service order #{batch_id} registered for {society_name}! Dedicated Co-op worker pod scheduled."
    })

@app.route("/api/community/worker-pledge", methods=["POST"])
def worker_pledge_slot():
    data = request.json or {}
    worker_name = data.get("worker_name", "Verified Master Pro")
    campaign_id = data.get("campaign_id", "c1")
    trade = data.get("trade", "Electrical")
    slots = int(data.get("slots", 5))

    return jsonify({
        "success": True,
        "pledge_id": f"PLG-{random.randint(1000, 9999)}",
        "worker_name": worker_name,
        "campaign_id": campaign_id,
        "trade": trade,
        "slots_pledged": slots,
        "guaranteed_day_earnings": slots * 450,
        "message": f"Worker slot confirmed for {worker_name}! Guaranteed volume day pay allocated."
    })

@app.route("/api/dispute/file", methods=["POST"])
def file_dispute():
    data = request.json or {}
    job_id = data.get("job_id", "JOB-UNKNOWN")
    customer = data.get("customer", "Customer")
    worker = data.get("worker", "Worker")
    reason = data.get("reason", "Verification mismatch / scope discrepancy")
    amount = float(data.get("amount", 499))

    dispute_case = {
        "id": f"DISP-{random.randint(100, 999)}",
        "job_id": job_id,
        "customer": customer,
        "worker": worker,
        "reason": reason,
        "amount": amount,
        "status": "ESCROW_FROZEN_UNDER_COOP_REVIEW",
        "tribunal_hearing_deadline": (datetime.now() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S"),
        "logged_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify({
        "success": True,
        "dispute": dispute_case,
        "message": f"Escrow frozen (₹{amount}). Case #{dispute_case['id']} logged to Co-op Tribunal ledger for 24h peer resolution."
    })

@app.route("/api/analytics/government", methods=["GET"])
def get_government_impact_analytics():
    return jsonify({
        "success": True,
        "niti_aayog_alignment": {
            "gig_workers_projected_2030": "23.5 Million",
            "informal_sector_base": "490 Million Tradespeople",
            "coop_income_uplift_pct": "+28.4%",
            "formal_social_security_coverage": "100% Co-op Reserve Funded"
        },
        "urban_impact": {
            "congestion_reduction_pct": 28.5,
            "hyperlocal_radius_avg_km": 1.4,
            "emergency_priority_response_time_min": 11.2,
            "local_economic_retention_pct": 92.0
        },
        "open_ledger": {
            "total_active_tradespeople": 2840,
            "active_escrow_balance_inr": 482950,
            "coop_welfare_reserve_inr": 218400,
            "completed_verified_gigs": 14280,
            "dispute_rate_pct": 0.3
        }
    })

@app.route("/api/analytics/gig-distribution", methods=["GET"])
def get_gig_workforce_distribution():
    sectors = [
        {"sector": "Ecommerce", "workers_lakhs": 37.0, "icon": "fa-cart-shopping", "color": "emerald"},
        {"sector": "Logistics", "workers_lakhs": 15.0, "icon": "fa-truck-fast", "color": "teal"},
        {"sector": "BFSI", "workers_lakhs": 10.0, "icon": "fa-building-columns", "color": "cyan"},
        {"sector": "Manufacturing", "workers_lakhs": 10.0, "icon": "fa-industry", "color": "blue"},
        {"sector": "Retail", "workers_lakhs": 7.0, "icon": "fa-shop", "color": "indigo"},
        {"sector": "Transportation", "workers_lakhs": 6.0, "icon": "fa-van-shuttle", "color": "violet"},
        {"sector": "IT", "workers_lakhs": 5.0, "icon": "fa-laptop-code", "color": "purple"},
        {"sector": "Healthcare", "workers_lakhs": 3.0, "icon": "fa-heart-pulse", "color": "rose"},
        {"sector": "ITeS", "workers_lakhs": 3.0, "icon": "fa-headset", "color": "amber"},
        {"sector": "Construction", "workers_lakhs": 3.0, "icon": "fa-helmet-safety", "color": "orange"},
        {"sector": "Education", "workers_lakhs": 3.0, "icon": "fa-graduation-cap", "color": "emerald"},
        {"sector": "Automotive", "workers_lakhs": 1.0, "icon": "fa-car", "color": "teal"},
        {"sector": "Hospitality", "workers_lakhs": 0.8, "icon": "fa-hotel", "color": "cyan"},
        {"sector": "Infrastructure", "workers_lakhs": 0.7, "icon": "fa-road", "color": "blue"},
        {"sector": "Telecom", "workers_lakhs": 0.5, "icon": "fa-tower-cell", "color": "indigo"},
        {"sector": "Power & Energy", "workers_lakhs": 0.3, "icon": "fa-bolt", "color": "amber"}
    ]
    return jsonify({
        "success": True,
        "source": "NITI Aayog 'Booming Gig and Platform Economy' Report & ILO Benchmarks",
        "total_sectors": len(sectors),
        "data": sectors
    })

# -------------------------------------------------------------
# App Runner
# -------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
