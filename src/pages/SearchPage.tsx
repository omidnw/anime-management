import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useAnimeSearch, AnimeSearchFilters } from "../hooks/useAnime";
import { Button } from "../components/ui/Button";
import { AnimeCard } from "../components/AnimeCard";
import { AnimeListCard } from "../components/AnimeListCard";
import { ViewToggle, ViewMode } from "../components/ViewToggle";
import { SearchFilters } from "../components/SearchFilters";
import { Search, X, Loader, Filter, Info } from "lucide-react";

interface SearchPageProps {
	onAnimeSelect: (animeId: number) => void;
	initialParams?: Record<string, string>;
}

const SearchContainer = styled.div`
	max-width: 1200px;
	margin: 0 auto;
`;

const SearchHeader = styled.div`
	margin-bottom: 24px;
`;

const PageTitle = styled.h2`
	margin: 0 0 16px 0;
	font-size: 24px;
	font-weight: 600;
`;

// Completely rewritten search form layout
const SearchForm = styled.form`
	width: 100%;
	max-width: 600px;
	margin-bottom: 24px;
	display: flex;
	flex-direction: row;
	align-items: stretch;
`;

const SearchInputContainer = styled.div`
	flex: 1;
	min-width: 0;
	margin-right: 8px;
	position: relative;
`;

const InputIcon = styled.div`
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: ${(props) => props.color};
`;

const LoadingIcon = styled.div`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: ${(props) => props.color};
	animation: spin 1s linear infinite;

	@keyframes spin {
		0% {
			transform: translateY(-50%) rotate(0deg);
		}
		100% {
			transform: translateY(-50%) rotate(360deg);
		}
	}
`;

const ClearButton = styled.button`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	cursor: pointer;
	color: ${(props) => props.color};
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SearchInput = styled.input<{ theme: any }>`
	padding: 12px 12px 12px 40px;
	border-radius: 8px;
	border: 1px solid ${(props) => props.theme.colors.textSecondary};
	background-color: ${(props) => props.theme.colors.surface};
	color: ${(props) => props.theme.colors.text};
	width: 100%;
	height: 42px;
	font-size: 16px;
	outline: none;
	box-sizing: border-box;

	&:focus {
		border-color: ${(props) => props.theme.colors.primary};
	}
`;

const ResultsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
`;

const ResultsCount = styled.div`
	font-size: 16px;
	color: ${(props) => props.color};
`;

const ResultsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 24px;
`;

const ResultsList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const SearchMessage = styled.div`
	text-align: center;
	padding: 48px 0;
	color: ${(props) => props.color};
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 40px;
	gap: 8px;
`;

const PageInfo = styled.div`
	display: flex;
	align-items: center;
	margin: 0 16px;
`;

const StyledButton = styled(Button)`
	height: 42px;
	margin: 0;
	padding: 0 16px;
	vertical-align: top;
`;

const InitialSearchState = styled.div<{ theme: any }>`
	text-align: center;
	padding: 60px 0;
	max-width: 500px;
	margin: 0 auto;
`;

const NoResultsState = styled.div<{ theme: any }>`
	text-align: center;
	padding: 60px 0;
	max-width: 500px;
	margin: 0 auto;
`;

const SearchIcon = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: 16px;
	opacity: 0.5;
`;

const SearchTitle = styled.h3`
	font-size: 22px;
	font-weight: 600;
	margin: 0 0 12px 0;
`;

const SearchDescription = styled.p`
	font-size: 16px;
	line-height: 1.5;
	color: #666;
	margin: 0 0 24px 0;
`;

const ActiveFiltersNote = styled.div<{ theme: any }>`
	display: flex;
	align-items: center;
	gap: 8px;
	background-color: ${(props) => `${props.theme.colors.primary}10`};
	color: ${(props) => props.theme.colors.primary};
	padding: 10px 16px;
	border-radius: 8px;
	font-size: 14px;
	margin: 0 auto;
	width: fit-content;
`;

