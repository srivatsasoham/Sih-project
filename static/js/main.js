/**
 * SahiDeal (पारस्परिक सहकारी) - Core JavaScript Engine
 * Smart India Hackathon 2026 - Problem Statement ID: 26089
 * Manages: Theme Engine (Light/Dark), Multilingual i18n, Phone OTP Auth,
 * e-KYC, Emergency SOS Sentinel, Notifications & Sound FX
 */

// Sound FX Engine using Web Audio API
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
    alarm() {
        this.playTone(1046.50, 'sawtooth', 0.18, 0);
        this.playTone(880.00, 'sawtooth', 0.18, 180);
        this.playTone(1046.50, 'sawtooth', 0.18, 360);
        this.playTone(880.00, 'sawtooth', 0.18, 540);
        this.playTone(1174.66, 'sawtooth', 0.30, 720);
    },
    cash() {
        this.playTone(987.77, 'sine', 0.1, 0);
        this.playTone(1318.51, 'sine', 0.25, 80);
        try {
            if (window.confetti) {
                window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
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

// Theme Engine (Strict Light Mode Default + Dynamic Dark Mode Toggle)
const ThemeEngine = {
    currentTheme: localStorage.getItem('sahideal_theme') || 'light',

    init() {
        this.applyTheme(this.currentTheme);
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('sahideal_theme', this.currentTheme);
        this.applyTheme(this.currentTheme);
        Toast.show(`Switched to ${this.currentTheme.toUpperCase()} theme`, 'info', 2000);
    },

    applyTheme(theme) {
        const root = document.documentElement;
        const icon = document.getElementById('theme-icon');
        const text = document.getElementById('theme-text');

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
            if (icon) icon.className = 'fa-solid fa-sun text-amber-400 text-xs';
            if (text) text.textContent = 'Light';
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
            if (icon) icon.className = 'fa-solid fa-moon text-indigo-600 text-xs';
            if (text) text.textContent = 'Dark';
        }
    }
};

// Multilingual i18n Translation Engine
const LanguageEngine = {
    currentLang: localStorage.getItem('sahideal_lang') || 'en',

    translations: {
        en: {
            badge_live_sync: "LIVE COOPERATIVE SYNC",
            tagline: "Transforming Informal Labour Through Accountable Commerce",
            nav_services: "Customer Portal",
            nav_worker_hub: "Worker-Owner Portal",
            nav_governance: "Co-op Council (Voting)",
            nav_community: "RWA Bulk Hub",
            nav_about: "SIH Pitch Deck",
            btn_sos: "SOS Safety",
            btn_ekyc: "e-KYC",
            role_customer: "Customer Mode",
            role_worker: "Worker Mode",
            menu_edit_profile: "Edit Profile Details",
            menu_verify_ekyc: "Verify Aadhaar e-KYC",
            menu_customer_mode: "Switch to Customer Mode",
            menu_worker_mode: "Switch to Worker Mode",
            menu_logout: "Log Out & Clear Session",
            title_notifications: "Live Notifications",
            title_auth: "Cooperative Authentication",
            tab_customer: "Customer (Book & Post)",
            tab_worker: "Worker-Owner (Accept)",
            title_ekyc: "Authorized e-KYC Verification",
            title_sos: "Emergency SOS Alert",
            // Page terms
            cat_all: "All Services",
            cat_ambulance: "Ambulance",
            cat_medical: "Medical Help",
            cat_agriculture: "Agriculture Delivery",
            cat_foodtech: "Food Tech Services",
            cat_electrical: "Electrical",
            cat_plumbing: "Plumbing",
            cat_cleaning: "Cleaning",
            cat_appliances: "Appliances",
            cat_carpentry: "Carpentry",
            cat_community: "Community Care",
            post_problem_btn: "Broadcast Problem to Radar",
            find_pros_btn: "Find Nearby Pros",
            instant_payout: "Instant UPI Disbursal",
            durability_title: "7-Day Durability Protection & Guarantee",
            durability_desc: "Zero-cost re-work if issue recurs within 7 days.",
            report_issue_btn: "Report Durability / Workmanship Issue",
            available_balance: "Available Co-op Balance",
            today_earnings: "Today's Direct Earnings (92%)",
            patronage_dividend: "Patronage Dividend Accrued",
            welfare_cover: "Welfare & Health Safety Net",
            file_dispute_btn: "File Tribunal Dispute",
            vote_yes: "Vote YES",
            vote_no: "Vote NO"
        },
        hi: {
            badge_live_sync: "लाइव सहकारी सिंक",
            tagline: "जवाबदेह वाणिज्य के माध्यम से अनौपचारिक श्रम का रूपांतरण",
            nav_services: "ग्राहक पोर्टल",
            nav_worker_hub: "श्रमिक-मालिक पोर्टल",
            nav_governance: "सहकारी परिषद (मतदान)",
            nav_community: "सोसायटी सामूहिक हब",
            nav_about: "प्रस्तुति डेक",
            btn_sos: "आपातकालीन सुरक्षा",
            btn_ekyc: "ई-केवाईसी",
            role_customer: "ग्राहक मोड",
            role_worker: "श्रमिक मोड",
            menu_edit_profile: "प्रोफ़ाइल संपादित करें",
            menu_verify_ekyc: "आधार ई-केवाईसी सत्यापित करें",
            menu_customer_mode: "ग्राहक मोड पर स्विच करें",
            menu_worker_mode: "श्रमिक मोड पर स्विच करें",
            menu_logout: "लॉग आउट और सत्र समाप्त",
            title_notifications: "लाइव सूचनाएं",
            title_auth: "सहकारी प्रमाणीकरण",
            tab_customer: "ग्राहक (बुक और पोस्ट)",
            tab_worker: "श्रमिक-मालिक (स्वीकारें)",
            title_ekyc: "अधिकृत ई-केवाईसी सत्यापन",
            title_sos: "आपातकालीन एसओएस चेतावनी",
            // Page terms
            cat_all: "सभी सेवाएं",
            cat_ambulance: "एम्बुलेंस सेवा",
            cat_medical: "चिकित्सा सहायता",
            cat_agriculture: "कृषि वितरण",
            cat_foodtech: "फूड टेक सेवाएं",
            cat_electrical: "इलेक्ट्रिकल",
            cat_plumbing: "प्लंबिंग",
            cat_cleaning: "सफाई",
            cat_appliances: "उपकरण मरम्मत",
            cat_carpentry: "बढ़ईगीरी",
            cat_community: "सामुदायिक देखभाल",
            post_problem_btn: "रडार पर समस्या प्रसारित करें",
            find_pros_btn: "निकटतम विशेषज्ञ खोजें",
            instant_payout: "तत्काल यूपीआई भुगतान",
            durability_title: "7-दिवसीय स्थायित्व सुरक्षा और गारंटी",
            durability_desc: "7 दिनों के भीतर समस्या आने पर निःशुल्क पुनः सेवा।",
            report_issue_btn: "स्थायित्व / कारीगरी समस्या दर्ज करें",
            available_balance: "उपलब्ध सहकारी शेष राशि",
            today_earnings: "आज की प्रत्यक्ष कमाई (92%)",
            patronage_dividend: "संचित लाभांश",
            welfare_cover: "कल्याण और स्वास्थ्य सुरक्षा कवर",
            file_dispute_btn: "न्यायाधिकरण विवाद दर्ज करें",
            vote_yes: "स्वीकार (हाँ)",
            vote_no: "अस्वीकार (नहीं)"
        },
        kn: {
            badge_live_sync: "ಲೈವ್ ಸಹಕಾರಿ ಸಿಂಕ್",
            tagline: "ಉತ್ತರದಾಯಿತ್ವ ವಾಣಿಜ್ಯದ ಮೂಲಕ ಅನೌಪಚಾರಿಕ ಶ್ರಮ ಪರಿವರ್ತನೆ",
            nav_services: "ಗ್ರಾಹಕ ಪೋರ್ಟಲ್",
            nav_worker_hub: "ಕಾರ್ಮಿಕ ಮಾಲೀಕ ಪೋರ್ಟಲ್",
            nav_governance: "ಸಹಕಾರಿ ಮಂಡಳಿ (ಮತದಾನ)",
            nav_community: "ಸೊಸೈಟಿ ಹಬ್",
            nav_about: "ಪಿಚ್ ಡೆಕ್",
            btn_sos: "ತುರ್ತು ಸುರಕ್ಷತೆ",
            btn_ekyc: "ಇ-ಕೆವೈಸಿ",
            role_customer: "ಗ್ರಾಹಕ ಮೋಡ್",
            role_worker: "ಕಾರ್ಮಿಕ ಮೋಡ್",
            menu_edit_profile: "ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ",
            menu_verify_ekyc: "ಆಧಾರ್ ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲಿಸಿ",
            menu_customer_mode: "ಗ್ರಾಹಕ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ",
            menu_worker_mode: "ಕಾರ್ಮಿಕ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ",
            menu_logout: "ಲಾಗ್ ಔಟ್ & ಸೆಷನ್ ತೆರವು",
            title_notifications: "ಲೈವ್ ಅಧಿಸೂಚನೆಗಳು",
            title_auth: "ಸಹಕಾರಿ ದೃಢೀಕರಣ",
            tab_customer: "ಗ್ರಾಹಕ (ಬುಕ್ & ಪೋಸ್ಟ್)",
            tab_worker: "ಕಾರ್ಮಿಕ-ಮಾಲೀಕ (ಸ್ವೀಕರಿಸಿ)",
            title_ekyc: "ಪ್ರಾಧಿಕೃತ ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲನೆ",
            title_sos: "ತುರ್ತು ಎಸ್‌ಒಎಸ್ ಎಚ್ಚರಿಕೆ",
            // Page terms
            cat_all: "ಎಲ್ಲಾ ಸೇವೆಗಳು",
            cat_ambulance: "ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ",
            cat_medical: "ವೈದ್ಯಕೀಯ ನೆರವು",
            cat_agriculture: "ಕೃಷಿ ವಿತರಣೆ",
            cat_foodtech: "ಫುಡ್ ಟೆಕ್ ಸೇವೆಗಳು",
            cat_electrical: "ವಿದ್ಯುತ್ ಸೇವೆ",
            cat_plumbing: "ಪ್ಲಂಬಿಂಗ್ ಸೇವೆ",
            cat_cleaning: "ಸ್ವಚ್ಛತೆ",
            cat_appliances: "ಉಪಕರಣಗಳ ದುರಸ್ತಿ",
            cat_carpentry: "ಬಡಗಿ ಕೆಲಸ",
            cat_community: "ಸಮುದಾಯ ಕಾಳಜಿ",
            post_problem_btn: "ರಾಡಾರ್‌ಗೆ ಸಮಸ್ಯೆಯನ್ನು ಪ್ರಸಾರ ಮಾಡಿ",
            find_pros_btn: "ಹತ್ತಿರದ ತಜ್ಞರನ್ನು ಹುಡುಕಿ",
            instant_payout: "ತಕ್ಷಣದ ಯುಪಿಐ ಪಾವತಿ",
            durability_title: "7 ದಿನಗಳ ಬಾಳಿಕೆ ರಕ್ಷಣೆ ಮತ್ತು ಗ್ಯಾರಂಟಿ",
            durability_desc: "7 ದಿನಗಳಲ್ಲಿ ಪುನರಾವರ್ತನೆಯಾದರೆ ಉಚಿತ ಮರು-ಕೆಲಸ.",
            report_issue_btn: "ಬಾಳಿಕೆ / ಕೌಶಲ್ಯ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
            available_balance: "ಲಭ್ಯವಿರುವ ಸಹಕಾರಿ ಬಾಕಿ",
            today_earnings: "ಇಂದಿನ ನೇರ ಗಳಿಕೆ (92%)",
            patronage_dividend: "ಸಂಗ್ರಹವಾದ ಲಾಭಾಂಶ",
            welfare_cover: "ಕ್ಷೇಮಾಭಿವೃದ್ಧಿ & ಆರೋಗ್ಯ ಸುರಕ್ಷತೆ",
            file_dispute_btn: "ವಿವಾದ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
            vote_yes: "ಒಪ್ಪಿಗೆ (ಹೌದು)",
            vote_no: "ತಿರಸ್ಕಾರ (ಇಲ್ಲ)"
        },
        ta: {
            badge_live_sync: "நேரலை கூட்டுறவு ஒத்திசைவு",
            tagline: "பொறுப்பான வர்த்தகம் மூலம் முறைசாரா தொழிலாளர் மாற்றம்",
            nav_services: "வாடிக்கையாளர் போர்டல்",
            nav_worker_hub: "தொழிலாளர் போர்டல்",
            nav_governance: "கூட்டுறவு சபை (வாக்கெடுப்பு)",
            nav_community: "குடியிருப்பு சங்கம்",
            nav_about: "விளக்கக் காட்சி",
            btn_sos: "அவசர பாதுகாப்பு",
            btn_ekyc: "இ-கேஒய்சி",
            role_customer: "வாடிக்கையாளர் பயன்முறை",
            role_worker: "தொழிலாளர் பயன்முறை",
            menu_edit_profile: "சுயவிவரத்தைத் திருத்து",
            menu_verify_ekyc: "ஆதார் இ-கேஒய்சி சரிபார்",
            menu_customer_mode: "வாடிக்கையாளர் முறைக்கு மாறு",
            menu_worker_mode: "தொழிலாளர் முறைக்கு மாறு",
            menu_logout: "வெளியேறு & அமர்வை அழி",
            title_notifications: "நேரலை அறிவிப்புகள்",
            title_auth: "கூட்டுறவு அங்கீகாரம்",
            tab_customer: "வாடிக்கையாளர் (பதிவு)",
            tab_worker: "தொழிலாளர் (ஏற்றுக்கொள்)",
            title_ekyc: "அங்கீகரிக்கப்பட்ட இ-கேஒய்சி",
            title_sos: "அவசர எஸ்ஓஎஸ் எச்சரிக்கை",
            // Page terms
            cat_all: "அனைத்து சேவைகள்",
            cat_ambulance: "ஆம்புலன்ஸ் சேவை",
            cat_medical: "மருத்துவ உதவி",
            cat_agriculture: "விவசாய விநியோகம்",
            cat_foodtech: "உணவு தொழில்நுட்ப சேவை",
            cat_electrical: "மின்சார சேவை",
            cat_plumbing: "குழாய் பழுது",
            cat_cleaning: "துப்புரவு பணி",
            cat_appliances: "சாதனங்கள் பழுது",
            cat_carpentry: "மரவேலை",
            cat_community: "சமூக பராமரிப்பு",
            post_problem_btn: "ரேடாரில் சிக்கலை ஒளிபரப்பவும்",
            find_pros_btn: "அருகிலுள்ள நிபுணர்களைக் கண்டறியவும்",
            instant_payout: "உடனடி யுபிஐ பட்டுவாடா",
            durability_title: "7 நாட்கள் உழைப்பு பாதுகாப்பு & உத்தரவாதம்",
            durability_desc: "7 நாட்களுக்குள் சிக்கல் ஏற்பட்டால் இலவச மறுவேலை.",
            report_issue_btn: "உழைப்பு அல்லது வேலைத்திறன் சிக்கலை பதிவு செய்க",
            available_balance: "கூட்டுறவு கணக்கு இருப்பு",
            today_earnings: "இன்றைய நேரடி வருவாய் (92%)",
            patronage_dividend: "கூட்டுறவு பங்கு ஈவுத்தொகை",
            welfare_cover: "நலவாழ்வு & மருத்துவ பாதுகாப்பு",
            file_dispute_btn: "தீர்ப்பாயத்தில் புகார் பதிவு செய்",
            vote_yes: "வாக்கு ஆம்",
            vote_no: "வாக்கு இல்லை"
        }
    },

    init() {
        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = this.currentLang;
        this.applyLanguage(this.currentLang);
    },

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('sahideal_lang', lang);
        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = lang;
        this.applyLanguage(lang);
        Toast.show(`Language switched to ${lang.toUpperCase()}`, 'info', 2000);
    },

    applyLanguage(lang) {
        document.documentElement.lang = lang;
        const dict = this.translations[lang] || this.translations.en;
        
        // 1. Update elements with explicit data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // 2. Map phrases across standard UI elements
        const navIndex = document.getElementById('nav-index');
        const navWorker = document.getElementById('nav-worker');
        const navGov = document.getElementById('nav-governance');
        const navComm = document.getElementById('nav-community');
        const navAbout = document.getElementById('nav-about');

        if (navIndex) navIndex.innerHTML = `<i class="fa-solid fa-house-chimney text-emerald-600 mr-1.5"></i> ${dict.nav_services}`;
        if (navWorker) navWorker.innerHTML = `<i class="fa-solid fa-screwdriver-wrench text-amber-600 mr-1.5"></i> ${dict.nav_worker_hub}`;
        if (navGov) navGov.innerHTML = `<i class="fa-solid fa-check-to-slot text-indigo-600 mr-1.5"></i> ${dict.nav_governance}`;
        if (navComm) navComm.innerHTML = `<i class="fa-solid fa-people-roof text-teal-600 mr-1.5"></i> ${dict.nav_community}`;
        if (navAbout) navAbout.innerHTML = `<i class="fa-solid fa-lightbulb text-amber-600 mr-1.5"></i> ${dict.nav_about}`;
    }
};

// Phone OTP Authentication System
const AuthOTP = {
    isOtpSent: false,
    isOtpVerified: false,
    verifiedPhone: "",

    async sendOtp() {
        const phoneInput = document.getElementById('auth-phone-input');
        const phone = phoneInput ? phoneInput.value.trim() : "";

        if (!phone || phone.length < 10) {
            Toast.show("Please enter a valid 10-digit mobile phone number.", "error");
            return;
        }

        const btn = document.getElementById('btn-send-otp');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Sending...';
        }

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();

            if (data.success) {
                this.isOtpSent = true;
                this.verifiedPhone = phone;

                const otpRow = document.getElementById('otp-input-row');
                const feedback = document.getElementById('otp-feedback-msg');
                const statusBadge = document.getElementById('otp-status-badge');

                if (otpRow) otpRow.classList.remove('hidden');
                if (statusBadge) {
                    statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 animate-pulse';
                    statusBadge.textContent = 'OTP DISPATCHED';
                }
                if (feedback) {
                    feedback.innerHTML = `✅ 6-digit OTP sent to <b>${phone}</b>. Enter code below.` + (data.dev_hint_otp ? ` <span class="text-emerald-600 font-mono">(Dev Hint: <b>${data.dev_hint_otp}</b>)</span>` : '');
                }

                Toast.show(`OTP dispatched to ${phone} via SMS Gateway!`, 'success');
                SoundFX.pop();

                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Resend OTP';
                }
            } else {
                Toast.show(data.error || "Failed to send OTP.", "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Send OTP';
                }
            }
        } catch (e) {
            Toast.show("Error connecting to auth server.", "error");
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Send OTP';
            }
        }
    },

    async verifyOtp() {
        const phone = this.verifiedPhone || (document.getElementById('auth-phone-input') ? document.getElementById('auth-phone-input').value.trim() : "");
        const otpInput = document.getElementById('auth-otp-input');
        const otp = otpInput ? otpInput.value.trim() : "";

        if (!otp || otp.length < 4) {
            Toast.show("Please enter the received OTP code.", "error");
            return;
        }

        const btn = document.getElementById('btn-verify-otp');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Verifying...';
        }

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();

            if (data.success) {
                this.isOtpVerified = true;
                const statusBadge = document.getElementById('otp-status-badge');
                const feedback = document.getElementById('otp-feedback-msg');

                if (statusBadge) {
                    statusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
                    statusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> PHONE VERIFIED';
                }
                if (feedback) {
                    feedback.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> Phone number ${phone} successfully verified!</span>`;
                }

                Toast.show("🎉 Phone number verified! You can now submit registration/login.", "success");
                SoundFX.success();

                if (btn) {
                    btn.disabled = true;
                    btn.className = 'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0';
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Verified';
                }
            } else {
                Toast.show(data.error || "Invalid OTP code.", "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Verify OTP';
                }
            }
        } catch (e) {
            Toast.show("Error verifying OTP.", "error");
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Verify OTP';
            }
        }
    }
};

let isWorkerCertVerified = false;

async function verifyWorkerCertificate() {
    const certInput = document.getElementById('worker-reg-cert');
    const certName = certInput ? certInput.value.trim() : '';
    if (!certName) {
        Toast.show("Please enter your Company / Skill Certificate name.", "error");
        return;
    }

    const btn = document.getElementById('btn-verify-cert');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Verifying...';
    }

    try {
        const res = await fetch('/api/worker/cert/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cert_name: certName, skills: certName })
        });
        const data = await res.json();
        if (data.success) {
            isWorkerCertVerified = true;
            const badge = document.getElementById('cert-status-badge');
            const feedback = document.getElementById('cert-feedback-msg');
            if (badge) {
                badge.className = 'text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
                badge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> VERIFIED';
            }
            if (feedback) {
                feedback.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-certificate text-emerald-600 mr-1"></i> Skill Certificate '${certName}' verified by Co-op Council!</span>`;
            }
            if (btn) {
                btn.className = 'px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0';
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Verified';
            }
            Toast.show(`🎉 Certificate '${certName}' successfully verified!`, 'success');
            if (typeof SoundFX !== 'undefined') SoundFX.success();
        } else {
            Toast.show(data.error || "Certificate verification failed.", "error");
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Verify Cert';
            }
        }
    } catch (e) {
        Toast.show("Error connecting to skill verification service.", "error");
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Verify Cert';
        }
    }
}

