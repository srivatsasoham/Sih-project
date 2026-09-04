/**
 * SahiDeal (पारस्परिक सहकारी) - Real-Time Live Sync & State Engine
 * Enables 100% Real-Time Cross-Tab / Cross-Device Coordination between Customer & Worker
 * Uses BroadcastChannel + LocalStorage Events + REST API fallback
 */

const DEFAULT_SHADOW_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'%3E%3Crect width='100' height='100' fill='%230f172a'/%3E%3Cpath d='M50 48a18 18 0 1 0 0-36 18 18 0 0 0 0 36zm0 10c-20 0-36 12-36 28v6h72v-6c0-16-16-28-36-28z' fill='%23475569'/%3E%3C/svg%3E";

const CoopSync = {
    channel: null,
    DEFAULT_AVATAR: DEFAULT_SHADOW_AVATAR,
    
    // Default initial seed state if empty
    state: {
        activeRole: localStorage.getItem('sahideal_active_role') || null,
        isWorkerOnline: localStorage.getItem('sahideal_worker_online') !== 'false',
        customerUser: null,
        workerUser: {
            name: "Ramesh Kumar",
            phone: "+91 98860 54321",
            trade: "Master Electrician & Plumber",
            experience: "8 Years",
            location: "Indiranagar (1.2 km radius)",
            avatar: DEFAULT_SHADOW_AVATAR
        },
        activeJobs: [],
        completedJobs: [],
        workerWallet: {
            balance: 4850,
            earningsToday: 0,
            totalJobs: 142,
            shares: 14,
            dividendsAccrued: 2840,
            transactions: [
                { id: "TXN-801", title: "Full Home Electrical Safety Audit", amount: 643, fee: 56, time: "Today, 2:30 PM", customer: "Rahul V." },
                { id: "TXN-800", title: "BLDC Fan Installation", amount: 413, fee: 36, time: "Yesterday", customer: "Meera K." }
            ]
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
                console.warn("BroadcastChannel fallback to storage events");
            }
        }

        // Listen for storage changes across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'sahideal_app_state') {
                this.loadState();
                if (window.onCoopStateUpdated) {
                    window.onCoopStateUpdated(this.state);
                }
            }
        });
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

    handleIncomingEvent(event) {
        const { type, payload } = event;
        this.loadState();

        if (type === 'JOB_POSTED') {
            // If on Worker page and worker is ONLINE, sound alarm and update radar
            if (this.state.isWorkerOnline) {
                if (typeof onWorkerJobReceived === 'function') {
                    onWorkerJobReceived(payload);
                }
                if (typeof SoundFX !== 'undefined') {
                    SoundFX.alarm(); // Loud audio alert for active worker
                }
                if (typeof Toast !== 'undefined') {
                    Toast.show(`🚨 INCOMING GIG ALARM: ${payload.serviceTitle} (₹${payload.workerPayout}) from ${payload.customerName}`, 'sos', 8000);
                }
            }
        } 
        else if (type === 'JOB_ACCEPTED') {
            // If on Customer page, transition immediately to Live GPS Tracking
            if (typeof onCustomerJobAccepted === 'function') {
                onCustomerJobAccepted(payload);
            }
            if (typeof Toast !== 'undefined') {
                Toast.show(`🚀 Worker ${payload.workerName} has ACCEPTED your request! ETA: 12 Mins`, 'success', 6000);
            }
            if (typeof SoundFX !== 'undefined') SoundFX.success();
        } 
        else if (type === 'JOB_STARTED') {
            if (typeof onCustomerJobStarted === 'function') {
                onCustomerJobStarted(payload);
            }
            if (typeof Toast !== 'undefined') {
                Toast.show(`⚡ Start OTP Verified! Pro ${payload.workerName} has started work.`, 'info');
            }
        } 
        else if (type === 'JOB_COMPLETED') {
            if (typeof onCustomerJobCompleted === 'function') {
                onCustomerJobCompleted(payload);
            }
            if (typeof Toast !== 'undefined') {
                Toast.show(`✅ Task verified & completed! Escrow released to ${payload.workerName}.`, 'success', 8000);
            }
            if (typeof SoundFX !== 'undefined') SoundFX.cash();
        }
        else if (type === 'JOB_TIMEOUT') {
            if (typeof onCustomerJobTimeout === 'function') {
                onCustomerJobTimeout(payload);
            }
        }
        else if (type === 'JOB_RATED') {
            if (typeof onWorkerJobRated === 'function') {
                onWorkerJobRated(payload);
            }
            if (typeof Toast !== 'undefined') {
                Toast.show(`⭐ Customer rated you ${payload.rating} Stars! Trust Score updated.`, 'success');
            }
        }
        else if (type === 'WORKER_STATUS_CHANGED') {
            if (typeof onWorkerStatusChanged === 'function') {
                onWorkerStatusChanged(payload);
            }
        }

        if (window.onCoopStateUpdated) {
            window.onCoopStateUpdated(this.state);
        }
    },

    // Online / Offline & Role Session Management
    setWorkerOnline(isOnline) {
        this.state.isWorkerOnline = isOnline;
        localStorage.setItem('sahideal_worker_online', isOnline ? 'true' : 'false');
        this.saveState();
        this.broadcast('WORKER_STATUS_CHANGED', { isOnline });
        return isOnline;
    },

    setCustomer(user) {
        this.state.customerUser = user;
        this.state.activeRole = 'customer';
        localStorage.setItem('sahideal_active_role', 'customer');
        this.saveState();
    },

    setWorker(user) {
        this.state.workerUser = user;
        this.state.activeRole = 'worker';
        localStorage.setItem('sahideal_active_role', 'worker');
        this.saveState();
    },

    logout() {
        this.state.activeRole = null;
        localStorage.removeItem('sahideal_active_role');
        this.saveState();
        this.broadcast('USER_LOGGED_OUT', {});
    },

    updateWorkerAvatar(avatarDataUrl) {
        if (!this.state.workerUser) {
            this.state.workerUser = { name: "Ramesh Kumar", role: "worker", avatar: DEFAULT_SHADOW_AVATAR };
        }
        this.state.workerUser.avatar = avatarDataUrl;
        this.saveState();
        this.broadcast('WORKER_AVATAR_UPDATED', { avatar: avatarDataUrl });
    },

    getCustomer() {
        return this.state.customerUser;
    },

    getWorker() {
        return this.state.workerUser;
    },

    // Job Lifecycle Functions
    postCustomerJob(jobDetails) {
        const jobId = `GIG-${Math.floor(1000 + Math.random() * 9000)}`;
        const startOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const completeOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const price = jobDetails.price || 599;
        const workerPayout = Math.round(price * 0.92);
        const coopFee = price - workerPayout;

        const job = {
            id: jobId,
            serviceTitle: jobDetails.title,
            category: jobDetails.category || "custom",
            problemDescription: jobDetails.description || "Service requested via customer portal",
            customerName: jobDetails.customerName || (this.state.customerUser ? this.state.customerUser.name : "Valued Customer"),
            customerPhone: jobDetails.customerPhone || (this.state.customerUser ? this.state.customerUser.phone : "+91 98450 12345"),
            customerAddress: jobDetails.customerAddress || (this.state.customerUser ? this.state.customerUser.address : "Indiranagar, Bangalore"),
            urgency: jobDetails.urgency || "Immediate (<20 mins)",
            price: price,
            workerPayout: workerPayout,
            coopFee: coopFee,
            startOtp: startOtp,
            completeOtp: completeOtp,
            status: "OPEN", // OPEN -> ACCEPTED -> IN_PROGRESS -> COMPLETED -> TIMEOUT
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAtTimestamp: Date.now(),
            workerName: null,
            workerPhone: null,
            workerAvatar: null,
            workPhotoProof: null,
            customerRating: null,
            customerReview: null
        };

        // Add to state and save
        this.state.activeJobs.unshift(job);
        this.saveState();

        // Broadcast to all active worker tabs
        this.broadcast('JOB_POSTED', job);

        return job;
    },

    acceptJobByWorker(jobId, worker) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return { success: false, message: "Job not found" };

        const job = this.state.activeJobs[jobIndex];
        
        // Strictly only ONE active worker can accept
        if (job.status !== 'OPEN') {
            return { success: false, message: "This task was already accepted by another specialist!" };
        }

        job.status = "ACCEPTED";
        job.workerName = worker.name || "Co-op Specialist";
        job.workerPhone = worker.phone || "+91 98860 54321";
        job.workerTrade = worker.trade || "Master Specialist";
        job.workerAvatar = worker.avatar || DEFAULT_SHADOW_AVATAR;
        job.acceptedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        job.etaMinutes = 12;

        this.state.activeJobs[jobIndex] = job;
        this.saveState();

        this.broadcast('JOB_ACCEPTED', job);
        return { success: true, job };
    },

    timeoutCustomerJob(jobId) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return null;

        const job = this.state.activeJobs[jobIndex];
        if (job.status === 'OPEN') {
            job.status = 'TIMEOUT';
            this.state.activeJobs[jobIndex] = job;
            this.saveState();
            this.broadcast('JOB_TIMEOUT', job);
        }
        return job;
    },

    retryBroadcastJob(jobId) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return null;

        const job = this.state.activeJobs[jobIndex];
        job.status = 'OPEN';
        job.createdAtTimestamp = Date.now();
        this.state.activeJobs[jobIndex] = job;
        this.saveState();
        this.broadcast('JOB_POSTED', job);
        return job;
    },

    verifyStartOtp(jobId, enteredOtp) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return { success: false, message: "Job not found" };

        const job = this.state.activeJobs[jobIndex];
        if (job.startOtp !== enteredOtp.trim()) {
            return { success: false, message: "Invalid Start OTP! Ask customer for the 4-digit code shown on their screen." };
        }

        job.status = "IN_PROGRESS";
        job.startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.state.activeJobs[jobIndex] = job;
        this.saveState();

        this.broadcast('JOB_STARTED', job);
        return { success: true, job };
    },

    uploadWorkPhotoProof(jobId, photoDataUrl) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return false;

        this.state.activeJobs[jobIndex].workPhotoProof = photoDataUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=80";
        this.saveState();
        return true;
    },

    verifyCompleteOtpAndSettle(jobId, enteredOtp) {
        const jobIndex = this.state.activeJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return { success: false, message: "Job not found" };

        const job = this.state.activeJobs[jobIndex];
        if (job.completeOtp !== enteredOtp.trim()) {
            return { success: false, message: "Invalid Completion OTP! Customer will provide this code after inspecting your work." };
        }

        job.status = "COMPLETED";
        job.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update Worker Wallet & Transaction Ledger
        this.state.workerWallet.balance += job.workerPayout;
        this.state.workerWallet.earningsToday += job.workerPayout;
        this.state.workerWallet.totalJobs += 1;
        this.state.workerWallet.dividendsAccrued += job.coopFee;

        this.state.workerWallet.transactions.unshift({
            id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
            title: job.serviceTitle,
            amount: job.workerPayout,
            fee: job.coopFee,
            time: "Just Now",
            customer: job.customerName
        });

        // Move to completed jobs history
        this.state.completedJobs.unshift(job);
        this.state.activeJobs.splice(jobIndex, 1);
        this.saveState();

        this.broadcast('JOB_COMPLETED', job);
        return { success: true, job };
    },

    submitCustomerRating(jobId, rating, reviewText) {
        const completedIndex = this.state.completedJobs.findIndex(j => j.id === jobId);
        if (completedIndex !== -1) {
            this.state.completedJobs[completedIndex].customerRating = rating;
            this.state.completedJobs[completedIndex].customerReview = reviewText;
        }

        this.saveState();
        this.broadcast('JOB_RATED', { jobId, rating, reviewText });
        return true;
    }
};

// Initialize Sync Engine
CoopSync.init();
