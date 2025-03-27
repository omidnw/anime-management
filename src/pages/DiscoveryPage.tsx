import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { TrendingAnimeSection } from "../components/TrendingAnimeSection";
import { Calendar, Compass, Filter, TrendingUp } from "lucide-react";
import { SearchInput } from "../components/ui/SearchInput";
import { Button } from "../components/ui/Button";
import { ANIME_GENRES } from "../types/anime";

interface DiscoveryPageProps {
	onAnimeSelect: (animeId: number) => void;
	onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export function DiscoveryPage({
	onAnimeSelect,
	onNavigate,
}: DiscoveryPageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [searchQuery, setSearchQuery] = useState("");
	const [activeGenres, setActiveGenres] = useState<number[]>([]);

	const handleSearch = () => {
		if (searchQuery.trim() && onNavigate) {
			onNavigate("search", { q: searchQuery.trim() });
		}
	};

	const toggleGenre = (genreId: number) => {
		if (activeGenres.includes(genreId)) {
			setActiveGenres(activeGenres.filter((id) => id !== genreId));
		} else {
			setActiveGenres([...activeGenres, genreId]);
		}
	};

	const navigateToSearch = () => {
		if (!onNavigate) return;

		const params: Record<string, string> = {};

		if (searchQuery) {
			params.q = searchQuery;
		}

		if (activeGenres.length > 0) {
			params.genres = activeGenres.join(",");
		}

		onNavigate("search", params);
	};

	const navigateToSeasonal = () => {
		if (onNavigate) {
			onNavigate("seasonal");
		}
	};

	const navigateToTrending = () => {
		if (onNavigate) {
			onNavigate("trending");
		}
	};

	// Get popular genres for quick access
	const popularGenres = ANIME_GENRES.slice(0, 12);

	return (
		<PageContainer>
			<HeroSection theme={theme}>
				<HeroContent>
					<HeroTitle>Discover Your Next Favorite Anime</HeroTitle>
					<HeroDescription>
						Browse trending anime, explore by genre, or find current seasonal
						shows
					</HeroDescription>

					<SearchContainer>
						<SearchInput
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onSearch={handleSearch}
							placeholder="Search for anime..."
							autoFocus={false}
						/>
					</SearchContainer>

					<QuickFilters>
						<FilterLabel theme={theme}>
							<Filter size={16} />
							Quick Genre Filters:
						</FilterLabel>
						<GenreTags>
							{popularGenres.map((genre) => (
								<GenreTag
									key={genre.mal_id}
									isActive={activeGenres.includes(genre.mal_id)}
									onClick={() => toggleGenre(genre.mal_id)}
									theme={theme}
								>
									{genre.name}
								</GenreTag>
							))}
						</GenreTags>
						{activeGenres.length > 0 && (
							<Button variant="outline" size="small" onClick={navigateToSearch}>
								Search with Filters
							</Button>
						)}
					</QuickFilters>
				</HeroContent>
			</HeroSection>

			<ContentSection>
				<FeaturedSection>
					<SectionHeader>
						<SectionTitle theme={theme}>
							<Compass size={22} />
							<span>Anime Discovery</span>
						</SectionTitle>
					</SectionHeader>

					<FeatureCards>
						<FeatureCard
							theme={theme}
							onClick={navigateToSearch}
							icon={<TrendingUp size={24} />}
							title="Top Anime"
							description="Discover the highest rated anime of all time"
						/>
						<FeatureCard
							theme={theme}
							onClick={navigateToSeasonal}
							icon={<Calendar size={24} />}
							title="Seasonal Anime"
							description="Explore currently airing and upcoming anime"
						/>
					</FeatureCards>
				</FeaturedSection>

				<TrendingAnimeSection
					onAnimeSelect={onAnimeSelect}
					theme={theme}
					limit={12}
					showViewAll={true}
					onViewAllClick={navigateToTrending}
				/>

				<RecommendedSection>
					<SectionHeader>
						<SectionTitle theme={theme}>
							<Compass size={22} />
							<span>Continue Discovering</span>
						</SectionTitle>
					</SectionHeader>

					<GenreExploreGrid>
						{ANIME_GENRES.slice(0, 8).map((genre) => (
							<GenreExploreCard
								key={genre.mal_id}
								theme={theme}
								onClick={() => {
									if (onNavigate) {
										onNavigate("search", { genres: genre.mal_id.toString() });
									}
								}}
							>
								<GenreCardTitle>{genre.name}</GenreCardTitle>
								<GenreCardDescription>
									Explore {genre.name} anime
								</GenreCardDescription>
							</GenreExploreCard>
						))}
					</GenreExploreGrid>
				</RecommendedSection>
			</ContentSection>
		</PageContainer>
	);
}

interface FeatureCardProps {
	theme: any;
	onClick: () => void;
	icon: React.ReactNode;
	title: string;
	description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	theme,
	onClick,
	icon,
	title,
	description,
}) => {
	return (
		<FeatureCardContainer onClick={onClick} theme={theme}>
			<FeatureCardIcon theme={theme}>{icon}</FeatureCardIcon>
			<FeatureCardContent>
				<FeatureCardTitle>{title}</FeatureCardTitle>
				<FeatureCardDescription>{description}</FeatureCardDescription>
			</FeatureCardContent>
		</FeatureCardContainer>
	);
};

