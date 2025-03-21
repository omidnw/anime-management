import { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useTopAnime } from "../hooks/useAnime";
import { useResponsive } from "../components/ResponsiveLayout";
import { AnimeCard } from "../components/AnimeCard";
import { AnimeListCard } from "../components/AnimeListCard";
import { ViewToggle, ViewMode } from "../components/ViewToggle";
import { Button } from "../components/ui/Button";

interface HomePageProps {
	onAnimeSelect: (id: number) => void;
}

const MainSection = styled.main`
	margin-bottom: 48px;
`;

const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;

	@media (max-width: 576px) {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
`;

const HeaderControls = styled.div`
	display: flex;
	gap: 12px;
	align-items: center;

	@media (max-width: 576px) {
		width: 100%;
		justify-content: space-between;
		margin-top: 8px;
	}
`;

const SectionTitle = styled.h2`
	margin: 0;
	font-size: 20px;
	font-weight: 600;
`;

const AnimeGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 24px;
	margin-top: 24px;

	@media (max-width: 576px) {
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px;
	}
`;

const AnimeList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-top: 24px;
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 300px;
	color: ${(props) => props.color};
	font-size: 16px;
`;

const LoadMoreContainer = styled.div`
	text-align: center;
	margin-top: 24px;
`;

export function HomePage({ onAnimeSelect }: HomePageProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const deviceType = useResponsive();
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	const { data: topAnimeData, isLoading } = useTopAnime();

	return (
		<MainSection>
			<SectionHeader>
				<SectionTitle>Top Anime</SectionTitle>
				<HeaderControls>
					<ViewToggle currentView={viewMode} onViewChange={setViewMode} />
					{deviceType !== "mobile" && <Button variant="text">View All</Button>}
				</HeaderControls>
			</SectionHeader>

			{isLoading ? (
				<LoadingContainer color={theme.colors.textSecondary}>
					Loading top anime...
				</LoadingContainer>
			) : viewMode === "grid" ? (
				<AnimeGrid>
					{topAnimeData?.data
						.slice(0, deviceType === "mobile" ? 6 : 12)
						.map((anime) => (
							<AnimeCard
								key={anime.mal_id}
								anime={anime}
								onClick={() => onAnimeSelect(anime.mal_id)}
							/>
						))}
				</AnimeGrid>
			) : (
				<AnimeList>
					{topAnimeData?.data
						.slice(0, deviceType === "mobile" ? 6 : 10)
						.map((anime) => (
							<AnimeListCard
								key={anime.mal_id}
								anime={anime}
								onClick={() => onAnimeSelect(anime.mal_id)}
							/>
						))}
				</AnimeList>
			)}

			{deviceType === "mobile" && (
				<LoadMoreContainer>
					<Button variant="outline">Load More</Button>
				</LoadMoreContainer>
			)}
		</MainSection>
	);
}
