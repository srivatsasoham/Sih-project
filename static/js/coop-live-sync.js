/**
 * SahiDeal (पारस्परिक सहकारी) - Real-Time Live Sync & Cross-Device State Engine
 * Enables 100% Real-Time Cross-Device & Cross-Tab Coordination between Customer & Worker
 * Connected directly to Persistent Backend SQLite APIs + BroadcastChannel
 */

const DEFAULT_SHADOW_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'%3E%3Crect width='100' height='100' fill='%230f172a'/%3E%3Cpath d='M50 48a18 18 0 1 0 0-36 18 18 0 0 0 0 36zm0 10c-20 0-36 12-36 28v6h72v-6c0-16-16-28-36-28z' fill='%23475569'/%3E%3C/svg%3E";

const CoopSync = {
    channel: null,
    DEFAULT_AVATAR: DEFAULT_SHADOW_AVATAR,
    pollingInterval: null,
    lastKnownJobIds: new Set(),
    
    // Default initial state
    state: {
        activeRole: localStorage.getItem('sahideal_active_role') || null,
        isWorkerOnline: (localStorage.getItem('sahideal_worker_online')) !== 'false',
        customerUser: null,
        workerUser: {
            name: "Ramesh Kumar Sharma",
            phone: "+91 98860 54321",
            trade: "Master Electrician & Solar Specialist",
            experience: "12 Years",
            location: "Indiranagar (1.2 km radius)",
            avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"
        },
        activeJobs: [],
        completedJobs: [],
        workerWallet: {
            balance: 4850.0,
            earningsToday: 0.0,
            totalJobs: 142,
            shares: 142,
            dividendsAccrued: 28400.0,
            transactions: []
        }
    },

    init() {
        this.loadState();
        
        // Setup BroadcastChannel for Instant Cross-Tab Realtime Messaging
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.channel = new BroadcastChannel('sahideal_realtime_coop');
                this.channel.onmessage = (event) => {
                    this.handleIncomingEvent(event.data);
                };
            } catch (e) {
                console.warn("BroadcastChannel fallback to REST sync");
            }
        }

        // Start Cross-Device Server REST API Polling (every 1.5 seconds)
        this.pollServer();
        this.pollingInterval = setInterval(() => this.pollServer(), 1500);
    },

    loadState() {
        try {
            const saved = localStorage.getItem('sahideal_app_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.warn("Error loading state:", e);
        }
    },

    saveState() {
        try {
            localStorage.setItem('sahideal_app_state', JSON.stringify(this.state));
            if (this.channel) {
                this.channel.postMessage({ type: 'STATE_UPDATED', state: this.state });
            }
        } catch (e) {
            console.warn("Error saving state:", e);
        }
    },

    broadcast(type, payload) {
        this.saveState();
        if (this.channel) {
            this.channel.postMessage({ type, payload });
        }
    },

    handleIncomingEvent(msg) {
        if (!msg) return;
        if (msg.type === 'JOB_POSTED') {
            if (typeof onWorkerJobReceived === 'function') onWorkerJobReceived(msg.payload);
            if (typeof SoundFX !== 'undefined') SoundFX.alarm();
            if (typeof Toast !== 'undefined') Toast.show(`🚨 NEW GIG: ${msg.payload.serviceTitle || msg.payload.title} (₹${msg.payload.workerPayout})`, 'sos', 8000);
        } else if (msg.type === 'JOB_ACCEPTED') {
            if (typeof onCustomerJobAccepted === 'function') onCustomerJobAccepted(msg.payload);
        } else if (msg.type === 'JOB_STARTED') {
            if (typeof onCustomerJobStarted === 'function') onCustomerJobStarted(msg.payload);
        } else if (msg.type === 'JOB_COMPLETED') {
            if (typeof onCustomerJobCompleted === 'function') onCustomerJobCompleted(msg.payload);
        }
    },

    // Cross-Device Server State Poller
    async pollServer() {
        try {
            const res = await fetch('/api/jobs');
            if (!res.ok) return;
            const data = await res.json();
            if (!data.success) return;

            let hasChanges = false;
            const prevActiveJobs = this.state.activeJobs || [];
            const serverActiveJobs = data.activeJobs || [];
            const serverCompletedJobs = data.completedJobs || [];

            // Check for brand new incoming jobs
            serverActiveJobs.forEach(serverJob => {
                if (!this.lastKnownJobIds.has(serverJob.id) && serverJob.status === 'OPEN') {
                    this.lastKnownJobIds.add(serverJob.id);
                    if (this.state.isWorkerOnline) {
                        if (typeof onWorkerJobReceived === 'function') onWorkerJobReceived(serverJob);
                        if (typeof SoundFX !== 'undefined') SoundFX.alarm();
                        if (typeof Toast !== 'undefined') {
                            Toast.show(`🚨 INCOMING GIG ALARM: ${serverJob.service_title || serverJob.serviceTitle} (₹${serverJob.worker_payout || serverJob.workerPayout})`, 'sos', 8000);
                        }
                    }
                    hasChanges = true;
                }
            });

            // Status transitions check
            prevActiveJobs.forEach(localJob => {
                const updatedServerJob = serverActiveJobs.find(j => j.id === localJob.id);
                if (updatedServerJob) {
                    if (localJob.status !== updatedServerJob.status) {
                        hasChanges = true;
                        if (updatedServerJob.status === 'ACCEPTED' && localJob.status === 'OPEN') {
                            if (typeof onCustomerJobAccepted === 'function') onCustomerJobAccepted(updatedServerJob);
                            if (typeof Toast !== 'undefined') Toast.show(`🚀 Worker ${updatedServerJob.worker_name || updatedServerJob.workerName} has ACCEPTED your request! ETA: 9 Mins`, 'success', 6000);
                            if (typeof SoundFX !== 'undefined') SoundFX.success();
                        } else if (updatedServerJob.status === 'IN_PROGRESS' && localJob.status !== 'IN_PROGRESS') {
                            if (typeof onCustomerJobStarted === 'function') onCustomerJobStarted(updatedServerJob);
                            if (typeof Toast !== 'undefined') Toast.show(`⚡ Start OTP Verified! Pro started work.`, 'info');
                        }
                    }
                } else {
                    const completedServerJob = serverCompletedJobs.find(j => j.id === localJob.id);
                    if (completedServerJob) {
                        hasChanges = true;
                        if (typeof onCustomerJobCompleted === 'function') onCustomerJobCompleted(completedServerJob);
                        if (typeof Toast !== 'undefined') Toast.show(`✅ Task verified & completed! Escrow released. 7-Day Durability Active.`, 'success', 8000);
                        if (typeof SoundFX !== 'undefined') SoundFX.cash();
                    }
                }
            });

            this.state.activeJobs = serverActiveJobs;
            this.state.completedJobs = serverCompletedJobs;
            if (data.workerWallet) this.state.workerWallet = data.workerWallet;
            this.saveState();

            if (hasChanges) {
                if (typeof renderWorkerRadar === 'function') renderWorkerRadar();
                if (typeof renderWorkerWalletUI === 'function') renderWorkerWalletUI();
            }

        } catch (e) {}
    },

    // Job Actions
    async postCustomerJob(jobData) {
        try {
            const res = await fetch('/api/jobs/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            const data = await res.json();
            if (data.success) {
                this.broadcast('JOB_POSTED', data.job);
                this.state.activeJobs.unshift(data.job);
                this.lastKnownJobIds.add(data.job.id);
                this.saveState();
                return { success: true, job: data.job };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: "Network error posting job." };
        }
    },

    async acceptJobByWorker(jobId, worker) {
        try {
            const res = await fetch('/api/jobs/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, worker })
            });
            const data = await res.json();
            if (data.success) {
                this.broadcast('JOB_ACCEPTED', data.job);
                await this.pollServer();
                return { success: true, job: data.job };
            }
            return { success: false, message: data.message };
        } catch (e) {
            return { success: false, message: "Network error accepting job." };
        }
    },

    async verifyStartOtp(jobId, otp) {
        try {
            const res = await fetch('/api/jobs/start-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, otp })
            });
            const data = await res.json();
            if (data.success) {
                this.broadcast('JOB_STARTED', data.job);
                await this.pollServer();
                return { success: true, job: data.job };
            }
            return { success: false, message: data.message };
        } catch (e) {
            return { success: false, message: "Network error." };
        }
    },

    async uploadWorkPhotoProof(jobId, photoDataUrl) {
        try {
            const res = await fetch('/api/jobs/photo-proof', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, photo: photoDataUrl })
            });
            const data = await res.json();
            if (data.success) {
                await this.pollServer();
                return { success: true };
            }
            return { success: false };
        } catch (e) {
            return { success: false };
        }
    },

    async verifyCompleteOtpAndSettle(jobId, otp) {
        try {
            const res = await fetch('/api/jobs/complete-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, otp })
            });
            const data = await res.json();
            if (data.success) {
                this.broadcast('JOB_COMPLETED', data.job);
                await this.pollServer();
                return { success: true, job: data.job };
            }
            return { success: false, message: data.message };
        } catch (e) {
            return { success: false, message: "Network error." };
        }
    },

    async raiseDurabilityIssue(jobId, notes) {
        try {
            const res = await fetch('/api/jobs/durability-issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, notes })
            });
            return await res.json();
        } catch (e) {
            return { success: false, error: "Network error." };
        }
    },

    async submitCustomerRating(jobId, rating, review) {
        try {
            const res = await fetch('/api/jobs/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, rating, review })
            });
            return await res.json();
        } catch (e) {
            return { success: false };
        }
    },

    // Tool Bank & Wallet Actions
    async rentTool(toolId, days) {
        try {
            const res = await fetch('/api/tools/rent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool_id: toolId, days })
            });
            const data = await res.json();
            await this.pollServer();
            return data;
        } catch (e) {
            return { success: false, message: "Failed to rent tool." };
        }
    },

    async withdrawUpi(amount, isFull) {
        try {
            const res = await fetch('/api/wallet/withdraw-upi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, full_withdrawal: isFull })
            });
            const data = await res.json();
            await this.pollServer();
            return data;
        } catch (e) {
            return { success: false, message: "Failed to process UPI disbursal." };
        }
    },

    async submitWelfareClaim(claimType, amount, hospital, desc) {
        try {
            const res = await fetch('/api/welfare/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim_type: claimType, amount, hospital_name: hospital, description: desc })
            });
            const data = await res.json();
            await this.pollServer();
            return data;
        } catch (e) {
            return { success: false, message: "Failed to submit welfare claim." };
        }
    },

    async getActiveSos() {
        try {
            const res = await fetch('/api/sos/active');
            const data = await res.json();
            return data.alerts || [];
        } catch (e) {
            return [];
        }
    },

    async updateSosStatus(sosId, status) {
        try {
            const res = await fetch('/api/sos/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sos_id: sosId, status: status })
            });
            return await res.json();
        } catch (e) {
            return { success: false };
        }
    },

    setWorkerOnline(isOnline) {
        this.state.isWorkerOnline = isOnline;
        localStorage.setItem('sahideal_worker_online', isOnline);
        this.saveState();
    },

    getWorker() {
        return this.state.workerUser;
    },

    getCustomer() {
        return this.state.customerUser;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    CoopSync.init();
});
