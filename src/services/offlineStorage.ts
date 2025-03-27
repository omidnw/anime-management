import { invoke } from "@tauri-apps/api/core";
import {
	readTextFile,
	writeTextFile,
	exists,
	BaseDirectory,
	create,
} from "@tauri-apps/plugin-fs";
import { UserAnimeData } from "../types/anime";
import { animeDatabase } from "./animeDatabase";
import { isOnline } from "../utils/network";

// Types for offline storage
interface CachedData<T> {
	data: T;
	timestamp: number;
	expiration: number;
	version: number;
}

interface PendingChange {
	id: string;
	type: "add" | "update" | "delete";
	entityType: string;
	data: any;
	timestamp: number;
}

// Current cache version
const CACHE_VERSION = 1;

// Cache expiration (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Default folder name
const DEFAULT_FOLDER_NAME = "AniTrack";

// Storage files
const ANIME_CACHE_FILENAME = "anime_cache.json";
const PENDING_CHANGES_FILENAME = "pending_changes.json";
const NETWORK_STATUS_FILENAME = "network_status.json";

// Current storage location
let currentStorageLocation: "documents" | "home" | "appdata" | "custom" =
	"documents";
let customStoragePath = "";

/**
 * Convert TypeScript storage location to Rust enum value
 */
const getStorageLocationForRust = (): string => {
	switch (currentStorageLocation) {
		case "appdata":
			return "AppData";
		case "home":
			return "Home";
		case "documents":
			return "Documents";
		case "custom":
			return "Custom";
		default:
			return "Documents";
	}
};

/**
 * Configure the storage location
 * @param location "documents" | "home" | "appdata" | "custom"
 * @param customFolderPath Optional custom path when using "custom" location
 */
export const configureStorageLocation = async (
	location: "documents" | "home" | "appdata" | "custom" = "documents",
	customFolderPath: string = ""
): Promise<void> => {
	try {
		// Save the settings
		currentStorageLocation = location;
		if (location === "custom" && customFolderPath) {
			customStoragePath = customFolderPath;
		} else {
			customStoragePath = "";
		}

		// Create storage directory if needed
		await initOfflineStorage();

		console.log(`Storage location configured to: ${location}`);
	} catch (error) {
		console.error("Failed to configure storage location:", error);
		throw error;
	}
};

/**
 * Get the appropriate BaseDirectory enum based on storage location
 */
const getBaseDirectory = (): { baseDir?: BaseDirectory; path: string } => {
	switch (currentStorageLocation) {
		case "appdata":
			return {
				baseDir: BaseDirectory.AppData,
				path: DEFAULT_FOLDER_NAME,
			};
		case "documents":
			return {
				baseDir: BaseDirectory.Document,
				path: DEFAULT_FOLDER_NAME,
			};
		case "home":
			return {
				baseDir: BaseDirectory.Home,
				path: DEFAULT_FOLDER_NAME,
			};
		case "custom":
			// Custom paths cannot use BaseDirectory
			return { path: customStoragePath };
		default:
			// Default to documents
			return {
				baseDir: BaseDirectory.Document,
				path: DEFAULT_FOLDER_NAME,
			};
	}
};

/**
 * Get full path for a storage file (relative to base directory)
 */
const getStoragePath = (filename: string): string => {
	return `${DEFAULT_FOLDER_NAME}/${filename}`;
};

/**
 * Initialize the offline storage system
 */
export const initOfflineStorage = async (): Promise<void> => {
	try {
		// Create the directory using our Rust function
		try {
			const path = await invoke("create_directory", {
				folderName: DEFAULT_FOLDER_NAME,
				location: getStorageLocationForRust(),
				customPath: customStoragePath || null,
				recursive: true,
			});
			console.log(`Created storage directory: ${path}`);
		} catch (error) {
			// Directory might already exist or there was an error
			console.log("Directory creation result:", error);
		}

		// Initialize cache files if they don't exist
		await initializeStorageFile(ANIME_CACHE_FILENAME, {
			timestamp: Date.now(),
			data: [],
			version: CACHE_VERSION,
		});

		await initializeStorageFile(PENDING_CHANGES_FILENAME, []);

		await initializeStorageFile(NETWORK_STATUS_FILENAME, {
			online: true,
			lastChecked: Date.now(),
		});

		console.log("Offline storage initialized successfully");
	} catch (error) {
		console.error("Failed to initialize offline storage:", error);
		throw error;
	}
};

