import { forwardRef, useState } from "react";
import styled from "@emotion/styled";
import {
	Play,
	CheckCircle,
	Trash2,
	Star,
	BookmarkPlus,
	BookmarkCheck,
	PlusCircle,
	Eye,
} from "lucide-react";
import { AnimeData, UserAnimeData } from "../types/anime";
import {
	useUserAnimeDetails,
	useDeleteAnime,
	useAddAnime,
} from "../hooks/useAnime";
import { motion } from "framer-motion";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { Card } from "./ui/Card";

interface AnimeListCardProps {
	anime: AnimeData;
	onClick?: () => void;
}

// Create a forwardRef version of Card to fix the ref warning
const ForwardedCard = forwardRef<HTMLDivElement, any>(
	({ children, ...props }, ref) => (
		<Card {...props} ref={ref}>
			{children}
		</Card>
	)
);

// Styled components needed for this component
const StatusBadge = styled.div<{ statusColor: string }>`
	position: absolute;
	top: 10px;
	right: 10px;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
	background-color: ${(props) => props.statusColor};
	color: white;
	text-transform: capitalize;
`;

const IconButton = styled.button<{
	textColor?: string;
	bgColor?: string;
	primaryColor?: string;
}>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: none;
	background-color: ${(props) => props.bgColor || "transparent"};
	color: ${(props) => props.textColor || "currentColor"};
	cursor: pointer;
	transition: all 0.2s ease;
	padding: 0;

	&:hover {
		background-color: ${(props) => props.primaryColor || "#4266E8"};
		color: white;
	}
`;

const AnimeImage = styled.div<{ imageUrl: string }>`
	width: 100px;
	height: 150px;
	border-radius: 8px;
	background-image: url(${(props) => props.imageUrl});
	background-size: cover;
	background-position: center;
	flex-shrink: 0;
`;

// Helper function to get status color
const getStatusColor = (status: string, theme: any) => {
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
			return theme.colors.textSecondary;
	}
};

// Rest of the styled components
const MotionListCardContainer = styled(motion(ForwardedCard))`
	display: flex;
	margin-bottom: 16px;
	padding: 16px;
	position: relative;
	overflow: hidden;
`;

const AnimeInfo = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-left: 16px;
	flex: 1;
`;

const AnimeTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 18px;
	font-weight: 600;
	line-height: 1.3;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const AnimeMetadata = styled.div<{ color: string }>`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
	color: ${(props) => props.color};
	font-size: 14px;
`;

const AnimeRating = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	margin-right: 12px;
`;

const AnimeBadge = styled.span<{ accentColor: string }>`
	background-color: ${(props) => props.accentColor}20;
	color: ${(props) => props.accentColor};
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
`;

const AnimeDetails = styled.div<{ color: string }>`
	font-size: 14px;
	color: ${(props) => props.color};
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 8px;
	margin-top: auto;
