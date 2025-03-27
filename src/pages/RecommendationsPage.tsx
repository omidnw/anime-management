import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import {
	usePersonalizedRecommendations,
	useUserAnimeList,
} from "../hooks/useAnime";
import { useAIRecommendations } from "../hooks/useAIRecommendations";
import { motion } from "framer-motion";
import { Stars, BrainCircuit } from "lucide-react";
import { AIRecommendationProgress } from "../components/AIRecommendationProgress";
import { AIRecommendationVisualizer } from "../components/AIRecommendationVisualizer";
import { RecommendationGrid } from "../components/RecommendationGrid";
import { RecommendationPageHeader } from "../components/RecommendationPageHeader";

interface RecommendationsPageProps {
	onAnimeSelect: (id: number) => void;
}

// Styled components
const Container = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 16px;
	position: relative;

	&:before {
		content: "";
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
				circle at 80% 10%,
				${(props) => props.theme?.colors?.primary || "#1976d2"}10 0%,
				transparent 60%
			),
			radial-gradient(
				circle at 20% 90%,
				${(props) =>
						props.theme?.colors?.secondary ||
						props.theme?.colors?.primary ||
						"#1976d2"}10
					0%,
				transparent 60%
			);
		opacity: 0.8;
		z-index: -1;
		pointer-events: none;
	}
`;

const PageWrapper = styled.div`
	margin-top: 20px;
	padding: 20px 0;
	position: relative;
	z-index: 1;
`;

// Add animated dots background
const BackgroundAnimation = styled(motion.div)`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: -2;
	overflow: hidden;
	pointer-events: none;
`;

const AnimatedDot = styled(motion.div)<{ size: number; color: string }>`
	position: absolute;
	width: ${(props) => props.size}px;
	height: ${(props) => props.size}px;
	border-radius: 50%;
	background-color: ${(props) => props.color};
	opacity: 0.4;
	filter: blur(${(props) => props.size / 2}px);
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 24px;
	gap: 12px;
	position: relative;

	&:after {
		content: "";
		position: absolute;
		bottom: -12px;
		left: 0;
		width: 60px;
		height: 3px;
		background: ${(props) => props.theme?.colors?.primary || "#1976d2"};
		border-radius: 2px;
	}
`;

const SectionTitle = styled.h2`
	margin: 0;
	font-size: 24px;
	font-weight: 700;
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 50vh;
	width: 100%;
`;

// Add loading animation
const LoadingSpinner = styled(motion.div)`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 20px;
`;

const LoadingText = styled(motion.p)`
	font-size: 18px;
	font-weight: 500;
	margin: 0;
	opacity: 0.7;