/**
 * Initialize a storage file if it doesn't exist
 */
const initializeStorageFile = async (
	filename: string,
	defaultContent: any
): Promise<void> => {
	try {
		const filePath = getStoragePath(filename);

		// Check if file exists using Rust backend
		const fileExists = await invoke("file_exists", {
			filePath,
			location: getStorageLocationForRust(),
			customPath: customStoragePath || null,
		});

		if (!fileExists) {
			// Create the file with default content using Rust backend
			await invoke("write_file", {
				filePath,
				content: JSON.stringify(defaultContent),
				location: getStorageLocationForRust(),
				customPath: customStoragePath || null,
			});
			console.log(`Initialized storage file: ${filename}`);
		}
	} catch (error) {
		console.error(`Failed to initialize storage file ${filename}:`, error);
		throw error;
	}
};

/**
 * Helper function to read a file from storage
 */
const readStorageFile = async (filename: string): Promise<string> => {
	const filePath = getStoragePath(filename);

	return await invoke("read_file", {
		filePath,
		location: getStorageLocationForRust(),
		customPath: customStoragePath || null,
	});
};

/**
 * Helper function to write a file to storage
 */
const writeStorageFile = async (
	filename: string,
	content: string
): Promise<void> => {
	const filePath = getStoragePath(filename);

	await invoke("write_file", {
		filePath,
		content,
		location: getStorageLocationForRust(),
		customPath: customStoragePath || null,
	});
};

/**
 * Helper function to check if a file exists in storage
 */
const fileExists = async (filename: string): Promise<boolean> => {
	try {
		const filePath = getStoragePath(filename);

		return await invoke("file_exists", {
			filePath,
			location: getStorageLocationForRust(),
			customPath: customStoragePath || null,
		});
	} catch (error) {
		console.error(`Error checking if file ${filename} exists:`, error);
		return false;
	}
};

/**
 * Check if we're online by attempting to ping an API
 */
export const checkOnlineStatus = async (): Promise<boolean> => {
	try {
		// Try to fetch a small resource to check connectivity
		const response = await fetch("https://api.jikan.moe/v4/status", {
			method: "HEAD",
			mode: "no-cors",
			cache: "no-store",
		});

		const online = response.status >= 200 && response.status < 300;

		// Update network status file
		await writeStorageFile(
			NETWORK_STATUS_FILENAME,
			JSON.stringify({ online, lastChecked: Date.now() })
		);

		return online;
	} catch (error) {
		console.log("Network check failed, likely offline:", error);

		// Update network status file to offline
		await writeStorageFile(
			NETWORK_STATUS_FILENAME,
			JSON.stringify({ online: false, lastChecked: Date.now() })
		);

		return false;
	}
};

/**
 * Get the current network status
 * @returns Boolean indicating whether we're online
 */
export const getNetworkStatus = async (): Promise<boolean> => {
	try {
		// Check if file exists
		const statusExists = await fileExists(NETWORK_STATUS_FILENAME);
		if (!statusExists) {
			return true; // Default to online
		}

		const statusText = await readStorageFile(NETWORK_STATUS_FILENAME);
		const status = JSON.parse(statusText);

		// If the last check was more than 5 minutes ago, check again
		if (Date.now() - status.lastChecked > 5 * 60 * 1000) {
			status.online = await checkOnlineStatus();
			status.lastChecked = Date.now();
			await writeStorageFile(NETWORK_STATUS_FILENAME, JSON.stringify(status));
		}

		return status.online;
	} catch (error) {
		console.error("Failed to get network status:", error);
		return true; // Default to online on error
	}
};

