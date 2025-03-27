import { UserAnimeData } from "../types/anime";
import { animeDatabase } from "./animeDatabase";
import {
	addPendingChange,
	cacheAnimeList,
	getCachedAnimeList,
	getNetworkStatus,
} from "./offlineStorage";

/**
 * API service that handles both online and offline operations
 * It will use the local database when offline and add pending changes
 * for synchronization when back online
 */
export const API = {
	/**
	 * Get user's anime list, with offline support
	 * @param status Optional status filter
	 * @returns List of user anime
	 */
	getUserAnimeList: async (
		status?: UserAnimeData["status"]
	): Promise<UserAnimeData[]> => {
		try {
			// Check if we're online
			const { online } = await getNetworkStatus();

			if (online) {
				// Online mode: get from database
				const animeList = await animeDatabase.listUserAnime(status);

				// Cache the result for offline use
				if (!status) {
					// Only cache the full list
					await cacheAnimeList(animeList);
				}

				return animeList;
			} else {
				// Offline mode: get from cache
				console.log("Getting anime list from cache (offline mode)");
				const cachedList = await getCachedAnimeList();

				if (!cachedList) {
					console.warn("No cached anime list available");
					return [];
				}

				// Apply status filter if needed
				if (status) {
					return cachedList.filter((anime) => anime.status === status);
				}

				return cachedList;
			}
		} catch (error) {
			console.error("Error getting user anime list:", error);

			// Try to get from cache as fallback
			const cachedList = await getCachedAnimeList();

			if (cachedList) {
				if (status) {
					return cachedList.filter((anime) => anime.status === status);
				}
				return cachedList;
			}

			throw error;
		}
	},

	/**
	 * Get a specific anime by ID, with offline support
	 * @param animeId Anime ID to retrieve
	 * @returns User anime data or null if not found
	 */
	getUserAnime: async (animeId: number): Promise<UserAnimeData | null> => {
		try {
			// Check if we're online
			const { online } = await getNetworkStatus();

			if (online) {
				// Online mode: get from database
				return animeDatabase.getUserAnime(animeId);
			} else {
				// Offline mode: get from cache
				console.log(`Getting anime ${animeId} from cache (offline mode)`);
				const cachedList = await getCachedAnimeList();

				if (!cachedList) {
					console.warn("No cached anime list available");
					return null;
				}

				return cachedList.find((anime) => anime.anime_id === animeId) || null;
			}
		} catch (error) {
			console.error(`Error getting anime ${animeId}:`, error);

			// Try to get from cache as fallback
			const cachedList = await getCachedAnimeList();

			if (cachedList) {
				return cachedList.find((anime) => anime.anime_id === animeId) || null;
			}

			throw error;
		}
	},

	/**
	 * Save or update anime data, with offline support
	 * @param animeData Anime data to save
	 * @returns The saved anime data
	 */
	saveUserAnime: async (animeData: UserAnimeData): Promise<UserAnimeData> => {
		try {
			// Check if we're online
			const { online } = await getNetworkStatus();

			if (online) {
				// Online mode: save to database
				const savedAnime = await animeDatabase.addUserAnime(animeData);

				// Update the cache
				const cachedList = await getCachedAnimeList();
				if (cachedList) {
					// Replace or add the anime in the cached list
					const updatedList = cachedList.filter(
						(anime) => anime.anime_id !== animeData.anime_id
					);
					updatedList.push(savedAnime);
					await cacheAnimeList(updatedList);
				}

				return savedAnime;
			} else {
				// Offline mode: add to pending changes
				console.log(
					`Adding or updating anime ${animeData.anime_id} to pending changes (offline mode)`
				);

				// Add to pending changes
				await addPendingChange(
					animeData.anime_id ? "update" : "add",
					"anime",
					animeData
				);

				// Update the cache
				const cachedList = (await getCachedAnimeList()) || [];
				const updatedList = cachedList.filter(
					(anime) => anime.anime_id !== animeData.anime_id
				);
				updatedList.push(animeData);
				await cacheAnimeList(updatedList);

				return animeData;
			}
		} catch (error) {
			console.error(`Error saving anime ${animeData.anime_id}:`, error);

			// Try to add to pending changes as fallback
			await addPendingChange(
				animeData.anime_id ? "update" : "add",
				"anime",
				animeData
			);

			// And update the cache
			try {
				const cachedList = (await getCachedAnimeList()) || [];
				const updatedList = cachedList.filter(
					(anime) => anime.anime_id !== animeData.anime_id
				);
				updatedList.push(animeData);
				await cacheAnimeList(updatedList);
			} catch (cacheError) {
				console.error("Failed to update cache:", cacheError);
			}

			throw error;
		}
	},

	/**
	 * Delete anime data, with offline support
	 * @param animeId Anime ID to delete
	 * @returns True if successful
	 */
	deleteUserAnime: async (animeId: number): Promise<boolean> => {
		try {
			// Check if we're online
			const { online } = await getNetworkStatus();

			if (online) {
				// Online mode: delete from database
				const success = await animeDatabase.deleteUserAnime(animeId);

				// Update the cache
				const cachedList = await getCachedAnimeList();
				if (cachedList) {
					const updatedList = cachedList.filter(
						(anime) => anime.anime_id !== animeId
					);
					await cacheAnimeList(updatedList);
				}

				return success;
			} else {
				// Offline mode: add to pending changes
				console.log(
					`Adding delete for anime ${animeId} to pending changes (offline mode)`
				);

				// Add to pending changes
				await addPendingChange("delete", "anime", { anime_id: animeId });

				// Update the cache
				const cachedList = await getCachedAnimeList();
				if (cachedList) {
					const updatedList = cachedList.filter(
						(anime) => anime.anime_id !== animeId
					);
					await cacheAnimeList(updatedList);
				}

				return true;
			}
		} catch (error) {
			console.error(`Error deleting anime ${animeId}:`, error);

			// Try to add to pending changes as fallback
			await addPendingChange("delete", "anime", { anime_id: animeId });

			// And update the cache
			try {
				const cachedList = await getCachedAnimeList();
				if (cachedList) {
					const updatedList = cachedList.filter(
						(anime) => anime.anime_id !== animeId
					);
					await cacheAnimeList(updatedList);
				}
			} catch (cacheError) {
				console.error("Failed to update cache:", cacheError);
			}

			throw error;
		}
	},
};
