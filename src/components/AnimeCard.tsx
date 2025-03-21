import { useState, forwardRef } from "react";
import styled from "@emotion/styled";
import {
	Star,
	BookmarkPlus,
	BookmarkCheck,
	PlusCircle,
	Eye,
} from "lucide-react";
import { AnimeData, UserAnimeData } from "../types/anime";
import { Card } from "./ui/Card";
import { useUserAnimeDetails } from "../hooks/useAnime";
import { useAddAnime } from "../hooks/useAnime";
import { motion } from "framer-motion";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";

interface AnimeCardProps {
	anime: AnimeData;
	onClick?: () => void;
}

// Use forwardRef to fix the ref warning
const ForwardedCard = forwardRef<HTMLDivElement, any>(
	({ children, ...props }, ref) => (
		<Card {...props} ref={ref}>
			{children}
		</Card>
	)
);

const AnimeCardContainer = styled(ForwardedCard)`
	width: 100%;
	max-width: 240px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0;
	position: relative;
`;

// Create a motion component properly
const MotionAnimeCardContainer = motion(AnimeCardContainer);

// Export the AnimeImage component so it can be imported elsewhere
export const AnimeImage = styled.div<{ imageUrl: string }>`
	width: 100%;
	height: 320px;
	background-image: url(${(props) => props.imageUrl});
	background-size: cover;
	background-position: center;
`;

const AnimeInfo = styled.div`
	padding: 12px;
`;

const AnimeTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
	line-height: 1.3;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	height: 42px;
`;

const AnimeMetadata = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	margin-bottom: 10px;
	color: ${(props) => props.color || "inherit"};
`;

const AnimeRating = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const AnimeBadge = styled.span<{ accentColor: string }>`
	background-color: ${(props) => props.accentColor}20;
	color: ${(props) => props.accentColor};
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
`;

const ActionButtons = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: auto;
`;

const StatusBadge = styled.div<{ statusColor: string }>`
	position: absolute;
	top: 8px;
	right: 8px;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 600;
	background-color: ${(props) => props.statusColor};
	color: white;
`;

const IconButton = styled.button<{
	textColor: string;
	bgColor: string;
	primaryColor: string;
}>`
	background: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	color: ${(props) => props.textColor};
	border-radius: 50%;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => props.bgColor};
		color: ${(props) => props.primaryColor};
	}
`;

export function AnimeCard({ anime, onClick }: AnimeCardProps) {
	const { data: userAnimeData } = useUserAnimeDetails(anime.mal_id);
	const addAnimeMutation = useAddAnime();
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const getStatusColor = (status: string): string => {
		switch (status) {
			case "watching":
				return theme.colors.primary;
			case "completed":
				return theme.colors.success;
			case "plan_to_watch":
				return theme.colors.accent;
			case "on_hold":
				return theme.colors.warning;
			case "dropped":
				return theme.colors.error;
			default:
				return theme.colors.primary;
		}
	};

	const handleAddToWatchlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!anime) return;

		try {
			const status = "plan_to_watch";
			await addAnimeMutation.mutate({
				anime_id: anime.mal_id,
				status,
				image_url: anime.images.jpg.image_url,
				title: anime.title,
			});
			console.log(`Added ${anime.title} to watchlist`);
		} catch (error) {
			console.error("Error adding to watchlist:", error);
		}
	};

	const handleStartWatching = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!anime) return;

		try {
			const status = "watching";
			await addAnimeMutation.mutate({
				anime_id: anime.mal_id,
				status,
				image_url: anime.images.jpg.image_url,
				title: anime.title,
			});
			console.log(`Started watching ${anime.title}`);
		} catch (error) {
			console.error("Error adding to watching list:", error);
		}
	};

	return (
		<MotionAnimeCardContainer
			elevation="medium"
			hoverEffect
			onClick={onClick}
			whileHover={{ y: -5 }}
		>
			<AnimeImage imageUrl={anime.images.jpg.image_url} />

			{userAnimeData && (
				<StatusBadge statusColor={getStatusColor(userAnimeData.status)}>
					{userAnimeData.status.replace("_", " ")}
				</StatusBadge>
			)}

			<AnimeInfo>
				<AnimeTitle>{anime.title}</AnimeTitle>

				<AnimeMetadata color={theme.colors.textSecondary}>
					<AnimeRating>
						<Star
							size={16}
							fill={anime.score ? "gold" : "none"}
							color={anime.score ? "gold" : "currentColor"}
						/>
						<span>{anime.score || "N/A"}</span>
					</AnimeRating>

					<AnimeBadge accentColor={theme.colors.accent}>
						{anime.type || "Unknown"}
					</AnimeBadge>
				</AnimeMetadata>

				<ActionButtons>
					{!userAnimeData && (
						<>
							<IconButton
								onClick={handleAddToWatchlist}
								textColor={theme.colors.textSecondary}
								bgColor={theme.colors.background}
								primaryColor={theme.colors.primary}
							>
								<BookmarkPlus size={20} />
							</IconButton>
							<IconButton
								onClick={handleStartWatching}
								textColor={theme.colors.textSecondary}
								bgColor={theme.colors.background}
								primaryColor={theme.colors.primary}
							>
								<Eye size={20} />
							</IconButton>
						</>
					)}

					{userAnimeData && (
						<>
							<IconButton
								textColor={theme.colors.textSecondary}
								bgColor={theme.colors.background}
								primaryColor={theme.colors.primary}
							>
								<BookmarkCheck size={20} />
							</IconButton>
							<IconButton
								textColor={theme.colors.textSecondary}
								bgColor={theme.colors.background}
								primaryColor={theme.colors.primary}
							>
								<PlusCircle size={20} />
							</IconButton>
						</>
					)}
				</ActionButtons>
			</AnimeInfo>
		</MotionAnimeCardContainer>
	);
}