/**
 * Cache anime list data
 */
export const cacheAnimeList = async (
	animeList: UserAnimeData[]
): Promise<void> => {
	try {
		const cacheData: CachedData<UserAnimeData[]> = {
			timestamp: Date.now(),
			data: animeList,
			expiration: CACHE_EXPIRATION,
			version: CACHE_VERSION,
		};

		await writeStorageFile(ANIME_CACHE_FILENAME, JSON.stringify(cacheData));
		console.log(`Cached ${animeList.length} anime entries`);
	} catch (error) {
		console.error("Failed to cache anime list:", error);
		throw error;
	}
};

/**
 * Get cached anime list
 */
export const getCachedAnimeList = async (): Promise<UserAnimeData[] | null> => {
	try {
		const exists = await fileExists(ANIME_CACHE_FILENAME);
		if (!exists) {
			return null;
		}

		const cacheText = await readStorageFile(ANIME_CACHE_FILENAME);
		const cache: CachedData<UserAnimeData[]> = JSON.parse(cacheText);

		// Check if cache is valid
		if (cache.version !== CACHE_VERSION) {
			console.log("Cache version mismatch, invalidating cache");
			return null;
		}

		// Check if cache is expired
		if (Date.now() - cache.timestamp > CACHE_EXPIRATION) {
			console.log("Cache expired, invalidating");
			return null;
		}

		return cache.data as UserAnimeData[];
	} catch (error) {
		console.error("Failed to get cached anime list:", error);
		return null;
	}
};

/**
 * Add a pending change to be synced when online
 */
export const addPendingChange = async (
	type: "add" | "update" | "delete",
	entityType: "anime",
	data: any
): Promise<void> => {
	try {
		// Ensure file exists
		let changes: PendingChange[] = [];
		const changesExists = await fileExists(PENDING_CHANGES_FILENAME);

		if (changesExists) {
			// Read existing pending changes
			const changesText = await readStorageFile(PENDING_CHANGES_FILENAME);
			changes = JSON.parse(changesText);
		}

		// Create a unique ID for the change
		const id = `${entityType}_${
			data.anime_id || data.id || Date.now()
		}_${Date.now()}`;

		// Add the new change
		changes.push({
			id,
			type,
			entityType,
			data,
			timestamp: Date.now(),
		});

		// Save the updated changes
		await writeStorageFile(PENDING_CHANGES_FILENAME, JSON.stringify(changes));
		console.log(`Added pending ${type} change for ${entityType}`);
	} catch (error) {
		console.error("Failed to add pending change:", error);
		throw error;
	}
};

/**
 * Get all pending changes
 */
export const getPendingChanges = async (): Promise<PendingChange[]> => {
	try {
		const exists = await fileExists(PENDING_CHANGES_FILENAME);
		if (!exists) {
			return [];
		}

		const changesText = await readStorageFile(PENDING_CHANGES_FILENAME);
		return JSON.parse(changesText);
	} catch (error) {
		console.error("Failed to get pending changes:", error);
		return [];
	}
};

/**
 * Remove a pending change after it's been synced
 */
export const removePendingChange = async (id: string): Promise<void> => {
	try {
		const exists = await fileExists(PENDING_CHANGES_FILENAME);
		if (!exists) {
			console.log("No pending changes file exists");
			return;
		}

		// Read existing pending changes
		const changesText = await readStorageFile(PENDING_CHANGES_FILENAME);
		let changes: PendingChange[] = JSON.parse(changesText);

		// Filter out the change with the given ID
		changes = changes.filter((change) => change.id !== id);

		// Save the updated changes
		await writeStorageFile(PENDING_CHANGES_FILENAME, JSON.stringify(changes));
		console.log(`Removed pending change with ID ${id}`);
	} catch (error) {
		console.error("Failed to remove pending change:", error);
		throw error;
	}
};

/**
 * Get the current storage location
 */
