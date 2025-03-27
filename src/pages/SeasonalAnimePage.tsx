import { useState, useEffect, ChangeEvent } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { motion } from "framer-motion";
import { AnimeCard } from "../components/AnimeCard";
import { Button } from "../components/ui/Button";
import { useSeasonalAnime } from "../hooks/useAnime";
import { Card } from "../components/ui/Card";
import { AppTheme } from "../themes/themeTypes";
import {
	Sun,
	Cloud,
	CloudSun,
	Leaf,
	ChevronLeft,
	ChevronRight,
	Calendar,
	Loader2,
	Filter,
	List,
	Grid,
	Clock,
	LayoutTemplate,
	LayoutList,
} from "lucide-react";
import { SearchInput } from "../components/ui/SearchInput";
import AnimeScheduleView from "../components/AnimeScheduleView";

interface SeasonalAnimePageProps {
	onAnimeSelect: (id: number) => void;
}

// Types for season and year selection
type Season = "winter" | "spring" | "summer" | "fall";
type ViewMode = "grid" | "list" | "schedule";
type ScheduleLayout = "vertical" | "horizontal" | "timeline";

// Helper function to get the current season
const getCurrentSeason = (): Season => {
	const month = new Date().getMonth();
	if (month >= 0 && month <= 2) return "winter";
	if (month >= 3 && month <= 5) return "spring";
	if (month >= 6 && month <= 8) return "summer";
	return "fall";
};

// Helper function to get season icon
const getSeasonIcon = (season: Season, size = 24) => {
	switch (season) {
		case "winter":
			return <Cloud size={size} />;
		case "spring":
			return <Leaf size={size} />;
		case "summer":
			return <Sun size={size} />;
		case "fall":
			return <CloudSun size={size} />;
	}
};

// Styled components
const Container = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 16px;
`;

const Header = styled.div`
	margin-bottom: 24px;
	display: flex;
	flex-direction: column;
`;

const Title = styled.h1`
	font-size: 28px;
	font-weight: 700;
	margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
	font-size: 16px;
	color: ${(props) => props.color};
	margin: 0;
`;

const ControlsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 24px 0;
	flex-wrap: wrap;
	gap: 16px;
`;

const SeasonSelector = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const YearDisplay = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 18px;
	font-weight: 600;
`;

const SeasonButton = styled(Button)<{ isActive: boolean }>`
	position: relative;
	overflow: hidden;

	${(props) =>
		props.isActive &&
		`
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: currentColor;
      border-radius: 3px 3px 0 0;
    }
  `}
`;

const YearButton = styled(Button)`
	padding: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ViewControls = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const FilterSection = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 20px;
	flex-wrap: wrap;
`;

const SearchContainer = styled.div`
	min-width: 280px;
	flex: 1;
	max-width: 400px;
`;

const AnimeGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 24px;
	margin-top: 24px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 16px;
	}
`;

const AnimeList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-top: 24px;
`;

const AnimeListItem = styled(Card)`
	display: flex;
	gap: 16px;
	padding: 16px;
	cursor: pointer;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-2px);
	}
`;

const AnimeImage = styled.img`
	width: 80px;
	height: 120px;
	object-fit: cover;
	border-radius: 4px;
`;

const AnimeInfo = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
`;

const AnimeTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 18px;
	font-weight: 600;
`;

const AnimeDetails = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 8px;
	font-size: 14px;
	color: ${(props) => props.color};
`;

const AnimeSynopsis = styled.p`
	margin: 0;
	font-size: 14px;
	color: ${(props) => props.color};
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const Detail = styled.span`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 300px;
`;

const EmptyStateCard = styled(Card)`
	padding: 32px;
	text-align: center;
	margin-top: 24px;
`;

const EmptyStateIcon = styled.div`
	margin: 0 auto 16px;
	width: 64px;
	height: 64px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const EmptyStateTitle = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
	font-size: 16px;
	margin: 0 0 24px 0;
	max-width: 500px;
	margin-left: auto;
	margin-right: auto;
`;

const ScheduleControls = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-bottom: 16px;
`;

const LayoutToggle = styled.div`
	display: flex;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid #eaeaea;
`;

const LayoutButton = styled.button<{ isActive: boolean; theme: AppTheme }>`
	padding: 8px 12px;
	display: flex;
	align-items: center;
	gap: 6px;
	background-color: ${(props) =>
		props.isActive ? props.theme.colors.primary : "transparent"};
	color: ${(props) => (props.isActive ? "white" : props.theme.colors.text)};
	border: none;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			props.isActive
				? props.theme.colors.primary
				: props.theme.colors.background};
	}
`;

