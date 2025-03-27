import { UserAnimeData } from "../types/anime";
import { jikanApi } from "./jikanApi";

// Type definitions for AI recommendation
export interface TagWeight {
	tag: string;
	weight: number;
}

export interface AnimeFeatures {
	tags: string[];
	genres: string[];
	themes: string[];
	demographics: string[];
	studios: string[];
	year?: number;
	score?: number;
	type?: string;
}

export interface RecommendationSource {
	animeId: number;
	title: string;
	imageUrl: string;
	score: number;
	favorite: boolean;
	contribution: number; // How much this source contributed to recommendations
	matchingTags?: string[];
}

export interface AIRecommendationResult {
	recommendations: AIRecommendation[];
	userProfile: {
		topGenres: TagWeight[];
		topThemes: TagWeight[];
		topStudios: TagWeight[];
		preferredYears: TagWeight[];
		preferredTypes: TagWeight[];
	};
	sources: RecommendationSource[];
	processingTime: number;
	confidence: number; // 0-1 score of how confident the AI is in these recommendations
}

export interface AIRecommendation {
	animeId: number;
	title: string;
	imageUrl: string;
	matchScore: number; // 0-100 score of how well this matches user's tastes
	matchedTags: string[]; // List of tags that matched user's preferences
	features: AnimeFeatures;
}

// Local storage keys
const AI_USER_PROFILE_KEY = "ai_user_profile";
const AI_RECOMMENDATIONS_KEY = "ai_recommendations";

// Extract features from anime based on its data
async function extractFeatures(animeId: number): Promise<AnimeFeatures | null> {
	try {
		const animeDetails = await jikanApi.getAnimeById(animeId);
		if (!animeDetails) return null;

		const data = animeDetails.data;

		const features: AnimeFeatures = {
			tags: [],
			genres: data.genres.map((g: any) => g.name),
			themes: data.themes.map((t: any) => t.name),
			demographics: data.demographics.map((d: any) => d.name),
			studios: data.studios.map((s: any) => s.name),
			year: data.aired.prop.from.year,
			score: data.score || 0,
			type: data.type || "",
		};

		// Add special tags based on anime characteristics
		if (data.episodes === 1) features.tags.push("SingleEpisode");
		if (data.episodes && data.episodes > 50) features.tags.push("LongRunning");
		if (data.score && data.score > 8) features.tags.push("HighlyRated");
		if (data.favorites && data.favorites > 100000)
			features.tags.push("Popular");
		if (data.rating === "r" || data.rating === "rx")
			features.tags.push("Mature");

		return features;
	} catch (error) {
		console.error(`Failed to extract features for anime ${animeId}:`, error);
		return null;
	}
}

// Get the current user preference profile
export function getUserProfile(): any {
	try {
		const savedProfile = localStorage.getItem(AI_USER_PROFILE_KEY);
		if (savedProfile) {
			return JSON.parse(savedProfile);
		}
	} catch (error) {
		console.error("Failed to load AI user profile:", error);
	}
	return null;
}

// Save the current user preference profile
function saveUserProfile(profile: any): void {
	try {
		localStorage.setItem(AI_USER_PROFILE_KEY, JSON.stringify(profile));
	} catch (error) {
		console.error("Failed to save AI user profile:", error);
	}
}

// Save AI recommendations
export function saveAIRecommendations(
	recommendations: AIRecommendationResult
): void {
	try {
		localStorage.setItem(
			AI_RECOMMENDATIONS_KEY,
			JSON.stringify(recommendations)
		);
	} catch (error) {
		console.error("Failed to save AI recommendations:", error);
	}
}

// Get the cached AI recommendations
export function getCachedAIRecommendations(): AIRecommendationResult | null {
	try {
		const savedRecommendations = localStorage.getItem(AI_RECOMMENDATIONS_KEY);
		if (savedRecommendations) {
			return JSON.parse(savedRecommendations);
		}
	} catch (error) {
		console.error("Failed to load AI recommendations:", error);
	}
	return null;
}