export function SearchPage({ onAnimeSelect, initialParams }: SearchPageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [page, setPage] = useState(1);
	const [isDebouncing, setIsDebouncing] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [filters, setFilters] = useState<AnimeSearchFilters>({});

	// Initialize from initialParams if provided
	useEffect(() => {
		if (initialParams) {
			// Set search query
			if (initialParams.q) {
				setSearchQuery(initialParams.q);
				setDebouncedQuery(initialParams.q);
			}

			// Set filters
			const newFilters: AnimeSearchFilters = {};

			if (initialParams.genres) {
				newFilters.genres = initialParams.genres.split(",").map(Number);
			}

			if (initialParams.type) {
				newFilters.type = initialParams.type as any;
			}

			if (initialParams.status) {
				newFilters.status = initialParams.status as any;
			}

			if (initialParams.rating) {
				newFilters.rating = initialParams.rating as any;
			}

			if (initialParams.min_score) {
				newFilters.min_score = Number(initialParams.min_score);
			}

			if (initialParams.max_score) {
				newFilters.max_score = Number(initialParams.max_score);
			}

			if (initialParams.order_by) {
				newFilters.order_by = initialParams.order_by as any;
			}

			if (initialParams.sort) {
				newFilters.sort = initialParams.sort as any;
			}

			if (Object.keys(newFilters).length > 0) {
				setFilters(newFilters);
			}
		}
	}, [initialParams]);

	// Debounce search query
	useEffect(() => {
		setIsDebouncing(true);
		const handler = setTimeout(() => {
			setDebouncedQuery(searchQuery);
			setIsDebouncing(false);
			// Reset to page 1 when search query changes
			setPage(1);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [searchQuery]);

	const {
		data: searchResults,
		isLoading,
		isFetching,
	} = useAnimeSearch(debouncedQuery, page, debouncedQuery.length > 0, filters);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	const handleSearchClick = () => {
		setDebouncedQuery(searchQuery);
		setPage(1);
		setIsDebouncing(false);
	};

	const handleFilterChange = (newFilters: AnimeSearchFilters) => {
		setFilters(newFilters);
		setPage(1);
	};

	const handleClearFilters = () => {
		setFilters({});
	};

	const goToNextPage = () => {
		if (searchResults?.pagination?.has_next_page) {
			setPage((prev) => prev + 1);
		}
	};

	const goToPrevPage = () => {
		if (page > 1) {
			setPage((prev) => prev - 1);
		}
	};

	const isSearching = isLoading || isFetching;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearchClick();
	};

	const hasActiveFilters = Object.keys(filters).length > 0;

	return (
		<SearchContainer>
			<SearchHeader>
				<PageTitle>Search Anime</PageTitle>
				<SearchForm onSubmit={handleSubmit}>
					<SearchInputContainer>
						<InputIcon color={theme.colors.textSecondary}>
							<Search size={20} />
						</InputIcon>
						<SearchInput
							placeholder="Search by anime title..."
							value={searchQuery}
							onChange={handleSearchChange}
							theme={theme}
						/>
						{isDebouncing && (
							<LoadingIcon color={theme.colors.primary}>
								<Loader size={18} />
							</LoadingIcon>
						)}
						{searchQuery && !isDebouncing && (
							<ClearButton
								onClick={clearSearch}
								color={theme.colors.textSecondary}
								aria-label="Clear search"
								type="button"
							>
								<X size={18} />
							</ClearButton>
						)}
					</SearchInputContainer>
					<StyledButton
						variant="primary"
						onClick={handleSearchClick}
						disabled={isSearching || searchQuery.trim().length === 0}
						type="submit"
					>
						Search
					</StyledButton>
				</SearchForm>
			</SearchHeader>

			<SearchFilters
				theme={theme}
				onFilterChange={handleFilterChange}
				onClearFilters={handleClearFilters}
				currentFilters={filters}
			/>

			{isSearching ? (
				<SearchMessage color={theme.colors.textSecondary}>
					Searching...
				</SearchMessage>
			) : !debouncedQuery ? (
				<InitialSearchState theme={theme}>
					<SearchIcon>
						<Search size={48} />
					</SearchIcon>
					<SearchTitle>Discover Anime</SearchTitle>
					<SearchDescription>
						Type in the search box to find anime by title. Use filters to refine
						your results.
					</SearchDescription>
					{hasActiveFilters && (
						<ActiveFiltersNote theme={theme}>
							<Filter size={16} />
							<span>Filters are active. Search to see filtered results.</span>
						</ActiveFiltersNote>
					)}
				</InitialSearchState>
			) : searchResults?.data?.length === 0 ? (
				<NoResultsState theme={theme}>
					<SearchIcon>
						<Info size={48} />
					</SearchIcon>
					<SearchTitle>No Results Found</SearchTitle>
					<SearchDescription>
						No anime found matching "{debouncedQuery}". Try different keywords
						or adjust your filters.
					</SearchDescription>
					{hasActiveFilters && (
						<Button variant="outline" onClick={handleClearFilters}>
							Clear Filters
						</Button>
					)}
				</NoResultsState>
			) : (
				<>
					<ResultsHeader>
						<ResultsCount color={theme.colors.textSecondary}>
							{searchResults?.pagination?.items?.total} results for "
							{debouncedQuery}"
						</ResultsCount>
						<ViewToggle currentView={viewMode} onViewChange={setViewMode} />
					</ResultsHeader>

					{viewMode === "grid" ? (
						<ResultsGrid>
							{searchResults?.data.map((anime) => (
								<AnimeCard
									key={anime.mal_id}
									anime={anime}
									onClick={() => onAnimeSelect(anime.mal_id)}
								/>
							))}
						</ResultsGrid>
					) : (
						<ResultsList>
							{searchResults?.data.map((anime) => (
								<AnimeListCard
									key={anime.mal_id}
									anime={anime}
									onClick={() => onAnimeSelect(anime.mal_id)}
								/>
							))}
						</ResultsList>
					)}

					{searchResults && searchResults.pagination && (
						<PaginationContainer>
							<Button
								variant="outline"
								onClick={goToPrevPage}
								disabled={page <= 1}
							>
								Previous
							</Button>

							<PageInfo>
								Page {page} of {searchResults.pagination.last_visible_page}
							</PageInfo>

							<Button
								variant="outline"
								onClick={goToNextPage}
								disabled={!searchResults.pagination.has_next_page}
							>
								Next
							</Button>
						</PaginationContainer>
					)}
				</>
			)}
		</SearchContainer>
	);
}