export const getStorageLocation = (): {
	location: "documents" | "home" | "appdata" | "custom";
	path: string;
	customPath: string;
} => {
	const { path } = getBaseDirectory();

	return {
		location: currentStorageLocation,
		path,
		customPath: customStoragePath,
	};
};

/**
 * Update the network status in the storage
 * @param online Current online status
 * @returns Success status
 */
export const updateNetworkStatus = async (
	online: boolean
): Promise<boolean> => {
	try {
		await writeStorageFile(
			NETWORK_STATUS_FILENAME,
			JSON.stringify({ online, lastChecked: Date.now() })
		);
		return true;
	} catch (error) {
		console.error("Error updating network status:", error);
		return false;
	}
};

/**
 * Sync pending changes with the server
 * @returns Object with counts of successful and failed changes
 */
export const syncPendingChanges = async (): Promise<{
	success: number;
	failed: number;
}> => {
	try {
		// Get the pending changes
		const changes = await getPendingChanges();

		if (changes.length === 0) {
			return { success: 0, failed: 0 };
		}

		// Check if we're online
		const online = await isOnline();
		if (!online) {
			console.log("Cannot sync changes while offline");
			return { success: 0, failed: changes.length };
		}

		console.log(`Attempting to sync ${changes.length} pending changes`);

		let successCount = 0;
		let failedCount = 0;

		// Process each change
		for (const change of changes) {
			try {
				// Different logic based on change type
				if (change.type === "add" || change.type === "update") {
					if (change.entityType === "anime") {
						// Update or add anime to database
						await animeDatabase.saveUserAnime(change.data);
						successCount++;

						// Remove the pending change
						await removePendingChange(change.id);
					}
				} else if (change.type === "delete") {
					if (change.entityType === "anime") {
						// Delete anime from database
						await animeDatabase.deleteUserAnime(
							change.data.id || change.data.anime_id
						);
						successCount++;

						// Remove the pending change
						await removePendingChange(change.id);
					}
				}
			} catch (error) {
				console.error(`Failed to sync change:`, change, error);
				failedCount++;
			}
		}

		console.log(
			`Sync complete. Success: ${successCount}, Failed: ${failedCount}`
		);
		return { success: successCount, failed: failedCount };
	} catch (error) {
		console.error("Failed to sync pending changes:", error);
		return { success: 0, failed: -1 }; // -1 indicates an error in the sync process itself
	}
};

/**
 * Save anime changes while handling offline mode
 */
export const saveAnimeOffline = async (
	animeData: UserAnimeData
): Promise<void> => {
	try {
		// Check if we're online
		const online = await getNetworkStatus();

		if (online) {
			// If online, save directly to the database
			await animeDatabase.saveUserAnime(animeData);

			// Also update the cache
			const cachedList = await getCachedAnimeList();
			if (cachedList) {
				// Update or add the anime in the cache
				const index = cachedList.findIndex(
					(a) => a.anime_id === animeData.anime_id
				);
				if (index >= 0) {
					cachedList[index] = animeData;
				} else {
					cachedList.push(animeData);
				}

				await cacheAnimeList(cachedList);
			}
		} else {
			// If offline, add to pending changes
			await addPendingChange("update", "anime", animeData);

			// Update local cache
			const cachedList = await getCachedAnimeList();
			if (cachedList) {
				// Update or add the anime in the cache
				const index = cachedList.findIndex(
					(a) => a.anime_id === animeData.anime_id
				);
				if (index >= 0) {
					cachedList[index] = animeData;
				} else {
					cachedList.push(animeData);
				}

				await cacheAnimeList(cachedList);
			}
		}
	} catch (error) {
		console.error("Failed to save anime offline:", error);
		throw error;
	}
};

/**
 * Delete anime while handling offline mode
 */