// Clear cached AI recommendations
export function clearCachedAIRecommendations(): void {
	localStorage.removeItem(AI_RECOMMENDATIONS_KEY);
}

// Simulates an AI analysis process with visual progress updates
export async function generateAIRecommendations(
	userAnimeList: UserAnimeData[],
	progressCallback: (stage: string, progress: number, detail?: string) => void
): Promise<AIRecommendationResult> {
	const startTime = Date.now();
	// let progress = 0;

	// Simulate initialization
	progressCallback("Initializing AI engine", 5);
	await simulateDelay(500);

	// Step 1: Find relevant user anime (completed or high-rated)
	progressCallback("Analyzing your anime preferences", 10);
	const relevantAnime = userAnimeList.filter(
		(anime) =>
			anime.score >= 7 || anime.status === "completed" || anime.favorite
	);
	await simulateDelay(800);

	// Step 2: Extract features from relevant anime
	progressCallback("Extracting features from your anime", 20);
	const featurePromises = relevantAnime
		.slice(0, 10)
		.map(async (anime, index) => {
			// Update progress for each anime processed
			const baseProgress = 20;
			const progressIncrement = 30 / Math.min(relevantAnime.length, 10);

			progressCallback(
				"Extracting anime features",
				baseProgress + index * progressIncrement,
				anime.title
			);

			await simulateDelay(300);
			return {
				anime,
				features: await extractFeatures(anime.anime_id),
			};
		});

	const animeWithFeatures = (await Promise.all(featurePromises)).filter(
		(item) => item.features !== null
	);

	// Step 3: Build user preference profile
	progressCallback("Building your taste profile", 55);
	await simulateDelay(1000);

	const userProfile = buildUserProfile(
		animeWithFeatures.map((item) => ({
			anime: item.anime,
			features: item.features!,
		}))
	);

	saveUserProfile(userProfile);

	// Step 4: Search for matching anime
	progressCallback("Searching for perfect matches", 65);
	await simulateDelay(1200);

	// Step 5: Score and rank candidates
	progressCallback("Ranking candidate recommendations", 80);
	await simulateDelay(1000);

	// Step 6: Finalize recommendations
	progressCallback("Finalizing your personalized recommendations", 90);
	await simulateDelay(800);

	// Prepare source information
	const sources: RecommendationSource[] = animeWithFeatures.map((item) => ({
		animeId: item.anime.anime_id,
		title: item.anime.title,
		imageUrl: item.anime.image_url,
		score: item.anime.score,
		favorite: item.anime.favorite,
		contribution: calculateSourceContribution(item.anime),
		matchingTags: getTopTags(item.features!),
	}));

	// Generate mock recommendations
	const aiRecommendations = await findMatchingAnime(userProfile, userAnimeList);

	// Finalize and return result
	progressCallback("Complete!", 100);

	const result: AIRecommendationResult = {
		recommendations: aiRecommendations,
		userProfile: {
			topGenres: userProfile.genres.slice(0, 5),
			topThemes: userProfile.themes.slice(0, 5),
			topStudios: userProfile.studios.slice(0, 3),
			preferredYears: userProfile.years.slice(0, 3),
			preferredTypes: userProfile.types.slice(0, 3),
		},
		sources: sources,
		processingTime: Date.now() - startTime,
		confidence: calculateConfidence(userAnimeList, aiRecommendations.length),
	};

	saveAIRecommendations(result);
	return result;
}

