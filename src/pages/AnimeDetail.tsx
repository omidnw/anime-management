import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import {
	useAnimeDetails,
	useUserAnimeDetails,
	useAddAnime,
} from "../hooks/useAnime";
import { Button } from "../components/ui/Button";
import { UserAnimeData } from "../types/anime";
import {
	ArrowLeft,
	Star,
	Calendar,
	Clock,
	Edit,
	Share2,
	Heart,
	Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	UserProgress,
	Notes,
	ActionButtons as ActionButtonsComponent,
} from "../components/pages/AnimeDetail/UserProgress";

interface AnimeDetailProps {
	animeId: number;
	onBack: () => void;
}

const MotionContainer = styled(motion.div)`
	display: flex;
	flex-direction: column;
	gap: 24px;
	max-width: 1000px;
	margin: 0 auto;
`;

const BackButton = styled(Button)`
	width: fit-content;
	margin-bottom: 16px;
`;

const FavoriteLabel = styled(motion.div)`
	position: absolute;
	top: -14px;
	left: 24px;
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.primary};
	color: ${(props: { theme: AppTheme }) =>
		props.theme.name === "sakura" ? "#3D2E39" : "#FFFFFF"};
	padding: 4px 12px;
	border-radius: 20px;
	font-weight: 600;
	font-size: 14px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	display: flex;
	align-items: center;
	gap: 5px;
	z-index: 1;
`;

const AnimeHeader = styled(motion.div)<{
	isFavorite: boolean;
	theme: AppTheme;
}>`
	display: flex;
	position: relative;
	gap: 24px;
	background: ${(props) =>
		props.isFavorite
			? `linear-gradient(135deg, 
		${props.theme.colors.primary}10,
		${props.theme.colors.accent}30)`
			: "transparent"};
	border-radius: 12px;
	padding: ${(props) => (props.isFavorite ? "24px" : "0")};
	margin-top: ${(props) => (props.isFavorite ? "24px" : "0")};
	box-shadow: ${(props) =>
		props.isFavorite ? "0 4px 15px rgba(0, 0, 0, 0.08)" : "none"};

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const AnimeCoverWrapper = styled(motion.div)`
	position: relative;
	width: 220px;
	height: 320px;

	@media (max-width: 768px) {
		width: 100%;
		max-width: 220px;
		margin: 0 auto;
	}
`;

const AnimeCover = styled(motion.img)`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const CoverOverlay = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.8) 0%,
		rgba(0, 0, 0, 0) 50%
	);
	border-radius: 8px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 16px;
	opacity: 0;
	transition: opacity 0.3s;

	&:hover {
		opacity: 1;
	}
`;

const PlayButton = styled(motion.button)`
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.primary};
	color: ${(props: { theme: AppTheme }) =>
		props.theme.name === "sakura" ? "#3D2E39" : "#FFFFFF"};
	border: none;
	border-radius: 50%;
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
`;

const AnimeInfo = styled(motion.div)`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const AnimeTitle = styled(motion.h1)`
	margin: 0 0 8px 0;
	font-size: 28px;
	font-weight: 700;
	background: ${(props: { theme: AppTheme }) => `linear-gradient(90deg, 
		${props.theme.colors.text} 0%, 
		${props.theme.colors.textSecondary} 100%)`};
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
`;

const AnimeJapaneseTitle = styled(motion.h2)`
	margin: 0 0 16px 0;
	font-size: 16px;
	font-weight: 400;
	opacity: 0.8;
`;

const MetadataList = styled(motion.div)`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-bottom: 16px;
`;

const MetadataItem = styled(motion.div)`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	padding: 6px 10px;
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.surface};
	border-radius: 20px;
`;

const GenresList = styled(motion.div)`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 16px;
`;

const GenreBadge = styled(motion.span)<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.accent}20;
	color: ${(props) => props.theme.colors.accent};
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => props.theme.colors.accent}40;
		transform: scale(1.05);
	}
`;

const SynopsisSection = styled(motion.div)`
	margin: 24px 0;
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

const Synopsis = styled(motion.p)`
	margin: 0;
	line-height: 1.7;
	font-size: 15px;
	text-align: justify;
`;

// Animation variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
			when: "beforeChildren",
		},
	},
};

const headerVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
};

