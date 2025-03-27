import {
	useState,
	forwardRef,
	useCallback,
	useEffect,
	memo,
	useRef,
} from "react";
import styled from "@emotion/styled";
import {
	Star,
	BookmarkPlus,
	PlusCircle,
	Eye,
	Loader,
	AlertCircle,
	CheckCircle,
	Pause,
	X,
} from "lucide-react";
import { AnimeData } from "../types/anime";
import { Card } from "./ui/Card";
import { useUserAnimeDetails } from "../hooks/useAnime";
import { useAddAnime } from "../hooks/useAnime";
import { motion } from "framer-motion";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { LazyLoadedImage } from "./LazyLoadedImage";

interface AnimeCardProps {
	anime: AnimeData;
	onClick?: () => void;
	disableHoverEffects?: boolean;
}

// Use forwardRef to fix the ref warning
const ForwardedCard = forwardRef<HTMLDivElement, any>(
	({ children, ...props }, ref) => (
		<Card {...props} ref={ref}>
			{children}
		</Card>
	)
);

const AnimeCardContainer = styled(ForwardedCard)`
	width: 100%;
	max-width: 240px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0;
	position: relative;
	border-radius: 16px;
	backdrop-filter: blur(8px);
	transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
	border: 1px solid rgba(255, 255, 255, 0.05);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);

	@media (max-width: 480px) {
		max-width: 100%;
	}
`;

// Create a motion component properly
const MotionAnimeCardContainer = motion(AnimeCardContainer);

// Export the AnimeImage component so it can be imported elsewhere
export const AnimeImage = styled.div<{ imageUrl: string }>`
	width: 100%;
	height: 320px;
	background-image: url(${(props) => props.imageUrl});
	background-size: cover;
	background-position: center;
	position: relative;
	background-color: rgba(0, 0, 0, 0.2);

	&:after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.3) 40%,
			rgba(0, 0, 0, 0) 100%
		);
		pointer-events: none;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	@media (max-width: 768px) {
		height: 280px;
	}

	@media (max-width: 480px) {
		height: 240px;
	}
`;

// Create a styled wrapper for LazyLoadedImage
const LazyAnimeImage = styled.div`
	width: 100%;
	height: 320px;
	position: relative;

	&:after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.3) 40%,
			rgba(0, 0, 0, 0) 100%
		);
		pointer-events: none;
		opacity: 0.7;
		transition: opacity 0.3s ease;
		z-index: 1;
	}

	@media (max-width: 768px) {
		height: 280px;
	}

	@media (max-width: 480px) {
		height: 240px;
	}
`;

const AnimeInfo = styled.div`
	padding: 16px;
	background: rgba(255, 255, 255, 0.02);
	backdrop-filter: blur(4px);
	position: relative;
	z-index: 1;
	transition: transform 0.3s ease;
`;

const AnimeTitle = styled.h3`
	margin: 0 0 10px 0;
	font-size: 16px;
	font-weight: 700;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	height: 44px;
	transition: color 0.3s ease;
`;

const AnimeMetadata = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	margin-bottom: 12px;
	color: ${(props) => props.color || "#bdbdbd"};
`;

const AnimeRating = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

const AnimeBadge = styled.span<{ accentColor: string }>`
	background-color: ${(props) => `${props.accentColor || "#1976d2"}20`};
	color: ${(props) => props.accentColor || "#1976d2"};
	padding: 3px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	box-shadow: 0 2px 6px ${(props) => `${props.accentColor || "#1976d2"}20`};
`;

const StatusBadge = styled(motion.div)<{ statusColor: string }>`
	position: absolute;
	top: 12px;
	right: 12px;
	padding: 5px 10px;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 600;
	background-color: ${(props) => `${props.statusColor || "#1976d2"}ee`};
	color: white;
	z-index: 10;
	backdrop-filter: blur(4px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

const IconButton = styled.button<{
	textColor: string;
	bgColor: string;
	primaryColor: string;
}>`
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	color: ${(props) => props.textColor || "white"};
	border-radius: 12px;
	transition: all 0.2s ease;
	backdrop-filter: blur(4px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

	&:hover {
		background-color: ${(props) => props.bgColor || "rgba(25, 118, 210, 0.4)"};
		color: ${(props) => props.primaryColor || "#1976d2"};
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	}

	&:active {
		transform: translateY(0);
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.primaryColor || "#1976d2"};
		outline-offset: 2px;
	}
`;

const LoadingOverlay = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	backdrop-filter: blur(4px);
`;

const RotatingLoader = styled(motion(Loader))`
	color: white;
`;

const HoverOverlay = styled(motion.div)`
	position: absolute;
	inset: 0;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.8) 0%,
		rgba(0, 0, 0, 0.6) 40%,
		rgba(0, 0, 0, 0.3) 100%
	);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	opacity: 0;
	z-index: 5;
	padding: 20px;
	text-align: center;
