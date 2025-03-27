import React from "react";
import styled from "@emotion/styled";
import { useTopAnime } from "../hooks/useAnime";
import { AnimeData } from "../types/anime";
import { AppTheme } from "../themes/themeTypes";
import { TrendingUp, ChevronRight, Eye } from "lucide-react";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";

interface TrendingAnimeSectionProps {
	onAnimeSelect: (animeId: number) => void;
	theme: AppTheme;
	limit?: number;
	showViewAll?: boolean;
	onViewAllClick?: () => void;
}

export const TrendingAnimeSection: React.FC<TrendingAnimeSectionProps> = ({
	onAnimeSelect,
	theme,
	limit = 8,
	showViewAll = true,
	onViewAllClick,
}) => {
	const { data, isLoading, error } = useTopAnime();

	if (isLoading) {
		return (
			<SectionContainer>
				<SectionHeader>
					<SectionTitle theme={theme}>
						<TrendingUp size={22} />
						<span>Trending Anime</span>
					</SectionTitle>
				</SectionHeader>

				<LoadingGrid>
					{[...Array(limit)].map((_, index) => (
						<LoadingCard key={index} theme={theme} />
					))}
				</LoadingGrid>
			</SectionContainer>
		);
	}

	if (error || !data) {
		return (
			<SectionContainer>
				<SectionHeader>
					<SectionTitle theme={theme}>
						<TrendingUp size={22} />
						<span>Trending Anime</span>
					</SectionTitle>
				</SectionHeader>
				<ErrorMessage theme={theme}>
					Unable to load trending anime at this time.
				</ErrorMessage>
			</SectionContainer>
		);
	}

	// Limit the number of anime shown
	const trendingAnime = data.data.slice(0, limit);

	return (
		<SectionContainer>
			<SectionHeader>
				<SectionTitle theme={theme}>
					<TrendingUp size={22} />
					<span>Trending Anime</span>
				</SectionTitle>
				{showViewAll && onViewAllClick && (
					<ViewAllButton
						variant="outline"
						size="small"
						onClick={onViewAllClick}
					>
						View All <ChevronRight size={16} />
					</ViewAllButton>
				)}
			</SectionHeader>

			<AnimeGrid>
				{trendingAnime.map((anime, index) => (
					<motion.div
						key={anime.mal_id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05, duration: 0.3 }}
					>
						<AnimeCard
							anime={anime}
							onClick={() => onAnimeSelect(anime.mal_id)}
							theme={theme}
						/>
					</motion.div>
				))}
			</AnimeGrid>
		</SectionContainer>
	);
};

interface AnimeCardProps {
	anime: AnimeData;
	onClick: () => void;
	theme: AppTheme;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, theme }) => {
	return (
		<CardContainer onClick={onClick} theme={theme}>
			<CardImage src={anime.images.jpg.image_url} alt={anime.title} />
			<RankBadge theme={theme}>#{anime.rank || "N/A"}</RankBadge>

			<CardOverlay>
				<CardTitle>{anime.title}</CardTitle>
				<CardStats>
					{anime.score && <ScoreBadge theme={theme}>{anime.score}</ScoreBadge>}
					{anime.members && (
						<MembersBadge theme={theme}>
							<Eye size={12} /> {formatNumber(anime.members)}
						</MembersBadge>
					)}
				</CardStats>
			</CardOverlay>
		</CardContainer>
	);
};

// Helper function to format large numbers with K, M suffix
const formatNumber = (num: number): string => {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
};

const SectionContainer = styled.section`
	margin-bottom: 40px;
`;

const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`;

const SectionTitle = styled.h2<{ theme: AppTheme }>`
	font-size: 22px;
	font-weight: 600;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	color: ${(props) => props.theme.colors.text};

	svg {
		color: ${(props) => props.theme.colors.primary};
	}
`;

const ViewAllButton = styled(Button)`
	display: flex;
	align-items: center;
	gap: 4px;
	font-weight: 500;
`;

const AnimeGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 20px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 15px;
	}
`;

const LoadingGrid = styled(AnimeGrid)``;

const LoadingCard = styled.div<{ theme: AppTheme }>`
	height: 270px;
	border-radius: 8px;
	background: linear-gradient(
		110deg,
		${(props) => props.theme.colors.background} 8%,
		${(props) => `${props.theme.colors.textSecondary}10`} 18%,
		${(props) => props.theme.colors.background} 33%
	);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite linear;

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}
`;

const CardContainer = styled.div<{ theme: AppTheme }>`
	position: relative;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	height: 270px;

	&:hover {
		transform: translateY(-5px) scale(1.02);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
	}
`;

const CardImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const CardOverlay = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12px;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
	color: white;
`;

const CardTitle = styled.div`
	font-weight: 600;
	font-size: 14px;
	margin-bottom: 6px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const CardStats = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const RankBadge = styled.div<{ theme: AppTheme }>`
	position: absolute;
	top: 10px;
	left: 10px;
	background-color: ${(props) => props.theme.colors.primary};
	color: white;
	font-size: 12px;
	font-weight: 600;
	padding: 4px 8px;
	border-radius: 4px;
	z-index: 1;
`;

const ScoreBadge = styled.div<{ theme: AppTheme }>`
	background-color: #ffd700;
	color: #333;
	font-size: 12px;
	font-weight: 600;
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
`;

const MembersBadge = styled.div<{ theme: AppTheme }>`
	background-color: rgba(255, 255, 255, 0.2);
	font-size: 12px;
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
`;

const ErrorMessage = styled.div<{ theme: AppTheme }>`
	text-align: center;
	padding: 30px;
	background-color: ${(props) => `${props.theme.colors.error}10`};
	color: ${(props) => props.theme.colors.error};
	border-radius: 8px;
	font-size: 16px;
`;
