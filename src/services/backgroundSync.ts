import { networkMonitor, NetworkEvent } from "./networkMonitor";
import {
	initOfflineStorage,
	getPendingChanges,
	syncPendingChanges,
	getNetworkStatus,
} from "./offlineStorage";
import { isOnline } from "../utils/network";
import { EventEmitter } from "../utils/eventEmitter";

// Sync events
export enum SyncEvent {
	SYNC_STARTED = "sync:started",
	SYNC_COMPLETED = "sync:completed",
	SYNC_FAILED = "sync:failed",
	PENDING_CHANGES_UPDATED = "sync:pending_changes_updated",
	SYNC_PROGRESS = "sync_progress",
}

// Background sync configuration
const DEFAULT_SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const SYNC_STATUS_CHECK_INTERVAL = 60 * 1000; // 1 minute
const RETRY_MAX_ATTEMPTS = 5;

export interface SyncResult {
	timestamp: number;
	success: number;
	failed: number;
	hasPendingChanges: boolean;
	pendingChangesCount: number;
	isOnline: boolean;
	errors?: string[];
}

// Background sync service singleton
class BackgroundSync {
	private isInitialized = false;
	private isRunning = false;
	private syncIntervalId: number | null = null;
	private statusCheckIntervalId: number | null = null;
	private lastSyncResult: SyncResult | null = null;
	private events: EventEmitter = new EventEmitter();
	private pendingChangesCount = 0;
	private lastSyncAttempt = 0;
	private retryCount = 0;

	/**
	 * Initialize the background sync service
	 */
	public async init(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		try {
			console.log("Initializing background sync service");

			// Initialize storage
			await initOfflineStorage();

			// Check for pending changes
			const pendingChanges = await getPendingChanges();
			this.pendingChangesCount = pendingChanges.length;

			// Set up network status change listener
			if (
				networkMonitor &&
				typeof networkMonitor.subscribeToNetworkEvents === "function"
			) {
				networkMonitor.subscribeToNetworkEvents(
					NetworkEvent.CONNECTION_RESTORED,
					this.handleOnline
				);
				networkMonitor.subscribeToNetworkEvents(
					NetworkEvent.STATUS_CHANGE,
					this.handleNetworkStatusChange
				);

				// Start the network monitor
				if (typeof networkMonitor.initialize === "function") {
					await networkMonitor.initialize();
				}
			} else {
				// Set up periodic checks as fallback
				window.addEventListener("online", this.handleOnline);
				console.log("Using browser online event as fallback");
			}

			// Set up periodic status check
			this.startStatusCheck();

			this.isInitialized = true;
			console.log("Background sync service initialized");
		} catch (error) {
			console.error("Failed to initialize background sync service:", error);
		}
	}

	/**
	 * Start automatic background synchronization
	 * @param syncInterval Interval in milliseconds between sync attempts
	 */
	public start(syncInterval = DEFAULT_SYNC_INTERVAL): void {
		if (!this.isInitialized) {
			console.warn(
				"Background sync service not initialized. Call init() first."
			);
			return;
		}

		if (this.isRunning) {
			console.log("Background sync is already running");
			return;
		}

		// Ensure minimum sync interval
		const interval = Math.max(syncInterval, MIN_SYNC_INTERVAL);

		console.log(`Starting background sync with interval: ${interval}ms`);
		this.isRunning = true;

		// Schedule first sync
		this.syncIntervalId = window.setInterval(this.performSync, interval);

		// Run an initial sync immediately
		this.performSync();
	}

	/**
	 * Stop automatic background synchronization
	 */
	public stop(): void {
		if (!this.isRunning) {
			return;
		}

		console.log("Stopping background sync");
		this.isRunning = false;

		if (this.syncIntervalId !== null) {
			window.clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}
	}

	/**
	 * Start periodic status checks
	 */
	private startStatusCheck(): void {
		if (this.statusCheckIntervalId !== null) {
			window.clearInterval(this.statusCheckIntervalId);
		}

		this.statusCheckIntervalId = window.setInterval(
			this.checkPendingChanges,
			SYNC_STATUS_CHECK_INTERVAL
		);

		// Run an initial check immediately
		this.checkPendingChanges();
	}

	/**
	 * Stop periodic status checks
	 */
	private stopStatusCheck(): void {
		if (this.statusCheckIntervalId !== null) {
			window.clearInterval(this.statusCheckIntervalId);
			this.statusCheckIntervalId = null;
		}
	}

	/**
	 * Check for pending changes and update status
	 */
	private checkPendingChanges = async (): Promise<void> => {
		try {
			const pendingChanges = await getPendingChanges();
			const oldCount = this.pendingChangesCount;
			this.pendingChangesCount = pendingChanges.length;

			// Emit event if count changed
			if (oldCount !== this.pendingChangesCount) {
				this.events.emit(
					SyncEvent.PENDING_CHANGES_UPDATED,
					this.pendingChangesCount
				);
			}
		} catch (error) {
			console.error("Error checking pending changes:", error);
		}
	};

