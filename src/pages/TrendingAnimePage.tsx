import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useTopAnime } from "../hooks/useAnime";
import { AnimeCardGrid } from "../components/AnimeCardGrid";
import { Button } from "../components/ui/Button";
import { SearchInput } from "../components/ui/SearchInput";
import {
	List,
	Grid,
	TrendingUp,
	Filter,
	SortAsc,
	SortDesc,
} from "lucide-react";

interface TrendingAnimePageProps {
	onAnimeSelect: (animeId: number) => void;
	onNavigate?: (page: string, params?: Record<string, string>) => void;
}

type ViewMode = "grid" | "list";
type SortFilter = "rank" | "score" | "popularity" | "favorites" | "members";

export function TrendingAnimePage({
	onAnimeSelect,
	// onNavigate,
}: TrendingAnimePageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [page, setPage] = useState(1);
	const [sortFilter, setSortFilter] = useState<SortFilter>("rank");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const { data, isLoading, error } = useTopAnime(page);

	// Filter and sort the anime based on user preferences
	const filteredAnime = React.useMemo(() => {
		if (!data?.data) return [];

		// First filter by search query if present
		let filtered = data.data;
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((anime) =>
				anime.title.toLowerCase().includes(query)
			);
		}

		// Then sort by the selected criteria
		return [...filtered].sort((a, b) => {
			let valA: number, valB: number;

			switch (sortFilter) {
				case "rank":
					valA = a.rank || Number.MAX_SAFE_INTEGER;
					valB = b.rank || Number.MAX_SAFE_INTEGER;
					break;
				case "score":
					valA = a.score || 0;
					valB = b.score || 0;
					break;
				case "popularity":
					valA = a.popularity || Number.MAX_SAFE_INTEGER;
					valB = b.popularity || Number.MAX_SAFE_INTEGER;
					break;
				case "favorites":
					valA = a.favorites || 0;
					valB = b.favorites || 0;
					break;
				case "members":
					valA = a.members || 0;
					valB = b.members || 0;
					break;
				default:
					valA = a.rank || Number.MAX_SAFE_INTEGER;
					valB = b.rank || Number.MAX_SAFE_INTEGER;
			}

			// For rank and popularity, lower is better
			if (sortFilter === "rank" || sortFilter === "popularity") {
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}

			// For everything else, higher is better
			return sortDirection === "asc" ? valA - valB : valB - valA;
		});
	}, [data, searchQuery, sortFilter, sortDirection]);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	const handleSortFilterChange = (filter: SortFilter) => {
		if (filter === sortFilter) {
			// Toggle sort direction if the same filter is clicked
			setSortDirection(sortDirection === "desc" ? "asc" : "desc");
		} else {
			setSortFilter(filter);
			// Reset to descending order for a new filter
			setSortDirection("desc");
		}
	};

	const goToNextPage = () => {
		if (data?.pagination?.has_next_page) {
			setPage((prevPage) => prevPage + 1);
		}
	};

	const goToPrevPage = () => {
		if (page > 1) {
			setPage((prevPage) => prevPage - 1);
		}
	};

	return (
		<PageContainer>
			<PageHeader>
				<PageTitle>
					<TitleIcon>
						<TrendingUp size={26} />
					</TitleIcon>
					<span>Trending Anime</span>
				</PageTitle>
				<PageDescription>
					Discover the most popular and highest-rated anime from around the
					world
				</PageDescription>
			</PageHeader>

			<ControlsContainer>
				<SearchContainer>
					<SearchInput
						value={searchQuery}
						onChange={handleSearchChange}
						onClear={clearSearch}
						placeholder="Filter trending anime..."
						debounceMs={300}
					/>
				</SearchContainer>

				<FilterControls>
					<FilterGroup>
						<FilterLabel>
							<Filter size={16} />
							<span>Sort By:</span>
						</FilterLabel>
						<SortButton
							isActive={sortFilter === "rank"}
							onClick={() => handleSortFilterChange("rank")}
							theme={theme}
						>
							Rank
							{sortFilter === "rank" &&
								(sortDirection === "desc" ? (
									<SortDesc size={14} />
								) : (
									<SortAsc size={14} />
								))}
						</SortButton>
						<SortButton
							isActive={sortFilter === "score"}
							onClick={() => handleSortFilterChange("score")}
							theme={theme}
						>
							Score
							{sortFilter === "score" &&
								(sortDirection === "desc" ? (
									<SortDesc size={14} />
								) : (
									<SortAsc size={14} />
								))}
						</SortButton>
						<SortButton
							isActive={sortFilter === "popularity"}
							onClick={() => handleSortFilterChange("popularity")}
							theme={theme}
						>
							Popularity
							{sortFilter === "popularity" &&
								(sortDirection === "desc" ? (
									<SortDesc size={14} />
								) : (
									<SortAsc size={14} />
								))}
						</SortButton>
						<SortButton
							isActive={sortFilter === "favorites"}
							onClick={() => handleSortFilterChange("favorites")}
							theme={theme}
						>
							Favorites
							{sortFilter === "favorites" &&
								(sortDirection === "desc" ? (
									<SortDesc size={14} />
								) : (
									<SortAsc size={14} />
								))}
						</SortButton>
						<SortButton
							isActive={sortFilter === "members"}
							onClick={() => handleSortFilterChange("members")}
							theme={theme}
						>
							Members
							{sortFilter === "members" &&
								(sortDirection === "desc" ? (
									<SortDesc size={14} />
								) : (
									<SortAsc size={14} />
								))}
						</SortButton>
					</FilterGroup>

					<ViewControls>
						<Button
							variant={viewMode === "grid" ? "primary" : "outline"}
							onClick={() => setViewMode("grid")}
							size="small"
							icon={<Grid size={16} />}
						>
							Grid
						</Button>
						<Button
							variant={viewMode === "list" ? "primary" : "outline"}
							onClick={() => setViewMode("list")}
							size="small"
							icon={<List size={16} />}
						>
							List
						</Button>
					</ViewControls>
				</FilterControls>
			</ControlsContainer>

			{isLoading ? (
				<LoadingState theme={theme}>Loading trending anime...</LoadingState>
			) : error ? (
				<ErrorState theme={theme}>
					Failed to load trending anime. Please try again later.
				</ErrorState>
			) : (
				<>
					<ResultsInfo theme={theme}>
						{searchQuery
							? `Found ${filteredAnime.length} anime matching "${searchQuery}"`
							: `Showing ${filteredAnime.length} trending anime`}
					</ResultsInfo>

					<AnimeCardGrid
						animeList={filteredAnime}
						onAnimeSelect={onAnimeSelect}
						viewMode={viewMode}
						theme={theme}
					/>

					{!searchQuery && (
						<PaginationContainer>
							<Button
								variant="outline"
								onClick={goToPrevPage}
								disabled={page <= 1}
							>
								Previous
							</Button>

							<PageNumber theme={theme}>
								Page {page}{" "}
								{data?.pagination?.last_visible_page
									? `of ${data.pagination.last_visible_page}`
									: ""}
							</PageNumber>

							<Button
								variant="outline"
								onClick={goToNextPage}
								disabled={!data?.pagination?.has_next_page}
							>
								Next
							</Button>
						</PaginationContainer>
					)}
				</>
			)}
		</PageContainer>
	);
}

