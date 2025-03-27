import { invoke } from "@tauri-apps/api/core";
import { UserAnimeData } from "../types/anime";

// Interface matching the Rust UserAnime struct
interface TauriUserAnime {
	id?: number;
	anime_id: number;
	status: string;
	score: number;
	progress: number;
	notes: string;
	favorite: boolean;
	start_date?: string | null;
	end_date?: string | null;
	image_url: string;
	title: string;
}

// Convert our React type to Tauri type
const convertToTauriAnime = (anime: UserAnimeData): TauriUserAnime => {
	return {
		anime_id: anime.anime_id,
		status: anime.status,
		score: anime.score,
		progress: anime.progress,
		notes: anime.notes,
		favorite: anime.favorite,
		start_date: anime.start_date,
		end_date: anime.end_date,
		image_url: anime.image_url || "",
		title: anime.title || "",
	};
};

// Convert Tauri type to our React type
const convertFromTauriAnime = (anime: TauriUserAnime): UserAnimeData => {
	return {
		anime_id: anime.anime_id,
		status: anime.status as UserAnimeData["status"],
		score: anime.score,
		progress: anime.progress,
		notes: anime.notes,
		favorite: anime.favorite,
		start_date: anime.start_date || null,
		end_date: anime.end_date || null,
		image_url: anime.image_url,
		title: anime.title,
	};
};

export const animeDatabase = {
	// Add or update an anime entry
	addUserAnime: async (anime: UserAnimeData): Promise<UserAnimeData> => {
		try {
			const tauriAnime = convertToTauriAnime(anime);
			const result = await invoke<TauriUserAnime>("add_user_anime", {
				anime: tauriAnime,
			});
			return convertFromTauriAnime(result);
		} catch (error) {
			console.error("Failed to add anime:", error);
			throw error;
		}
	},

	// Get anime by id
	getUserAnime: async (animeId: number): Promise<UserAnimeData | null> => {
		try {
			console.log(`Invoking get_user_anime with anime_id: ${animeId}`);
			const result = await invoke<TauriUserAnime | null>("get_user_anime", {
				animeId: animeId,
			});
			return result ? convertFromTauriAnime(result) : null;
		} catch (error) {
			console.error("Failed to get anime:", error);
			throw error;
		}
	},

	// List all anime or filter by status
	listUserAnime: async (
		status?: UserAnimeData["status"]
	): Promise<UserAnimeData[]> => {
		try {
			console.log(`Invoking list_user_anime with status: ${status || "all"}`);

			// Ensure we're passing a valid status string to the backend
			let params: { status?: string } = {};
			if (status) {
				params.status = status;
				console.log(`Adding status filter: ${status} to query params`);
			} else {
				console.log("No status filter applied, fetching all anime");
			}

			const result = await invoke<TauriUserAnime[]>("list_user_anime", params);

			console.log(
				`Retrieved ${result.length} anime entries with status ${
					status || "all"
				}`
			);
			if (result.length > 0) {
				console.log("Sample anime:", result[0]);
			}

			return result.map(convertFromTauriAnime);
		} catch (error) {
			console.error(`Failed to list anime with status ${status}:`, error);
			throw error;
		}
	},

	// Delete an anime entry
	deleteUserAnime: async (animeId: number): Promise<boolean> => {
		try {
			console.log(`Invoking delete_user_anime with anime_id: ${animeId}`);
			const wasDeleted = await invoke<boolean>("delete_user_anime", {
				animeId: animeId,
			});

			if (wasDeleted) {
				console.log(`Successfully deleted anime with ID: ${animeId}`);
			} else {
				console.warn(
					`Anime with ID: ${animeId} was not found or could not be deleted`
				);
			}

			return wasDeleted;
		} catch (error) {
			console.error("Failed to delete anime:", error);
			throw error;
		}
	},

	// Add or update an anime entry
	saveUserAnime: async (animeData: UserAnimeData): Promise<void> => {
		try {
			const anime = convertToTauriAnime(animeData);

			// Ensure image_url and title are provided
			if (!anime.image_url && animeData.anime_id) {
				// If image_url is not provided but we have an anime_id, try to fetch the anime details
				console.log(
					`Fetching anime details for ID: ${animeData.anime_id} to get image_url and title`
				);
				try {
					const response = await fetch(
						`https://api.jikan.moe/v4/anime/${animeData.anime_id}`
					);
					const data = await response.json();
					if (data.data) {
						anime.image_url = data.data.images.jpg.image_url;
						anime.title = data.data.title;
						console.log(
							`Successfully fetched image_url: ${anime.image_url} and title: ${anime.title}`
						);
					}
				} catch (error) {
					console.error("Failed to fetch anime details:", error);
				}
			}

			// Log the anime data being saved
			console.log("Saving anime to database:", anime);

			// Call Tauri command to add anime to database
			await invoke("add_user_anime", { anime });
			console.log("Successfully saved anime to database");
		} catch (error) {
			console.error("Failed to save anime:", error);
		}
	},
};
