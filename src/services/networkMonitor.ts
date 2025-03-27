import { EventEmitter } from "../utils/eventEmitter";
import { isOnline as checkOnline } from "../utils/network";
import { offlineStorage } from "./offlineStorage";

// Network status event types
export enum NetworkEvent {
	STATUS_CHANGE = "network_status_change",
	CONNECTION_LOST = "connection_lost",
	CONNECTION_RESTORED = "connection_restored",
}

// Configuration
const PING_INTERVAL = 30000; // 30 seconds
// const PING_ENDPOINT = "https://api.jikan.moe/v4"; // Use anime API as ping endpoint

class NetworkMonitor {
	private emitter = new EventEmitter(); // Removed type argument
	private isInitialized = false;
	private currentStatus = true; // Assume online initially
	private pingInterval: number | null = null;
	private offlineListener: (() => void) | null = null;
	private onlineListener: (() => void) | null = null;

	/**
	 * Initialize the network monitor
	 */
	public async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		// Try to load previous network status from storage
		try {
			const storedStatus = await offlineStorage.getNetworkStatus();
			if (storedStatus !== null && typeof storedStatus === "boolean") {
				this.currentStatus = storedStatus;
			}
		} catch (error) {
			console.warn("Failed to load network status from storage:", error);
		}

		// Set up browser online/offline event listeners
		this.offlineListener = () => this.handleStatusChange(false);
		this.onlineListener = () => this.checkAndUpdateStatus();

		window.addEventListener("offline", this.offlineListener);
		window.addEventListener("online", this.onlineListener);

		// Initial check
		await this.checkAndUpdateStatus();

		// Set up periodic ping
		this.pingInterval = window.setInterval(
			() => this.checkAndUpdateStatus(),
			PING_INTERVAL
		);

		this.isInitialized = true;
		console.log("Network monitor initialized");
	}

	/**
	 * Clean up resources
	 */
	public dispose(): void {
		if (!this.isInitialized) {
			return;
		}

		// Remove event listeners
		if (this.offlineListener) {
			window.removeEventListener("offline", this.offlineListener);
			this.offlineListener = null;
		}

		if (this.onlineListener) {
			window.removeEventListener("online", this.onlineListener);
			this.onlineListener = null;
		}

		// Clear ping interval
		if (this.pingInterval !== null) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}

		this.isInitialized = false;
		console.log("Network monitor disposed");
	}

	/**
	 * Subscribe to network events
	 * @param event The event to subscribe to
	 * @param callback The callback function
	 * @returns A function to unsubscribe
	 */
	public subscribeToNetworkEvents(
		event: NetworkEvent,
		callback: (...args: any[]) => void
	): () => void {
		return this.emitter.subscribe(event, callback);
	}

	/**
	 * Get current online status
	 * @returns Promise resolving to true if online, false otherwise
	 */
	public async getNetworkStatus(): Promise<boolean> {
		return this.currentStatus;
	}

	/**
	 * Perform network status check and update if changed
	 */
	private async checkAndUpdateStatus(): Promise<void> {
		try {
			const status = await checkOnline();
			await this.handleStatusChange(status);
		} catch (error) {
			console.error("Error checking network status:", error);
			// Assume offline if error occurs during check
			await this.handleStatusChange(false);
		}
	}

	/**
	 * Handle network status changes and emit events
	 * @param isOnline Current online status
	 */
	private async handleStatusChange(isOnline: boolean): Promise<void> {
		// Only emit events if status has changed
		if (this.currentStatus !== isOnline) {
			// Update status
			const previousStatus = this.currentStatus;
			this.currentStatus = isOnline;

			// Store status in local storage
			try {
				await offlineStorage.updateNetworkStatus(isOnline);
			} catch (error) {
				console.error("Failed to store network status:", error);
			}

			// Emit status change event
			this.emitter.emit(NetworkEvent.STATUS_CHANGE, isOnline);

			// Emit connection lost/restored events
			if (!isOnline && previousStatus) {
				this.emitter.emit(NetworkEvent.CONNECTION_LOST);
			} else if (isOnline && !previousStatus) {
				this.emitter.emit(NetworkEvent.CONNECTION_RESTORED);
			}

			console.log(`Network status changed: ${isOnline ? "online" : "offline"}`);
		}
	}
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
