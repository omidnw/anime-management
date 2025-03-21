import { useState, forwardRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useUserAnimeList, useDeleteAnime } from "../hooks/useAnime";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { List, Grid, Info, Filter, Trash2 } from "lucide-react";
import { UserAnimeData } from "../types/anime";
import { jikanApi } from "../services/jikanApi";
import { useQueries } from "@tanstack/react-query";
import FilterErrors from "../components/FilterErrors";
import { useError, handleAppError } from "../contexts/ErrorContext";

type ViewMode = "list" | "grid";

interface UserAnimeListProps {
	onAnimeSelect: (animeId: number) => void;
}

const ListContainer = styled.div`
	max-width: 1200px;
	margin: 0 auto;
`;

const ListHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

const PageTitle = styled.h2`
	margin: 0;
	font-size: 24px;
	font-weight: 600;
`;

const FilterSection = styled.div`
	margin-bottom: 24px;
`;

const FilterRow = styled.div`
	display: flex;
	gap: 8px;
	margin-bottom: 16px;
	flex-wrap: wrap;
`;

const ViewToggle = styled.div`
	display: flex;
	gap: 8px;
`;

const GridView = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 24px;
	margin-bottom: 40px;
`;

const ListView = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-bottom: 40px;
`;

const DeleteButtonBase = styled.button<{ theme: any }>`
	position: absolute;
	top: 8px;
	right: 8px;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.6);
	color: white;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	opacity: 0;
	transition: opacity 0.2s ease;
	z-index: 10;

	&:hover {
		background-color: ${(props) => props.theme.colors.error};
	}
`;

const DeleteButton = styled(DeleteButtonBase)``;

// Create a forwardRef version of Card to fix the ref warning
const ForwardedCard = forwardRef<HTMLDivElement, any>(
	({ children, ...props }, ref) => (
		<Card {...props} ref={ref}>
			{children}
		</Card>
	)
);

// Update to use ForwardedCard
const AnimeGridCard = styled(ForwardedCard)`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0;
	cursor: pointer;
	position: relative;

	&:hover .grid-delete-button {
		opacity: 1;
	}
`;

const AnimeImage = styled.div<{ imageUrl: string }>`
	width: 100%;
	height: 320px;
	background-image: url(${(props) => props.imageUrl});
	background-size: cover;
	background-position: center;
`;

const AnimeCardContent = styled.div`
	padding: 16px;
`;

const AnimeCardTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
`;

const AnimeCardMeta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	font-size: 14px;
`;

// Update to use ForwardedCard
const AnimeListCard = styled(ForwardedCard)`
	display: flex;
	padding: 12px;
	cursor: pointer;
`;

const ListImageContainer = styled.div`
	width: 70px;
	margin-right: 16px;
`;

const ListImage = styled.img`
	width: 70px;
	height: 100px;
	object-fit: cover;
	border-radius: 4px;
`;

const ListContent = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const AnimeListTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 16px;
	font-weight: 600;
`;

const ListMeta = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-bottom: 8px;
	font-size: 14px;
`;

const MetaItem = styled.div<{ theme: any }>`
	display: flex;
	align-items: center;
	gap: 4px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const StatusBadge = styled.span<{ color: string }>`
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
	background-color: ${(props) => props.color}20;
	color: ${(props) => props.color};
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 48px 0;
	text-align: center;
`;

const EmptyStateIcon = styled.div`
	margin-bottom: 16px;
	color: ${(props) => props.color};
`;

const EmptyStateTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 18px;
	font-weight: 600;
`;

const EmptyStateMessage = styled.p`
	margin: 0 0 24px 0;
	font-size: 16px;
	opacity: 0.8;
`;

const ListDeleteButton = styled.button<{ theme: any }>`
	background-color: ${(props) => `${props.theme.colors.error}15`};
	color: ${(props) => props.theme.colors.error};
	border: none;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	margin-left: auto;

	&:hover {
		background-color: ${(props) => props.theme.colors.error};
		color: white;
	}
`;

