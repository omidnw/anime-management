import { useState } from "react";
import { ThemeProvider } from "./themes/ThemeProvider";
import styled from "@emotion/styled";
import {
	Sun,
	Moon,
	Cherry,
	Search,
	Plus,
	Home,
	ListFilter,
	Settings as SettingsIcon,
	Menu,
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { useTheme } from "./themes/ThemeProvider";
import { themes } from "./themes/themes";
import { useTopAnime } from "./hooks/useAnime";
import { AnimeCard } from "./components/AnimeCard";
import { AppTheme } from "./themes/themeTypes";
import { AnimeDetail } from "./pages/AnimeDetail";
import { UserAnimeList } from "./pages/UserAnimeList";
import { SearchPage } from "./pages/SearchPage";
import { Settings } from "./pages/Settings";
import { HomePage } from "./pages/HomePage";
import { ResponsiveLayout, useResponsive } from "./components/ResponsiveLayout";

type AppPage = "home" | "myList" | "search" | "detail" | "settings";

function ThemeSwitcher() {
	const { currentTheme, setTheme } = useTheme();
	const deviceType = useResponsive();

	// On mobile, only show icons
	if (deviceType === "mobile") {
		return (
			<ThemeButtonGroup>
				<Button
					variant={currentTheme === "light" ? "primary" : "outline"}
					icon={<Sun size={18} />}
					onClick={() => setTheme("light")}
				/>
				<Button
					variant={currentTheme === "dark" ? "primary" : "outline"}
					icon={<Moon size={18} />}
					onClick={() => setTheme("dark")}
				/>
				<Button
					variant={currentTheme === "sakura" ? "primary" : "outline"}
					icon={<Cherry size={18} />}
					onClick={() => setTheme("sakura")}
				/>
			</ThemeButtonGroup>
		);
	}

	return (
		<ThemeButtonGroup>
			<Button
				variant={currentTheme === "light" ? "primary" : "outline"}
				icon={<Sun size={18} />}
				onClick={() => setTheme("light")}
			>
				Light
			</Button>
			<Button
				variant={currentTheme === "dark" ? "primary" : "outline"}
				icon={<Moon size={18} />}
				onClick={() => setTheme("dark")}
			>
				Dark
			</Button>
			<Button
				variant={currentTheme === "sakura" ? "primary" : "outline"}
				icon={<Cherry size={18} />}
				onClick={() => setTheme("sakura")}
			>
				Sakura
			</Button>
		</ThemeButtonGroup>
	);
}

const ThemeButtonGroup = styled.div`
	display: flex;
	gap: 8px;
`;

const AppContainer = styled.div`
	width: 100%;
`;

const Header = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
`;

const Logo = styled.h1`
	margin: 0;
	font-size: 24px;
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;

	@media (max-width: 576px) {
		font-size: 20px;
	}
`;

const Navigation = styled.nav`
	margin-bottom: 24px;

	@media (max-width: 576px) {
		overflow-x: auto;
		padding-bottom: 8px;
		margin-bottom: 16px;

		&::-webkit-scrollbar {
			height: 4px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgba(0, 0, 0, 0.2);
			border-radius: 4px;
		}
	}
`;

const NavList = styled.ul`
	display: flex;
	gap: 8px;
	list-style: none;
	padding: 0;
	margin: 0;

	@media (max-width: 576px) {
		width: max-content;
	}
`;

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

const HeaderActions = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;

	@media (max-width: 576px) {
		gap: 8px;
	}
`;

const MobileMenu = styled.div`
	display: none;

	@media (max-width: 576px) {
		display: block;
	}
`;

function MainContent() {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [currentPage, setCurrentPage] = useState<AppPage>("home");
	const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
	const deviceType = useResponsive();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navigateTo = (page: AppPage) => {
		setCurrentPage(page);
		setMobileMenuOpen(false);
	};

	const handleAnimeSelect = (id: number) => {
		setSelectedAnimeId(id);
		navigateTo("detail");
	};

	const handleBackToHome = () => {
		navigateTo("home");
	};

	return (
		<AppContainer>
			<ResponsiveLayout>
				<Header>
					<Logo onClick={() => navigateTo("home")}>
						<span>AniTrack</span>
					</Logo>

					<HeaderActions>
						{deviceType !== "mobile" && (
							<Button
								variant="outline"
								size="small"
								icon={<SettingsIcon size={18} />}
								onClick={() => navigateTo("settings")}
							>
								Settings
							</Button>
						)}
						<ThemeSwitcher />
						{deviceType === "mobile" && (
							<Button
								variant="outline"
								size="small"
								icon={<SettingsIcon size={18} />}
								onClick={() => navigateTo("settings")}
							/>
						)}
					</HeaderActions>
				</Header>

				<Navigation>
					<NavList>
						<li>
							<Button
								icon={<Home size={18} />}
								variant={currentPage === "home" ? "primary" : "outline"}
								onClick={() => navigateTo("home")}
							>
								{deviceType !== "mobile" && "Home"}
							</Button>
						</li>
						<li>
							<Button
								icon={<ListFilter size={18} />}
								variant={currentPage === "myList" ? "primary" : "outline"}
								onClick={() => navigateTo("myList")}
							>
								{deviceType !== "mobile" && "My List"}
							</Button>
						</li>
						<li>
							<Button
								icon={<Search size={18} />}
								variant={currentPage === "search" ? "primary" : "outline"}
								onClick={() => navigateTo("search")}
							>
								{deviceType !== "mobile" && "Search"}
							</Button>
						</li>
					</NavList>
				</Navigation>

				{currentPage === "home" && (
					<HomePage onAnimeSelect={handleAnimeSelect} />
				)}

				{currentPage === "myList" && (
					<UserAnimeList onAnimeSelect={handleAnimeSelect} />
				)}

				{currentPage === "search" && (
					<SearchPage onAnimeSelect={handleAnimeSelect} />
				)}

				{currentPage === "detail" && selectedAnimeId && (
					<AnimeDetail animeId={selectedAnimeId} onBack={handleBackToHome} />
				)}

				{currentPage === "settings" && (
					<Settings onClose={() => navigateTo("home")} />
				)}
			</ResponsiveLayout>
		</AppContainer>
	);
}

function App() {
	return (
		<ThemeProvider>
			<MainContent />
		</ThemeProvider>
	);
}

export default App;