const PageContainer = styled.div`
	max-width: 1200px;
	margin: 0 auto;
`;

const HeroSection = styled.section<{ theme: any }>`
	background-color: ${(props) => `${props.theme.colors.primary}10`};
	border-radius: 12px;
	padding: 40px 30px;
	margin-bottom: 40px;
	background-image: linear-gradient(
		135deg,
		${(props) => `${props.theme.colors.primary}15`} 0%,
		${(props) => `${props.theme.colors.primary}05`} 100%
	);
`;

const HeroContent = styled.div`
	max-width: 800px;
	margin: 0 auto;
`;

const HeroTitle = styled.h1`
	font-size: 32px;
	font-weight: 700;
	margin: 0 0 16px 0;
	text-align: center;
`;

const HeroDescription = styled.p`
	font-size: 18px;
	text-align: center;
	margin: 0 0 30px 0;
	opacity: 0.8;
`;

const SearchContainer = styled.div`
	margin-bottom: 24px;
`;

const QuickFilters = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
`;

const FilterLabel = styled.div<{ theme: any }>`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	color: ${(props) => props.theme.colors.textSecondary};
	margin-bottom: 4px;
`;

const GenreTags = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 8px;
	margin-bottom: 16px;
`;

const GenreTag = styled.button<{ isActive: boolean; theme: any }>`
	padding: 6px 12px;
	border-radius: 20px;
	border: 1px solid
		${(props) =>
			props.isActive ? props.theme.colors.primary : "rgba(0, 0, 0, 0.1)"};
	background-color: ${(props) =>
		props.isActive ? `${props.theme.colors.primary}15` : "transparent"};
	color: ${(props) =>
		props.isActive ? props.theme.colors.primary : props.theme.colors.text};
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			props.isActive
				? `${props.theme.colors.primary}20`
				: "rgba(0, 0, 0, 0.05)"};
	}
`;

const ContentSection = styled.div`
	padding: 0 16px;
`;

const FeaturedSection = styled.section`
	margin-bottom: 40px;
`;

const SectionHeader = styled.div`
	margin-bottom: 24px;
`;

const SectionTitle = styled.h2<{ theme: any }>`
	font-size: 24px;
	font-weight: 600;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 10px;

	svg {
		color: ${(props) => props.theme.colors.primary};
	}
`;

const FeatureCards = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 20px;
`;

const FeatureCardContainer = styled.div<{ theme: any }>`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 20px;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
	}
`;

const FeatureCardIcon = styled.div<{ theme: any }>`
	width: 50px;
	height: 50px;
	border-radius: 12px;
	background-color: ${(props) => `${props.theme.colors.primary}15`};
	color: ${(props) => props.theme.colors.primary};
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
`;

const FeatureCardContent = styled.div`
	display: flex;
	flex-direction: column;
`;

const FeatureCardTitle = styled.h3`
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 4px 0;
`;

const FeatureCardDescription = styled.p`
	font-size: 14px;
	margin: 0;
	opacity: 0.7;
`;

const RecommendedSection = styled.section`
	margin-bottom: 40px;
`;

const GenreExploreGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 16px;
`;

const GenreExploreCard = styled.div<{ theme: any }>`
	background-color: ${(props) => props.theme.colors.surface};
	padding: 16px;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	border-left: 3px solid ${(props) => props.theme.colors.primary};

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	}
`;

const GenreCardTitle = styled.h4`
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 6px 0;
`;

const GenreCardDescription = styled.p`
	font-size: 13px;
	margin: 0;
	opacity: 0.7;
`;