export function UserAnimeList({ onAnimeSelect }: UserAnimeListProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [selectedStatus, setSelectedStatus] = useState<
		UserAnimeData["status"] | "all"
	>("all");
	const deleteAnimeMutation = useDeleteAnime();
	const { error, setError } = useError();
	const [filterError, setFilterError] = useState<{
		code: string;
		message: string;
	} | null>(null);

	// Get user anime list filtered by status if needed
	const {
		data: userAnimeList,
		isLoading,
		error: queryError,
	} = useUserAnimeList(selectedStatus === "all" ? undefined : selectedStatus);

	// Add debugging logs
	console.log("Selected status:", selectedStatus);
	console.log("User anime list:", userAnimeList);

	// Fetch anime details for each user anime
	const animeQueries = useQueries({
		queries:
			userAnimeList?.map((userAnime) => ({
				queryKey: ["animeDetails", userAnime.anime_id],
				queryFn: () => jikanApi.getAnimeById(userAnime.anime_id),
				staleTime: 60 * 60 * 1000, // 1 hour
			})) || [],
	});

	const isLoadingAnimeDetails = animeQueries.some((query) => query.isLoading);

	// Add effect to handle filter errors
	useEffect(() => {
		if (queryError) {
			console.error("Error loading anime list with filter:", queryError);
			setFilterError({
				code: "FILTER_ERROR",
				message: `Failed to load anime with status "${selectedStatus}". Please try again or choose a different filter.`,
			});
			// Also log to the global error system for debugging
			setError(handleAppError(queryError, "FILTER_ERROR"));
		} else {
			setFilterError(null);
		}
	}, [queryError, selectedStatus, setError]);

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

	const formatStatus = (status: string): string => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const handleDeleteAnime = (
		e: React.MouseEvent,
		animeId: number,
		animeTitle: string
	) => {
		e.stopPropagation();
		e.preventDefault();
		console.log(`Attempting to delete anime: ${animeTitle} (ID: ${animeId})`);

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
		message.textContent = `Are you sure you want to remove "${animeTitle}" from your list? This action cannot be undone.`;
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
			console.log(`Delete operation cancelled by user for: ${animeTitle}`);
			document.body.removeChild(confirmDelete);
		};

		deleteButton.onclick = () => {
			console.log(
				`Confirmed deletion. Calling mutation for anime ID: ${animeId}`
			);
			document.body.removeChild(confirmDelete);

			deleteAnimeMutation.mutate(animeId, {
				onSuccess: (wasDeleted) => {
					if (wasDeleted) {
						console.log(`Successfully deleted anime: ${animeTitle}`);
						// Optional: Show a success toast/notification
					} else {
						console.warn(
							`Anime ${animeTitle} was not found or couldn't be deleted`
						);
						alert(
							`Could not find "${animeTitle}" in your list. It may have been already removed.`
						);
					}
				},
				onError: (error) => {
					console.error(`Error deleting anime: ${animeTitle}`, error);
					alert(`Failed to delete "${animeTitle}". Please try again.`);
				},
			});
		};
	};

	// Add a handler for filter button clicks
	const handleStatusFilterChange = (
		status: UserAnimeData["status"] | "all"
	) => {
		console.log(`Changing filter to: ${status}`);
		setSelectedStatus(status);
	};

	// Add a handler to reset filters when there's an error
	const handleResetFilters = () => {
		setSelectedStatus("all");
		setFilterError(null);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!userAnimeList || userAnimeList.length === 0) {
		return (
			<ListContainer>
				<ListHeader>
					<PageTitle>My Anime List</PageTitle>

					<ViewToggle>
						<Button
							variant={viewMode === "grid" ? "primary" : "outline"}
							size="small"
							icon={<Grid size={18} />}
							onClick={() => setViewMode("grid")}
						>
							Grid
						</Button>
						<Button
							variant={viewMode === "list" ? "primary" : "outline"}
							size="small"
							icon={<List size={18} />}
							onClick={() => setViewMode("list")}
						>
							List
						</Button>
					</ViewToggle>
				</ListHeader>

				<FilterSection>
					<FilterRow>
						<Button
							variant={selectedStatus === "all" ? "primary" : "outline"}
							size="small"
							icon={<Filter size={16} />}
							onClick={() => handleStatusFilterChange("all")}
						>
							All
						</Button>
						<Button
							variant={selectedStatus === "watching" ? "primary" : "outline"}
							size="small"
							onClick={() => handleStatusFilterChange("watching")}
						>
							Watching
						</Button>
						<Button
							variant={selectedStatus === "completed" ? "primary" : "outline"}
							size="small"
							onClick={() => handleStatusFilterChange("completed")}
						>
							Completed
						</Button>
						<Button
							variant={
								selectedStatus === "plan_to_watch" ? "primary" : "outline"
							}
							size="small"
							onClick={() => handleStatusFilterChange("plan_to_watch")}
						>
							Plan to Watch
						</Button>
						<Button
							variant={selectedStatus === "on_hold" ? "primary" : "outline"}
							size="small"
							onClick={() => handleStatusFilterChange("on_hold")}
						>
							On Hold
						</Button>
						<Button
							variant={selectedStatus === "dropped" ? "primary" : "outline"}
							size="small"
							onClick={() => handleStatusFilterChange("dropped")}
						>
							Dropped
						</Button>
					</FilterRow>
				</FilterSection>

				<EmptyState>
					<EmptyStateIcon color={theme.colors.textSecondary}>
						<Info size={48} />
					</EmptyStateIcon>
					<EmptyStateTitle>
						{selectedStatus === "all"
							? "Your anime list is empty"
							: `No ${formatStatus(selectedStatus)} anime found`}
					</EmptyStateTitle>
					<EmptyStateMessage>
						{selectedStatus === "all"
							? "Start by adding anime to your list from the home page."
							: `You don't have any anime with status "${formatStatus(
									selectedStatus
							  )}".`}
					</EmptyStateMessage>
					{selectedStatus === "all" ? (
						<Button
							variant="primary"
							onClick={() => {
								// Navigate to home page or reload the page
								window.location.hash = "#/"; // If you're using hash routing
								// Alternatively, you can trigger any navigation callback provided by parent
							}}
						>
							Explore Anime
						</Button>
					) : (
						<Button
							variant="outline"
							onClick={() => handleStatusFilterChange("all")}
						>
							Show All Anime
						</Button>
					)}
				</EmptyState>
			</ListContainer>
		);
	}

	if (filterError) {
		return (
			<ListContainer>
				<ListHeader>
					<PageTitle>My Anime List</PageTitle>
				</ListHeader>
				<FilterSection>
					<FilterRow>
						<Button
							variant="primary"
							size="small"
							icon={<Filter size={16} />}
							onClick={() => handleStatusFilterChange("all")}
						>
							All
						</Button>
					</FilterRow>
				</FilterSection>
				<FilterErrors
					errorCode={filterError.code}
					message={filterError.message}
					onReset={handleResetFilters}
					onReload={() => window.location.reload()}
				/>
			</ListContainer>
		);
	}

	return (
		<ListContainer>
			<ListHeader>
				<PageTitle>My Anime List</PageTitle>

				<ViewToggle>
					<Button
						variant={viewMode === "grid" ? "primary" : "outline"}
						size="small"
						icon={<Grid size={18} />}
						onClick={() => setViewMode("grid")}
					>
						Grid
					</Button>
					<Button
						variant={viewMode === "list" ? "primary" : "outline"}
						size="small"
						icon={<List size={18} />}
						onClick={() => setViewMode("list")}
					>
						List
					</Button>
				</ViewToggle>
			</ListHeader>

			<FilterSection>
				<FilterRow>
					<Button
						variant={selectedStatus === "all" ? "primary" : "outline"}
						size="small"
						icon={<Filter size={16} />}
						onClick={() => handleStatusFilterChange("all")}
					>
						All
					</Button>
					<Button
						variant={selectedStatus === "watching" ? "primary" : "outline"}
						size="small"
						onClick={() => handleStatusFilterChange("watching")}
					>
						Watching
					</Button>
					<Button
						variant={selectedStatus === "completed" ? "primary" : "outline"}
						size="small"
						onClick={() => handleStatusFilterChange("completed")}
					>
						Completed
					</Button>
					<Button
						variant={selectedStatus === "plan_to_watch" ? "primary" : "outline"}
						size="small"
						onClick={() => handleStatusFilterChange("plan_to_watch")}
					>
						Plan to Watch
					</Button>
					<Button
						variant={selectedStatus === "on_hold" ? "primary" : "outline"}
						size="small"
						onClick={() => handleStatusFilterChange("on_hold")}
					>
						On Hold
					</Button>
					<Button
						variant={selectedStatus === "dropped" ? "primary" : "outline"}
						size="small"
						onClick={() => handleStatusFilterChange("dropped")}
					>
						Dropped
					</Button>
				</FilterRow>
			</FilterSection>

			{isLoadingAnimeDetails ? (
				<div>Loading anime details...</div>
			) : viewMode === "grid" ? (
				<GridView>
					{userAnimeList.map((userAnime, index) => {
						const animeData = animeQueries[index]?.data?.data;
						// If we don't have API data but have local data, create a minimal object
						const displayData = animeData || {
							title: userAnime.title,
							images: {
								jpg: {
									image_url: userAnime.image_url,
								},
							},
							episodes: null,
						};

						if (!displayData) return null;

						return (
							<AnimeGridCard
								key={userAnime.anime_id}
								onClick={() => onAnimeSelect(userAnime.anime_id)}
							>
								<DeleteButton
									theme={theme}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										console.log(
											`Delete button clicked for ${displayData.title}`
										);
										handleDeleteAnime(e, userAnime.anime_id, displayData.title);
									}}
									title="Remove from my list"
									className="grid-delete-button"
								>
									<Trash2 size={16} />
								</DeleteButton>
								<AnimeImage imageUrl={displayData.images.jpg.image_url} />
								<AnimeCardContent>
									<AnimeCardTitle>{displayData.title}</AnimeCardTitle>
									<StatusBadge color={getStatusColor(userAnime.status)}>
										{formatStatus(userAnime.status)}
									</StatusBadge>
									<AnimeCardMeta>
										<span>
											Score: {userAnime.score > 0 ? userAnime.score : "N/A"}
										</span>
										<span>
											{userAnime.progress}
											{displayData.episodes ? `/${displayData.episodes}` : ""}
										</span>
									</AnimeCardMeta>
								</AnimeCardContent>
							</AnimeGridCard>
						);
					})}
				</GridView>
			) : (
				<ListView>
					{userAnimeList.map((userAnime, index) => {
						const animeData = animeQueries[index]?.data?.data;
						// If we don't have API data but have local data, create a minimal object
						const displayData = animeData || {
							title: userAnime.title,
							images: {
								jpg: {
									image_url: userAnime.image_url,
								},
							},
							episodes: null,
							type: null,
						};

						if (!displayData) return null;

						return (
							<AnimeListCard
								key={userAnime.anime_id}
								onClick={() => onAnimeSelect(userAnime.anime_id)}
							>
								<ListImageContainer>
									<ListImage
										src={displayData.images.jpg.image_url}
										alt={displayData.title}
									/>
								</ListImageContainer>
								<ListContent>
									<AnimeListTitle>{displayData.title}</AnimeListTitle>
									<ListMeta>
										<StatusBadge color={getStatusColor(userAnime.status)}>
											{formatStatus(userAnime.status)}
										</StatusBadge>
										<MetaItem theme={theme}>
											<span>
												Score: {userAnime.score > 0 ? userAnime.score : "N/A"}
											</span>
										</MetaItem>
										<MetaItem theme={theme}>
											<span>
												Episodes: {userAnime.progress}
												{displayData.episodes ? `/${displayData.episodes}` : ""}
											</span>
										</MetaItem>
										{displayData.type && (
											<MetaItem theme={theme}>
												<span>{displayData.type}</span>
											</MetaItem>
										)}
									</ListMeta>
								</ListContent>
								<ListDeleteButton
									theme={theme}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										console.log(
											`Delete button clicked for ${displayData.title}`
										);
										handleDeleteAnime(e, userAnime.anime_id, displayData.title);
									}}
									title="Remove from my list"
								>
									<Trash2 size={16} />
								</ListDeleteButton>
							</AnimeListCard>
						);
					})}
				</ListView>
			)}
		</ListContainer>
	);
}