export const deleteAnimeOffline = async (animeId: number): Promise<void> => {
	try {
		// Check if we're online
		const online = await getNetworkStatus();

		if (online) {
			// If online, delete directly from the database
			await animeDatabase.deleteUserAnime(animeId);

			// Also update the cache
			const cachedList = await getCachedAnimeList();
			if (cachedList) {
				const updatedList = cachedList.filter((a) => a.anime_id !== animeId);
				await cacheAnimeList(updatedList);
			}
		} else {
			// If offline, add to pending changes
			await addPendingChange("delete", "anime", { anime_id: animeId });

			// Update local cache
			const cachedList = await getCachedAnimeList();
			if (cachedList) {
				const updatedList = cachedList.filter((a) => a.anime_id !== animeId);
				await cacheAnimeList(updatedList);
			}
		}
	} catch (error) {
		console.error("Failed to delete anime offline:", error);
		throw error;
	}
};

/**
 * Get anime list while handling offline mode
 */
export const getAnimeListOffline = async (
	status?: UserAnimeData["status"]
): Promise<UserAnimeData[]> => {
	try {
		// Check if we're online
		const online = await getNetworkStatus();

		if (online) {
			// If online, get from the database
			const animeList = await animeDatabase.listUserAnime(status);

			// Update the cache
			await cacheAnimeList(animeList);

			return animeList;
		} else {
			// If offline, get from the cache
			const cachedList = await getCachedAnimeList();
			if (!cachedList) {
				console.warn("No cached anime list available while offline");
				return [];
			}

			// Filter by status if requested
			if (status) {
				return cachedList.filter((anime) => anime.status === status);
			}

			return cachedList;
		}
	} catch (error) {
		console.error("Failed to get anime list offline:", error);

		// Try to get from cache as fallback
		const cachedList = await getCachedAnimeList();
		if (cachedList) {
			if (status) {
				return cachedList.filter((anime) => anime.status === status);
			}
			return cachedList;
		}

		return [];
	}
};

/**
 * Initialize the offline mode when the app starts
 */
export const initOfflineMode = async (): Promise<void> => {
	try {
		// Initialize storage
		await initOfflineStorage();

		// Check online status
		const online = await checkOnlineStatus();

		// If online, sync any pending changes
		if (online) {
			await syncPendingChanges();

			// Refresh the cache with latest data
			const animeList = await animeDatabase.listUserAnime();
			await cacheAnimeList(animeList);
		}

		console.log(`Offline mode initialized, online status: ${online}`);
	} catch (error) {
		console.error("Failed to initialize offline mode:", error);
	}
};

/**
 * Synchronize a specific change with the backend
 * @param changeId - The ID of the change to sync
 */
export const syncChange = async (changeId: string): Promise<void> => {
	try {
		const changes = await getPendingChanges();
		const change = changes.find((c) => c.id === changeId);

		if (!change) {
			throw new Error(`Change with ID ${changeId} not found`);
		}

		// Different logic based on change type
		if (change.type === "add" || change.type === "update") {
			if (change.entityType === "anime") {
				// Update or add anime to database
				await animeDatabase.saveUserAnime(change.data);
				console.log(
					`Successfully synced ${change.type} for anime ${change.data.anime_id}`
				);
			}
		} else if (change.type === "delete") {
			if (change.entityType === "anime") {
				// Delete anime from database
				await animeDatabase.deleteUserAnime(
					change.data.id || change.data.anime_id
				);
				console.log(
					`Successfully synced delete for anime ${
						change.data.anime_id || change.data.id
					}`
				);
			}
		}

		// Remove the pending change after successfully syncing
		await removePendingChange(changeId);
	} catch (error) {
		console.error(`Failed to sync change ${changeId}:`, error);
		throw error;
	}
};

// Initialize with default location (documents)
configureStorageLocation("documents").catch((err) =>
	console.error("Failed to set default storage location:", err)
);

export const offlineStorage = {
	initOfflineMode,
	getNetworkStatus,
	checkOnlineStatus,
	syncPendingChanges,
	saveAnimeOffline,
	deleteAnimeOffline,
	getAnimeListOffline,
	updateNetworkStatus,
	getPendingChanges,
	addPendingChange,
	removePendingChange,
	syncChange,
	cacheAnimeList,
	getCachedAnimeList,
	configureStorageLocation,
	getStorageLocation,
};