`;

const ScoreBadge = styled(motion.div)`
	position: absolute;
	top: 12px;
	left: 12px;
	background: rgba(255, 215, 0, 0.8);
	color: #000;
	font-weight: 700;
	font-size: 13px;
	padding: 4px 8px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 4px;
	z-index: 5;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ActionButtonsOverlay = styled.div`
	position: absolute;
	bottom: 16px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	gap: 12px;
	z-index: 6;
`;

const ErrorMessage = styled(motion.div)`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(220, 53, 69, 0.9);
	color: white;
	padding: 8px 12px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 6px;
	z-index: 20;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	max-width: 90%;
`;

// Add a menu for all status options
const StatusMenu = styled.div`
	position: absolute;
	bottom: 16px;
	left: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
	z-index: 6;
	padding: 0 16px;
`;

const StatusOption = styled.button<{ bgColor: string }>`
	background-color: ${(props) => props.bgColor || "rgba(25, 118, 210, 0.4)"};
	color: white;
	border: none;
	border-radius: 8px;
	padding: 8px 12px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	backdrop-filter: blur(4px);
	transition: transform 0.2s ease;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	&:active {
		transform: translateY(0);
	}
`;

// Memoize the component to avoid unnecessary re-renders
export const AnimeCard = memo(function AnimeCard({
	anime,
	onClick,
}: AnimeCardProps) {
	const { data: userAnimeData, isLoading: isLoadingAnimeDetails } =
		useUserAnimeDetails(anime.mal_id);
	const addAnimeMutation = useAddAnime();
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [isAddingToList, setIsAddingToList] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Ensure we don't change state if component unmounts
	const isMounted = useRef(true);
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	// Clear error after a delay
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				if (isMounted.current) {
					setError(null);
				}
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	// Add back the getStatusColor function
	const getStatusColor = (status: string): string => {
		switch (status) {
			case "watching":
				return theme?.colors?.primary || "#1976d2";
			case "completed":
				return theme?.colors?.success || "#2e7d32";
			case "plan_to_watch":
				return theme?.colors?.secondary || "#9c27b0";
			case "on_hold":
				return theme?.colors?.warning || "#ed6c02";
			case "dropped":
				return theme?.colors?.error || "#d32f2f";
			default:
				return theme?.colors?.primary || "#1976d2";
		}
	};

	// Handle status change with useCallback to prevent recreation on every render
	const handleStatusChange = useCallback(
		(
			status:
				| "watching"
				| "completed"
				| "on_hold"
				| "dropped"
				| "plan_to_watch",
			e: React.MouseEvent
		) => {
			e.preventDefault();
			e.stopPropagation();

			if (!anime) return;

			setIsAddingToList(true);
			setError(null);
			addAnimeMutation.mutate(
				{
					anime_id: anime.mal_id,
					status,
					image_url: anime.images.jpg.image_url,
					title: anime.title,
				},
				{
					onSuccess: () => {
						if (isMounted.current) {
							setShowStatusMenu(false);
							setIsAddingToList(false);
						}
					},
					onError: (err) => {
						if (isMounted.current) {
							console.error(`Error adding anime with status ${status}:`, err);
							setError("Failed to add to watchlist");
							setIsAddingToList(false);
						}
					},
				}
			);
		},
		[anime, addAnimeMutation]
	);

	// Ensure image URL exists and is valid
	const imageUrl =
		anime?.images?.jpg?.image_url || anime?.images?.webp?.image_url || "";

	// Check for required data
	const hasRequiredData = !!anime?.mal_id && !!anime?.title;
	if (!hasRequiredData) {
		return (
			<MotionAnimeCardContainer
				elevation="medium"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				backgroundColor={theme?.colors?.background}
				style={{
					minHeight: "200px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div style={{ textAlign: "center", padding: "20px" }}>
					<AlertCircle
						size={32}
						color={theme?.colors?.error || "#d32f2f"}
						style={{ marginBottom: "12px" }}
					/>
					<p>Anime data unavailable</p>
				</div>
			</MotionAnimeCardContainer>
		);
	}

	return (
		<MotionAnimeCardContainer
			elevation="medium"
			hoverEffect
			onClick={onClick}
			backgroundColor={theme?.colors?.background}
			whileHover={{
				y: -8,
				scale: 1.03,
				transition: { type: "spring", stiffness: 300 },
			}}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			aria-label={`View details for ${anime.title}`}
			role="button"
			tabIndex={0}
		>
			<LazyAnimeImage>
				<LazyLoadedImage src={imageUrl} alt={anime.title} height="100%" />
			</LazyAnimeImage>

			{userAnimeData && (
				<StatusBadge
					statusColor={getStatusColor(userAnimeData.status)}
					initial={{ opacity: 0, scale: 0.8, y: -10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{userAnimeData.status.replace("_", " ")}
				</StatusBadge>
			)}

			{(isLoadingAnimeDetails ||
				isAddingToList ||
				addAnimeMutation.isPending) && (
				<LoadingOverlay
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<RotatingLoader
						size={36}
						animate={{
							rotate: 360,
							transition: { duration: 1, repeat: Infinity, ease: "linear" },
						}}
					/>
				</LoadingOverlay>
			)}

			{error && (
				<ErrorMessage
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<AlertCircle size={16} />
					{error}
				</ErrorMessage>
			)}

			{anime.score && (
				<ScoreBadge
					initial={{ opacity: 0, scale: 0.8, x: -10 }}
					animate={{ opacity: 1, scale: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					<Star size={14} fill="black" color="black" />
					{anime.score}
				</ScoreBadge>
			)}

			<HoverOverlay
				animate={{ opacity: isHovered ? 1 : 0 }}
				transition={{ duration: 0.3 }}
			>
				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					style={{
						fontSize: "18px",
						fontWeight: 700,
						marginBottom: "8px",
						color: "white",
						textShadow: "0 2px 4px rgba(0,0,0,0.5)",
					}}
				>
					{anime.title}
				</motion.h3>

				{anime.genres && anime.genres.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
						transition={{ duration: 0.3, delay: 0.2 }}
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "4px",
							justifyContent: "center",
							marginBottom: "16px",
						}}
					>
						{anime.genres.slice(0, 3).map((genre) => (
							<span
								key={genre.mal_id}
								style={{
									backgroundColor: `${theme?.colors?.primary || "#1976d2"}50`,
									color: "white",
									padding: "2px 8px",
									borderRadius: "4px",
									fontSize: "12px",
									fontWeight: "500",
									backdropFilter: "blur(4px)",
								}}
							>
								{genre.name}
							</span>
						))}
					</motion.div>
				)}
			</HoverOverlay>

			{!userAnimeData && isHovered && !showStatusMenu && (
				<ActionButtonsOverlay>
					<IconButton
						onClick={(_e) => setShowStatusMenu(true)}
						textColor="white"
						bgColor={`${theme?.colors?.primary || "#1976d2"}40`}
						primaryColor={theme?.colors?.primary || "#1976d2"}
						aria-label="Add to list"
					>
						<PlusCircle size={20} />
					</IconButton>
				</ActionButtonsOverlay>
			)}

			{!userAnimeData && isHovered && showStatusMenu && (
				<StatusMenu>
					<StatusOption
						bgColor={getStatusColor("watching")}
						onClick={(e) => handleStatusChange("watching", e)}
						aria-label="Start watching"
					>
						<Eye size={16} /> Watching
					</StatusOption>

					<StatusOption
						bgColor={getStatusColor("completed")}
						onClick={(e) => handleStatusChange("completed", e)}
						aria-label="Mark as completed"
					>
						<CheckCircle size={16} /> Completed
					</StatusOption>

					<StatusOption
						bgColor={getStatusColor("plan_to_watch")}
						onClick={(e) => handleStatusChange("plan_to_watch", e)}
						aria-label="Add to plan to watch"
					>
						<BookmarkPlus size={16} /> Plan to Watch
					</StatusOption>

					<StatusOption
						bgColor={getStatusColor("on_hold")}
						onClick={(e) => handleStatusChange("on_hold", e)}
						aria-label="Put on hold"
					>
						<Pause size={16} /> On Hold
					</StatusOption>

					<StatusOption
						bgColor={getStatusColor("dropped")}
						onClick={(e) => handleStatusChange("dropped", e)}
						aria-label="Mark as dropped"
					>
						<X size={16} /> Dropped
					</StatusOption>
				</StatusMenu>
			)}

			<AnimeInfo>
				<AnimeTitle>{anime.title}</AnimeTitle>
				<AnimeMetadata color={theme?.colors?.textSecondary || "#bdbdbd"}>
					<AnimeRating>
						<Star
							size={16}
							fill={anime.score ? "gold" : "none"}
							color={
								anime.score ? "gold" : theme?.colors?.textSecondary || "#bdbdbd"
							}
						/>
						<span>{anime.score || "N/A"}</span>
					</AnimeRating>

					{anime.type && (
						<AnimeBadge accentColor={theme?.colors?.primary || "#1976d2"}>
							{anime.type}
						</AnimeBadge>
					)}
				</AnimeMetadata>

				{/* Only show episodes if the data exists */}
				{anime.episodes && (
					<div
						style={{
							fontSize: "14px",
							color: theme?.colors?.textSecondary || "#bdbdbd",
						}}
					>
						{anime.episodes} episodes {anime.status && `• ${anime.status}`}
					</div>
				)}
			</AnimeInfo>
		</MotionAnimeCardContainer>
	);
});