// Role Gateway & Profile Manager (No Guest Accounts Enforcement)
const RoleGateway = {
    currentRole: localStorage.getItem('sahideal_active_role') || (window.location.href.includes('worker') ? 'worker' : 'customer'),
    activeUser: null,

    async init() {
        await this.fetchCurrentUser();
        this.updateNavUI();
    },

    async fetchCurrentUser() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    this.activeUser = data.user;
                    this.currentRole = data.user.role;
                    localStorage.setItem('sahideal_active_role', data.user.role);
                } else {
                    this.activeUser = null;
                }
            }
        } catch (e) {
            console.warn("Could not fetch user session:", e);
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
            if (tabWork) tabWork.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md transition-all';
            if (tabCust) tabCust.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-all';
            if (viewWork) viewWork.classList.remove('hidden');
            if (viewCust) viewCust.classList.add('hidden');
        } else {
            if (tabCust) tabCust.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-md transition-all';
            if (tabWork) tabWork.className = 'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-all';
            if (viewCust) viewCust.classList.remove('hidden');
            if (viewWork) viewWork.classList.add('hidden');
        }
    },

    async submitCustomerAuth() {
        const name = document.getElementById('cust-reg-name').value.trim();
        const phone = AuthOTP.verifiedPhone || (document.getElementById('auth-phone-input') ? document.getElementById('auth-phone-input').value.trim() : "");
        const address = document.getElementById('cust-reg-address').value.trim();
        const aadhaar = document.getElementById('cust-reg-aadhaar') ? document.getElementById('cust-reg-aadhaar').value.trim() : "";

        if (!name) {
            Toast.show("Please enter your full name.", "error");
            return;
        }

        if (!phone || !AuthOTP.isOtpVerified) {
            Toast.show("Please complete Phone OTP verification first.", "error");
            return;
        }

        try {
            const res = await fetch('/api/auth/register-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'customer', name, phone, address, aadhaar })
            });
            const data = await res.json();

            if (data.success) {
                this.activeUser = data.user;
                this.currentRole = 'customer';
                localStorage.setItem('sahideal_active_role', 'customer');
                this.updateNavUI();
                this.closeModal();

                Toast.show(`👋 Welcome, ${name}! Logged in as Customer.`, 'success');
                SoundFX.success();

                setTimeout(() => {
                    if (!window.location.href.includes('index') && window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                }, 600);
            } else {
                Toast.show(data.error || "Authentication failed.", "error");
            }
        } catch (e) {
            Toast.show("Error connecting to authentication service.", "error");
        }
    },

    async submitWorkerAuth() {
        const name = document.getElementById('worker-reg-name').value.trim();
        const phone = AuthOTP.verifiedPhone || (document.getElementById('auth-phone-input') ? document.getElementById('auth-phone-input').value.trim() : "");
        const trade = document.getElementById('worker-reg-trade').value;
        const exp = document.getElementById('worker-reg-exp') ? document.getElementById('worker-reg-exp').value.trim() : "5 Years";
        const location = document.getElementById('worker-reg-loc') ? document.getElementById('worker-reg-loc').value.trim() : "Indiranagar";
        const certName = document.getElementById('worker-reg-cert') ? document.getElementById('worker-reg-cert').value.trim() : "PMKVY RPL Level 4";

        if (!name) {
            Toast.show("Please enter your full name.", "error");
            return;
        }

        if (!phone || !AuthOTP.isOtpVerified) {
            Toast.show("Please complete Phone OTP verification first.", "error");
            return;
        }

        try {
            const res = await fetch('/api/auth/register-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: 'worker', name, phone, trade, experience: exp,
                    location, cert_name: certName
                })
            });
            const data = await res.json();

            if (data.success) {
                this.activeUser = data.user;
                this.currentRole = 'worker';
                localStorage.setItem('sahideal_active_role', 'worker');
                this.updateNavUI();
                this.closeModal();

                Toast.show(`⚡ Welcome, ${name} (${trade})! Worker Radar is active.`, 'success');
                SoundFX.cash();

                setTimeout(() => {
                    if (!window.location.href.includes('worker')) {
                        window.location.href = '/worker';
                    }
                }, 600);
            } else {
                Toast.show(data.error || "Authentication failed.", "error");
            }
        } catch (e) {
            Toast.show("Error connecting to authentication service.", "error");
        }
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}

        this.activeUser = null;
        this.currentRole = null;
        localStorage.removeItem('sahideal_active_role');
        localStorage.removeItem('cowork_active_role');
        localStorage.removeItem('cowork_app_state');
        localStorage.removeItem('sahideal_app_state');
        localStorage.removeItem('sahideal_worker_user');
        localStorage.removeItem('sahideal_customer_user');

        if (typeof CoopSync !== 'undefined') {
            CoopSync.state.customerUser = null;
            CoopSync.state.workerUser = null;
            CoopSync.saveState();
        }

        this.updateNavUI();
        this.closeRoleMenu();
        Toast.show("🔒 Logged out cleanly. Session and cached identity destroyed.", "info");
        SoundFX.pop();

        setTimeout(() => {
            window.location.href = '/';
        }, 600);
    },

    toggleRoleMenu() {
        const menu = document.getElementById('role-dropdown-menu');
        if (menu) menu.classList.toggle('hidden');
    },

    closeRoleMenu() {
        const menu = document.getElementById('role-dropdown-menu');
        if (menu) menu.classList.add('hidden');
    },

    updateNavUI() {
        const badge = document.getElementById('current-role-badge');
        const roleName = document.getElementById('current-user-name');
        const userPhone = document.getElementById('dropdown-user-phone');

        if (this.activeUser) {
            if (roleName) roleName.textContent = this.activeUser.name;
            if (userPhone) userPhone.textContent = this.activeUser.phone;

            if (this.activeUser.role === 'worker') {
                if (badge) badge.innerHTML = '<i class="fa-solid fa-screwdriver-wrench text-amber-500 mr-1.5"></i> Worker Mode';
            } else {
                if (badge) badge.innerHTML = '<i class="fa-solid fa-user-check text-emerald-600 mr-1.5"></i> Customer Mode';
            }
        } else {
            if (badge) badge.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket text-emerald-600 mr-1.5"></i> Login / Register';
            if (roleName) roleName.textContent = "Guest / Sign In";
            if (userPhone) userPhone.textContent = "Not Authenticated";
        }
    }
};