export function SeasonalAnimePage({ onAnimeSelect }: SeasonalAnimePageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// State for current year and season
	const [year, setYear] = useState(new Date().getFullYear());
	const [season, setSeason] = useState<Season>(getCurrentSeason());
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [scheduleLayout, setScheduleLayout] =
		useState<ScheduleLayout>("horizontal");
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch seasonal anime data
	const {
		data: seasonalData,
		isLoading,
		error,
		refetch,
	} = useSeasonalAnime(year, season);

	// Filter anime based on search query
	const filteredAnime =
		seasonalData?.data?.filter(
			(anime) =>
				anime.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				anime.title_english?.toLowerCase()?.includes(searchQuery.toLowerCase())
		) || [];

	// Change season
	const changeSeason = (newSeason: Season) => {
		setSeason(newSeason);
		setSearchQuery("");
	};

	// Change year
	const changeYear = (delta: number) => {
		setYear((prevYear) => prevYear + delta);
		setSearchQuery("");
	};

	// Format season for display
	const formatSeason = (s: Season) => {
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	// Correctly handle search input change
	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	// Loading state
	if (isLoading) {
		return (
			<LoadingContainer>
				<motion.div
					animate={{
						rotate: 360,
						transition: { duration: 1, repeat: Infinity, ease: "linear" },
					}}
				>
					<Loader2 size={48} color={theme.colors.primary} />
				</motion.div>
			</LoadingContainer>
		);
	}

	// Error state
	if (error) {
		return (
			<EmptyStateCard>
				<EmptyStateIcon
					style={{
						backgroundColor: `${theme.colors.error}20`,
						color: theme.colors.error,
					}}
				>
					<Calendar size={32} />
				</EmptyStateIcon>
				<EmptyStateTitle>Error loading seasonal anime</EmptyStateTitle>
				<EmptyStateText style={{ color: theme.colors.textSecondary }}>
					We encountered an error while trying to get the seasonal anime. Please
					try again later.
				</EmptyStateText>
				<Button variant="primary" onClick={() => refetch()}>
					Try Again
				</Button>
			</EmptyStateCard>
		);
	}

	// Empty state
	if (!seasonalData?.data || seasonalData.data.length === 0) {
		return (
			<Container>
				<Header>
					<Title>Seasonal Anime</Title>
					<Subtitle color={theme.colors.textSecondary}>
						Explore anime by season
					</Subtitle>
				</Header>

				<ControlsContainer>
					<SeasonSelector>
						<YearButton variant="outline" onClick={() => changeYear(-1)}>
							<ChevronLeft size={18} />
						</YearButton>

						<YearDisplay>
							<Calendar size={18} color={theme.colors.primary} />
							{year}
						</YearDisplay>

						<YearButton variant="outline" onClick={() => changeYear(1)}>
							<ChevronRight size={18} />
						</YearButton>

						{["winter", "spring", "summer", "fall"].map((s) => (
							<SeasonButton
								key={s}
								variant="outline"
								isActive={season === s}
								onClick={() => changeSeason(s as Season)}
								icon={getSeasonIcon(s as Season, 16)}
							>
								{formatSeason(s as Season)}
							</SeasonButton>
						))}
					</SeasonSelector>
				</ControlsContainer>

				<EmptyStateCard>
					<EmptyStateIcon
						style={{
							backgroundColor: `${theme.colors.primary}20`,
							color: theme.colors.primary,
						}}
					>
						<Calendar size={32} />
					</EmptyStateIcon>
					<EmptyStateTitle>No anime found for this season</EmptyStateTitle>
					<EmptyStateText style={{ color: theme.colors.textSecondary }}>
						There are no anime available for {formatSeason(season)} {year}. Try
						a different season or year.
					</EmptyStateText>
				</EmptyStateCard>
			</Container>
		);
	}

	// Empty search results
	if (searchQuery && filteredAnime.length === 0) {
		return (
			<Container>
				<Header>
					<Title>Seasonal Anime</Title>
					<Subtitle color={theme.colors.textSecondary}>
						Explore anime by season
					</Subtitle>
				</Header>

				<ControlsContainer>
					<SeasonSelector>
						<YearButton variant="outline" onClick={() => changeYear(-1)}>
							<ChevronLeft size={18} />
						</YearButton>

						<YearDisplay>
							<Calendar size={18} color={theme.colors.primary} />
							{year}
						</YearDisplay>

						<YearButton variant="outline" onClick={() => changeYear(1)}>
							<ChevronRight size={18} />
						</YearButton>

						{["winter", "spring", "summer", "fall"].map((s) => (
							<SeasonButton
								key={s}
								variant="outline"
								isActive={season === s}
								onClick={() => changeSeason(s as Season)}
								icon={getSeasonIcon(s as Season, 16)}
							>
								{formatSeason(s as Season)}
							</SeasonButton>
						))}
					</SeasonSelector>

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
						<Button
							variant={viewMode === "schedule" ? "primary" : "outline"}
							onClick={() => setViewMode("schedule")}
							size="small"
							icon={<Clock size={16} />}
						>
							Schedule
						</Button>
					</ViewControls>
				</ControlsContainer>

				<FilterSection>
					<SearchContainer>
						<SearchInput
							value={searchQuery}
							onChange={handleSearchChange}
							placeholder="Search anime by title..."
							debounceMs={300}
						/>
					</SearchContainer>
				</FilterSection>

				<EmptyStateCard>
					<EmptyStateIcon
						style={{
							backgroundColor: `${theme.colors.primary}20`,
							color: theme.colors.primary,
						}}
					>
						<Filter size={32} />
					</EmptyStateIcon>
					<EmptyStateTitle>No results found</EmptyStateTitle>
					<EmptyStateText style={{ color: theme.colors.textSecondary }}>
						No anime matching "{searchQuery}" found in {formatSeason(season)}{" "}
						{year}. Try a different search term or clear the search.
					</EmptyStateText>
					<Button variant="outline" onClick={() => setSearchQuery("")}>
						Clear Search
					</Button>
				</EmptyStateCard>
			</Container>
		);
	}

	return (
		<Container>
			<Header>
				<Title>Seasonal Anime</Title>
				<Subtitle color={theme.colors.textSecondary}>
					Explore anime by season
				</Subtitle>
			</Header>

			<ControlsContainer>
				<SeasonSelector>
					<YearButton variant="outline" onClick={() => changeYear(-1)}>
						<ChevronLeft size={18} />
					</YearButton>

					<YearDisplay>
						<Calendar size={18} color={theme.colors.primary} />
						{year}
					</YearDisplay>

					<YearButton variant="outline" onClick={() => changeYear(1)}>
						<ChevronRight size={18} />
					</YearButton>

					{["winter", "spring", "summer", "fall"].map((s) => (
						<SeasonButton
							key={s}
							variant="outline"
							isActive={season === s}
							onClick={() => changeSeason(s as Season)}
							icon={getSeasonIcon(s as Season, 16)}
						>
							{formatSeason(s as Season)}
						</SeasonButton>
					))}
				</SeasonSelector>

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
					<Button
						variant={viewMode === "schedule" ? "primary" : "outline"}
						onClick={() => setViewMode("schedule")}
						size="small"
						icon={<Clock size={16} />}
					>
						Schedule
					</Button>
				</ViewControls>
			</ControlsContainer>

			{viewMode === "schedule" && (
				<ScheduleControls>
					<LayoutToggle>
						<LayoutButton
							isActive={scheduleLayout === "horizontal"}
							onClick={() => setScheduleLayout("horizontal")}
							theme={theme}
						>
							<LayoutTemplate size={14} />
							Tabs
						</LayoutButton>
						<LayoutButton
							isActive={scheduleLayout === "vertical"}
							onClick={() => setScheduleLayout("vertical")}
							theme={theme}
						>
							<LayoutList size={14} />
							Accordion
						</LayoutButton>
						<LayoutButton
							isActive={scheduleLayout === "timeline"}
							onClick={() => setScheduleLayout("timeline")}
							theme={theme}
						>
							<Clock size={14} />
							Timeline
						</LayoutButton>
					</LayoutToggle>
				</ScheduleControls>
			)}

			{viewMode !== "schedule" && (
				<FilterSection>
					<SearchContainer>
						<SearchInput
							value={searchQuery}
							onChange={handleSearchChange}
							placeholder="Search anime by title..."
							debounceMs={300}
						/>
					</SearchContainer>
				</FilterSection>
			)}

			{viewMode === "grid" && (
				<AnimeGrid>
					{filteredAnime.map((anime) => (
						<motion.div
							key={anime.mal_id}
							whileHover={{ y: -5 }}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<AnimeCard
								anime={anime}
								onClick={() => onAnimeSelect(anime.mal_id)}
							/>
						</motion.div>
					))}
				</AnimeGrid>
			)}

			{viewMode === "list" && (
				<AnimeList>
					{filteredAnime.map((anime) => (
						<motion.div
							key={anime.mal_id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<AnimeListItem onClick={() => onAnimeSelect(anime.mal_id)}>
								<AnimeImage
									src={anime.images.jpg.image_url}
									alt={anime.title}
								/>
								<AnimeInfo>
									<AnimeTitle>{anime.title}</AnimeTitle>
									<AnimeDetails color={theme.colors.textSecondary}>
										{anime.score && <Detail>⭐ {anime.score}</Detail>}
										{anime.type && <Detail>{anime.type}</Detail>}
										{anime.episodes && (
											<Detail>{anime.episodes} episodes</Detail>
										)}
									</AnimeDetails>
									{anime.synopsis && (
										<AnimeSynopsis color={theme.colors.textSecondary}>
											{anime.synopsis}
										</AnimeSynopsis>
									)}
								</AnimeInfo>
							</AnimeListItem>
						</motion.div>
					))}
				</AnimeList>
			)}

			{viewMode === "schedule" && (
				<AnimeScheduleView
					animeList={filteredAnime}
					onAnimeSelect={onAnimeSelect}
					theme={theme}
					layoutMode={scheduleLayout}
				/>
			)}
		</Container>
	);
}
