/**
 * SahiDeal (पारस्परिक सहकारी) - Core JavaScript Engine
 * Smart India Hackathon 2026 - Problem Statement ID: 26089
 * Handles Role Switcher, Sound FX (Web Audio), Toast Notifications, Multilingual, and Live Pulse
 */

// Sound FX Engine using Web Audio API (zero external audio dependencies)
const SoundFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
    },
    playTone(freq, type, duration, delay = 0) {
        try {
            this.init();
            if (!this.ctx) return;
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            }, delay);
        } catch (e) {
            console.warn("Web Audio not unlocked yet:", e);
        }
    },
    success() {
        this.playTone(523.25, 'sine', 0.15, 0);   // C5
        this.playTone(659.25, 'sine', 0.25, 100); // E5
        this.playTone(783.99, 'sine', 0.35, 200); // G5
    },
    pop() {
        this.playTone(800, 'triangle', 0.08, 0);
    },
    sos() {
        this.playTone(880, 'sawtooth', 0.2, 0);
        this.playTone(660, 'sawtooth', 0.2, 220);
        this.playTone(880, 'sawtooth', 0.3, 440);
    },
    cash() {
        this.playTone(987.77, 'sine', 0.1, 0);
        this.playTone(1318.51, 'sine', 0.25, 80);
        try {
            if (window.confetti) {
                window.confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 }
                });
            }
        } catch(e) {}
    }
};

// Toast Notification Manager
const Toast = {
    show(message, type = 'success', duration = 4000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        let icon = 'fa-circle-check text-emerald-400';
        let borderColor = 'border-emerald-500/40';
        let bgGlow = 'rgba(16, 185, 129, 0.15)';

        if (type === 'error' || type === 'sos') {
            icon = 'fa-triangle-exclamation text-rose-400';
            borderColor = 'border-rose-500/50';
            bgGlow = 'rgba(244, 63, 94, 0.2)';
            SoundFX.sos();
        } else if (type === 'info') {
            icon = 'fa-circle-info text-sky-400';
            borderColor = 'border-sky-500/40';
            bgGlow = 'rgba(56, 189, 248, 0.15)';
            SoundFX.pop();
        } else {
            SoundFX.success();
        }

        toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border ${borderColor} text-slate-100 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-3 opacity-0 pointer-events-auto`;
        toast.style.background = `linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96))`;
        toast.style.boxShadow = `0 12px 30px -5px ${bgGlow}`;

        toast.innerHTML = `
            <i class="fa-solid ${icon} text-lg shrink-0"></i>
            <div class="text-xs sm:text-sm font-medium pr-2 leading-snug">${message}</div>
            <button onclick="this.parentElement.remove()" class="ml-auto text-slate-400 hover:text-white text-xs p-1">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-3', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }
};

// Role Gateway & Authentication Manager
const RoleGateway = {
    currentRole: localStorage.getItem('sahideal_role') || 'customer',
    
    init() {
        this.updateNavUI();
    },

    openModal(defaultTab = 'customer') {
        const modal = document.getElementById('role-auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.switchTab(defaultTab);
            SoundFX.pop();
        }
    },

    closeModal() {
        const modal = document.getElementById('role-auth-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    switchTab(tab) {
        const tabCust = document.getElementById('tab-btn-customer');
        const tabWork = document.getElementById('tab-btn-worker');
        const viewCust = document.getElementById('auth-view-customer');
        const viewWork = document.getElementById('auth-view-worker');

        if (tab === 'worker') {
            if (tabWork) tabWork.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all';
            if (tabCust) tabCust.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-all';
            if (viewWork) viewWork.classList.remove('hidden');
            if (viewCust) viewCust.classList.add('hidden');
        } else {
            if (tabCust) tabCust.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all';
            if (tabWork) tabWork.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-all';
            if (viewCust) viewCust.classList.remove('hidden');
            if (viewWork) viewWork.classList.add('hidden');
        }
    },

    selectRole(role) {
        this.currentRole = role;
        localStorage.setItem('sahideal_role', role);
        
        // Make asynchronous API call if backend active
        fetch('/api/auth/switch-role', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({role: role})
        }).catch(err => console.log("Static mode fallback"));

        this.updateNavUI();
        this.closeModal();

        if (role === 'worker') {
            Toast.show("⚡ Switched to Worker-Owner Portal! Welcome Ramesh Kumar (Master Electrician).", "success");
            setTimeout(() => {
                if (!window.location.href.includes('worker')) {
                    window.location.href = 'worker.html';
                }
            }, 600);
        } else {
            Toast.show("👤 Switched to Customer Portal! Welcome Priya Sharma (Resident).", "info");
            setTimeout(() => {
                if (window.location.href.includes('worker') || window.location.href.includes('governance') || window.location.href.includes('community') || window.location.href.includes('about')) {
                    window.location.href = 'index.html';
                }
            }, 600);
        }
    },

    demoQuickLogin(role) {
        this.selectRole(role);
    },

    updateNavUI() {
        const badge = document.getElementById('current-role-badge');
        const roleName = document.getElementById('current-user-name');
        if (badge && roleName) {
            if (this.currentRole === 'worker') {
                badge.innerHTML = '<i class="fa-solid fa-screwdriver-wrench text-amber-400 mr-1.5"></i> Worker-Owner';
                roleName.textContent = 'Ramesh Kumar (Pro)';
            } else {
                badge.innerHTML = '<i class="fa-solid fa-user-check text-emerald-400 mr-1.5"></i> Customer';
                roleName.textContent = 'Priya Sharma';
            }
        }
    }
};

