import { useState } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { AppTheme } from "../../../../themes/themeTypes";
import { UserAnimeData } from "../../../../types/anime";
import {
	BookmarkCheck,
	Heart,
	HeartOff,
	Minus,
	Plus,
	Star,
} from "lucide-react";

interface UserProgressProps {
	userAnime: UserAnimeData;
	animeEpisodes?: number;
	theme: AppTheme;
	isFavorite: boolean;
	onStatusChange: (status: UserAnimeData["status"]) => void;
	onProgressChange: (progress: number) => void;
	onScoreChange: (score: number) => void;
	onToggleFavorite: () => void;
}

const ProgressSection = styled(motion(Card))<{
	isFavorite: boolean;
	theme: AppTheme;
}>`
	margin-top: 24px;
	border-radius: 12px;
	overflow: visible;
	background: ${(props) =>
		props.isFavorite
			? `linear-gradient(135deg, 
      ${props.theme.colors.primary}10,
      ${props.theme.colors.accent}20)`
			: "transparent"};
	border: ${(props) =>
		props.isFavorite
			? `1px solid ${props.theme.colors.primary}30`
			: `1px solid ${props.theme.colors.textSecondary}30`};
	box-shadow: ${(props) =>
		props.isFavorite ? "0 4px 15px rgba(0, 0, 0, 0.08)" : "none"};
`;

const StatusSelector = styled(motion.div)`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 24px;
`;

const ProgressRow = styled(motion.div)`
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 16px;
	padding: 8px 12px;
	border-radius: 8px;
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.surface};
`;

const ProgressLabel = styled.label`
	font-size: 15px;
	min-width: 80px;
	font-weight: 500;
`;

const ProgressInput = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const EpisodeInput = styled.input<{ theme: AppTheme; disabled?: boolean }>`
	width: 60px;
	padding: 8px 10px;
	border: 1px solid ${(props) => props.theme.colors.textSecondary};
	border-radius: 6px;
	font-size: 14px;
	background-color: ${(props) =>
		props.disabled
			? `${props.theme.colors.background}80`
			: props.theme.colors.background};
	color: ${(props) => props.theme.colors.text};
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
	cursor: ${(props) => (props.disabled ? "not-allowed" : "text")};

	&:focus {
		border-color: ${(props) =>
			props.disabled
				? props.theme.colors.textSecondary
				: props.theme.colors.primary};
		outline: none;
		box-shadow: ${(props) =>
			props.disabled ? "none" : `0 0 0 2px ${props.theme.colors.primary}30`};
	}
`;

const RatingRow = styled(motion.div)`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 24px;
	padding: 8px 12px;
	border-radius: 8px;
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.surface};
`;

const StarButton = styled.button<{
	active: boolean;
	theme: AppTheme;
	disabled?: boolean;
}>`
	background: none;
	border: none;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	color: ${(props) =>
		props.active ? "gold" : props.theme.colors.textSecondary};
	transition: all 0.2s ease;
	padding: 4px;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	&:hover {
		color: ${(props) =>
			props.disabled ? props.theme.colors.textSecondary : "gold"};
		transform: ${(props) => (props.disabled ? "none" : "scale(1.2)")};
	}
`;

const SectionTitle = styled(motion.h3)`
	margin: 0 0 12px 0;
	font-size: 20px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;

	&::after {
		content: "";
		height: 2px;
		flex: 1;
		background: linear-gradient(
			90deg,
			${(props: { theme: AppTheme }) => props.theme.colors.primary}50 0%,
			transparent 100%
		);
	}
`;

const EpisodeIndicator = styled.span<{ theme: AppTheme }>`
	padding: 4px 8px;
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.primary}20;
	color: ${(props) => props.theme.colors.primary};
	font-weight: 500;
`;

const FavoriteButton = styled(Button)<{ isFavorite: boolean; theme: AppTheme }>`
	margin-bottom: 16px;
	background: ${(props) =>
		props.isFavorite
			? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.accent})`
			: `linear-gradient(to right, ${props.theme.colors.primary}15, ${props.theme.colors.primary}30)`};
	border: ${(props) =>
		props.isFavorite ? "none" : `2px solid ${props.theme.colors.primary}`};
	color: ${(props) =>
		props.isFavorite
			? props.theme.name === "sakura"
				? "#3D2E39"
				: "#FFFFFF"
			: props.theme.colors.primary};
	font-weight: ${(props) => (props.isFavorite ? "normal" : "500")};
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	box-shadow: ${(props) =>
		!props.isFavorite ? `0 4px 12px ${props.theme.colors.primary}20` : "none"};

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: ${(props) =>
			props.isFavorite
				? `linear-gradient(45deg, ${props.theme.colors.primary}40, ${props.theme.colors.accent}40)`
				: `linear-gradient(45deg, ${props.theme.colors.primary}20, ${props.theme.colors.primary}30)`};
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	&:hover {
		transform: scale(1.05);
		box-shadow: ${(props) =>
			props.isFavorite
				? "0 4px 12px rgba(0, 0, 0, 0.2)"
				: `0 6px 15px ${props.theme.colors.primary}30`};

		&::before {
			opacity: 1;
		}
	}

	&:active {
		transform: scale(0.98);
	}
`;

const ProgressContainer = styled.div<{ isFavorite: boolean; theme: AppTheme }>`
	position: relative;
	${(props) =>
		!props.isFavorite &&
		`
		filter: grayscale(30%);
		
		&::after {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: ${props.theme.colors.background}25;
			pointer-events: none;
			z-index: 1;
			border-radius: 8px;
		}
	`}