// Builds a user profile from the anime they've watched
function buildUserProfile(
	animeWithFeatures: { anime: UserAnimeData; features: AnimeFeatures }[]
) {
	const genreWeights: Record<string, number> = {};
	const themeWeights: Record<string, number> = {};
	const studioWeights: Record<string, number> = {};
	const yearWeights: Record<string, number> = {};
	const typeWeights: Record<string, number> = {};

	animeWithFeatures.forEach(({ anime, features }) => {
		// Calculate a weight based on score and favorite status
		const weight = calculateWeight(anime);

		// Update genre weights
		features.genres.forEach((genre) => {
			genreWeights[genre] = (genreWeights[genre] || 0) + weight;
		});

		// Update theme weights
		features.themes.forEach((theme) => {
			themeWeights[theme] = (themeWeights[theme] || 0) + weight;
		});

		// Update studio weights
		features.studios.forEach((studio) => {
			studioWeights[studio] = (studioWeights[studio] || 0) + weight;
		});

		// Update year weights
		if (features.year) {
			const yearKey = features.year.toString();
			yearWeights[yearKey] = (yearWeights[yearKey] || 0) + weight;
		}

		// Update type weights
		if (features.type) {
			typeWeights[features.type] = (typeWeights[features.type] || 0) + weight;
		}
	});

	return {
		genres: sortWeights(genreWeights),
		themes: sortWeights(themeWeights),
		studios: sortWeights(studioWeights),
		years: sortWeights(yearWeights),
		types: sortWeights(typeWeights),
	};
}

// Calculate weight based on anime score and favorite status
function calculateWeight(anime: UserAnimeData): number {
	let weight = 1.0;

	// Adjust based on score (0-10)
	if (anime.score > 0) {
		weight *= anime.score / 5; // Score of 10 = weight of 2.0
	}

	// Favorite status gives a bonus
	if (anime.favorite) {
		weight *= 1.5;
	}

	// Status adjustments
	switch (anime.status) {
		case "completed":
			weight *= 1.2;
			break;
		case "watching":
			weight *= 1.0;
			break;
		case "on_hold":
			weight *= 0.7;
			break;
		case "dropped":
			weight *= 0.4;
			break;
		case "plan_to_watch":
			weight *= 0.5;
			break;
	}

	return weight;
}

// Sort the weights from highest to lowest and convert to TagWeight array
function sortWeights(weightMap: Record<string, number>): TagWeight[] {
	return Object.entries(weightMap)
		.map(([tag, weight]) => ({ tag, weight }))
		.sort((a, b) => b.weight - a.weight);
}

// Find matching anime based on user profile
async function findMatchingAnime(
	userProfile: any,
	userAnimeList: UserAnimeData[]
): Promise<AIRecommendation[]> {
	// For demo, get the top genres and perform search
	const userTopGenres = userProfile.genres
		.slice(0, 3)
		.map((g: TagWeight) => g.tag);
	const userAnimeIds = new Set(userAnimeList.map((anime) => anime.anime_id));

	try {
		// Build search filters
		const genreIds = await getGenreIds(userTopGenres);

		// Make API request to fetch matching anime
		const searchResults = await jikanApi.searchAnime("", 1, 25, {
			genres: genreIds,
			min_score: 7.0,
			order_by: "score",
			sort: "desc",
		});

		// Process results
		return searchResults.data
			.filter((anime: any) => !userAnimeIds.has(anime.mal_id))
			.slice(0, 20)
			.map((anime: any) => ({
				animeId: anime.mal_id,
				title: anime.title,
				imageUrl: anime.images.jpg.image_url,
				matchScore: calculateMatchScore(anime, userProfile),
				matchedTags: findMatchingTags(anime, userProfile),
				features: {
					tags: [],
					genres: anime.genres.map((g: any) => g.name),
					themes: anime.themes?.map((t: any) => t.name) || [],
					demographics: anime.demographics?.map((d: any) => d.name) || [],
					studios: anime.studios?.map((s: any) => s.name) || [],
					year: anime.aired?.prop?.from?.year,
					score: anime.score,
					type: anime.type,
				},
			}));
	} catch (error) {
		console.error("Error finding matching anime:", error);
		return [];
	}
}

