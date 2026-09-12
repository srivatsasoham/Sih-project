/**
 * Co-Work (पारस्परिक सहकारी) - Resilience & Trust Checkpoint Simulation Engine
 * Powers the 6 Real-World Failure Handlers (Slide 2) & 7-Checkpoints Stepper (Slide 3)
 */

const ResilienceEngine = {
    // 1. IVR & SMS Fallback Simulator
    simulateIVR() {
        const phone = document.getElementById('ivr-phone-input') ? document.getElementById('ivr-phone-input').value : "+91 98450 12345";
        const lang = document.getElementById('ivr-lang-select') ? document.getElementById('ivr-lang-select').value : "hi";
        const outputBox = document.getElementById('ivr-simulation-output');
        const audioVisualizer = document.getElementById('ivr-audio-visualizer');
        const btn = document.getElementById('btn-trigger-ivr');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-phone-arrow-up-right fa-shake mr-2"></i> Placing Automated Twilio IVR Call...';
        }

        if (audioVisualizer) audioVisualizer.classList.remove('hidden');

        // Play phone ringing / audio synthesis
        SoundFX.playTone(440, 'sine', 0.8, 0);
        SoundFX.playTone(480, 'sine', 0.8, 0);

        fetch('/api/resilience/ivr-simulate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({phone: phone, lang: lang})
        }).then(r => r.json()).then(data => {
            setTimeout(() => {
                if (audioVisualizer) audioVisualizer.classList.add('hidden');
                if (outputBox) {
                    outputBox.classList.remove('hidden');
                    outputBox.innerHTML = `
                        <div class="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 space-y-3">
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-bold text-emerald-300"><i class="fa-solid fa-phone-volume mr-1.5"></i> IVR Voice Call Connected (${data.language.toUpperCase()})</span>
                                <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">200 OK • TWILIO_IVR</span>
                            </div>
                            <p class="text-xs text-slate-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                                "${data.voice_script}"
                            </p>
                            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                <span class="text-slate-400"><i class="fa-solid fa-comment-sms text-sky-400 mr-1"></i> SMS Dispatched to ${data.phone}</span>
                                <span class="font-bold text-emerald-400">Start OTP: 4819</span>
                            </div>
                        </div>
                    `;
                }
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-phone-volume mr-2"></i> Place Voice Booking Call';
                }
                Toast.show(`📞 IVR Voice Booking completed in ${data.language.toUpperCase()}! SMS sent to ${data.phone}`, 'success');
                SoundFX.cash();
            }, 1200);
        }).catch(err => {
            if (audioVisualizer) audioVisualizer.classList.add('hidden');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-phone-volume mr-2"></i> Place Voice Booking Call';
            }
        });
    },

    // 2. No-Show Auto-Reassign Simulation
    simulateNoShow() {
        const btn = document.getElementById('btn-test-noshow');
        const resultBox = document.getElementById('noshow-result-box');

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation fa-fade text-amber-400 mr-2"></i> Detecting Pro Timeout...';
        }

        fetch('/api/resilience/no-show-simulate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({booking_id: "SG-884210"})
        }).then(r => r.json()).then(data => {
            setTimeout(() => {
                if (resultBox) {
                    resultBox.classList.remove('hidden');
                    resultBox.innerHTML = `
                        <div class="space-y-3">
                            <div class="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-xs">
                                <div>
                                    <span class="font-bold text-rose-300"><i class="fa-solid fa-circle-xmark mr-1"></i> Pro No-Show: ${data.penalized_worker.name}</span>
                                    <div class="text-[11px] text-slate-400 mt-0.5">${data.penalized_worker.trust_penalty} • Penalty recorded on ledger</div>
                                </div>
                                <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">PENALIZED</span>
                            </div>

                            <div class="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                                <div>
                                    <span class="font-bold text-emerald-300"><i class="fa-solid fa-circle-check mr-1"></i> Auto-Reassigned Pro: ${data.auto_reassigned_worker.name}</span>
                                    <div class="text-[11px] text-slate-400 mt-0.5">${data.auto_reassigned_worker.role} • ${data.auto_reassigned_worker.distance}</div>
                                </div>
                                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">ETA: ${data.auto_reassigned_worker.eta}</span>
                            </div>
                        </div>
                    `;
                }
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-rotate-right mr-2"></i> Test No-Show Auto-Reassign Again';
                }
                Toast.show("🚨 No-show handled: Automatically re-routed to nearest Co-op Pro Arun Prakash (0.8km away)!", "info", 5000);
                SoundFX.pop();
            }, 800);
        });
    },

    // 3. Citizen Dispute Tribunal Peer Voting
    voteDispute(disputeId, decision) {
        fetch('/api/governance/dispute-vote', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({dispute_id: disputeId, decision: decision})
        }).then(r => r.json()).then(data => {
            const countResolve = document.getElementById(`dispute-resolve-count-${disputeId}`);
            const countRefund = document.getElementById(`dispute-refund-count-${disputeId}`);
            if (countResolve && data.resolve_votes) countResolve.textContent = data.resolve_votes;
            if (countRefund && data.refund_votes) countRefund.textContent = data.refund_votes;
            
            Toast.show(`🗳️ Citizen Tribunal Vote Recorded (${decision.toUpperCase()})! Escrow state updated democratically.`, 'success');
            SoundFX.success();
        });
    },

    // 4. Community Vouching for First-Time Worker
    vouchForWorker(proId) {
        const countEl = document.getElementById(`vouch-count-${proId}`);
        if (countEl) {
            let current = parseInt(countEl.textContent) || 84;
            countEl.textContent = current + 1;
        }
        Toast.show("⭐ +1 Community Vouch added to Pro profile! Trust score reinforced on Co-op Ledger.", "success");
        SoundFX.cash();
    }
};

// 7 Trust Checkpoints Interactive Step Highlighter
function activateCheckpointStep(stepNum) {
    document.querySelectorAll('.checkpoint-step-card').forEach(card => {
        card.classList.remove('border-emerald-500', 'bg-emerald-950/40', 'scale-105');
        card.classList.add('border-white/10', 'bg-slate-900/70');
    });

    const activeCard = document.getElementById(`checkpoint-card-${stepNum}`);
    if (activeCard) {
        activeCard.classList.remove('border-white/10', 'bg-slate-900/70');
        activeCard.classList.add('border-emerald-500', 'bg-emerald-950/40', 'scale-105');
        SoundFX.pop();
    }
}
