import React, { useState } from "react";
import styled from "@emotion/styled";
import { AppTheme } from "../themes/themeTypes";
import { Button } from "./ui/Button";
import {
	ANIME_GENRES,
	ANIME_TYPES,
	ANIME_STATUS,
	ANIME_RATINGS,
	ANIME_SORT_OPTIONS,
} from "../types/anime";
import { AnimeSearchFilters } from "../hooks/useAnime";
import {
	ChevronDown,
	ChevronUp,
	X,
	Filter,
	SortDesc,
	SortAsc,
} from "lucide-react";

interface SearchFiltersProps {
	theme: AppTheme;
	onFilterChange: (filters: AnimeSearchFilters) => void;
	onClearFilters: () => void;
	currentFilters: AnimeSearchFilters;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
	theme,
	onFilterChange,
	onClearFilters,
	currentFilters,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedGenres, setSelectedGenres] = useState<number[]>(
		currentFilters.genres || []
	);
	const [selectedType, setSelectedType] = useState<string | undefined>(
		currentFilters.type
	);
	const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
		currentFilters.status
	);
	const [selectedRating, setSelectedRating] = useState<string | undefined>(
		currentFilters.rating
	);
	const [minScore, setMinScore] = useState<number | undefined>(
		currentFilters.min_score
	);
	const [sortBy, setSortBy] = useState<string | undefined>(
		currentFilters.order_by
	);
	const [sortDirection, setSortDirection] = useState<"desc" | "asc">(
		currentFilters.sort || "desc"
	);

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	const toggleGenre = (genreId: number) => {
		if (selectedGenres.includes(genreId)) {
			setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
		} else {
			setSelectedGenres([...selectedGenres, genreId]);
		}
	};

	const handleApplyFilters = () => {
		const filters: AnimeSearchFilters = {
			...(selectedGenres.length > 0 && { genres: selectedGenres }),
			...(selectedType && { type: selectedType as any }),
			...(selectedStatus && { status: selectedStatus as any }),
			...(selectedRating && { rating: selectedRating as any }),
			...(minScore !== undefined && { min_score: minScore }),
			...(sortBy && { order_by: sortBy as any }),
			sort: sortDirection,
		};

		onFilterChange(filters);
	};

	const handleClearAll = () => {
		setSelectedGenres([]);
		setSelectedType(undefined);
		setSelectedStatus(undefined);
		setSelectedRating(undefined);
		setMinScore(undefined);
		setSortBy(undefined);
		setSortDirection("desc");
		onClearFilters();
	};

	const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		setMinScore(isNaN(value) ? undefined : value);
	};

	const toggleSortDirection = () => {
		setSortDirection(sortDirection === "desc" ? "asc" : "desc");
	};

	const hasActiveFilters = (): boolean => {
		return (
			selectedGenres.length > 0 ||
			!!selectedType ||
			!!selectedStatus ||
			!!selectedRating ||
			minScore !== undefined ||
			!!sortBy
		);
	};

	return (
		<FiltersContainer theme={theme}>
			<FiltersHeader onClick={toggleExpand}>
				<FiltersTitle>
					<Filter size={16} />
					Filters
					{hasActiveFilters() && (
						<ActiveFiltersBadge theme={theme}>
							{selectedGenres.length +
								(selectedType ? 1 : 0) +
								(selectedStatus ? 1 : 0) +
								(selectedRating ? 1 : 0) +
								(minScore !== undefined ? 1 : 0)}
						</ActiveFiltersBadge>
					)}
				</FiltersTitle>
				{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
			</FiltersHeader>

			{isExpanded && (
				<FiltersContent>
					<FilterSection>
						<FilterSectionTitle>Sort By</FilterSectionTitle>
						<SortContainer>
							<SortSelect
								value={sortBy || ""}
								onChange={(e) => setSortBy(e.target.value || undefined)}
								theme={theme}
							>
								<option value="">Default</option>
								{ANIME_SORT_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</SortSelect>
							<SortDirectionButton onClick={toggleSortDirection} theme={theme}>
								{sortDirection === "desc" ? (
									<SortDesc size={18} />
								) : (
									<SortAsc size={18} />
								)}
							</SortDirectionButton>
						</SortContainer>
					</FilterSection>

					<FilterSection>
						<FilterSectionTitle>Type</FilterSectionTitle>
						<FilterButtonsContainer>
							<FilterButton
								isActive={!selectedType}
								onClick={() => setSelectedType(undefined)}
								theme={theme}
							>
								All
							</FilterButton>
							{ANIME_TYPES.map((type) => (
								<FilterButton
									key={type.value}
									isActive={selectedType === type.value}
									onClick={() => setSelectedType(type.value)}
									theme={theme}
								>
									{type.label}
								</FilterButton>
							))}
						</FilterButtonsContainer>
					</FilterSection>

					<FilterSection>
						<FilterSectionTitle>Status</FilterSectionTitle>
						<FilterButtonsContainer>
							<FilterButton
								isActive={!selectedStatus}
								onClick={() => setSelectedStatus(undefined)}
								theme={theme}
							>
								All
							</FilterButton>
							{ANIME_STATUS.map((status) => (
								<FilterButton
									key={status.value}
									isActive={selectedStatus === status.value}
									onClick={() => setSelectedStatus(status.value)}
									theme={theme}
								>
									{status.label}
								</FilterButton>
							))}
						</FilterButtonsContainer>
					</FilterSection>

					<FilterSection>
						<FilterSectionTitle>Rating</FilterSectionTitle>
						<FilterButtonsContainer>
							<FilterButton
								isActive={!selectedRating}
								onClick={() => setSelectedRating(undefined)}
								theme={theme}
							>
								All
							</FilterButton>
							{ANIME_RATINGS.map((rating) => (
								<FilterButton
									key={rating.value}
									isActive={selectedRating === rating.value}
									onClick={() => setSelectedRating(rating.value)}
									theme={theme}
								>
									{rating.label}
								</FilterButton>
							))}
						</FilterButtonsContainer>
					</FilterSection>

					<FilterSection>
						<FilterSectionTitle>Minimum Score</FilterSectionTitle>
						<ScoreFilterContainer>
							<ScoreInput
								type="number"
								min="0"
								max="10"
								step="0.1"
								value={minScore !== undefined ? minScore : ""}
								onChange={handleMinScoreChange}
								placeholder="Any score"
								theme={theme}
							/>
							{minScore !== undefined && (
								<ClearButton
									onClick={() => setMinScore(undefined)}
									theme={theme}
								>
									<X size={16} />
								</ClearButton>
							)}
						</ScoreFilterContainer>
					</FilterSection>

					<FilterSection>
						<FilterSectionTitle>Genres</FilterSectionTitle>
						<GenreGrid>
							{ANIME_GENRES.map((genre) => (
								<GenreTag
									key={genre.mal_id}
									isSelected={selectedGenres.includes(genre.mal_id)}
									onClick={() => toggleGenre(genre.mal_id)}
									theme={theme}
								>
									{genre.name}
								</GenreTag>
							))}
						</GenreGrid>
					</FilterSection>

					<FilterActionButtons>
						<Button
							variant="outline"
							onClick={handleClearAll}
							disabled={!hasActiveFilters()}
						>
							Clear All
						</Button>
						<Button variant="primary" onClick={handleApplyFilters}>
							Apply Filters
						</Button>
					</FilterActionButtons>
				</FiltersContent>
			)}
		</FiltersContainer>
	);
};

const FiltersContainer = styled.div<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 8px;
	margin-bottom: 20px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid ${(props) => `${props.theme.colors.primary}20`};
	overflow: hidden;
`;

const FiltersHeader = styled.div`
	padding: 14px 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	user-select: none;
`;

const FiltersTitle = styled.div`
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ActiveFiltersBadge = styled.span<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.primary};
	color: white;
	font-size: 12px;
	font-weight: 500;
	padding: 2px 6px;
	border-radius: 12px;
	margin-left: 8px;