// Notification Engine
const NotificationEngine = {
    isOpen: false,

    async toggleDrawer() {
        const drawer = document.getElementById('notification-drawer');
        if (!drawer) return;

        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            drawer.classList.remove('translate-x-full');
            await this.loadNotifications();
        } else {
            drawer.classList.add('translate-x-full');
        }
    },

    async loadNotifications() {
        const list = document.getElementById('notification-list');
        const badge = document.getElementById('notif-badge');
        if (!list) return;

        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            const data = await res.json();

            if (data.success && data.notifications.length > 0) {
                if (badge) {
                    badge.textContent = data.notifications.length;
                    badge.classList.remove('hidden');
                }
                list.innerHTML = data.notifications.map(n => {
                    let color = 'border-slate-200 bg-slate-50 dark:bg-slate-800';
                    let icon = 'fa-bell text-slate-500';
                    if (n.type === 'sos') {
                        color = 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                        icon = 'fa-shield-heart text-rose-600 animate-pulse';
                    } else if (n.type === 'success') {
                        color = 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                        icon = 'fa-circle-check text-emerald-600';
                    } else if (n.type === 'warning') {
                        color = 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200';
                        icon = 'fa-triangle-exclamation text-amber-600';
                    }

                    return `
                        <div class="p-3.5 rounded-2xl border ${color} space-y-1">
                            <div class="flex items-center justify-between font-bold text-xs">
                                <span class="flex items-center gap-1.5"><i class="fa-solid ${icon}"></i> ${n.title}</span>
                                <span class="text-[10px] font-mono opacity-70">${n.created_at.split(' ')[1] || 'Just now'}</span>
                            </div>
                            <p class="text-[11px] leading-relaxed opacity-90">${n.message}</p>
                        </div>
                    `;
                }).join('');
            } else {
                if (badge) badge.classList.add('hidden');
                list.innerHTML = '<div class="text-center py-10 text-slate-400"><i class="fa-solid fa-bell-slash text-2xl mb-2"></i><p>No new notifications.</p></div>';
            }
        } catch (e) {
            list.innerHTML = '<div class="text-center py-6 text-rose-500">Error loading notifications.</div>';
        }
    }
};