const PageContainer = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 16px;
`;

const PageHeader = styled.div`
	margin-bottom: 32px;
`;

const PageTitle = styled.h1`
	font-size: 28px;
	font-weight: 700;
	margin: 0 0 12px 0;
	display: flex;
	align-items: center;
	gap: 12px;
`;

const TitleIcon = styled.div`
	color: #ff6b6b;
`;

const PageDescription = styled.p`
	font-size: 16px;
	color: #666;
	margin: 0;
`;

const ControlsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-bottom: 24px;
`;

const SearchContainer = styled.div`
	max-width: 500px;
`;

const FilterControls = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 16px;
	align-items: center;
`;

const FilterGroup = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
`;

const FilterLabel = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	color: #666;
`;

const SortButton = styled.button<{ isActive: boolean; theme: any }>`
	padding: 6px 12px;
	background-color: ${(props) =>
		props.isActive ? `${props.theme.colors.primary}15` : "transparent"};
	border: 1px solid
		${(props) => (props.isActive ? props.theme.colors.primary : "#e0e0e0")};
	border-radius: 6px;
	font-size: 14px;
	cursor: pointer;
	color: ${(props) =>
		props.isActive ? props.theme.colors.primary : props.theme.colors.text};
	display: flex;
	align-items: center;
	gap: 4px;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			props.isActive ? `${props.theme.colors.primary}20` : "#f5f5f5"};
	}
`;

const ViewControls = styled.div`
	display: flex;
	gap: 8px;
`;

const LoadingState = styled.div<{ theme: any }>`
	padding: 40px;
	text-align: center;
	font-size: 16px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div<{ theme: any }>`
	padding: 40px;
	text-align: center;
	font-size: 16px;
	color: ${(props) => props.theme.colors.error};
	background-color: ${(props) => `${props.theme.colors.error}10`};
	border-radius: 8px;
`;

const ResultsInfo = styled.div<{ theme: any }>`
	margin-bottom: 16px;
	font-size: 14px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16px;
	margin-top: 32px;
	margin-bottom: 16px;
`;

const PageNumber = styled.div<{ theme: any }>`
	font-size: 14px;
	color: ${(props) => props.theme.colors.textSecondary};
`;