`;

export function AnimeListCard({ anime, onClick }: AnimeListCardProps) {
	const { data: userAnimeData } = useUserAnimeDetails(anime.mal_id);
	const deleteAnimeMutation = useDeleteAnime();
	const addAnimeMutation = useAddAnime();
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const handleAddToWatchlist = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!userAnimeData) {
			const newUserAnime: UserAnimeData = {
				anime_id: anime.mal_id,
				status: "plan_to_watch",
				score: 0,
				progress: 0,
				notes: "",
				favorite: true,
				start_date: null,
				end_date: null,
				image_url: anime.images.jpg.image_url,
				title: anime.title,
			};

			addAnimeMutation.mutate(newUserAnime);
		}
	};

	const handleMarkAsWatching = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			await addAnimeMutation.mutate({
				anime_id: anime.mal_id,
				status: "watching",
				image_url: anime.images.jpg.image_url,
				title: anime.title,
			});
			console.log("Marked as watching");
		} catch (error) {
			console.error("Error updating status:", error);
		}
	};

	const handleMarkAsCompleted = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		try {
			await addAnimeMutation.mutate({
				anime_id: anime.mal_id,
				status: "completed",
				image_url: anime.images.jpg.image_url,
				title: anime.title,
			});
			console.log("Marked as completed");
		} catch (error) {
			console.error("Error updating status:", error);
		}
	};

	const handleDeleteAnime = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		console.log(
			`Attempting to delete anime: ${anime.title} (ID: ${anime.mal_id})`
		);

		// Create a custom confirmation dialog
		const confirmDelete = document.createElement("div");
		confirmDelete.style.position = "fixed";
		confirmDelete.style.top = "0";
		confirmDelete.style.left = "0";
		confirmDelete.style.width = "100%";
		confirmDelete.style.height = "100%";
		confirmDelete.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
		confirmDelete.style.display = "flex";
		confirmDelete.style.justifyContent = "center";
		confirmDelete.style.alignItems = "center";
		confirmDelete.style.zIndex = "9999";

		const dialogBox = document.createElement("div");
		dialogBox.style.width = "350px";
		dialogBox.style.padding = "24px";
		dialogBox.style.backgroundColor = theme.colors.surface;
		dialogBox.style.borderRadius = "8px";
		dialogBox.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";

		const title = document.createElement("h3");
		title.textContent = "Confirm Deletion";
		title.style.margin = "0 0 16px 0";
		title.style.color = theme.colors.text;
		title.style.fontSize = "18px";

		const message = document.createElement("p");
		message.textContent = `Are you sure you want to remove "${anime.title}" from your list? This action cannot be undone.`;
		message.style.margin = "0 0 24px 0";
		message.style.color = theme.colors.textSecondary;
		message.style.fontSize = "14px";
		message.style.lineHeight = "1.5";

		const buttonContainer = document.createElement("div");
		buttonContainer.style.display = "flex";
		buttonContainer.style.justifyContent = "flex-end";
		buttonContainer.style.gap = "12px";

		const cancelButton = document.createElement("button");
		cancelButton.textContent = "Cancel";
		cancelButton.style.padding = "8px 16px";
		cancelButton.style.border = "none";
		cancelButton.style.borderRadius = "4px";
		cancelButton.style.backgroundColor = "transparent";
		cancelButton.style.color = theme.colors.textSecondary;
		cancelButton.style.cursor = "pointer";
		cancelButton.style.fontSize = "14px";

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.style.padding = "8px 16px";
		deleteButton.style.border = "none";
		deleteButton.style.borderRadius = "4px";
		deleteButton.style.backgroundColor = theme.colors.error;
		deleteButton.style.color = "white";
		deleteButton.style.cursor = "pointer";
		deleteButton.style.fontSize = "14px";

		buttonContainer.appendChild(cancelButton);
		buttonContainer.appendChild(deleteButton);

		dialogBox.appendChild(title);
		dialogBox.appendChild(message);
		dialogBox.appendChild(buttonContainer);

		confirmDelete.appendChild(dialogBox);
		document.body.appendChild(confirmDelete);

		// Handle button clicks
		cancelButton.onclick = () => {
			console.log(`Delete operation cancelled by user for: ${anime.title}`);
			document.body.removeChild(confirmDelete);
		};

		deleteButton.onclick = () => {
			console.log(
				`Confirmed deletion. Calling mutation for anime ID: ${anime.mal_id}`
			);
			document.body.removeChild(confirmDelete);

			deleteAnimeMutation.mutate(anime.mal_id, {
				onSuccess: (wasDeleted) => {
					if (wasDeleted) {
						console.log(`Successfully deleted anime: ${anime.title}`);
						// Optional: Show a success toast/notification
					} else {
						console.warn(
							`Anime ${anime.title} was not found or couldn't be deleted`
						);
						alert(
							`Could not find "${anime.title}" in your list. It may have been already removed.`
						);
					}
				},
				onError: (error) => {
					console.error(`Error deleting anime: ${anime.title}`, error);
					alert(`Failed to delete "${anime.title}". Please try again.`);
				},
			});
		};
	};

	return (
		<MotionListCardContainer
			elevation="medium"
			hoverEffect
			onClick={onClick}
			whileHover={{ x: 5 }}
		>
			<AnimeImage imageUrl={anime.images.jpg.image_url} />

			<AnimeInfo>
				<div>
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

					<AnimeDetails color={theme.colors.textSecondary}>
						{anime.episodes ? `${anime.episodes} episodes` : "? episodes"} •{" "}
						{anime.status}
					</AnimeDetails>
				</div>

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
								onClick={handleMarkAsWatching}
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
							<IconButton
								onClick={handleDeleteAnime}
								textColor={theme.colors.error}
								bgColor={`${theme.colors.error}15`}
								primaryColor={theme.colors.error}
								title="Remove from my list"
							>
								<Trash2 size={20} />
							</IconButton>
						</>
					)}
				</ActionButtons>
			</AnimeInfo>

			{userAnimeData && (
				<StatusBadge statusColor={getStatusColor(userAnimeData.status, theme)}>
					{userAnimeData.status.replace("_", " ")}
				</StatusBadge>
			)}
		</MotionListCardContainer>
	);
}
