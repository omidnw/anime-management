/**
 * Convert a time string in 12-hour format to 24-hour format
 * @param time12h Time string in 12-hour format (e.g., "9:30 PM")
 * @returns Time string in 24-hour format (e.g., "21:30")
 */
export function convertTo24Hour(time12h: string): string {
	// Check if the time is already in 24-hour format
	if (
		!time12h.toLowerCase().includes("am") &&
		!time12h.toLowerCase().includes("pm")
	) {
		return time12h;
	}

	const [timePart, modifier] = time12h.split(" ");
	let [hours, minutes] = timePart.split(":");

	let hour = parseInt(hours, 10);

	// Convert 12-hour format to 24-hour format
	if (modifier?.toLowerCase() === "pm" && hour < 12) {
		hour += 12;
	} else if (modifier?.toLowerCase() === "am" && hour === 12) {
		hour = 0;
	}

	return `${hour.toString().padStart(2, "0")}:${minutes || "00"}`;
}

/**
 * Convert a time string in 24-hour format to 12-hour format
 * @param time24h Time string in 24-hour format (e.g., "21:30")
 * @returns Time string in 12-hour format (e.g., "9:30 PM")
 */
export function convertTo12Hour(time24h: string): string {
	const [hourStr, minuteStr] = time24h.split(":");
	let hour = parseInt(hourStr, 10);
	const minutes = minuteStr || "00";

	const suffix = hour >= 12 ? "PM" : "AM";
	hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

	return `${hour}:${minutes} ${suffix}`;
}

/**
 * Parse a day name to its corresponding day index (0 for Sunday, 1 for Monday, etc.)
 * @param day Day name (e.g., "Monday", "Tue", "Sundays", etc.)
 * @returns Day index (0-6) or -1 if invalid
 */
export function parseDay(day: string): number {
	if (!day) return -1;

	const dayLower = day.toLowerCase();

	if (dayLower.includes("sun")) return 0;
	if (dayLower.includes("mon")) return 1;
	if (dayLower.includes("tue")) return 2;
	if (dayLower.includes("wed")) return 3;
	if (dayLower.includes("thu")) return 4;
	if (dayLower.includes("fri")) return 5;
	if (dayLower.includes("sat")) return 6;

	return -1;
}

/**
 * Format a date to a readable string (e.g., "Monday, January 1, 2023")
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Format a time string to a readable string (e.g., "9:30 PM")
 * @param time Time string in 24-hour format (e.g., "21:30")
 * @returns Formatted time string
 */
export function formatTime(time: string, use24Hour = false): string {
	if (!time) return "";

	return use24Hour ? time : convertTo12Hour(time);
}

/**
 * Get the day name from a date
 * @param date Date to get the day name from
 * @returns Day name (e.g., "Monday")
 */
export function getDayName(date: Date): string {
	return date.toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Get the current time in HH:MM format
 * @returns Current time string in 24-hour format
 */
export function getCurrentTime(): string {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, "0");
	const minutes = now.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
}

/**
 * Check if a given time is within a range
 * @param time Time to check (HH:MM format)
 * @param startTime Start of the range (HH:MM format)
 * @param endTime End of the range (HH:MM format)
 * @returns True if the time is within the range, false otherwise
 */
export function isTimeInRange(
	time: string,
	startTime: string,
	endTime: string
): boolean {
	if (!time || !startTime || !endTime) return false;

	// Convert to comparable format
	const timeMinutes = timeToMinutes(time);
	const startMinutes = timeToMinutes(startTime);
	const endMinutes = timeToMinutes(endTime);

	return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Convert a time string to minutes since midnight
 * @param time Time string in HH:MM format
 * @returns Minutes since midnight
 */
function timeToMinutes(time: string): number {
	const [hourStr, minuteStr] = time.split(":");
	const hours = parseInt(hourStr, 10);
	const minutes = parseInt(minuteStr, 10);

	return hours * 60 + minutes;
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * @param timestamp Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
	const now = new Date().getTime();
	const diff = now - timestamp;

	// Less than a minute
	if (diff < 60 * 1000) {
		return "just now";
	}

	// Less than an hour
	if (diff < 60 * 60 * 1000) {
		const minutes = Math.floor(diff / (60 * 1000));
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	}

	// Less than a day
	if (diff < 24 * 60 * 60 * 1000) {
		const hours = Math.floor(diff / (60 * 60 * 1000));
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	}

	// Less than a week
	if (diff < 7 * 24 * 60 * 60 * 1000) {
		const days = Math.floor(diff / (24 * 60 * 60 * 1000));
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	}

	// Format as date
	return formatDate(new Date(timestamp));
}