`;

const FiltersContent = styled.div`
	padding: 12px 16px;
`;

const FilterSection = styled.div`
	margin-bottom: 20px;
`;

const FilterSectionTitle = styled.h4`
	font-size: 15px;
	font-weight: 600;
	margin: 0 0 10px 0;
`;

const FilterButtonsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const FilterButton = styled.button<{ isActive: boolean; theme: AppTheme }>`
	padding: 6px 12px;
	border-radius: 6px;
	border: 1px solid
		${(props) => (props.isActive ? props.theme.colors.primary : "#e0e0e0")};
	background-color: ${(props) =>
		props.isActive ? `${props.theme.colors.primary}15` : "transparent"};
	color: ${(props) =>
		props.isActive ? props.theme.colors.primary : props.theme.colors.text};
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			props.isActive ? `${props.theme.colors.primary}20` : "#f5f5f5"};
	}
`;

const GenreGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 8px;
`;

const GenreTag = styled.div<{ isSelected: boolean; theme: AppTheme }>`
	padding: 6px 10px;
	border-radius: 4px;
	background-color: ${(props) =>
		props.isSelected ? props.theme.colors.primary : "#f5f5f5"};
	color: ${(props) => (props.isSelected ? "white" : props.theme.colors.text)};
	font-size: 13px;
	text-align: center;
	cursor: pointer;
	transition: all 0.2s ease;
	user-select: none;

	&:hover {
		background-color: ${(props) =>
			props.isSelected ? props.theme.colors.primary : "#e0e0e0"};
	}
`;

const ScoreFilterContainer = styled.div`
	position: relative;
	width: 100%;
	max-width: 120px;
`;

const ScoreInput = styled.input<{ theme: AppTheme }>`
	width: 100%;
	padding: 8px 16px 8px 12px;
	border-radius: 4px;
	border: 1px solid #e0e0e0;
	font-size: 14px;
	outline: none;

	&:focus {
		border-color: ${(props) => props.theme.colors.primary};
	}
`;

const ClearButton = styled.button<{ theme: AppTheme }>`
	position: absolute;
	right: 8px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	color: ${(props) => props.theme.colors.textSecondary};
	display: flex;
	align-items: center;
	justify-content: center;
`;

const FilterActionButtons = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: 16px;
`;

const SortContainer = styled.div`
	display: flex;
	gap: 8px;
`;

const SortSelect = styled.select<{ theme: AppTheme }>`
	padding: 8px 12px;
	border-radius: 4px;
	border: 1px solid #e0e0e0;
	background-color: white;
	font-size: 14px;
	outline: none;
	flex-grow: 1;

	&:focus {
		border-color: ${(props) => props.theme.colors.primary};
	}
`;

const SortDirectionButton = styled.button<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 8px;
	background-color: #f5f5f5;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.text};
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => `${props.theme.colors.primary}10`};
	}
`;
