import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import {
	BrainCircuit,
	Settings,
	RefreshCw,
	X,
	Heart,
	Star,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { UserAnimeData } from "../types/anime";

// Styled components
const HeaderContainer = styled.div`
	margin-bottom: 32px;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 20px;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: stretch;
	}
`;

const TitleWrapper = styled.div`
	position: relative;
`;

const Title = styled.h1`
	font-size: 36px;
	font-weight: 800;
	margin: 0 0 12px 0;
	background: linear-gradient(
		to right,
		${(props) => props.theme?.colors?.primary || "#1976d2"},
		${(props) =>
			props.theme?.colors?.secondary ||
			props.theme?.colors?.primary ||
			"#1976d2"}aa
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	text-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Subtitle = styled.p`
	font-size: 16px;
	color: ${(props) => props.color};
	margin: 0;
	opacity: 0.9;
	max-width: 600px;
`;

const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	flex-shrink: 0;
	margin-top: 8px;

	@media (max-width: 768px) {
		width: 100%;
		justify-content: center;
	}
`;

const ModeToggle = styled.div`
	display: flex;
	align-items: center;
	background: ${(props) => props.theme?.colors?.surface || "#121212"}44;
	backdrop-filter: blur(10px);
	border-radius: 100px;
	padding: 4px;
	border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ModeLabel = styled.span`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border-radius: 100px;
	font-size: 14px;
	font-weight: 600;
	transition: all 0.2s ease;
`;

const ActionButton = styled(Button)`
	border-radius: 100px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: ${(props) =>
		props.variant === "primary"
			? `0 8px 16px ${props.theme?.colors?.primary || "#1976d2"}30`
			: "none"};
	transform-origin: center;

	&:hover {
		transform: translateY(-2px);
		box-shadow: ${(props) =>
			props.variant === "primary"
				? `0 12px 20px ${props.theme?.colors?.primary || "#1976d2"}40`
				: `0 8px 16px rgba(0, 0, 0, 0.1)`};
	}
`;

// Selection panel components
const SelectionPanel = styled(motion.div)`
	margin-bottom: 32px;
	border-radius: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
`;

const SelectionHeader = styled.div`
	padding: 16px 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const SelectionTitle = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 16px;
	font-weight: 600;
	position: relative;
`;

const SelectedAnimeCount = styled(motion.div)`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	color: white;
	font-size: 13px;
	font-weight: 700;
	margin-left: 12px;
`;

const SelectionGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 16px;
	padding: 24px;
	max-height: 400px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.15);
	}
`;

const AnimeSelectItem = styled(motion.div)`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 12px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
`;

const AnimeSelectImage = styled(motion.img)`
	width: 50px;
	height: 70px;
	object-fit: cover;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const AnimeSelectInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
`;

const AnimeSelectTitle = styled.div`
	font-weight: 600;
	font-size: 14px;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const AnimeSelectDetails = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 12px;
`;

const ButtonsContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	padding: 16px 24px;
	gap: 12px;
	border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

interface RecommendationPageHeaderProps {
	useAIMode: boolean;
	toggleAIMode: () => void;
	isCustomSelection: boolean;
	selectedAnimeIds: number[];
	userAnimeList: UserAnimeData[] | undefined;
	showSelectionPanel: boolean;
	setShowSelectionPanel: (show: boolean) => void;
	toggleAnimeSelection: (animeId: number) => void;
	fetchCustomRecommendations: () => Promise<void>;
}

export function RecommendationPageHeader({
	useAIMode,
	toggleAIMode,
	isCustomSelection,
	selectedAnimeIds,
	userAnimeList,
	showSelectionPanel,
	setShowSelectionPanel,
	toggleAnimeSelection,
	fetchCustomRecommendations,
}: RecommendationPageHeaderProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<>
			<HeaderContainer>
				<TitleWrapper>
					<Title theme={theme || { colors: { primary: "#1976d2" } }}>
						Anime Recommendations
					</Title>
					<Subtitle color={theme?.colors?.textSecondary || "#bdbdbd"}>
						Discover new anime tailored to your taste. Based on your watch
						history and ratings.
					</Subtitle>
				</TitleWrapper>

				<HeaderActions>
					<ModeToggle>
						<ModeLabel
							style={{
								background: !useAIMode
									? `${theme?.colors?.primary || "#1976d2"}20`
									: "transparent",
								color: !useAIMode
									? theme?.colors?.primary || "#1976d2"
									: theme?.colors?.textSecondary || "#bdbdbd",
							}}
						>
							Classic
						</ModeLabel>
						<Switch checked={useAIMode} onChange={toggleAIMode} size="small" />
						<ModeLabel
							style={{
								background: useAIMode
									? `${theme?.colors?.primary || "#1976d2"}20`
									: "transparent",
								color: useAIMode
									? theme?.colors?.primary || "#1976d2"
									: theme?.colors?.textSecondary || "#bdbdbd",
							}}
						>
							<BrainCircuit size={16} />
							AI-Powered
						</ModeLabel>
					</ModeToggle>
					<ActionButton
						variant={showSelectionPanel ? "primary" : "outline"}
						size="small"
						icon={<Settings size={16} />}
						onClick={() => setShowSelectionPanel(!showSelectionPanel)}
						disabled={useAIMode}
					>
						Customize
					</ActionButton>
				</HeaderActions>
			</HeaderContainer>

			<AnimatePresence>
				{showSelectionPanel &&
					userAnimeList &&
					userAnimeList.length > 0 &&
					!useAIMode && (
						<SelectionPanel
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0, transition: { duration: 0.3 } }}
							style={{
								backgroundColor: `${theme?.colors?.surface || "#121212"}aa`,
								border: `1px solid ${theme?.colors?.primary || "#1976d2"}20`,
							}}
						>
							<SelectionHeader>
								<SelectionTitle>
									<Settings
										size={18}
										color={theme?.colors?.primary || "#1976d2"}
									/>
									Select up to 3 anime to get personalized recommendations
									{selectedAnimeIds.length > 0 && (
										<SelectedAnimeCount
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											style={{
												backgroundColor: theme?.colors?.primary || "#1976d2",
											}}
										>
											{selectedAnimeIds.length}/3
										</SelectedAnimeCount>
									)}
								</SelectionTitle>
							</SelectionHeader>

							<SelectionGrid>
								{userAnimeList
									.filter((anime) => anime.score > 0 || anime.favorite)
									.map((anime) => {
										const isSelected = selectedAnimeIds.includes(
											anime.anime_id
										);
										return (
											<AnimeSelectItem
												key={anime.anime_id}
												onClick={() => toggleAnimeSelection(anime.anime_id)}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3 }}
												style={{
													backgroundColor: isSelected
														? `${theme?.colors?.primary || "#1976d2"}20`
														: `${theme?.colors?.surface || "#121212"}aa`,
													border: `1px solid ${
														isSelected
															? theme?.colors?.primary || "#1976d2"
															: "rgba(255,255,255,0.05)"
													}`,
													boxShadow: isSelected
														? `0 4px 12px ${
																theme?.colors?.primary || "#1976d2"
														  }30`
														: "none",
												}}
											>
												<AnimeSelectImage
													src={anime.image_url}
													alt={anime.title}
													whileHover={{ scale: 1.05 }}
												/>
												<AnimeSelectInfo>
													<AnimeSelectTitle>{anime.title}</AnimeSelectTitle>
													<AnimeSelectDetails
														style={{
															color: theme?.colors?.textSecondary || "#bdbdbd",
														}}
													>
														{anime.score > 0 && (
															<>
																<Star size={14} color="gold" fill="gold" />
																<span>{anime.score}</span>
															</>
														)}
														{anime.favorite && (
															<Heart
																size={14}
																color={theme?.colors?.primary || "#1976d2"}
																fill={theme?.colors?.primary || "#1976d2"}
															/>
														)}
													</AnimeSelectDetails>
												</AnimeSelectInfo>
											</AnimeSelectItem>
										);
									})}
							</SelectionGrid>

							<ButtonsContainer>
								<Button
									variant="outline"
									size="small"
									icon={<X size={16} />}
									onClick={() => setShowSelectionPanel(false)}
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									size="small"
									icon={<RefreshCw size={16} />}
									onClick={fetchCustomRecommendations}
									disabled={selectedAnimeIds.length === 0}
								>
									Get Recommendations
								</Button>
							</ButtonsContainer>
						</SelectionPanel>
					)}
			</AnimatePresence>
		</>
	);
}
