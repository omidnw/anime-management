import React from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { AnimeData } from "../types/anime";
import { AppTheme } from "../themes/themeTypes";
import { Star, Eye, Calendar } from "lucide-react";

interface AnimeCardGridProps {
	animeList: AnimeData[];
	onAnimeSelect: (animeId: number) => void;
	viewMode: "grid" | "list";
	theme: AppTheme;
}

export const AnimeCardGrid: React.FC<AnimeCardGridProps> = ({
	animeList,
	onAnimeSelect,
	viewMode,
	theme,
}) => {
	if (animeList.length === 0) {
		return (
			<EmptyState theme={theme}>
				No anime found. Try adjusting your search or filters.
			</EmptyState>
		);
	}

	if (viewMode === "grid") {
		return (
			<GridContainer>
				{animeList.map((anime, index) => (
					<motion.div
						key={anime.mal_id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05, duration: 0.3 }}
						whileHover={{ y: -5, transition: { delay: 0 } }}
					>
						<GridCard onClick={() => onAnimeSelect(anime.mal_id)} theme={theme}>
							<CardImage src={anime.images.jpg.image_url} alt={anime.title} />
							<CardOverlay>
								<CardTitle>{anime.title}</CardTitle>
								<CardStats>
									{anime.score ? (
										<ScoreBadge theme={theme}>
											<Star size={12} />
											{anime.score}
										</ScoreBadge>
									) : null}
									{anime.members ? (
										<StatBadge theme={theme}>
											<Eye size={12} />
											{formatNumber(anime.members)}
										</StatBadge>
									) : null}
								</CardStats>
							</CardOverlay>
							{anime.rank && <RankBadge theme={theme}>#{anime.rank}</RankBadge>}
						</GridCard>
					</motion.div>
				))}
			</GridContainer>
		);
	}

	return (
		<ListContainer>
			{animeList.map((anime, index) => (
				<motion.div
					key={anime.mal_id}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: index * 0.05, duration: 0.3 }}
				>
					<ListCard onClick={() => onAnimeSelect(anime.mal_id)} theme={theme}>
						<ListCardImage src={anime.images.jpg.image_url} alt={anime.title} />
						<ListCardContent>
							<ListCardTitle>{anime.title}</ListCardTitle>
							<ListCardDescription>
								{anime.synopsis
									? truncateText(anime.synopsis, 150)
									: "No description available."}
							</ListCardDescription>
							<ListCardFooter>
								<ListCardStats>
									{anime.score ? (
										<StatItem theme={theme}>
											<Star size={14} />
											{anime.score}
										</StatItem>
									) : null}
									{anime.type ? (
										<StatItem theme={theme}>{anime.type}</StatItem>
									) : null}
									{anime.status ? (
										<StatItem theme={theme}>{anime.status}</StatItem>
									) : null}
									{anime.aired?.from ? (
										<StatItem theme={theme}>
											<Calendar size={14} />
											{new Date(anime.aired.from).getFullYear()}
										</StatItem>
									) : null}
								</ListCardStats>
								{anime.rank && (
									<RankIndicator theme={theme}>
										Rank: <strong>#{anime.rank}</strong>
									</RankIndicator>
								)}
							</ListCardFooter>
						</ListCardContent>
					</ListCard>
				</motion.div>
			))}
		</ListContainer>
	);
};

// Helper functions
const formatNumber = (num: number): string => {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
};

const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
};

// Grid View Styles
const GridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 20px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 15px;
	}
`;

const GridCard = styled.div<{ theme: AppTheme }>`
	position: relative;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	height: 270px;

	&:hover {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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

const ScoreBadge = styled.div<{ theme: AppTheme }>`
	background-color: #ffd700;
	color: #333;
	font-size: 12px;
	font-weight: 600;
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
`;

const StatBadge = styled.div<{ theme: AppTheme }>`
	background-color: rgba(255, 255, 255, 0.2);
	font-size: 12px;
	padding: 2px 6px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
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

// List View Styles
const ListContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const ListCard = styled.div<{ theme: AppTheme }>`
	display: flex;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}
`;

const ListCardImage = styled.img`
	width: 100px;
	height: 140px;
	object-fit: cover;
	flex-shrink: 0;

	@media (min-width: 768px) {
		width: 120px;
		height: 170px;
	}
`;

const ListCardContent = styled.div`
	flex: 1;
	padding: 16px;
	display: flex;
	flex-direction: column;
`;

const ListCardTitle = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 10px 0;
`;

const ListCardDescription = styled.p`
	font-size: 14px;
	margin: 0 0 auto 0;
	color: #666;
	line-height: 1.5;
`;

const ListCardFooter = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16px;
	flex-wrap: wrap;
`;

const ListCardStats = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
`;

const StatItem = styled.div<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const RankIndicator = styled.div<{ theme: AppTheme }>`
	font-size: 13px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div<{ theme: AppTheme }>`
	padding: 40px;
	text-align: center;
	background-color: ${(props) => `${props.theme.colors.primary}05`};
	border-radius: 8px;
	color: ${(props) => props.theme.colors.textSecondary};
`;
