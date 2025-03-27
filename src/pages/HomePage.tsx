import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import {
	useTopAnime,
	useUserAnimeList,
	useSeasonalAnime,
} from "../hooks/useAnime";
import { useResponsive } from "../components/ResponsiveLayout";
import { AnimeCard } from "../components/AnimeCard";
import { useOffline } from "../contexts/OfflineContext";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, Star, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";

interface HomePageProps {
	onAnimeSelect: (id: number) => void;
}

const Hero = styled.div`
	margin-bottom: 56px;
	position: relative;
	overflow: hidden;
	border-radius: 20px;
	height: 300px;
	background: linear-gradient(
		45deg,
		${(props) => props.theme.colors?.primary + "99" || "#1976d299"},
		${(props) => props.theme.colors?.secondary + "99" || "#9c27b099"}
	);
	display: flex;
	align-items: center;
	padding: 0 32px;
	box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);

	&:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.7) 0%,
			rgba(0, 0, 0, 0.5) 50%,
			rgba(0, 0, 0, 0.3) 100%
		);
		z-index: 1;
	}

	@media (max-width: 768px) {
		height: 240px;
		padding: 0 20px;
	}
`;

const HeroContent = styled.div`
	color: #ffffff;
	z-index: 2;
	max-width: 600px;
	padding: 0;
	border-radius: 0;
	backdrop-filter: none;
`;

const HeroBg = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 50%;
	background-size: cover;
	background-position: center;
	opacity: 0.5;

	&:after {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			to right,
			rgba(0, 0, 0, 0.8),
			rgba(0, 0, 0, 0.4) 50%,
			transparent 100%
		);
	}

	@media (max-width: 768px) {
		width: 100%;
	}
`;

const HeroTitle = styled.h1`
	font-size: 36px;
	font-weight: 800;
	margin: 0 0 18px 0;
	line-height: 1.2;
	text-shadow: 0 2px 5px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.5);
	color: #ffffff;
	position: relative;
	display: inline-block;

	@media (max-width: 768px) {
		font-size: 28px;
	}
`;

const HeroSubtitle = styled.p`
	font-size: 18px;
	margin: 0 0 28px 0;
	opacity: 1;
	max-width: 440px;
	line-height: 1.6;
	color: #ffffff;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.5);

	@media (max-width: 768px) {
		font-size: 16px;
		margin: 0 0 24px 0;
	}
`;

const MainSection = styled.main`
	display: flex;
	flex-direction: column;
	gap: 56px;
	margin-bottom: 64px;
`;

const Section = styled.section`
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
`;

const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;

	@media (max-width: 576px) {
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}
`;

const SectionTitleWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

const SectionIcon = styled.div`
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background-color: ${(props) =>
		props.theme.colors?.primary + "20" || "#1976d220"};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${(props) => props.theme.colors?.primary || "#1976d2"};
`;

const SectionTitle = styled.h2`
	margin: 0;
	font-size: 22px;
	font-weight: 600;
	color: ${(props) => props.theme.colors?.text || "#2b2b2b"};
`;

const SectionDescription = styled.p`
	margin: 0 0 8px 0;
	font-size: 15px;
	color: ${(props) => props.theme.colors?.textSecondary || "#757575"};
`;

const AnimeScroll = styled.div`
	display: flex;
	gap: 20px;
	overflow-x: auto;
	padding: 12px 0 20px 0;
	scrollbar-width: thin;

	&::-webkit-scrollbar {
		height: 6px;
	}

	&::-webkit-scrollbar-track {
		background: ${(props) => props.theme.colors?.surfaceHover || "#f5f5f5"};
		border-radius: 10px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme.colors?.primary + "40" || "#1976d240"};
		border-radius: 10px;
	}

	> div {
		flex: 0 0 auto;
		width: 220px;
	}

	@media (max-width: 576px) {
		> div {
			width: 180px;
		}
	}
`;

const AnimeGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 28px;

	@media (max-width: 576px) {
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 20px;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 300px;
	color: ${(props) => props.theme.colors?.textSecondary || "#757575"};
	font-size: 16px;
	background-color: ${(props) =>
		props.theme.name === "dark"
			? props.theme.colors?.surface + "50" || "#2b2b2b50"
			: "transparent"};
	border-radius: 8px;
	padding: 24px;
`;

const WelcomeCard = styled.div`
	background: linear-gradient(
		45deg,
		${(props) => props.theme.colors?.secondary + "25" || "#9c27b025"},
		${(props) => props.theme.colors?.primary + "25" || "#1976d225"}
	);
	border-radius: 16px;
	padding: 28px;
	margin-bottom: 32px;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
	border: 1px solid ${(props) => props.theme.colors?.border || "#e0e0e0"};
	color: ${(props) => props.theme.colors?.text || "#2b2b2b"};
`;

const WelcomeTitle = styled.h2`
	margin: 0 0 12px 0;
	font-size: 24px;
	font-weight: 600;
	color: ${(props) => props.theme.colors?.text || "#2b2b2b"};
`;

const OfflineMessage = styled.div`
	background-color: ${(props) =>
		props.theme.colors?.warning
			? `${props.theme.colors.warning}20`
			: "#fff3e0"};
	border-left: 4px solid ${(props) => props.theme.colors?.warning || "#ed6c02"};
	padding: 12px 16px;
	margin-bottom: 16px;
	border-radius: 4px;
	cursor: pointer;

	p {
		margin: 0;
		font-size: 14px;
		color: ${(props) => props.theme.colors?.text || "#2b2b2b"};
	}
`;

const EmptyStateCard = styled(motion.div)`
	background-color: ${(props) => props.theme.colors?.surfaceHover || "#f5f5f5"};
	border-radius: 16px;
	padding: 32px;
	margin-top: 16px;
	text-align: center;
	border: 1px dashed ${(props) => props.theme.colors?.border || "#e0e0e0"};

	h3 {
		font-size: 20px;
		margin: 12px 0 8px;
		color: ${(props) => props.theme.colors?.text || "#2b2b2b"};
	}

	p {
		margin: 0;
		color: ${(props) => props.theme.colors?.textSecondary || "#757575"};
		font-size: 16px;
	}
`;

// Custom hero button with enhanced visibility
const HeroButton = styled(Button)`
	font-weight: 500;
	box-shadow: ${(props) =>
		props.theme.name === "dark"
			? "0 2px 8px rgba(0, 0, 0, 0.5)"
			: "0 2px 4px rgba(0, 0, 0, 0.2)"};
	background-color: ${(props) =>
		props.theme.name === "dark" && props.variant === "primary"
			? props.theme.colors?.primary || "#1976d2"
			: undefined};
	color: ${(props) =>
		props.theme.name === "dark" && props.variant === "primary"
			? "#ffffff"
			: undefined};
	border: ${(props) =>
		props.theme.name === "dark" && props.variant !== "primary"
			? `1px solid ${props.theme.colors?.primary || "#1976d2"}`
			: undefined};
	&:hover {
		transform: translateY(-1px);
		box-shadow: ${(props) =>
			props.theme.name === "dark"
				? "0 4px 12px rgba(0, 0, 0, 0.6)"
				: "0 4px 8px rgba(0, 0, 0, 0.3)"};
	}
`;

export function HomePage({ onAnimeSelect }: HomePageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const deviceType = useResponsive();
	const { data: topAnimeData, isLoading: isLoadingTop } = useTopAnime();

	// Get current year and season for seasonal anime
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();
	let currentSeason = "winter";
	if (currentMonth >= 3 && currentMonth <= 5) currentSeason = "spring";
	else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = "summer";
	else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = "fall";

	const { data: seasonalAnimeData, isLoading: isLoadingSeasonal } =
		useSeasonalAnime(currentYear, currentSeason);
	const { data: userAnimeList, isLoading: isLoadingUserAnime } =
		useUserAnimeList();
	const { isOffline } = useOffline();
	const [timeOfDay, setTimeOfDay] = useState("");
	const [showStatus, setShowStatus] = useState(false);

	useEffect(() => {
		const hour = new Date().getHours();
		if (hour < 12) setTimeOfDay("morning");
		else if (hour < 18) setTimeOfDay("afternoon");
		else setTimeOfDay("evening");
	}, []);

	if (isLoadingTop || isLoadingSeasonal || isLoadingUserAnime) {
		return (
			<LoadingContainer>
				Loading your personalized anime dashboard...
			</LoadingContainer>
		);
	}

	// Get seasonal and currently watching anime
	const seasonalAnime = seasonalAnimeData?.data || [];
	const watching = userAnimeList || [];
	const topAnime = topAnimeData?.data || [];

	// Generate personalized recommendations based on user's list
	// (In a real app, this would be a more sophisticated algorithm)
	const hasWatchHistory = watching.length > 0;
	const recommendedAnime = hasWatchHistory
		? topAnime
				.slice(0, 10)
				.filter((anime) => !watching.some((w) => w.anime_id === anime.mal_id))
		: topAnime.slice(0, 10);

	return (
		<MainSection>
			<Hero>
				<HeroBg
					style={{
						backgroundImage: `url(${topAnime[0]?.images.jpg.large_image_url})`,
					}}
				/>
				<HeroContent>
					<HeroTitle>Good {timeOfDay}, Anime Fan!</HeroTitle>
					<HeroSubtitle>
						Discover your next favorite anime series, track what you're
						watching, and never miss new episodes.
					</HeroSubtitle>
					<HeroButton
						variant="primary"
						icon={<Search size={18} />}
						onClick={() => console.log("Search clicked")}
					>
						Discover Anime
					</HeroButton>
				</HeroContent>
			</Hero>

			{isOffline && (
				<OfflineMessage onClick={() => setShowStatus(!showStatus)}>
					<p>
						You are currently in offline mode. Your data will be synced when you
						reconnect.
					</p>
				</OfflineMessage>
			)}

			{hasWatchHistory ? (
				<Section>
					<SectionHeader>
						<SectionTitleWrapper>
							<SectionIcon>
								<Clock size={18} />
							</SectionIcon>
							<div>
								<SectionTitle>Continue Watching</SectionTitle>
								<SectionDescription>
									Pick up where you left off
								</SectionDescription>
							</div>
						</SectionTitleWrapper>
					</SectionHeader>
					<AnimeScroll>
						{watching.slice(0, 10).map((animeItem) => {
							const matchingAnime = topAnime.find(
								(a) => a.mal_id === animeItem.anime_id
							);
							if (!matchingAnime) return null;

							return (
								<AnimeCard
									key={matchingAnime.mal_id}
									anime={matchingAnime}
									onClick={() => onAnimeSelect(matchingAnime.mal_id)}
									disableHoverEffects={deviceType === "mobile"}
								/>
							);
						})}
					</AnimeScroll>
				</Section>
			) : (
				<WelcomeCard>
					<WelcomeTitle>Welcome to Your Anime Dashboard!</WelcomeTitle>
					<p>
						Start tracking anime you're watching to get personalized
						recommendations.
					</p>
					<Button
						variant="outline"
						size="small"
						onClick={() => console.log("Browse catalog")}
					>
						Browse Catalog
					</Button>
				</WelcomeCard>
			)}

			<Section>
				<SectionHeader>
					<SectionTitleWrapper>
						<SectionIcon>
							<Sparkles size={18} />
						</SectionIcon>
						<div>
							<SectionTitle>Recommended For You</SectionTitle>
							<SectionDescription>Based on your preferences</SectionDescription>
						</div>
					</SectionTitleWrapper>
					<Button
						variant="text"
						size="small"
						onClick={() => console.log("View all recommendations")}
					>
						View All
					</Button>
				</SectionHeader>

				{recommendedAnime.length > 0 ? (
					<AnimeGrid>
						{recommendedAnime
							.slice(0, deviceType === "mobile" ? 6 : 8)
							.map((anime) => (
								<AnimeCard
									key={anime.mal_id}
									anime={anime}
									onClick={() => onAnimeSelect(anime.mal_id)}
									disableHoverEffects={deviceType === "mobile"}
								/>
							))}
					</AnimeGrid>
				) : (
					<EmptyStateCard
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4 }}
					>
						<Sparkles
							size={40}
							color={theme.colors?.primary || "#1976d2"}
							style={{ marginBottom: "16px" }}
						/>
						<h3>Your recommendations will appear here</h3>
						<p>
							Start adding anime to your list to get personalized
							recommendations
						</p>
					</EmptyStateCard>
				)}
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitleWrapper>
						<SectionIcon>
							<Calendar size={18} />
						</SectionIcon>
						<div>
							<SectionTitle>This Season</SectionTitle>
							<SectionDescription>
								Currently airing anime this season
							</SectionDescription>
						</div>
					</SectionTitleWrapper>
					<Button
						variant="text"
						size="small"
						onClick={() => console.log("View all seasonal")}
					>
						View All
					</Button>
				</SectionHeader>

				<AnimeScroll>
					{seasonalAnime.slice(0, 10).map((anime) => (
						<AnimeCard
							key={anime.mal_id}
							anime={anime}
							onClick={() => onAnimeSelect(anime.mal_id)}
							disableHoverEffects={deviceType === "mobile"}
						/>
					))}
				</AnimeScroll>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitleWrapper>
						<SectionIcon>
							<Star size={18} />
						</SectionIcon>
						<div>
							<SectionTitle>Top Rated</SectionTitle>
							<SectionDescription>
								All-time classics and fan favorites
							</SectionDescription>
						</div>
					</SectionTitleWrapper>
					<Button
						variant="text"
						size="small"
						onClick={() => console.log("View all top rated")}
					>
						View All
					</Button>
				</SectionHeader>

				<AnimeScroll>
					{topAnime.slice(0, 10).map((anime) => (
						<AnimeCard
							key={anime.mal_id}
							anime={anime}
							onClick={() => onAnimeSelect(anime.mal_id)}
							disableHoverEffects={deviceType === "mobile"}
						/>
					))}
				</AnimeScroll>
			</Section>
		</MainSection>
	);
}
