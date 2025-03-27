import { memo } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { AnimeCard } from "./AnimeCard";
import { Sparkles, Heart } from "lucide-react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AnimeData, AnimeGenre } from "../types/anime";

// Styled Components
const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 32px;
	margin-top: 24px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 20px;
	}
`;

const SourceSection = styled.div`
	margin-bottom: 32px;
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const SourceTitle = styled.div<{ color: string }>`
	display: flex;
	align-items: center;
	gap: 8px;
	color: ${(props) => props.color};
	font-size: 16px;
	font-weight: 500;
`;

const SourceAnimeList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
`;

const SourceAnimeItem = styled(motion.div)`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-radius: 100px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

// Recommendation Badge component
const RecommendationBadge = styled(motion.div)`
	position: absolute;
	top: 12px;
	right: 12px;
	background: rgba(0, 0, 0, 0.7);
	color: white;
	border-radius: 24px;
	padding: 6px 12px;
	font-size: 13px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 6px;
	z-index: 10;
	backdrop-filter: blur(4px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
`;

// Types
interface SourceAnime {
	anime_id: number;
	title: string;
	image_url?: string;
}

// Simplified version of the recommendation item to make it easier to work with
interface RecommendationItem {
	entry: {
		mal_id: number;
		title: string;
		images: {
			jpg: {
				image_url: string;
				small_image_url: string;
				large_image_url: string;
			};
			webp?: {
				image_url: string;
				small_image_url: string;
				large_image_url: string;
			};
		};
		genres?: AnimeGenre[];
		isAIRecommendation?: boolean;
	};
	votes: number;
	mode: string;
	matchScore?: number;
}

interface RecommendationGridProps {
	sourceAnime: SourceAnime[];
	recommendations: RecommendationItem[];
	useAIMode: boolean;
	onAnimeSelect: (id: number) => void;
}

// Create a memoized component to prevent unnecessary re-renders
export const RecommendationGrid = memo(function RecommendationGrid({
	sourceAnime,
	recommendations,
	useAIMode,
	onAnimeSelect,
}: RecommendationGridProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Helper function to convert recommendation entry to AnimeData
	const createAnimeData = (
		recommendation: RecommendationItem
	): Partial<AnimeData> => {
		return {
			mal_id: recommendation.entry.mal_id,
			title: recommendation.entry.title,
			images: {
				jpg: recommendation.entry.images.jpg,
				webp:
					recommendation.entry.images.webp || recommendation.entry.images.jpg,
			},
			genres: recommendation.entry.genres || [],
			// Add default values for required fields
			url: "",
			trailer: {
				youtube_id: null,
				url: null,
				embed_url: null,
			},
			approved: true,
			titles: [{ type: "Default", title: recommendation.entry.title }],
			title_english: null,
			title_japanese: null,
			title_synonyms: [],
			type: null,
			source: null,
			episodes: null,
			status: null,
			airing: false,
			aired: {
				from: "",
				to: null,
				prop: {
					from: { day: 1, month: 1, year: 2000 },
					to: { day: null, month: null, year: null },
				},
				string: "",
			},
			duration: null,
			rating: null,
			score: null,
			scored_by: null,
			rank: null,
			popularity: null,
			members: null,
			favorites: null,
			synopsis: null,
			background: null,
			season: null,
			year: null,
			broadcast: {
				day: null,
				time: null,
				timezone: null,
				string: null,
			},
			producers: [],
			licensors: [],
			studios: [],
			explicit_genres: [],
			themes: [],
			demographics: [],
		} as AnimeData;
	};

	return (
		<>
			{!useAIMode && sourceAnime && sourceAnime.length > 0 && (
				<SourceSection>
					<SourceTitle color={theme?.colors?.textSecondary || "#bdbdbd"}>
						<Sparkles size={16} color={theme?.colors?.primary || "#1976d2"} />
						Recommendations based on:
					</SourceTitle>
					<SourceAnimeList>
						{sourceAnime.map((anime, index) => (
							<SourceAnimeItem
								key={anime.anime_id}
								style={{
									backgroundColor: `${theme?.colors?.primary || "#1976d2"}15`,
									border: `1px solid ${theme?.colors?.primary || "#1976d2"}30`,
								}}
								initial={{ opacity: 0, x: -20 }}
								animate={{
									opacity: 1,
									x: 0,
									transition: { delay: index * 0.05, duration: 0.3 },
								}}
								whileHover={{ y: -4 }}
							>
								<Heart
									size={16}
									color={theme?.colors?.primary || "#1976d2"}
									fill={theme?.colors?.primary || "#1976d2"}
								/>
								{anime.title}
							</SourceAnimeItem>
						))}
					</SourceAnimeList>
				</SourceSection>
			)}

			<Grid>
				{recommendations.map((recommendation, index) => {
					// Create a truly unique key that won't clash between modes
					const uniqueKey = `${recommendation.mode}-${recommendation.entry.mal_id}`;

					// Convert to AnimeData format
					const animeData = createAnimeData(recommendation);

					return (
						<motion.div
							key={uniqueKey}
							style={{ position: "relative" }}
							initial={{ opacity: 0, y: 20 }}
							animate={{
								opacity: 1,
								y: 0,
								transition: {
									delay: index * 0.05,
									duration: 0.3,
								},
							}}
						>
							<RecommendationBadge>
								{useAIMode ? (
									<Sparkles size={14} color="#FFD700" />
								) : (
									<Heart size={14} color="#ff6b81" />
								)}
								{recommendation.votes}
								{useAIMode && recommendation.matchScore !== undefined && "%"}
							</RecommendationBadge>
							<AnimeCard
								anime={animeData as AnimeData}
								onClick={() => onAnimeSelect(recommendation.entry.mal_id)}
							/>
						</motion.div>
					);
				})}
			</Grid>
		</>
	);
});
