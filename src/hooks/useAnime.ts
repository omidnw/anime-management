import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jikanApi } from "../services/jikanApi";
import { animeDatabase } from "../services/animeDatabase";
import { AnimeData, UserAnimeData } from "../types/anime";
import { useError, handleAppError } from "../contexts/ErrorContext";

export type AnimeSearchFilters = {
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
};

export function useAnimeSearch(
	query: string,
	page = 1,
	enabled = true,
	filters?: AnimeSearchFilters
) {
	return useQuery({
		queryKey: ["animeSearch", query, page, filters],
		queryFn: () => jikanApi.searchAnime(query, page, 25, filters),
		enabled: enabled && query.length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useAnimeDetails(id: number, enabled = true) {
	return useQuery({
		queryKey: ["animeDetails", id],
		queryFn: () => jikanApi.getAnimeById(id),
		enabled: enabled && !!id,
		staleTime: 60 * 60 * 1000, // 1 hour
	});
}

export function useTopAnime(page = 1) {
	return useQuery({
		queryKey: ["topAnime", page],
		queryFn: () => jikanApi.getTopAnime(page),
		staleTime: 30 * 60 * 1000, // 30 minutes
	});
}

export function useSeasonalAnime(year: number, season: string, page = 1) {
	return useQuery({
		queryKey: ["seasonalAnime", year, season, page],
		queryFn: () => jikanApi.getSeasonalAnime(year, season, page),
		staleTime: 24 * 60 * 60 * 1000, // 24 hours
	});
}

export function useUserAnimeList(status?: UserAnimeData["status"]) {
	return useQuery({
		queryKey: ["userAnimeList", status],
		queryFn: () => animeDatabase.listUserAnime(status),
	});
}

export function useUserAnimeDetails(animeId: number) {
	return useQuery({
		queryKey: ["userAnime", animeId],
		queryFn: () => animeDatabase.getUserAnime(animeId),
		enabled: !!animeId,
	});
}

export function useAddAnime() {
	const queryClient = useQueryClient();
	const { setError } = useError();

	const createUserAnimeMutation = useMutation({
		mutationFn: async (animeData: Partial<UserAnimeData>) => {
			const { anime_id, status } = animeData;

			if (!anime_id) {
				throw new Error("anime_id is required");
			}

			try {
				// Try to get anime details if image_url or title is not provided
				if (!animeData.image_url || !animeData.title) {
					console.log("Fetching anime details to get image_url and title");
					try {
						const response = await fetch(
							`https://api.jikan.moe/v4/anime/${anime_id}`
						);
						const data = await response.json();
						if (data.data) {
							animeData.image_url = data.data.images.jpg.image_url;
							animeData.title = data.data.title;
							console.log(
								`Successfully fetched image_url and title for anime ${anime_id}`
							);
						}
					} catch (error) {
						console.error("Failed to fetch anime details:", error);
						// Don't fail the whole operation if we can't get the image
					}
				}

				// Preserve all provided values or use defaults
				const newUserAnimeData: UserAnimeData = {
					anime_id,
					status: status || "plan_to_watch",
					score: animeData.score !== undefined ? animeData.score : 0,
					progress: animeData.progress !== undefined ? animeData.progress : 0,
					notes: animeData.notes || "",
					favorite:
						animeData.favorite !== undefined ? animeData.favorite : true,
					image_url: animeData.image_url || "",
					title: animeData.title || "",
					start_date: animeData.start_date || new Date().toISOString(),
					end_date: animeData.end_date || "",
				};

				console.log("Saving anime data:", newUserAnimeData);
				await animeDatabase.saveUserAnime(newUserAnimeData);
				return newUserAnimeData;
			} catch (error) {
				console.error("Error adding anime to list:", error);
				setError(handleAppError(error, "ADD_ANIME_ERROR"));
				throw error;
			}
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["userAnimeList"] });
			queryClient.invalidateQueries({
				queryKey: ["userAnime", variables.anime_id],
			});
		},
		onError: (error) => {
			console.error("Mutation error in useAddAnime:", error);
			setError(handleAppError(error, "ADD_ANIME_ERROR"));
		},
	});

	return createUserAnimeMutation;
}

export function useDeleteAnime() {
	const queryClient = useQueryClient();
	const { setError } = useError();

	return useMutation({
		mutationFn: (animeId: number) => {
			try {
				return animeDatabase.deleteUserAnime(animeId);
			} catch (error) {
				console.error("Error deleting anime:", error);
				setError(handleAppError(error, "DELETE_ANIME_ERROR"));
				throw error;
			}
		},
		onSuccess: (wasDeleted, animeId) => {
			if (wasDeleted) {
				console.log(`Successfully deleted anime ID: ${animeId}`);
				queryClient.invalidateQueries({ queryKey: ["userAnimeList"] });
				queryClient.invalidateQueries({ queryKey: ["userAnime", animeId] });
			} else {
				const message = `Anime with ID ${animeId} was not found or could not be deleted`;
				console.warn(message);
				setError({
					code: "DELETE_NOT_FOUND",
					message,
					timestamp: new Date(),
				});
			}
		},
		onError: (error, animeId) => {
			console.error(`Error deleting anime ID ${animeId}:`, error);
			setError(handleAppError(error, "DELETE_ANIME_ERROR"));
		},
	});
}

export function useAnimeRecommendations(animeId: number) {
	return useQuery({
		queryKey: ["animeRecommendations", animeId],
		queryFn: () => jikanApi.getAnimeRecommendations(animeId),
		enabled: !!animeId,
		staleTime: 24 * 60 * 60 * 1000, // 24 hours - recommendations don't change often
	});
}

interface RecommendationEntry {
	entry: {
		mal_id: number;
		title: string;
		images: {
			jpg: {
				image_url: string;
			};
		};
	};
	votes: number;
}

export function usePersonalizedRecommendations() {
	const { data: userAnimeList } = useUserAnimeList();
	const { setError } = useError();

	return useQuery({
		queryKey: ["personalizedRecommendations"],
		queryFn: async () => {
			try {
				if (!userAnimeList || userAnimeList.length === 0) {
					return { data: [], sourceAnime: [] };
				}

				// Find anime with high scores (7 or above)
				const favoriteAnime: UserAnimeData[] = userAnimeList.filter(
					(anime) => anime.score >= 7
				);

				if (favoriteAnime.length === 0) {
					// If no high-rated anime, use anime marked as favorite
					const markedFavorites = userAnimeList.filter(
						(anime) => anime.favorite
					);

					if (markedFavorites.length === 0) {
						// If no favorites, use completed anime
						const completed = userAnimeList.filter(
							(anime) => anime.status === "completed"
						);

						if (completed.length === 0) {
							// If nothing else, use first 3 anime in the list
							favoriteAnime.push(...userAnimeList.slice(0, 3));
						} else {
							favoriteAnime.push(...completed.slice(0, 3));
						}
					} else {
						favoriteAnime.push(...markedFavorites.slice(0, 3));
					}
				}

				// Get recommendations for up to 3 favorite anime
				const sampleAnime = favoriteAnime.slice(0, 3);

				// Get recommendations for each anime in parallel
				const recommendationsPromises = sampleAnime.map((anime) =>
					jikanApi.getAnimeRecommendations(anime.anime_id)
				);

				const recommendationsResults = await Promise.allSettled(
					recommendationsPromises
				);

				// Process results, handle any errors
				const allRecommendations = recommendationsResults
					.filter(
						(result): result is PromiseFulfilledResult<any> =>
							result.status === "fulfilled"
					)
					.map((result) => result.value.data)
					.flat();

				// Filter out anime the user already has in their list
				const userAnimeIds = new Set(
					userAnimeList.map((anime) => anime.anime_id)
				);

				const filteredRecommendations = allRecommendations.filter(
					(rec: RecommendationEntry) => !userAnimeIds.has(rec.entry.mal_id)
				) as RecommendationEntry[];

				// Sort by votes and remove duplicates
				const recommendationsMap = new Map<number, RecommendationEntry>();

				for (const rec of filteredRecommendations) {
					const id = rec.entry.mal_id;
					if (
						!recommendationsMap.has(id) ||
						recommendationsMap.get(id)!.votes < rec.votes
					) {
						recommendationsMap.set(id, rec);
					}
				}

				const uniqueRecommendations = Array.from(recommendationsMap.values());

				// Sort by votes (descending)
				uniqueRecommendations.sort((a, b) => b.votes - a.votes);

				return {
					data: uniqueRecommendations.slice(0, 20),
					sourceAnime: sampleAnime,
				};
			} catch (error) {
				console.error("Error fetching personalized recommendations:", error);
				setError(handleAppError(error, "RECOMMENDATIONS_ERROR"));
				throw error;
			}
		},
		enabled: !!userAnimeList && userAnimeList.length > 0,
		staleTime: 12 * 60 * 60 * 1000, // 12 hours
	});
}
