/**
 * SahiDeal (पारस्परिक सहकारी) - Core JavaScript Engine
 * Smart India Hackathon 2026 - Problem Statement ID: 26089
 * Handles Role Management, Custom Profile Registrations, Live Sync & Audio FX
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
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.8 }
                });
            }
        } catch(e) {}
    }
};

// Toast Notification Manager
const Toast = {
    show(message, type = 'success', duration = 4500) {
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

// Role Gateway & Profile Manager
const RoleGateway = {
    currentRole: localStorage.getItem('sahideal_active_role') || (window.location.href.includes('worker') ? 'worker' : 'customer'),
    
    init() {
        this.syncWithState();
        this.updateNavUI();
    },

    syncWithState() {
        if (typeof CoopSync !== 'undefined') {
            const customer = CoopSync.getCustomer();
            const worker = CoopSync.getWorker();

            const custNameInput = document.getElementById('cust-reg-name');
            const custPhoneInput = document.getElementById('cust-reg-phone');
            const custAddrInput = document.getElementById('cust-reg-address');

            if (customer && custNameInput) {
                custNameInput.value = customer.name || "";
                custPhoneInput.value = customer.phone || "";
                custAddrInput.value = customer.address || "";
            }

            const workNameInput = document.getElementById('worker-reg-name');
            const workPhoneInput = document.getElementById('worker-reg-phone');
            const workTradeInput = document.getElementById('worker-reg-trade');
            const workLocInput = document.getElementById('worker-reg-loc');

            if (worker && workNameInput) {
                workNameInput.value = worker.name || "";
                workPhoneInput.value = worker.phone || "";
                if (workTradeInput) workTradeInput.value = worker.trade || "Master Electrician";
                if (workLocInput) workLocInput.value = worker.location || "Indiranagar (1.2 km radius)";
            }
        }
    },

    openModal(defaultTab) {
        const modal = document.getElementById('role-auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const tabToUse = defaultTab || (window.location.href.includes('worker') ? 'worker' : 'customer');
            this.switchTab(tabToUse);
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

    saveCustomCustomer() {
        const name = document.getElementById('cust-reg-name').value.trim() || "Customer";
        const phone = document.getElementById('cust-reg-phone').value.trim() || "+91 98765 43210";
        const address = document.getElementById('cust-reg-address').value.trim() || "Indiranagar, Bangalore";

        const user = { role: 'customer', name, phone, address };
        if (typeof CoopSync !== 'undefined') {
            CoopSync.setCustomer(user);
        }

        this.currentRole = 'customer';
        localStorage.setItem('sahideal_active_role', 'customer');
        this.updateNavUI();
        this.closeModal();

        Toast.show(`👋 Welcome, ${name}! Logged in as Customer. You can now post repair requests.`, 'success');
        SoundFX.success();

        setTimeout(() => {
            if (!window.location.href.includes('index') && window.location.pathname !== '/' && !window.location.href.endsWith('/')) {
                window.location.href = 'index.html';
            }
        }, 600);
    },

    saveCustomWorker() {
        const name = document.getElementById('worker-reg-name').value.trim() || "Worker-Owner";
        const phone = document.getElementById('worker-reg-phone').value.trim() || "+91 98860 54321";
        const trade = document.getElementById('worker-reg-trade').value;
        const exp = document.getElementById('worker-reg-exp') ? document.getElementById('worker-reg-exp').value : "8 Years";
        const location = document.getElementById('worker-reg-loc') ? document.getElementById('worker-reg-loc').value : "Indiranagar";

        const user = {
            role: 'worker',
            name,
            phone,
            trade,
            experience: exp,
            location,
            avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"
        };

        if (typeof CoopSync !== 'undefined') {
            CoopSync.setWorker(user);
        }

        this.currentRole = 'worker';
        localStorage.setItem('sahideal_active_role', 'worker');
        this.updateNavUI();
        this.closeModal();

        Toast.show(`⚡ Welcome, ${name} (${trade})! Worker Radar is active. You will receive live gig dispatches.`, 'success');
        SoundFX.cash();

        setTimeout(() => {
            if (!window.location.href.includes('worker')) {
                window.location.href = 'worker.html';
            }
        }, 600);
    },

    updateNavUI() {
        const badge = document.getElementById('current-role-badge');
        const roleName = document.getElementById('current-user-name');
        
        let customer = (typeof CoopSync !== 'undefined') ? CoopSync.getCustomer() : null;
        let worker = (typeof CoopSync !== 'undefined') ? CoopSync.getWorker() : null;

        const isWorkerPage = window.location.href.includes('worker');

        if (isWorkerPage) {
            if (badge) badge.innerHTML = '<i class="fa-solid fa-screwdriver-wrench text-amber-400 mr-1.5"></i> Worker Radar';
            if (roleName) roleName.textContent = worker ? worker.name : "Ramesh Kumar";
        } else {
            if (badge) badge.innerHTML = '<i class="fa-solid fa-user-check text-emerald-400 mr-1.5"></i> Customer';
            if (roleName) roleName.textContent = customer ? customer.name : "Srivatsa Soham";
        }
    }
};

// Multilingual Translation Dictionary
const TRANSLATIONS = {
    en: {
        nav_services: "Customer Portal",
        nav_worker_hub: "Worker-Owner Hub",
        nav_governance: "Co-op Council (Voting)",
        nav_community: "RWA Bulk Hub",
        sos_btn: "SOS 15-Min Handyman",
        hero_title_1: "Fair Work.",
        hero_title_2: "Community Trust.",
        hero_title_3: "Zero Exploitation.",
        hero_sub: "India's first 100% worker-owned cooperative for household & community services. 92% direct worker take-home, transparent 8% co-op fee, 7-checkpoint escrow, and democratic governance."
    },
    hi: {
        nav_services: "ग्राहक पोर्टल",
        nav_worker_hub: "श्रमिक-मालिक हब",
        nav_governance: "सहकारी परिषद (मतदान)",
        nav_community: "सोसायटी सामूहिक हब",
        sos_btn: "आपातकालीन 15-मिनट मिस्त्री",
        hero_title_1: "उचित काम।",
        hero_title_2: "सामुदायिक विश्वास।",
        hero_title_3: "शून्य शोषण।",
        hero_sub: "भारत का पहला 100% श्रमिक-स्वामित्व वाला सहकारी मंच। 92% सीधी श्रमिक कमाई, पारदर्शी 8% सहकारी शुल्क, 7-चेकपॉइंट एस्क्रो और लोकतांत्रिक शासन।"
    },
    kn: {
        nav_services: "ಗ್ರಾಹಕ ಪೋರ್ಟಲ್",
        nav_worker_hub: "ಕಾರ್ಮಿಕ ಮಾಲೀಕ ಪೋರ್ಟಲ್",
        nav_governance: "ಸಹಕಾರಿ ಮಂಡಳಿ",
        nav_community: "ಸೊಸೈಟಿ ಹಬ್",
        sos_btn: "ತುರ್ತು 15-ನಿಮಿಷ ಕರಕುಶಲ",
        hero_title_1: "ನ್ಯಾಯಯುತ ಕೆಲಸ.",
        hero_title_2: "ಸಮುದಾಯ ನಂಬಿಕೆ.",
        hero_title_3: "ಶೂನ್ಯ ಶೋಷಣೆ.",
        hero_sub: "ಭಾರತದ ಮೊದಲ 100% ಕಾರ್ಮಿಕರ ಒಡೆತನದ ಸಹಕಾರಿ ಸೇವಾ ವೇದಿಕೆ. 92% ನೇರ ಆದಾಯ ಮತ್ತು 8% ಸಹಕಾರಿ ಶುಲ್ಕ."
    },
    ta: {
        nav_services: "வாடிக்கையாளர் போர்டல்",
        nav_worker_hub: "தொழிலாளர் போர்டல்",
        nav_governance: "கூட்டுறவு சபை",
        nav_community: "குடியிருப்பு சங்கம்",
        sos_btn: "அவசர 15-நிமிட உதவி",
        hero_title_1: "நியாயமான வேலை.",
        hero_title_2: "சமூக நம்பிக்கை.",
        hero_title_3: "சுரண்டலற்ற தளம்.",
        hero_sub: "இந்தியாவின் முதல் தொழிலாளர் உரிமையாளர் கூட்டுறவு தளம். 92% நேரடி வருவாய், 8% எளிய கூட்டுறவு கட்டணம்."
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

    if (typeof CoopSync !== 'undefined') {
        const customer = CoopSync.getCustomer() || { name: "Valued Customer", phone: "+91 98450 12345", address: "Indiranagar" };
        CoopSync.postCustomerJob({
            title: `🚨 EMERGENCY: ${type}`,
            category: "emergency",
            description: `Urgent emergency response requested at ${customer.address}. Immediate <15 min dispatch needed.`,
            price: 399,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            urgency: "⚡ Critical Emergency (<15 mins)"
        });
    }

    setTimeout(() => {
        if (statusBox) statusBox.classList.remove('hidden');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Nearest Handyman Dispatched (ETA: 12 Mins)';
        Toast.show("🚨 Emergency SOS Handyman dispatched! Broadcast sent to all nearby workers.", "sos", 6000);
        SoundFX.sos();
    }, 600);
}

// Fair Calculator Controller (8% Co-op fee vs 28% Corporate cut)
function updateFairCalculator(val) {
    const amount = parseFloat(val);
    const label = document.getElementById('calc-amount-label');
    if (label) label.textContent = `₹${amount.toLocaleString('en-IN')}`;

    const corpMiddleman = Math.round(amount * 0.28);
    const corpWorker = amount - corpMiddleman;

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

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    RoleGateway.init();
    updateFairCalculator(1500);
});
