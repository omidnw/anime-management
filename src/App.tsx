import { useState, useEffect } from "react";
import { ThemeProvider } from "./themes/ThemeProvider";
import { OfflineProvider } from "./contexts/OfflineContext";
import OfflineIndicator from "./components/OfflineIndicator";
import styled from "@emotion/styled";
import {
	Sun,
	Moon,
	Cherry,
	Settings as SettingsIcon,
	Layout,
	Menu as MenuIcon,
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { useTheme } from "./themes/ThemeProvider";
import { themes } from "./themes/themes";
import { AppTheme } from "./themes/themeTypes";
import { AnimeDetail } from "./pages/AnimeDetail";
import { UserAnimeList } from "./pages/UserAnimeList";
import { SearchPage } from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import { HomePage } from "./pages/HomePage";
import { StatsDashboard } from "./pages/StatsDashboard";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { SeasonalAnimePage } from "./pages/SeasonalAnimePage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { TrendingAnimePage } from "./pages/TrendingAnimePage";
import { ResponsiveLayout, useResponsive } from "./components/ResponsiveLayout";
import StandardMenuBar from "./components/navigation/StandardMenuBar";
import HamburgerMenu from "./components/navigation/HamburgerMenu";
import { MenuDisplayType } from "./components/settings/MenuSettings";

type AppPage =
	| "home"
	| "myList"
	| "search"
	| "detail"
	| "settings"
	| "stats"
	| "recommendations"
	| "seasonal"
	| "discovery"
	| "trending";

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

const HeaderActions = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;

	@media (max-width: 576px) {
		gap: 8px;
	}
`;

const MainSection = styled.main`
	margin-bottom: 48px;
`;

const NavigationContainer = styled.div`
	position: relative;
`;

function MainContent() {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [currentPage, setCurrentPage] = useState<AppPage>("home");
	const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
	const [urlParams, setUrlParams] = useState<Record<string, string>>({});
	const deviceType = useResponsive();
	const [menuDisplayType, setMenuDisplayType] =
		useState<MenuDisplayType>("standard");
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Toggle menu type directly without page reload
	const toggleMenuType = () => {
		const newType = menuDisplayType === "standard" ? "hamburger" : "standard";
		setMenuDisplayType(newType);
		localStorage.setItem("menuDisplayType", newType);
	};

	// Toggle hamburger menu open/closed
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	// Load menu display type preference from localStorage
	useEffect(() => {
		const savedMenuType = localStorage.getItem(
			"menuDisplayType"
		) as MenuDisplayType | null;
		if (savedMenuType) {
			setMenuDisplayType(savedMenuType);
		}

		// Listen for menu type changes from settings page
		const handleMenuSettingsChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ menuType: MenuDisplayType }>;
			if (customEvent.detail && customEvent.detail.menuType) {
				setMenuDisplayType(customEvent.detail.menuType);
			}
		};

		window.addEventListener(
			"menuSettingsChanged",
			handleMenuSettingsChange as EventListener
		);

		return () => {
			window.removeEventListener(
				"menuSettingsChanged",
				handleMenuSettingsChange as EventListener
			);
		};
	}, []);

	const navigateTo = (page: AppPage) => {
		setCurrentPage(page);
		// Reset selected anime when navigating away from detail page
		if (page !== "detail") {
			setSelectedAnimeId(null);
		}
		// Reset URL params when changing pages
		if (page !== "search") {
			setUrlParams({});
		}
		// Close menu if open
		if (isMenuOpen) {
			setIsMenuOpen(false);
		}
	};

	const handleAnimeSelect = (id: number) => {
		setSelectedAnimeId(id);
		setCurrentPage("detail");
	};

	const handleBackToHome = () => {
		setCurrentPage("home");
		setSelectedAnimeId(null);
	};

	const handleNavigateWithParams = (
		page: string,
		params?: Record<string, string>
	) => {
		// Convert string page to AppPage type
		const targetPage = page as AppPage;
		setCurrentPage(targetPage);
		if (params) {
			setUrlParams(params);
		} else {
			setUrlParams({});
		}
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
						{menuDisplayType === "hamburger" && (
							<Button
								variant="outline"
								size="small"
								icon={<MenuIcon size={18} />}
								onClick={toggleMenu}
								aria-label="Toggle navigation menu"
							/>
						)}
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

				<OfflineIndicator />

				{/* Render menu based on user preference */}
				<NavigationContainer>
					{menuDisplayType === "standard" ? (
						<StandardMenuBar
							currentPage={currentPage}
							onNavigation={(page) => navigateTo(page as AppPage)}
							theme={theme}
						/>
					) : (
						<HamburgerMenu
							currentPage={currentPage}
							onNavigation={(page) => navigateTo(page as AppPage)}
							theme={theme}
							hideToggleButton={true}
							isMenuOpen={isMenuOpen}
							onMenuToggle={toggleMenu}
						/>
					)}
				</NavigationContainer>

				<MainSection>
					{currentPage === "home" && (
						<HomePage onAnimeSelect={handleAnimeSelect} />
					)}

					{currentPage === "myList" && (
						<UserAnimeList onAnimeSelect={handleAnimeSelect} />
					)}

					{currentPage === "search" && (
						<SearchPage
							onAnimeSelect={handleAnimeSelect}
							initialParams={urlParams}
						/>
					)}

					{currentPage === "detail" && selectedAnimeId && (
						<AnimeDetail animeId={selectedAnimeId} onBack={handleBackToHome} />
					)}

					{currentPage === "settings" && <SettingsPage />}

					{currentPage === "stats" && (
						<StatsDashboard onBack={() => navigateTo("home")} />
					)}

					{currentPage === "recommendations" && (
						<RecommendationsPage onAnimeSelect={handleAnimeSelect} />
					)}

					{currentPage === "seasonal" && (
						<SeasonalAnimePage onAnimeSelect={handleAnimeSelect} />
					)}

					{currentPage === "discovery" && (
						<DiscoveryPage
							onAnimeSelect={handleAnimeSelect}
							onNavigate={handleNavigateWithParams}
						/>
					)}

					{currentPage === "trending" && (
						<TrendingAnimePage
							onAnimeSelect={handleAnimeSelect}
							onNavigate={handleNavigateWithParams}
						/>
					)}
				</MainSection>
			</ResponsiveLayout>
		</AppContainer>
	);
}

function App() {
	return (
		<ThemeProvider>
			<OfflineProvider>
				<MainContent />
			</OfflineProvider>
		</ThemeProvider>
	);
}

export default App;