`;

export function RecommendationsPage({
	onAnimeSelect,
}: RecommendationsPageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const { data: userAnimeList } = useUserAnimeList();
	const [isCustomSelection, setIsCustomSelection] = useState(false);
	const [selectedAnimeIds, setSelectedAnimeIds] = useState<number[]>([]);
	const [customRecommendations, setCustomRecommendations] = useState<any[]>([]);
	const [isLoadingCustom, setIsLoadingCustom] = useState(false);
	const [showSelectionPanel, setShowSelectionPanel] = useState(false);
	const [useAIMode, setUseAIMode] = useState(false);
	const [previousMode, setPreviousMode] = useState<"classic" | "ai">("classic");

	const {
		data: recommendationsData,
		isLoading: isLoadingRecommendations,
		error,
		refetch: refetchRecommendations,
	} = usePersonalizedRecommendations();

	const {
		recommendations: aiRecommendations,
		isGenerating: isGeneratingAI,
		generationStage,
		generationProgress,
		generationDetail,
		generateRecommendations,
		clearRecommendations,
		resetGenerationState,
		hasRecommendations,
	} = useAIRecommendations();

	// Generate AI recommendations when AI mode is selected and we don't have any
	useEffect(() => {
		if (
			useAIMode &&
			!hasRecommendations &&
			!isGeneratingAI &&
			userAnimeList &&
			userAnimeList.length > 0 &&
			previousMode !== "ai"
		) {
			generateRecommendations();
		}
	}, [
		useAIMode,
		hasRecommendations,
		isGeneratingAI,
		userAnimeList,
		generateRecommendations,
		previousMode,
	]);

	// Toggle anime selection
	const toggleAnimeSelection = useCallback((animeId: number) => {
		setSelectedAnimeIds((prevIds) => {
			if (prevIds.includes(animeId)) {
				return prevIds.filter((id) => id !== animeId);
			} else {
				if (prevIds.length < 3) {
					return [...prevIds, animeId];
				}
				return prevIds;
			}
		});
	}, []);

	// Fetch custom recommendations based on selected anime
	const fetchCustomRecommendations = useCallback(async () => {
		if (selectedAnimeIds.length === 0) return;

		setIsLoadingCustom(true);
		setIsCustomSelection(true);

		try {
			// Get recommendations for each selected anime in parallel
			const recommendationsPromises = selectedAnimeIds.map((animeId) =>
				fetch(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`).then(
					(response) => response.json()
				)
			);

			const results = await Promise.allSettled(recommendationsPromises);

			// Process results, handle any errors
			const allRecommendations = results
				.filter(
					(result): result is PromiseFulfilledResult<any> =>
						result.status === "fulfilled"
				)
				.map((result) => result.value.data)
				.flat();

			// Filter out anime the user already has in their list and selected anime
			const userAnimeIds = new Set([
				...(userAnimeList?.map((anime) => anime.anime_id) || []),
				...selectedAnimeIds,
			]);

			const filteredRecommendations = allRecommendations.filter(
				(rec) => !userAnimeIds.has(rec.entry.mal_id)
			);

			// Remove duplicates and sort by votes
			const recommendationsMap = new Map();

			for (const rec of filteredRecommendations) {
				const id = rec.entry.mal_id;
				if (
					!recommendationsMap.has(id) ||
					recommendationsMap.get(id).votes < rec.votes
				) {
					recommendationsMap.set(id, rec);
				}
			}

			const uniqueRecommendations = Array.from(recommendationsMap.values());
			uniqueRecommendations.sort((a, b) => b.votes - a.votes);

			setCustomRecommendations(uniqueRecommendations.slice(0, 20));
		} catch (error) {
			console.error("Error fetching custom recommendations:", error);
		} finally {
			setIsLoadingCustom(false);
			setShowSelectionPanel(false);
		}
	}, [selectedAnimeIds, userAnimeList]);

	// Reset to default recommendations
	const resetToDefaultRecommendations = useCallback(() => {
		setIsCustomSelection(false);
		setSelectedAnimeIds([]);
		refetchRecommendations();
	}, [refetchRecommendations]);

	// Toggle between classic and AI recommendations
	const toggleAIMode = useCallback(() => {
		// If turning AI mode on
		if (!useAIMode) {
			setPreviousMode("classic");
			setUseAIMode(true);
			// Reset custom selection when switching to AI mode
			if (isCustomSelection) {
				setIsCustomSelection(false);
				setSelectedAnimeIds([]);
			}
		} else {
			// If turning AI mode off, reset to default recommendations
			setPreviousMode("ai");
			setUseAIMode(false);
			// Reset any custom selection that might be active
			if (isCustomSelection) {
				setIsCustomSelection(false);
				setSelectedAnimeIds([]);
			}
			// Force reload classic recommendations when switching back from AI mode
			refetchRecommendations();
		}
	}, [useAIMode, isCustomSelection, refetchRecommendations]);

	// Selected source anime from user list
	const selectedSourceAnime = useMemo(
		() =>
			userAnimeList?.filter((anime) =>
				selectedAnimeIds.includes(anime.anime_id)
			) || [],
		[userAnimeList, selectedAnimeIds]
	);

	// Determine which recommendations data to use
	const isLoading = useMemo(
		() =>
			isLoadingRecommendations ||
			isLoadingCustom ||
			(useAIMode && isGeneratingAI),
		[isLoadingRecommendations, isLoadingCustom, useAIMode, isGeneratingAI]
	);

	// Get source anime based on mode
	const sourceAnime = useMemo(
		() =>
			isCustomSelection
				? selectedSourceAnime
				: recommendationsData?.sourceAnime ?? [],
		[isCustomSelection, selectedSourceAnime, recommendationsData?.sourceAnime]
	);

	// Process recommendations based on mode (AI vs Classic)
	const processedRecommendations = useMemo(() => {
		if (useAIMode && aiRecommendations) {
			// First, deduplicate recommendations based on animeId
			const uniqueRecommendations: any[] = [];
			const seenAnimeIds = new Set<number>();

			aiRecommendations.recommendations.forEach((rec) => {
				if (!seenAnimeIds.has(rec.animeId)) {
					seenAnimeIds.add(rec.animeId);
					uniqueRecommendations.push({
						entry: {
							mal_id: rec.animeId,
							title: rec.title,
							images: {
								jpg: {
									image_url: rec.imageUrl,
									small_image_url: rec.imageUrl,
									large_image_url: rec.imageUrl,
								},
							},
							genres: rec.matchedTags || [],
							isAIRecommendation: true,
						},
						votes: Math.round(rec.matchScore),
						mode: "ai",
						matchScore: rec.matchScore,
					});
				}
			});

			return uniqueRecommendations;
		} else {
			// For classic mode
			const recData = isCustomSelection
				? customRecommendations
				: recommendationsData?.data || [];

			return recData.map((rec: any) => ({
				...rec,
				mode: "classic",
			}));
		}
	}, [
		useAIMode,
		aiRecommendations,
		isCustomSelection,
		customRecommendations,
		recommendationsData?.data,
	]);

	// Generate background animation dots
	const dots = useMemo(() => {
		const colors = [
			theme?.colors?.primary || "#1976d2",
			theme?.colors?.secondary || "#dc004e",
			theme?.colors?.primary || "#4caf50",
		];

		return Array.from({ length: 20 }, (_, i) => {
			const size = Math.random() * 70 + 30;
			return {
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size,
				duration: Math.random() * 20 + 20,
				delay: Math.random() * 10,
				color: colors[Math.floor(Math.random() * colors.length)],
			};
		});
	}, [theme?.colors?.primary, theme?.colors?.secondary]);

	return (
		<Container theme={theme || { colors: { primary: "#1976d2" } }}>
			<PageWrapper>
				<BackgroundAnimation>
					{dots.map((dot) => (
						<AnimatedDot
							key={dot.id}
							initial={{ x: `${dot.x}%`, y: `${dot.y}%`, opacity: 0.1 }}
							animate={{
								x: [`${dot.x}%`, `${(dot.x + 10) % 100}%`, `${dot.x}%`],
								y: [`${dot.y}%`, `${(dot.y + 10) % 100}%`, `${dot.y}%`],
								opacity: [0.1, 0.3, 0.1],
							}}
							transition={{
								duration: dot.duration,
								repeat: Infinity,
								delay: dot.delay,
								ease: "easeInOut",
							}}
							size={dot.size}
							color={dot.color}
						/>
					))}
				</BackgroundAnimation>

				{/* Page Header */}
				<RecommendationPageHeader
					useAIMode={useAIMode}
					toggleAIMode={toggleAIMode}
					isCustomSelection={isCustomSelection}
					selectedAnimeIds={selectedAnimeIds}
					userAnimeList={userAnimeList}
					showSelectionPanel={showSelectionPanel}
					setShowSelectionPanel={setShowSelectionPanel}
					toggleAnimeSelection={toggleAnimeSelection}
					fetchCustomRecommendations={fetchCustomRecommendations}
				/>

				{/* AI Recommendation Visualization */}
				{useAIMode && aiRecommendations && (
					<AIRecommendationVisualizer
						sources={aiRecommendations.sources}
						recommendations={aiRecommendations.recommendations}
						userProfile={aiRecommendations.userProfile}
						confidence={aiRecommendations.confidence}
						processingTime={aiRecommendations.processingTime}
						onRegenerate={generateRecommendations}
						onClear={clearRecommendations}
						isGenerating={isGeneratingAI}
					/>
				)}

				{/* Section Header */}
				<SectionHeader theme={theme || { colors: { primary: "#1976d2" } }}>
					{useAIMode ? (
						<>
							<BrainCircuit
								size={28}
								color={theme?.colors?.primary || "#1976d2"}
							/>
							<SectionTitle>AI-Powered Recommendations</SectionTitle>
						</>
					) : (
						<>
							<Stars size={28} color={theme?.colors?.primary || "#1976d2"} />
							<SectionTitle>Recommended for you</SectionTitle>
						</>
					)}
				</SectionHeader>

				{/* Loading Indicator */}
				{isLoading ? (
					<LoadingContainer>
						<LoadingSpinner>
							<motion.div
								animate={{
									opacity: [0.7, 1, 0.7],
								}}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								style={{
									background: `linear-gradient(135deg, ${
										theme?.colors?.primary || "#1976d2"
									}40, ${theme?.colors?.secondary || "#dc004e"}40)`,
									height: "4px",
									width: "120px",
									borderRadius: "2px",
									marginBottom: "20px",
								}}
							/>
							<LoadingText
								animate={{
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								{useAIMode
									? "Generating personalized recommendations..."
									: "Finding recommendations for you..."}
							</LoadingText>
							{useAIMode && isGeneratingAI && (
								<AIRecommendationProgress
									stage={generationStage}
									progress={generationProgress}
									detail={generationDetail}
								/>
							)}
						</LoadingSpinner>
					</LoadingContainer>
				) : (
					/* Recommendation Grid */
					<RecommendationGrid
						sourceAnime={sourceAnime}
						recommendations={processedRecommendations}
						useAIMode={useAIMode}
						onAnimeSelect={onAnimeSelect}
					/>
				)}
			</PageWrapper>
		</Container>
	);
}