const imageVariants = {
	hidden: { scale: 0.8, opacity: 0 },
	visible: {
		scale: 1,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
};

const titleVariants = {
	hidden: { x: -20, opacity: 0 },
	visible: {
		x: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
};

const itemVariants = {
	hidden: { y: 10, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
};

export function AnimeDetail({ animeId, onBack }: AnimeDetailProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const { data: animeData, isLoading: isLoadingAnime } =
		useAnimeDetails(animeId);
	const { data: userAnimeData } = useUserAnimeDetails(animeId);
	const addAnimeMutation = useAddAnime();

	const [userAnime, setUserAnime] = useState<UserAnimeData>({
		anime_id: animeId,
		status: "plan_to_watch",
		score: 0,
		progress: 0,
		notes: "",
		favorite: false,
		start_date: null,
		end_date: null,
		image_url: "",
		title: "",
	});

	useEffect(() => {
		if (userAnimeData) {
			setUserAnime(userAnimeData);
		}
	}, [userAnimeData]);

	const handleUpdateStatus = (status: UserAnimeData["status"]) => {
		if (!animeData || !animeData.data) return;

		const updatedAnime = {
			anime_id: animeId,
			status,
			score: userAnimeData?.score || 0,
			progress: userAnimeData?.progress || 0,
			notes: userAnimeData?.notes || "",
			favorite: userAnimeData?.favorite || true,
			start_date:
				status === "watching"
					? new Date().toISOString()
					: userAnimeData?.start_date || null,
			end_date:
				status === "completed"
					? new Date().toISOString()
					: userAnimeData?.end_date || null,
			image_url: animeData.data.images.jpg.image_url,
			title: animeData.data.title,
		};
		setUserAnime(updatedAnime);
		addAnimeMutation.mutate(updatedAnime);
	};

	const handleSaveChanges = () => {
		addAnimeMutation.mutate(userAnime);
	};

	const handleScoreChange = (score: number) => {
		const updatedAnime = {
			...userAnime,
			score,
		};
		setUserAnime(updatedAnime);
		addAnimeMutation.mutate(updatedAnime);
	};

	const handleProgressChange = (progress: number) => {
		const updatedAnime = {
			...userAnime,
			progress,
		};
		setUserAnime(updatedAnime);
		addAnimeMutation.mutate(updatedAnime);
	};

	const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setUserAnime({
			...userAnime,
			notes: e.target.value,
		});
	};

	const handleToggleFavorite = () => {
		const updatedAnime = {
			...userAnime,
			favorite: !userAnime.favorite,
		};
		setUserAnime(updatedAnime);
		addAnimeMutation.mutate(updatedAnime);
	};

	if (isLoadingAnime) {
		return (
			<MotionContainer
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "300px",
					}}
				>
					<motion.div
						animate={{
							rotate: 360,
							transition: { duration: 1, repeat: Infinity, ease: "linear" },
						}}
					>
						<Clock size={48} color={theme.colors.primary} />
					</motion.div>
				</div>
			</MotionContainer>
		);
	}

	if (!animeData) {
		return <div>Anime not found</div>;
	}

	const anime = animeData.data;

	return (
		<MotionContainer
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0 }}
		>
			<motion.div variants={itemVariants}>
				<BackButton
					variant="outline"
					size="small"
					icon={<ArrowLeft size={16} />}
					onClick={onBack}
				>
					Back
				</BackButton>
			</motion.div>

			<AnimeHeader
				isFavorite={userAnime.favorite}
				theme={theme}
				variants={headerVariants}
			>
				<AnimatePresence>
					{userAnime.favorite && (
						<FavoriteLabel
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -20, opacity: 0 }}
							transition={{ type: "spring", stiffness: 500 }}
							theme={theme}
						>
							<Heart size={14} /> Favorite
						</FavoriteLabel>
					)}
				</AnimatePresence>

				<AnimeCoverWrapper variants={imageVariants}>
					<AnimeCover
						src={anime.images.jpg.large_image_url}
						alt={anime.title}
						whileHover={{ scale: 1.03 }}
						transition={{ type: "spring", stiffness: 300 }}
					/>
					<CoverOverlay>
						<PlayButton
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							theme={theme}
						>
							<Play size={24} />
						</PlayButton>
					</CoverOverlay>
				</AnimeCoverWrapper>

				<AnimeInfo>
					<AnimeTitle variants={titleVariants} theme={theme}>
						{anime.title}
					</AnimeTitle>
					{anime.title_japanese && (
						<AnimeJapaneseTitle variants={itemVariants}>
							{anime.title_japanese}
						</AnimeJapaneseTitle>
					)}

					<MetadataList variants={headerVariants}>
						<MetadataItem variants={itemVariants} theme={theme}>
							<Star size={16} color={anime.score ? "gold" : "currentColor"} />
							<span>{anime.score || "N/A"}</span>
						</MetadataItem>

						{anime.aired.from && (
							<MetadataItem variants={itemVariants} theme={theme}>
								<Calendar size={16} />
								<span>{new Date(anime.aired.from).getFullYear()}</span>
							</MetadataItem>
						)}

						{anime.episodes && (
							<MetadataItem variants={itemVariants} theme={theme}>
								<Clock size={16} />
								<span>{anime.episodes} episodes</span>
							</MetadataItem>
						)}

						{anime.type && (
							<MetadataItem variants={itemVariants} theme={theme}>
								<span>{anime.type}</span>
							</MetadataItem>
						)}

						{anime.status && (
							<MetadataItem variants={itemVariants} theme={theme}>
								<span>{anime.status}</span>
							</MetadataItem>
						)}
					</MetadataList>

					<GenresList variants={headerVariants}>
						{anime.genres.map((genre) => (
							<GenreBadge
								key={genre.mal_id}
								theme={theme}
								variants={itemVariants}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								{genre.name}
							</GenreBadge>
						))}
					</GenresList>

					<SynopsisSection variants={itemVariants}>
						<SectionTitle theme={theme}>Synopsis</SectionTitle>
						<Synopsis>{anime.synopsis || "No synopsis available."}</Synopsis>
					</SynopsisSection>
				</AnimeInfo>
			</AnimeHeader>

			<UserProgress
				userAnime={userAnime}
				animeEpisodes={anime.episodes || undefined}
				theme={theme}
				isFavorite={userAnime.favorite}
				onStatusChange={handleUpdateStatus}
				onProgressChange={handleProgressChange}
				onScoreChange={handleScoreChange}
				onToggleFavorite={handleToggleFavorite}
			/>

			{userAnime.favorite && (
				<>
					<Notes
						notes={userAnime.notes}
						theme={theme}
						onNotesChange={handleNotesChange}
						onSave={handleSaveChanges}
					/>

					<ActionButtonsComponent onSave={handleSaveChanges} />
				</>
			)}
		</MotionContainer>
	);
}
