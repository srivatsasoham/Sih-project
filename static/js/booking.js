/**
 * Co-Work (पारस्परिक सहकारी) - 7-Checkpoints Booking Engine
 * Handles Booking Flow: Book → Match → Escrow → Track → Verify → Settle → Rate
 */

let activeBookingData = null;
let currentBookingStep = 1;

function openBookingModal(serviceId) {
    // Fetch service info or grab from DOM
    fetch(`/api/services?q=`)
        .then(r => r.json())
        .then(data => {
            const service = (data.services || []).find(s => s.id === serviceId) || {
                id: serviceId,
                title: "Precision Service Booking",
                price: 549,
                market_price: 999,
                worker_share: 505,
                welfare_share: 44,
                category: "general",
                women_pro_available: true
            };
            initModalWithService(service);
        })
        .catch(() => {
            initModalWithService({
                id: serviceId,
                title: "Precision Cooperative Service",
                price: 549,
                market_price: 999,
                worker_share: 505,
                welfare_share: 44,
                category: "general",
                women_pro_available: true
            });
        });
}

function initModalWithService(service) {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    currentBookingStep = 1;

    document.getElementById('modal-service-title').textContent = service.title;
    document.getElementById('modal-service-id').value = service.id;
    document.getElementById('modal-price-total').textContent = `₹${service.price}`;
    document.getElementById('modal-worker-takehome').textContent = `₹${service.worker_share} (92%)`;
    document.getElementById('modal-coop-reserve').textContent = `₹${service.welfare_share} (8% Co-op Pool)`;
    document.getElementById('modal-savings').textContent = `₹${service.market_price - service.price}`;

    // Women Pro Checkbox visibility
    const womenPrefBox = document.getElementById('modal-women-pref-container');
    if (womenPrefBox) {
        if (service.women_pro_available) {
            womenPrefBox.classList.remove('hidden');
        } else {
            womenPrefBox.classList.add('hidden');
        }
    }

    renderBookingStep(1);
    SoundFX.pop();
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function renderBookingStep(step) {
    currentBookingStep = step;
    
    // Hide all step sections
    document.querySelectorAll('.booking-wizard-step').forEach(el => el.classList.add('hidden'));

    // Update dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (dot) {
            if (i === step) {
                dot.className = 'w-8 h-2.5 rounded-full bg-emerald-400 transition-all shadow-md shadow-emerald-500/50';
            } else if (i < step) {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-600 transition-all';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-700 transition-all';
            }
        }
    }

    const currentEl = document.getElementById(`booking-step-${step}`);
    if (currentEl) currentEl.classList.remove('hidden');
}

function submitBookingOrder() {
    const serviceId = document.getElementById('modal-service-id').value;
    const name = document.getElementById('book-name').value || "Priya Sharma";
    const phone = document.getElementById('book-phone').value || "+91 98450 12345";
    const address = document.getElementById('book-address').value || "Indiranagar, Bangalore";
    const timeSlot = document.getElementById('book-time-slot').value || "Immediate (<20 mins)";
    const womenPref = document.getElementById('book-women-pref') ? document.getElementById('book-women-pref').checked : false;

    const btn = document.getElementById('btn-confirm-escrow');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Locking Escrow & Matching Nearest Co-op Pro...';
    }

    fetch('/api/book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            service_id: serviceId,
            name: name,
            phone: phone,
            address: address,
            time_slot: timeSlot,
            women_pro: womenPref
        })
    }).then(r => r.json()).then(data => {
        activeBookingData = data;
        renderBookingConfirmation(data);
        renderBookingStep(2);
        Toast.show("🎉 Escrow payment locked! Co-op Pro assigned within <2km.", "success");
        SoundFX.cash();
    }).catch(err => {
        Toast.show("Booking simulated in offline demo mode!", "info");
    });
}

function renderBookingConfirmation(data) {
    document.getElementById('confirm-booking-id').textContent = data.booking_id;
    document.getElementById('confirm-worker-name').textContent = data.matched_worker.name;
    document.getElementById('confirm-worker-role').textContent = data.matched_worker.role;
    document.getElementById('confirm-worker-img').src = data.matched_worker.avatar;
    document.getElementById('confirm-worker-distance').textContent = `${data.matched_worker.distance_km} km away`;
    document.getElementById('confirm-worker-rating').textContent = `${data.matched_worker.rating} (${data.matched_worker.jobs_completed} jobs)`;
    document.getElementById('confirm-start-otp').textContent = data.start_otp;
    document.getElementById('confirm-complete-otp').textContent = data.complete_otp;
    document.getElementById('confirm-eta').textContent = data.estimated_arrival;
}

function progressToTracking() {
    renderBookingStep(3);
    Toast.show("📡 Live GPS Dispatch Active: Pro is en route.", "info");
}

function completeSimulatedJob() {
    Toast.show("✅ Work verified with Photo & Customer OTP! ₹643 disbursed instantly to Pro wallet.", "success");
    SoundFX.cash();
    closeBookingModal();
}

// Filter Services on Consumer Hub
function filterServices() {
    const query = (document.getElementById('service-search') ? document.getElementById('service-search').value : "").toLowerCase();
    const womenOnly = document.getElementById('filter-women-only') ? document.getElementById('filter-women-only').checked : false;
    const activeCategoryBtn = document.querySelector('.category-filter-btn.active');
    const selectedCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'all';

    document.querySelectorAll('.service-catalog-card').forEach(card => {
        const title = (card.getAttribute('data-title') || "").toLowerCase();
        const desc = (card.getAttribute('data-desc') || "").toLowerCase();
        const category = card.getAttribute('data-category') || "";
        const hasWomenPro = card.getAttribute('data-women-pro') === "true";

        let matchQuery = !query || title.includes(query) || desc.includes(query);
        let matchCat = (selectedCategory === 'all' || category === selectedCategory);
        let matchWomen = !womenOnly || hasWomenPro;

        if (matchQuery && matchCat && matchWomen) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function selectCategoryFilter(category, btnElement) {
    document.querySelectorAll('.category-filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-emerald-500', 'text-white', 'shadow-lg');
        b.classList.add('text-slate-300', 'bg-slate-900/60', 'hover:bg-white/5');
    });

    btnElement.classList.add('active', 'bg-emerald-500', 'text-white', 'shadow-lg');
    btnElement.classList.remove('text-slate-300', 'bg-slate-900/60');

    filterServices();
}

function toggleWomenOnlyFilter() {
    const checkbox = document.getElementById('filter-women-only');
    if (checkbox) {
        if (checkbox.checked) {
            Toast.show("👩 Women Safety Filter Activated: Showing female-led verified professionals.", "info");
        } else {
            Toast.show("Showing all verified community professionals.", "info");
        }
        filterServices();
    }
}

function startVoiceSearch() {
    Toast.show("🎙️ Voice search activated: Speak your required service in English or Hindi...", "info");
    SoundFX.pop();
    setTimeout(() => {
        const searchInput = document.getElementById('service-search');
        if (searchInput) {
            searchInput.value = "Electrical";
            filterServices();
            Toast.show("🔍 Voice Recognized: 'Electrical Safety Audit'", "success");
        }
    }, 1500);
}