`;

const pulseAnimation = {
	scale: [1, 1.03, 1],
	transition: {
		duration: 2,
		ease: "easeInOut",
		repeat: Infinity,
		repeatType: "reverse" as const,
	},
};

export function UserProgress({
	userAnime,
	animeEpisodes,
	theme,
	isFavorite,
	onStatusChange,
	onProgressChange,
	onScoreChange,
	onToggleFavorite,
}: UserProgressProps) {
	return (
		<ProgressSection
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ delay: 0.3 }}
			isFavorite={isFavorite}
			theme={theme}
		>
			<SectionTitle theme={theme}>
				<BookmarkCheck size={20} />
				My Progress {!isFavorite && " (Locked)"}
			</SectionTitle>

			{!isFavorite && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					style={{
						padding: "14px 16px",
						borderRadius: "8px",
						backgroundColor: `${theme.colors.primary}15`,
						marginBottom: "20px",
						borderLeft: `4px solid ${theme.colors.primary}`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Heart
						size={18}
						style={{
							marginRight: "10px",
							color: theme.colors.primary,
						}}
					/>
					<div>
						<p
							style={{
								margin: 0,
								fontSize: "15px",
								fontWeight: 500,
								color: theme.colors.primary,
							}}
						>
							Features are locked
						</p>
						<p
							style={{
								margin: "4px 0 0 0",
								fontSize: "13px",
								opacity: 0.9,
							}}
						>
							Add this anime to favorites to enable tracking
						</p>
					</div>
				</motion.div>
			)}

			<ProgressContainer isFavorite={isFavorite} theme={theme}>
				<StatusSelector
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<Button
						variant={userAnime.status === "watching" ? "primary" : "outline"}
						size="small"
						onClick={() => onStatusChange("watching")}
						disabled={!isFavorite}
					>
						Watching
					</Button>
					<Button
						variant={userAnime.status === "completed" ? "primary" : "outline"}
						size="small"
						onClick={() => onStatusChange("completed")}
						disabled={!isFavorite}
					>
						Completed
					</Button>
					<Button
						variant={
							userAnime.status === "plan_to_watch" ? "primary" : "outline"
						}
						size="small"
						onClick={() => onStatusChange("plan_to_watch")}
						disabled={!isFavorite}
					>
						Plan to Watch
					</Button>
					<Button
						variant={userAnime.status === "on_hold" ? "primary" : "outline"}
						size="small"
						onClick={() => onStatusChange("on_hold")}
						disabled={!isFavorite}
					>
						On Hold
					</Button>
					<Button
						variant={userAnime.status === "dropped" ? "primary" : "outline"}
						size="small"
						onClick={() => onStatusChange("dropped")}
						disabled={!isFavorite}
					>
						Dropped
					</Button>
				</StatusSelector>

				<ProgressRow
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.5 }}
					theme={theme}
					style={{ opacity: isFavorite ? 1 : 0.6 }}
				>
					<ProgressLabel>Episodes:</ProgressLabel>
					<ProgressInput>
						<Button
							variant="outline"
							size="small"
							icon={<Minus size={14} />}
							onClick={() =>
								onProgressChange(Math.max(0, userAnime.progress - 1))
							}
							disabled={!isFavorite}
						/>
						<EpisodeInput
							type="number"
							value={userAnime.progress}
							onChange={(e) => onProgressChange(Number(e.target.value))}
							min="0"
							max={animeEpisodes || undefined}
							theme={theme}
							disabled={!isFavorite}
						/>
						<Button
							variant="outline"
							size="small"
							icon={<Plus size={14} />}
							onClick={() => onProgressChange(userAnime.progress + 1)}
							disabled={!isFavorite}
						/>
						{animeEpisodes && (
							<EpisodeIndicator theme={theme}>
								{userAnime.progress} / {animeEpisodes}
							</EpisodeIndicator>
						)}
					</ProgressInput>
				</ProgressRow>

				<RatingRow
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.6 }}
					theme={theme}
					style={{ opacity: isFavorite ? 1 : 0.6 }}
				>
					<ProgressLabel>Rating:</ProgressLabel>
					<div>
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
							<StarButton
								key={value}
								active={userAnime.score >= value}
								onClick={() => onScoreChange(value)}
								theme={theme}
								disabled={!isFavorite}
								style={{ cursor: isFavorite ? "pointer" : "not-allowed" }}
							>
								<Star
									size={20}
									fill={userAnime.score >= value ? "gold" : "none"}
								/>
							</StarButton>
						))}
					</div>
				</RatingRow>
			</ProgressContainer>

			<motion.div
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.7 }}
				style={{
					display: "flex",
					justifyContent: "center",
					marginTop: isFavorite ? "16px" : "24px",
					marginBottom: isFavorite ? "0" : "8px",
				}}
			>
				<motion.div animate={!isFavorite ? pulseAnimation : {}}>
					<FavoriteButton
						variant={userAnime.favorite ? "primary" : "outline"}
						size={isFavorite ? "medium" : "large"}
						icon={
							userAnime.favorite ? <Heart size={18} /> : <Heart size={20} />
						}
						onClick={onToggleFavorite}
						isFavorite={userAnime.favorite}
						theme={theme}
					>
						{userAnime.favorite ? "Remove from Favorites" : "Add to Favorites"}
					</FavoriteButton>
				</motion.div>
			</motion.div>
		</ProgressSection>
	);
}
