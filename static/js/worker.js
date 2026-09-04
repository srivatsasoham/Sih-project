/**
 * SahiDeal - Worker-Owner Portal Engine
 * Powers Radar GIS dispatches, 5-step job execution, Instant UPI Payouts, and Welfare Claims
 */

let workerOnline = true;

function toggleWorkerStatus() {
    workerOnline = !workerOnline;
    const badge = document.getElementById('status-live-badge');
    const btn = document.getElementById('btn-status-toggle');

    if (workerOnline) {
        if (badge) {
            badge.className = 'px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2';
            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Online & Receiving Dispatches';
        }
        if (btn) {
            btn.textContent = 'Go Offline';
            btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition';
        }
        Toast.show("📡 You are now ONLINE on the <3km Co-op Radar!", "success");
    } else {
        if (badge) {
            badge.className = 'px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-2';
            badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-500"></span> Offline';
        }
        if (btn) {
            btn.textContent = 'Go Online';
            btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20';
        }
        Toast.show("You are now OFFLINE. Radar dispatches paused.", "info");
    }
}

function acceptRadarJob(jobId) {
    const card = document.getElementById(`job-card-${jobId}`);
    if (card) {
        card.innerHTML = `
            <div class="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 space-y-4">
                <div class="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span><i class="fa-solid fa-circle-check mr-1.5"></i> GIG ACCEPTED • GIS ROUTE ACTIVE</span>
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">1.2 km away</span>
                </div>

                <!-- 5-Step Execution Workflow -->
                <div class="space-y-3 pt-2" id="exec-flow-${jobId}">
                    <!-- Step 1: Start OTP -->
                    <div id="step-start-otp-${jobId}" class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div class="text-xs font-semibold text-slate-300">1. Arrive at Customer Location & Enter Start OTP:</div>
                        <div class="flex gap-2">
                            <input type="text" id="input-start-otp-${jobId}" placeholder="Enter 4-digit OTP (e.g. 4819)" value="4819" class="w-full px-3 py-2 text-xs rounded-lg glass-input">
                            <button onclick="verifyStartOtp('${jobId}')" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shrink-0">
                                Verify OTP
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Photo Proof -->
                    <div id="step-photo-proof-${jobId}" class="hidden p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div class="text-xs font-semibold text-slate-300">2. Take Work Photo Proof (Before/After):</div>
                        <button onclick="uploadWorkPhoto('${jobId}')" class="w-full py-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-xs font-bold border border-indigo-500/40 flex items-center justify-center gap-2">
                            <i class="fa-solid fa-camera"></i> Capture & Upload Work Proof Photo
                        </button>
                    </div>

                    <!-- Step 3: Complete OTP & Instant UPI Disbursal -->
                    <div id="step-complete-otp-${jobId}" class="hidden p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div class="text-xs font-semibold text-slate-300">3. Job Done! Ask Customer for Completion OTP:</div>
                        <div class="flex gap-2">
                            <input type="text" id="input-complete-otp-${jobId}" placeholder="Enter Completion OTP (e.g. 7392)" value="7392" class="w-full px-3 py-2 text-xs rounded-lg glass-input">
                            <button onclick="verifyCompleteOtp('${jobId}')" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shrink-0 shadow-lg shadow-emerald-500/30">
                                Settle Instant UPI
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    Toast.show(`⚡ Gig ${jobId} Accepted! Customer notified. Directions active.`, 'success');
    SoundFX.pop();
}

function verifyStartOtp(jobId) {
    const step1 = document.getElementById(`step-start-otp-${jobId}`);
    const step2 = document.getElementById(`step-photo-proof-${jobId}`);
    if (step1) step1.innerHTML = `<div class="text-xs font-bold text-emerald-400"><i class="fa-solid fa-circle-check mr-1.5"></i> Start OTP 4819 Verified! Job in progress.</div>`;
    if (step2) step2.classList.remove('hidden');
    Toast.show("✅ Start OTP Verified! Work timer started.", "success");
    SoundFX.success();
}

function uploadWorkPhoto(jobId) {
    const step2 = document.getElementById(`step-photo-proof-${jobId}`);
    const step3 = document.getElementById(`step-complete-otp-${jobId}`);
    if (step2) step2.innerHTML = `
        <div class="text-xs font-bold text-indigo-300 flex items-center justify-between">
            <span><i class="fa-solid fa-image mr-1.5"></i> Work Photo Proof Uploaded & Hash-Locked</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">AUDIT READY</span>
        </div>
    `;
    if (step3) step3.classList.remove('hidden');
    Toast.show("📸 Work photo uploaded to permanent Co-op audit trail!", "info");
    SoundFX.pop();
}

function verifyCompleteOtp(jobId) {
    const card = document.getElementById(`job-card-${jobId}`);
    const balEl = document.getElementById('worker-wallet-bal');

    if (balEl) {
        let current = parseInt(balEl.textContent.replace(/[^\d]/g, '')) || 4850;
        balEl.textContent = `₹${(current + 643).toLocaleString('en-IN')}`;
    }

    if (card) {
        card.innerHTML = `
            <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-emerald-400 font-heading"><i class="fa-solid fa-money-bill-transfer mr-1.5"></i> INSTANT UPI PAYOUT DISBURSED</span>
                    <span class="text-lg font-black text-white font-heading">+₹643</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                    <div class="flex justify-between text-slate-300">
                        <span>Direct Worker Payout (92%):</span>
                        <span class="font-bold text-white">₹643</span>
                    </div>
                    <div class="flex justify-between text-emerald-400">
                        <span>Cooperative Dividend & Welfare Pool (8%):</span>
                        <span class="font-bold">+₹56</span>
                    </div>
                    <div class="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                        <span>Corporate Aggregator Middleman Cut:</span>
                        <span class="text-rose-400 line-through">₹0 (Saved ₹195)</span>
                    </div>
                </div>
                <div class="text-[11px] text-emerald-300 text-center font-medium">
                    ⭐ +1 Patronage Share credit added to your voting balance.
                </div>
            </div>
        `;
    }

    Toast.show("🎉 Instant ₹643 UPI Payout Transferred to your Bank Account!", "success", 6000);
    SoundFX.cash();
}

function declineRadarJob(jobId) {
    const card = document.getElementById(`job-card-${jobId}`);
    if (card) {
        card.style.opacity = 0;
        setTimeout(() => card.remove(), 300);
    }
    Toast.show("Gig skipped. Co-op Radar will auto-route to next pro.", "info");
}

function openWithdrawModal() {
    Toast.show("⚡ Instant UPI Disbursal Triggered! ₹4,850 credited to your registered UPI ID (ramesh@okhdfcbank).", "success");
    SoundFX.cash();
}

function openWelfareClaimModal() {
    Toast.show("🛡️ Ayushman Co-op Welfare Claim Submitted! Case reference: WLF-2026-904. Council will verify within 4 hours.", "info");
    SoundFX.pop();
}

function requestToolLoan() {
    Toast.show("🛠️ Zero-Interest Tool Replacement Loan of ₹8,000 approved from Co-op Tool Bank Depot!", "success");
    SoundFX.cash();
}
