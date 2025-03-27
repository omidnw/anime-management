import { processDueNotifications } from "./notificationService";

// Interval for processing notifications (in milliseconds)
const NOTIFICATION_CHECK_INTERVAL = 60000; // 1 minute

let notificationIntervalId: number | null = null;

/**
 * Start the background notification service
 */
export function startNotificationService(): void {
	// Stop any existing interval
	stopNotificationService();

	// Immediately check for notifications
	processDueNotifications().catch((error) => {
		console.error("Error processing notifications:", error);
	});

	// Set up periodic checking
	notificationIntervalId = window.setInterval(() => {
		processDueNotifications().catch((error) => {
			console.error("Error processing notifications:", error);
		});
	}, NOTIFICATION_CHECK_INTERVAL);

	console.log("Notification background service started");
}

/**
 * Stop the background notification service
 */
export function stopNotificationService(): void {
	if (notificationIntervalId !== null) {
		window.clearInterval(notificationIntervalId);
		notificationIntervalId = null;
		console.log("Notification background service stopped");
	}
}

/**
 * Check if the notification service is running
 */
export function isNotificationServiceRunning(): boolean {
	return notificationIntervalId !== null;
}