// e-KYC Modal Controller
function openEkycModal() {
    const modal = document.getElementById('ekyc-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        SoundFX.pop();
    }
}

function closeEkycModal() {
    const modal = document.getElementById('ekyc-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function submitEkyc() {
    const aadhaar = document.getElementById('ekyc-aadhaar-input').value.trim();
    const name = document.getElementById('ekyc-name-input').value.trim();

    const btn = document.getElementById('ekyc-submit-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Verifying UIDAI...';
    }

    try {
        const res = await fetch('/api/ekyc/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar, name })
        });
        const data = await res.json();

        if (data.success) {
            closeEkycModal();
            Toast.show(`✅ Aadhaar e-KYC Verified for ${name}! Ref: ${data.ekyc_ref}`, 'success');
            SoundFX.success();
            await RoleGateway.fetchCurrentUser();
            RoleGateway.updateNavUI();
        } else {
            Toast.show(data.error || "Aadhaar verification failed.", "error");
        }
    } catch (e) {
        Toast.show("Failed to connect to e-KYC gateway.", "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Authorize e-KYC';
        }
    }
}

// Emergency SOS Modal Controller
function openSosModal() {
    const modal = document.getElementById('sos-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        SoundFX.sos();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const gpsEl = document.getElementById('sos-gps-display');
                if (gpsEl) gpsEl.textContent = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
            }, () => {});
        }
    }
}

function closeSosModal() {
    const modal = document.getElementById('sos-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function triggerEmergencySos() {
    const typeSelect = document.getElementById('sos-type-select');
    const emergencyType = typeSelect ? typeSelect.value : "Critical Safety & Medical Emergency";

    closeSosModal();
    Toast.show(`🚨 Broadcasting Priority Emergency SOS Alert...`, 'sos', 6000);
    SoundFX.alarm();

    try {
        const res = await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emergency_type: emergencyType,
                location: "Indiranagar 100ft Road, Bangalore",
                lat: 12.9716,
                lng: 77.5946
            })
        });
        const data = await res.json();

        if (data.success) {
            Toast.show(`🚨 SOS Dispatched! Responder ${data.assigned_responder.name} is en route (ETA: 9 Mins).`, 'sos', 10000);
        }
    } catch (e) {
        Toast.show("Emergency SOS broadcast recorded.", 'sos');
    }
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    ThemeEngine.init();
    LanguageEngine.init();
    RoleGateway.init();
});
