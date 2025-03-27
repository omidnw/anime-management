/**
 * Utility to check if the device is currently online
 * @returns Promise<boolean> true if online, false if offline
 */
export async function isOnline(): Promise<boolean> {
	// Using the browser's navigator.onLine property as a baseline
	// This is not always 100% accurate but provides a good starting point
	if (typeof navigator !== "undefined" && "onLine" in navigator) {
		return navigator.onLine;
	}

	// If navigator is not available or doesn't have onLine property,
	// assume we're online (fallback)
	return true;
}

/**
 * Sets up a listener for online/offline events
 * @param callback Function to call when online status changes
 * @returns Function to remove the listeners
 */
export function setupNetworkListener(
	callback: (isOnline: boolean) => void
): () => void {
	const handleOnline = () => callback(true);
	const handleOffline = () => callback(false);

	window.addEventListener("online", handleOnline);
	window.addEventListener("offline", handleOffline);

	// Initial call with current status
	callback(navigator.onLine);

	// Return function to remove listeners
	return () => {
		window.removeEventListener("online", handleOnline);
		window.removeEventListener("offline", handleOffline);
	};
}
