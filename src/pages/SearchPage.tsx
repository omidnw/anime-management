import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useAnimeSearch } from "../hooks/useAnime";
import { Button } from "../components/ui/Button";
import { AnimeCard } from "../components/AnimeCard";
import { AnimeListCard } from "../components/AnimeListCard";
import { ViewToggle, ViewMode } from "../components/ViewToggle";
import { Search, X, Loader } from "lucide-react";

interface SearchPageProps {
	onAnimeSelect: (animeId: number) => void;
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

export function SearchPage({ onAnimeSelect }: SearchPageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [page, setPage] = useState(1);
	const [isDebouncing, setIsDebouncing] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
	} = useAnimeSearch(debouncedQuery, page, debouncedQuery.length > 0);

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

			{isSearching ? (
				<SearchMessage color={theme.colors.textSecondary}>
					Searching...
				</SearchMessage>
			) : !debouncedQuery ? (
				<SearchMessage color={theme.colors.textSecondary}>
					Enter a search term to find anime
				</SearchMessage>
			) : searchResults?.data?.length === 0 ? (
				<SearchMessage color={theme.colors.textSecondary}>
					No results found for "{debouncedQuery}"
				</SearchMessage>
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