	/**
	 * Perform a synchronization attempt
	 */
	private performSync = async (): Promise<void> => {
		// Don't sync if no pending changes
		if (this.pendingChangesCount === 0) {
			return;
		}

		try {
			// Check if we're online
			const online = await getNetworkStatus();
			if (!online) {
				console.log("Not online, skipping sync");
				return;
			}

			// Signal sync start
			this.events.emit(SyncEvent.SYNC_STARTED);

			// Sync pending changes
			const result = await syncPendingChanges();

			// Update last sync result
			this.lastSyncResult = {
				timestamp: Date.now(),
				success: result.success,
				failed: result.failed,
				hasPendingChanges: result.failed > 0,
				pendingChangesCount: result.failed,
				isOnline: online,
				errors: [], // Initialize with empty array since the property might not exist
			};

			// Update pending changes count
			await this.checkPendingChanges();

			// Signal sync completion
			this.events.emit(SyncEvent.SYNC_COMPLETED, this.lastSyncResult);

			console.log(
				`Sync completed: ${result.success} successful, ${result.failed} failed`
			);
		} catch (error) {
			console.error("Error performing background sync:", error);

			// Signal sync failure
			this.events.emit(SyncEvent.SYNC_FAILED, {
				timestamp: Date.now(),
				error,
			});
		}
	};

	/**
	 * Handle online event
	 */
	private handleOnline = (): void => {
		console.log("Network is online, triggering sync");
		this.performSync();
	};

	/**
	 * Handle network status change
	 */
	private handleNetworkStatusChange = (isOnline: boolean): void => {
		console.log(`Network status changed: ${isOnline ? "online" : "offline"}`);
	};

	/**
	 * Subscribe to sync events
	 */
	public on(event: SyncEvent, callback: (...args: any[]) => void): () => void {
		return this.events.on(event, callback);
	}

	/**
	 * Get the result of the last sync attempt
	 */
	public getLastSyncResult(): SyncResult | null {
		return this.lastSyncResult;
	}

	/**
	 * Get the current count of pending changes
	 */
	public getPendingChangesCount(): number {
		return this.pendingChangesCount;
	}

	/**
	 * Force a synchronization immediately
	 * @returns The sync result
	 */
	public async forceSync(): Promise<SyncResult> {
		if (!this.isInitialized) {
			throw new Error("Background sync service not initialized");
		}

		try {
			// Check if we're online
			const online = await isOnline();
			if (!online) {
				console.log("Not online, cannot force sync");
				return {
					timestamp: Date.now(),
					success: 0,
					failed: 0,
					hasPendingChanges: this.pendingChangesCount > 0,
					pendingChangesCount: this.pendingChangesCount,
					isOnline: false,
					errors: ["Cannot sync while offline"],
				};
			}

			// Signal sync start
			this.events.emit(SyncEvent.SYNC_STARTED);

			// Sync pending changes
			const result = await syncPendingChanges();

			// Update last sync result
			this.lastSyncResult = {
				timestamp: Date.now(),
				success: result.success,
				failed: result.failed,
				hasPendingChanges: result.failed > 0,
				pendingChangesCount: result.failed,
				isOnline: true,
				errors: [], // Initialize with empty array
			};

			// Update pending changes count
			await this.checkPendingChanges();

			// Signal sync completion
			this.events.emit(SyncEvent.SYNC_COMPLETED, this.lastSyncResult);

			return this.lastSyncResult;
		} catch (error) {
			console.error("Error performing force sync:", error);

			// Create an error result
			const errorResult: SyncResult = {
				timestamp: Date.now(),
				success: 0,
				failed: this.pendingChangesCount,
				hasPendingChanges: this.pendingChangesCount > 0,
				pendingChangesCount: this.pendingChangesCount,
				isOnline: await isOnline(),
				errors: [error instanceof Error ? error.message : String(error)],
			};

			// Signal sync failure
			this.events.emit(SyncEvent.SYNC_FAILED, errorResult);

			return errorResult;
		}
	}

	/**
	 * Handle connection restored event
	 */
	private handleConnectionRestored = async (): Promise<void> => {
		console.log("Connection restored, checking for pending changes");
		this.retryCount = 0; // Reset retry count
		await this.performSync();
	};

	/**
	 * Check if there are pending changes and sync if necessary
	 */
	private checkAndSync = async (): Promise<void> => {
		// Don't start a new sync if one is already in progress
		if (this.isRunning) {
			return;
		}

		try {
			// Check if we're online
			const isOnline = await networkMonitor.getNetworkStatus();
			if (!isOnline) {
				console.log("Skipping background sync: device is offline");
				return;
			}

			// Check if there are pending changes
			const pendingChanges = await getPendingChanges();
			if (pendingChanges.length === 0) {
				// No changes to sync
				return;
			}

			// Start sync
			await this.performSync();
		} catch (error) {
			console.error("Error checking for pending changes:", error);
		}
	};
}

// Export singleton instance
export const backgroundSync = new BackgroundSync();
