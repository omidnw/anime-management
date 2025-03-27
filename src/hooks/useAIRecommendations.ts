import { useState, useCallback } from "react";
import { useUserAnimeList } from "./useAnime";
import {
	generateAIRecommendations,
	getCachedAIRecommendations,
	clearCachedAIRecommendations,
	AIRecommendationResult,
} from "../services/aiRecommendationService";

/**
 * Custom hook for managing AI recommendations
 */
export function useAIRecommendations() {
	const { data: userAnimeList } = useUserAnimeList();
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationStage, setGenerationStage] = useState("");
	const [generationProgress, setGenerationProgress] = useState(0);
	const [generationDetail, setGenerationDetail] = useState<string | undefined>(
		undefined
	);
	const [recommendations, setRecommendations] =
		useState<AIRecommendationResult | null>(getCachedAIRecommendations());

	/**
	 * Generate new AI recommendations
	 */
	const generateRecommendations = useCallback(async () => {
		if (!userAnimeList || userAnimeList.length === 0 || isGenerating) {
			return null;
		}

		setIsGenerating(true);
		setGenerationProgress(0);
		setGenerationStage("Initializing AI engine");

		try {
			const result = await generateAIRecommendations(
				userAnimeList,
				(stage, progress, detail) => {
					setGenerationStage(stage);
					setGenerationProgress(progress);
					setGenerationDetail(detail);
				}
			);

			setRecommendations(result);
			return result;
		} catch (error) {
			console.error("Error generating AI recommendations:", error);
			return null;
		} finally {
			setIsGenerating(false);
			setGenerationDetail(undefined);
		}
	}, [userAnimeList, isGenerating]);

	/**
	 * Clear cached recommendations and state
	 */
	const clearRecommendations = useCallback(() => {
		clearCachedAIRecommendations();
		setRecommendations(null);
	}, []);

	/**
	 * Reset generation state (for cleanup)
	 */
	const resetGenerationState = useCallback(() => {
		setIsGenerating(false);
		setGenerationProgress(0);
		setGenerationStage("");
		setGenerationDetail(undefined);
	}, []);

	return {
		recommendations,
		isGenerating,
		generationStage,
		generationProgress,
		generationDetail,
		generateRecommendations,
		clearRecommendations,
		resetGenerationState,
		hasRecommendations: recommendations !== null,
	};
}
