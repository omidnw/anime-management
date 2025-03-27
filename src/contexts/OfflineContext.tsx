import { createContext, useContext, useState, useEffect } from "react";
import { isOnline } from "../utils/network";
import {
	getNetworkStatus,
	getPendingChanges,
} from "../services/offlineStorage";
import {
	backgroundSync,
	SyncEvent,
	SyncResult,
} from "../services/backgroundSync";
import { networkMonitor, NetworkEvent } from "../services/networkMonitor";
// import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

// Define the context type
interface OfflineContextType {
	isOffline: boolean;
	hasPendingChanges: boolean;
	isPendingSyncInProgress: boolean;
	lastSyncTime: Date | null;
	lastSyncResult: SyncResult | null;
	pendingChangesCount: number;
	manuallyToggleOfflineMode: () => void;
	syncNow: () => Promise<void>;
	formatLastSyncTime: () => string;
}

// Create the context with default values
const OfflineContext = createContext<OfflineContextType>({
	isOffline: false,
	hasPendingChanges: false,
	isPendingSyncInProgress: false,
	lastSyncTime: null,
	lastSyncResult: null,
	pendingChangesCount: 0,
	manuallyToggleOfflineMode: () => {},
	syncNow: async () => {},
	formatLastSyncTime: () => "",
});

// Hook for components to use the offline context
export const useOffline = () => useContext(OfflineContext);

interface OfflineProviderProps {
	children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
	children,
}) => {
	// State for tracking offline status and sync information
	const [isOffline, setIsOffline] = useState(false);
	const [manualOfflineMode, setManualOfflineMode] = useState<boolean | null>(
		null
	);
	const [hasPendingChanges, setHasPendingChanges] = useState(false);
	const [pendingChangesCount, setPendingChangesCount] = useState(0);
	const [isPendingSyncInProgress, setIsPendingSyncInProgress] = useState(false);
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
	const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
	const [_isInitialized, setIsInitialized] = useState(false);

	// Initialize offline storage and network status
	useEffect(() => {
		const initialize = async () => {
			try {
				// Initialize the background sync service
				await backgroundSync.init();

				// Get current network status
				const status = await getNetworkStatus();
				setIsOffline(!status);

				// Check for pending changes
				updatePendingChangesStatus();

				// Set up event listeners for the background sync service
				backgroundSync.on(SyncEvent.SYNC_STARTED, handleSyncStarted);
				backgroundSync.on(SyncEvent.SYNC_COMPLETED, handleSyncCompleted);
				backgroundSync.on(SyncEvent.SYNC_FAILED, handleSyncFailed);
				backgroundSync.on(
					SyncEvent.PENDING_CHANGES_UPDATED,
					handlePendingChangesUpdated
				);

				// Set up network event listeners
				if (
					networkMonitor &&
					typeof networkMonitor.subscribeToNetworkEvents === "function"
				) {
					networkMonitor.subscribeToNetworkEvents(
						NetworkEvent.STATUS_CHANGE,
						handleNetworkStatusChange
					);
				} else {
					// Fallback to periodic network checks if networkMonitor is unavailable
					const checkNetworkInterval = setInterval(async () => {
						const online = await isOnline();
						if (manualOfflineMode === null) {
							setIsOffline(!online);
						}
					}, 60000); // Check every minute

					// Clean up interval when component unmounts
					return () => clearInterval(checkNetworkInterval);
				}

				// Start the background sync service
				backgroundSync.start();

				setIsInitialized(true);
				console.log("Offline context initialized");
			} catch (error) {
				console.error("Failed to initialize offline mode:", error);
				setIsInitialized(true); // Still mark as initialized so UI can proceed
			}
		};

		initialize();

		// Cleanup when unmounting
		return () => {
			backgroundSync.stop();
		};
	}, []);

	// Handle background sync events
	const handleSyncStarted = () => {
		setIsPendingSyncInProgress(true);
	};

	const handleSyncCompleted = (result: SyncResult) => {
		setIsPendingSyncInProgress(false);
		setLastSyncTime(new Date(result.timestamp));
		setLastSyncResult(result);
		setHasPendingChanges(result.hasPendingChanges);
		setPendingChangesCount(result.pendingChangesCount);
	};

	const handleSyncFailed = () => {
		setIsPendingSyncInProgress(false);
		updatePendingChangesStatus();
	};

	const handlePendingChangesUpdated = (count: number) => {
		setPendingChangesCount(count);
		setHasPendingChanges(count > 0);
	};

	// Handle network status change
	const handleNetworkStatusChange = (online: boolean) => {
		// If user has manually set offline mode, don't override it
		if (manualOfflineMode !== null) {
			return;
		}

		setIsOffline(!online);
	};

	// Update pending changes status
	const updatePendingChangesStatus = async () => {
		try {
			const pendingChanges = await getPendingChanges();
			setHasPendingChanges(pendingChanges.length > 0);
			setPendingChangesCount(pendingChanges.length);
		} catch (error) {
			console.error("Error checking pending changes:", error);
		}
	};

	// Function to manually toggle offline mode
	const manuallyToggleOfflineMode = () => {
		const newOfflineState = !isOffline;
		setManualOfflineMode(newOfflineState);
		setIsOffline(newOfflineState);

		// If going back online, trigger a sync
		if (!newOfflineState && hasPendingChanges) {
			syncNow();
		}
	};

	// Format the last sync time in a user-friendly way
	const formatLastSyncTime = () => {
		if (!lastSyncTime) return "";
		return formatDistanceToNow(lastSyncTime, { addSuffix: true });
	};

	// Function to trigger a manual sync
	const syncNow = async (): Promise<void> => {
		// Don't sync if we're offline
		if (!isOffline && hasPendingChanges) {
			try {
				setIsPendingSyncInProgress(true);
				const result = await backgroundSync.forceSync();
				setLastSyncResult(result);
				setLastSyncTime(new Date(result.timestamp));
			} catch (error) {
				console.error("Sync failed:", error);
			} finally {
				setIsPendingSyncInProgress(false);
			}
		}
	};

	// Provide the context value
	const contextValue: OfflineContextType = {
		isOffline,
		hasPendingChanges,
		isPendingSyncInProgress,
		lastSyncTime,
		lastSyncResult,
		pendingChangesCount,
		manuallyToggleOfflineMode,
		syncNow,
		formatLastSyncTime,
	};

	return (
		<OfflineContext.Provider value={contextValue}>
			{children}
		</OfflineContext.Provider>
	);
};

export default OfflineProvider;