// Multilingual Translation Dictionary
const TRANSLATIONS = {
    en: {
        nav_services: "Consumer Hub",
        nav_worker_hub: "Worker-Owner Hub",
        nav_governance: "Co-op Council (Voting)",
        nav_community: "RWA Bulk Hub",
        sos_btn: "SOS 15-Min Handyman",
        hero_title_1: "Fair Work.",
        hero_title_2: "Community Trust.",
        hero_title_3: "Zero Exploitation.",
        hero_sub: "India's first 100% worker-owned cooperative for household & community services. 92% direct worker take-home, transparent 8% co-op fee, 7-checkpoint escrow, and democratic governance.",
        calc_title: "The Platform Cooperativism Advantage",
        calc_sub: "Test any service booking amount and compare how much more income stays in worker pockets with SahiDeal's 8% take-rate vs traditional 28% corporate fees."
    },
    hi: {
        nav_services: "ग्राहक हब",
        nav_worker_hub: "श्रमिक-मालिक पोर्टल",
        nav_governance: "सहकारी परिषद (मतदान)",
        nav_community: "सोसायटी सामूहिक हब",
        sos_btn: "आपातकालीन 15-मिनट मिस्त्री",
        hero_title_1: "उचित काम।",
        hero_title_2: "सामुदायिक विश्वास।",
        hero_title_3: "शून्य शोषण।",
        hero_sub: "भारत का पहला 100% श्रमिक-स्वामित्व वाला सहकारी मंच। 92% सीधी श्रमिक कमाई, पारदर्शी 8% सहकारी शुल्क, 7-चेकपॉइंट एस्क्रो और लोकतांत्रिक शासन।",
        calc_title: "सहकारी मॉडल का आर्थिक लाभ",
        calc_sub: "किसी भी सेवा राशि की जांच करें और देखें कि पारंपरिक 28% कंपनियों की तुलना में सहीडील के 8% मॉडल से कारीगरों को कितना अधिक लाभ मिलता है।"
    },
    kn: {
        nav_services: "ಗ್ರಾಹಕ ಹಬ್",
        nav_worker_hub: "ಕಾರ್ಮಿಕ ಮಾಲೀಕ ಪೋರ್ಟಲ್",
        nav_governance: "ಸಹಕಾರಿ ಮಂಡಳಿ",
        nav_community: "ಸೊಸೈಟಿ ಹಬ್",
        sos_btn: "ತುರ್ತು 15-ನಿಮಿಷ ಕರಕುಶಲ",
        hero_title_1: "ನ್ಯಾಯಯುತ ಕೆಲಸ.",
        hero_title_2: "ಸಮುದಾಯ ನಂಬಿಕೆ.",
        hero_title_3: "ಶೂನ್ಯ ಶೋಷಣೆ.",
        hero_sub: "ಭಾರತದ ಮೊದಲ 100% ಕಾರ್ಮಿಕರ ಒಡೆತನದ ಸಹಕಾರಿ ಸೇವಾ ವೇದಿಕೆ. 92% ನೇರ ಆದಾಯ ಮತ್ತು 8% ಸಹಕಾರಿ ಶುಲ್ಕ.",
        calc_title: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಕೋಆಪರೇಟಿವಿಸಂ ಪ್ರಯೋಜನ",
        calc_sub: "ಕಾರ್ಮಿಕರಿಗೆ ಉಳಿಯುವ ಆದಾಯವನ್ನು ಹೋಲಿಸಲು ಸ್ಲೈಡರ್ ಬಳಸಿ."
    },
    ta: {
        nav_services: "வாடிக்கையாளர் தளம்",
        nav_worker_hub: "தொழிலாளர் போர்டல்",
        nav_governance: "கூட்டுறவு சபை",
        nav_community: "குடியிருப்பு சங்கம்",
        sos_btn: "அவசர 15-நிமிட உதவி",
        hero_title_1: "நியாயமான வேலை.",
        hero_title_2: "சமூக நம்பிக்கை.",
        hero_title_3: "சுரண்டலற்ற தளம்.",
        hero_sub: "இந்தியாவின் முதல் தொழிலாளர் உரிமையாளர் கூட்டுறவு தளம். 92% நேரடி வருவாய், 8% எளிய கூட்டுறவு கட்டணம்.",
        calc_title: "கூட்டுறவு மாதிரியின் பொருளாதார நன்மை",
        calc_sub: "தொழிலாளர்களுக்கு கிடைக்கும் கூடுதல் வருவாயை கணக்கிடுங்கள்."
    }
};

function changeLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
    Toast.show(`Language switched to ${lang.toUpperCase()}`, 'info');
}

// Fair Calculator Controller (8% Co-op fee vs 28% Corporate cut)
function updateFairCalculator(val) {
    const amount = parseFloat(val);
    const label = document.getElementById('calc-amount-label');
    if (label) label.textContent = `₹${amount.toLocaleString('en-IN')}`;

    // Corporate 28% cut
    const corpMiddleman = Math.round(amount * 0.28);
    const corpWorker = amount - corpMiddleman;

    // SahiDeal 8% Co-op Fee (feeds welfare & dividends)
    const coopReserve = Math.round(amount * 0.08);
    const coopWorker = amount - coopReserve;
    const extraInPocket = coopWorker - corpWorker;
    const percentGain = Math.round((extraInPocket / corpWorker) * 100);

    const elCorpWorker = document.getElementById('calc-corp-worker');
    const elCorpCut = document.getElementById('calc-corp-cut');
    const elCoopWorker = document.getElementById('calc-coop-worker');
    const elCoopReserve = document.getElementById('calc-coop-reserve');
    const elExtra = document.getElementById('calc-extra-gain');
    const elGainPct = document.getElementById('calc-gain-pct');

    if (elCorpWorker) elCorpWorker.textContent = `₹${corpWorker.toLocaleString('en-IN')}`;
    if (elCorpCut) elCorpCut.textContent = `₹${corpMiddleman.toLocaleString('en-IN')} (28% Middleman Cut)`;
    if (elCoopWorker) elCoopWorker.textContent = `₹${coopWorker.toLocaleString('en-IN')}`;
    if (elCoopReserve) elCoopReserve.textContent = `₹${coopReserve.toLocaleString('en-IN')} (8% Co-op Reserve & Dividend)`;
    if (elExtra) elExtra.textContent = `+₹${extraInPocket.toLocaleString('en-IN')}`;
    if (elGainPct) elGainPct.textContent = `(+${percentGain}% higher take-home)`;
}

// Emergency SOS Modal Controller
function openSosModal() {
    const modal = document.getElementById('sos-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        SoundFX.sos();
    }
}

function closeSosModal() {
    const modal = document.getElementById('sos-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function triggerEmergencySos() {
    const btn = document.getElementById('btn-sos-dispatch');
    const statusBox = document.getElementById('sos-status-box');
    const type = document.getElementById('sos-type') ? document.getElementById('sos-type').value : "Emergency Pipe Burst";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatched Pro via Rapid GIS Radar...';
    }

    fetch('/api/sos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({service_type: type})
    }).then(r => r.json()).then(data => {
        if (statusBox) statusBox.classList.remove('hidden');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Master Pro Dispatched (ETA: 12 Mins)';
        Toast.show("🚨 Emergency SOS Handyman Ramesh Kumar dispatched! Police vetted & 1.2km away.", "sos", 6000);
        SoundFX.sos();
    }).catch(err => {
        if (statusBox) statusBox.classList.remove('hidden');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Master Pro Dispatched (ETA: 12 Mins)';
        Toast.show("🚨 Emergency SOS Handyman Ramesh Kumar dispatched! ETA: 12 Mins.", "sos", 6000);
    });
}

// Live Ticker Carousel
const LIVE_TICKERS = [
    "⚡ Ramesh K. completed 'Safety Audit' in Indiranagar (+₹643 direct instant payout, 8% co-op fee)",
    "👵 Senior citizen booked 'Elder Tech Handyman' via Twilio IVR voice call in Kannada",
    "🛡️ Palm Meadows RWA unlocked 25% Group Discount on Solar Deep Cleaning",
    "🗳️ 18 Co-op members voted YES on Proposal #08 (EV Battery Subsidies)",
    "👩 Women-Safety Filter: Lakshmi Devi assigned for Deep Home Sanitation in Koramangala"
];
let tickerIndex = 0;
setInterval(() => {
    const ticker = document.getElementById('live-feed-ticker');
    if (ticker) {
        ticker.style.opacity = 0;
        setTimeout(() => {
            tickerIndex = (tickerIndex + 1) % LIVE_TICKERS.length;
            ticker.textContent = LIVE_TICKERS[tickerIndex];
            ticker.style.opacity = 1;
        }, 300);
    }
}, 5000);

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    RoleGateway.init();
    updateFairCalculator(1500);
});