// Get genre IDs for the provided genre names
async function getGenreIds(genreNames: string[]): Promise<number[]> {
	try {
		const response = await fetch("https://api.jikan.moe/v4/genres/anime");
		const data = await response.json();

		const genreMap = new Map<string, number>();
		data.data.forEach((genre: any) => {
			genreMap.set(genre.name.toLowerCase(), genre.mal_id);
		});

		return genreNames
			.map((name) => genreMap.get(name.toLowerCase()))
			.filter((id): id is number => id !== undefined);
	} catch (error) {
		console.error("Error fetching genre IDs:", error);
		return [];
	}
}

// Calculate how well an anime matches the user profile
function calculateMatchScore(anime: any, userProfile: any): number {
	let score = 70; // Base score

	// Adjust based on genre matches
	const userGenres = new Set(
		userProfile.genres.map((g: TagWeight) => g.tag.toLowerCase())
	);
	anime.genres.forEach((genre: any) => {
		if (userGenres.has(genre.name.toLowerCase())) {
			score += 5;
		}
	});

	// Adjust based on theme matches
	const userThemes = new Set(
		userProfile.themes.map((t: TagWeight) => t.tag.toLowerCase())
	);
	(anime.themes || []).forEach((theme: any) => {
		if (userThemes.has(theme.name.toLowerCase())) {
			score += 7;
		}
	});

	// Adjust based on studio matches
	const userStudios = new Set(
		userProfile.studios.map((s: TagWeight) => s.tag.toLowerCase())
	);
	(anime.studios || []).forEach((studio: any) => {
		if (userStudios.has(studio.name.toLowerCase())) {
			score += 8;
		}
	});

	// Cap the score at 98 (save 99-100 for perfect matches)
	return Math.min(98, Math.max(50, score));
}

// Find the top matching tags between an anime and user profile
function findMatchingTags(anime: any, userProfile: any): string[] {
	const matchingTags: string[] = [];

	// Check genres
	const userGenres = new Set(
		userProfile.genres.map((g: TagWeight) => g.tag.toLowerCase())
	);
	anime.genres.forEach((genre: any) => {
		if (userGenres.has(genre.name.toLowerCase())) {
			matchingTags.push(genre.name);
		}
	});

	// Check themes
	const userThemes = new Set(
		userProfile.themes.map((t: TagWeight) => t.tag.toLowerCase())
	);
	(anime.themes || []).forEach((theme: any) => {
		if (userThemes.has(theme.name.toLowerCase())) {
			matchingTags.push(theme.name);
		}
	});

	// Check studios
	const userStudios = new Set(
		userProfile.studios.map((s: TagWeight) => s.tag.toLowerCase())
	);
	(anime.studios || []).forEach((studio: any) => {
		if (userStudios.has(studio.name.toLowerCase())) {
			matchingTags.push(studio.name);
		}
	});

	// Return top tags (limit to 5)
	return matchingTags.slice(0, 5);
}

// Calculate contribution of a source anime to the recommendations
function calculateSourceContribution(anime: UserAnimeData): number {
	let contribution = 20; // Base contribution

	// Adjust based on score
	if (anime.score > 0) {
		contribution += anime.score * 5; // 0-50 points based on score
	}

	// Adjust based on favorite status
	if (anime.favorite) {
		contribution += 30;
	}

	return Math.min(100, contribution);
}

// Get top tags from anime features
function getTopTags(features: AnimeFeatures): string[] {
	const allTags = [
		...features.tags,
		...features.genres,
		...features.themes,
		...features.studios,
	];

	// Return up to 5 tags
	return [...new Set(allTags)].slice(0, 5);
}

// Calculate confidence level in recommendations
function calculateConfidence(
	userAnimeList: UserAnimeData[],
	recommendationsCount: number
): number {
	// More anime in user list = higher confidence
	const listSizeConfidence = Math.min(0.5, userAnimeList.length / 50);

	// More recommendations = higher confidence
	const recommendationsConfidence = Math.min(0.5, recommendationsCount / 20);

	return listSizeConfidence + recommendationsConfidence;
}

// Helper function to simulate delay for visual progress effect
function simulateDelay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
