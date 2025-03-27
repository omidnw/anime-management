import {
	sendNotification,
	isPermissionGranted,
} from "@tauri-apps/plugin-notification";
import { AnimeData } from "../types/anime";
import { convertTo24Hour, parseDay } from "../utils/timeUtils";

// Local storage keys
const NOTIFICATIONS_ENABLED_KEY = "anime_notifications_enabled";
const SCHEDULED_NOTIFICATIONS_KEY = "scheduled_notifications";
const NOTIFICATION_SETTINGS_KEY = "notification_settings";

export interface NotificationSettings {
	enableReleaseReminders: boolean;
	reminderTime: number; // minutes before airing
	notifyOnlyFavorites: boolean;
	showSystemTray: boolean;
	soundEnabled: boolean;
	notificationDelivery: "system" | "app" | "both";
}

export interface ScheduledNotification {
	id: string;
	animeId: number;
	title: string;
	body: string;
	scheduledTime: number; // Unix timestamp
	episodeNumber?: number;
	imageUrl?: string;
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
	enableReleaseReminders: true,
	reminderTime: 30, // 30 minutes before
	notifyOnlyFavorites: false,
	showSystemTray: true,
	soundEnabled: true,
	notificationDelivery: "both",
};

/**
 * Load notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
	try {
		const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
		if (savedSettings) {
			return JSON.parse(savedSettings);
		}
	} catch (error) {
		console.error("Failed to load notification settings:", error);
	}
	return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
	try {
		localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
	} catch (error) {
		console.error("Failed to save notification settings:", error);
	}
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
	try {
		// Check system permission
		const permissionGranted = await isPermissionGranted();
		if (!permissionGranted) return false;

		// Check user preference
		const enabled = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
		return enabled !== "false"; // Default to true if not set
	} catch (error) {
		console.error("Error checking notification status:", error);
		return false;
	}
}

/**
 * Enable or disable notifications
 */
export function setNotificationsEnabled(enabled: boolean): void {
	localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
}

/**
 * Schedule a notification for an anime episode
 */
export function scheduleAnimeNotification(
	anime: AnimeData,
	episodeNumber: number,
	scheduledTime: Date
): string {
	// Create unique notification ID
	const notificationId = `anime_${
		anime.mal_id
	}_ep_${episodeNumber}_${scheduledTime.getTime()}`;

	const notification: ScheduledNotification = {
		id: notificationId,
		animeId: anime.mal_id,
		title: `${anime.title} - Episode ${episodeNumber}`,
		body: `A new episode of ${anime.title} is airing soon!`,
		scheduledTime: scheduledTime.getTime(),
		episodeNumber,
		imageUrl: anime.images?.jpg?.image_url,
	};

	// Get existing scheduled notifications
	const scheduled = getScheduledNotifications();

	// Add new notification
	scheduled.push(notification);

	// Save to localStorage
	saveScheduledNotifications(scheduled);

	return notificationId;
}

/**
 * Schedule notifications for all episodes in the next week
 */
export function scheduleWeeklyAnimeNotifications(
	animeList: AnimeData[],
	settings: NotificationSettings = getNotificationSettings()
): void {
	if (!settings.enableReleaseReminders) return;

	// Get current time
	const now = new Date();

	// Clear existing scheduled notifications
	clearAllScheduledNotifications();

	// Filter anime by user preference
	const animeToSchedule = settings.notifyOnlyFavorites
		? animeList.filter((anime) => anime.favorites && anime.favorites > 0)
		: animeList;

	// Schedule notifications for each anime
	animeToSchedule.forEach((anime) => {
		// Skip if no broadcast info
		if (!anime.broadcast?.day || !anime.broadcast?.time) return;

		// Calculate next episode time
		const episodeDate = getNextEpisodeDate(anime);
		if (!episodeDate) return;

		// Calculate notification time (X minutes before airing)
		const notificationTime = new Date(
			episodeDate.getTime() - settings.reminderTime * 60 * 1000
		);

		// Only schedule if it's in the future
		if (notificationTime > now) {
			// Determine episode number (approximate based on airing start date)
			const episodeNumber = estimateCurrentEpisode(anime);

			// Schedule the notification
			scheduleAnimeNotification(anime, episodeNumber, notificationTime);
		}
	});
}

/**
 * Get all scheduled notifications
 */
export function getScheduledNotifications(): ScheduledNotification[] {
	try {
		const savedNotifications = localStorage.getItem(
			SCHEDULED_NOTIFICATIONS_KEY
		);
		if (savedNotifications) {
			return JSON.parse(savedNotifications);
		}
	} catch (error) {
		console.error("Failed to load scheduled notifications:", error);
	}
	return [];
}

/**
 * Save scheduled notifications to localStorage
 */
function saveScheduledNotifications(
	notifications: ScheduledNotification[]
): void {
	try {
		localStorage.setItem(
			SCHEDULED_NOTIFICATIONS_KEY,
			JSON.stringify(notifications)
		);
	} catch (error) {
		console.error("Failed to save scheduled notifications:", error);
	}
}

/**
 * Cancel a specific scheduled notification
 */
export function cancelScheduledNotification(notificationId: string): void {
	const scheduled = getScheduledNotifications();
	const updatedSchedule = scheduled.filter((n) => n.id !== notificationId);
	saveScheduledNotifications(updatedSchedule);
}

