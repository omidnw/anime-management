import axios from "axios";
import { AnimeData, JikanResponse } from "../types/anime";

const BASE_URL = "https://api.jikan.moe/v4";
const RATE_LIMIT_DELAY = 1000; // 1 second between requests to avoid rate limiting

// Basic rate limiting helper
const rateLimitQueue: (() => Promise<any>)[] = [];
let isProcessing = false;

async function processQueue() {
	if (isProcessing || rateLimitQueue.length === 0) return;

	isProcessing = true;
	const task = rateLimitQueue.shift();

	if (task) {
		try {
			await task();
		} catch (error) {
			console.error("API request error:", error);
		}

		setTimeout(() => {
			isProcessing = false;
			processQueue();
		}, RATE_LIMIT_DELAY);
	} else {
		isProcessing = false;
	}
}

function executeWithRateLimit<T>(request: () => Promise<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		rateLimitQueue.push(async () => {
			try {
				const result = await request();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});

		processQueue();
	});
}

// API endpoints
export const jikanApi = {
	// Search anime by keyword
	searchAnime: (
		query: string,
		page = 1,
		limit = 25,
		filters?: {
			type?: "tv" | "movie" | "ova" | "special" | "ona" | "music";
			status?: "airing" | "complete" | "upcoming";
			rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx";
			genres?: number[];
			min_score?: number;
			max_score?: number;
			order_by?:
				| "title"
				| "start_date"
				| "end_date"
				| "score"
				| "rank"
				| "popularity"
				| "members"
				| "favorites";
			sort?: "desc" | "asc";
		}
	) => {
		return executeWithRateLimit<JikanResponse<AnimeData[]>>(() =>
			axios
				.get(`${BASE_URL}/anime`, {
					params: {
						q: query,
						page,
						limit,
						...filters,
						genres: filters?.genres?.join(","),
					},
				})
				.then((response) => response.data)
		);
	},

	// Get anime by ID
	getAnimeById: (id: number) => {
		return executeWithRateLimit<JikanResponse<AnimeData>>(() =>
			axios.get(`${BASE_URL}/anime/${id}`).then((response) => response.data)
		);
	},

	// Get top anime
	getTopAnime: (page = 1, limit = 25, filter?: string) => {
		return executeWithRateLimit<JikanResponse<AnimeData[]>>(() =>
			axios
				.get(`${BASE_URL}/top/anime`, {
					params: { page, limit, filter },
				})
				.then((response) => response.data)
		);
	},

	// Get seasonal anime
	getSeasonalAnime: (year: number, season: string, page = 1, limit = 25) => {
		return executeWithRateLimit<JikanResponse<AnimeData[]>>(() =>
			axios
				.get(`${BASE_URL}/seasons/${year}/${season}`, {
					params: { page, limit },
				})
				.then((response) => response.data)
		);
	},

	// Get anime recommendations
	getAnimeRecommendations: (id: number) => {
		return executeWithRateLimit<JikanResponse<any>>(() =>
			axios
				.get(`${BASE_URL}/anime/${id}/recommendations`)
				.then((response) => response.data)
		);
	},
};