/**
 * Clear all scheduled notifications
 */
export function clearAllScheduledNotifications(): void {
	saveScheduledNotifications([]);
}

/**
 * Process due notifications
 * This should be called regularly to check for notifications that need to be shown
 */
export async function processDueNotifications(): Promise<void> {
	// Skip if notifications aren't enabled
	const enabled = await areNotificationsEnabled();
	if (!enabled) return;

	const settings = getNotificationSettings();
	if (!settings.enableReleaseReminders) return;

	const now = new Date().getTime();
	const scheduled = getScheduledNotifications();
	const dueNotifications = scheduled.filter((n) => n.scheduledTime <= now);
	const remainingNotifications = scheduled.filter((n) => n.scheduledTime > now);

	// Save remaining notifications
	saveScheduledNotifications(remainingNotifications);

	// Send due notifications based on delivery settings
	for (const notification of dueNotifications) {
		try {
			if (
				settings.notificationDelivery === "system" ||
				settings.notificationDelivery === "both"
			) {
				// Send system notification if permission is granted
				const permissionGranted = await isPermissionGranted();
				if (permissionGranted) {
					await sendNotification({
						title: notification.title,
						body: notification.body,
						icon: notification.imageUrl,
					});
				}
			}

			if (
				settings.notificationDelivery === "app" ||
				settings.notificationDelivery === "both"
			) {
				// Store in-app notification
				await saveInAppNotification(notification);
			}
		} catch (error) {
			console.error("Failed to send notification:", error);
		}
	}
}

/**
 * Calculate the next episode date for an anime
 */
function getNextEpisodeDate(anime: AnimeData): Date | null {
	if (!anime.broadcast?.day || !anime.broadcast?.time) return null;

	const now = new Date();
	const dayOfWeek = parseDay(anime.broadcast.day);

	if (dayOfWeek === -1) return null;

	// Parse broadcast time
	const time24h = convertTo24Hour(anime.broadcast.time);
	const [hourStr, minuteStr] = time24h.split(":");
	const hour = parseInt(hourStr, 10);
	const minute = parseInt(minuteStr, 10);

	if (isNaN(hour) || isNaN(minute)) return null;

	// Calculate the next occurrence of the broadcast day
	const nextDate = new Date(now);

	// Set to the next occurrence of the day of week
	const daysUntilNext = (dayOfWeek + 7 - now.getDay()) % 7;
	nextDate.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));

	// Set the broadcast time
	nextDate.setHours(hour, minute, 0, 0);

	// If today is the broadcast day and it's before the broadcast time, set to today
	if (
		dayOfWeek === now.getDay() &&
		(now.getHours() < hour ||
			(now.getHours() === hour && now.getMinutes() < minute))
	) {
		nextDate.setDate(now.getDate());
	}

	return nextDate;
}

/**
 * Estimate the current episode number based on airing information
 */
function estimateCurrentEpisode(anime: AnimeData): number {
	// Default to episode 1 if we can't calculate
	if (!anime.aired?.from) return 1;

	const startDate = new Date(anime.aired.from);
	const now = new Date();

	// Calculate weeks since start
	const msPerWeek = 7 * 24 * 60 * 60 * 1000;
	const weeksSinceStart = Math.floor(
		(now.getTime() - startDate.getTime()) / msPerWeek
	);

	// Assume one episode per week, starting from episode 1
	return weeksSinceStart + 1;
}

// Add a function to store in-app notifications
export interface InAppNotification extends ScheduledNotification {
	read: boolean;
	createdAt: number;
}

const IN_APP_NOTIFICATIONS_KEY = "in_app_notifications";

/**
 * Get all in-app notifications
 */
export function getInAppNotifications(): InAppNotification[] {
	try {
		const saved = localStorage.getItem(IN_APP_NOTIFICATIONS_KEY);
		if (saved) {
			return JSON.parse(saved);
		}
	} catch (error) {
		console.error("Failed to load in-app notifications:", error);
	}
	return [];
}

/**
 * Save in-app notification
 */
export async function saveInAppNotification(
	notification: ScheduledNotification
): Promise<void> {
	try {
		const inAppNotification: InAppNotification = {
			...notification,
			read: false,
			createdAt: new Date().getTime(),
		};

		const notifications = getInAppNotifications();
		notifications.push(inAppNotification);

		// Sort by creation time, most recent first
		notifications.sort((a, b) => b.createdAt - a.createdAt);

		// Keep only the most recent 50 notifications
		const trimmed = notifications.slice(0, 50);

		localStorage.setItem(IN_APP_NOTIFICATIONS_KEY, JSON.stringify(trimmed));
	} catch (error) {
		console.error("Failed to save in-app notification:", error);
	}
}

/**
 * Mark in-app notification as read
 */
export function markInAppNotificationAsRead(id: string): void {
	try {
		const notifications = getInAppNotifications();
		const updatedNotifications = notifications.map((n) =>
			n.id === id ? { ...n, read: true } : n
		);

		localStorage.setItem(
			IN_APP_NOTIFICATIONS_KEY,
			JSON.stringify(updatedNotifications)
		);
	} catch (error) {
		console.error("Failed to mark notification as read:", error);
	}
}

/**
 * Clear all in-app notifications
 */
export function clearInAppNotifications(): void {
	localStorage.setItem(IN_APP_NOTIFICATIONS_KEY, JSON.stringify([]));
}
