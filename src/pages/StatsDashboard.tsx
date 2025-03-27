import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { useUserAnimeList } from "../hooks/useAnime";
import { BarChart2, PieChart as PieChartIcon, Star } from "lucide-react";
import { Card } from "../components/ui/Card";
import { motion } from "framer-motion";
import { UserAnimeData } from "../types/anime";
import { BarChart } from "../components/ui/BarChart";
import { PieChart } from "../components/ui/PieChart";

interface StatsDashboardProps {
	onBack: () => void;
}

// Statistical data model
interface AnimeStats {
	totalAnime: number;
	totalEpisodes: number;
	averageScore: number;
	statusDistribution: {
		watching: number;
		completed: number;
		plan_to_watch: number;
		on_hold: number;
		dropped: number;
	};
	scoreDistribution: {
		[key: number]: number;
	};
}

// Styled Components
const Container = styled.div`
	max-width: 1000px;
	margin: 0 auto;
	padding: 24px;
`;

const Header = styled.div`
	margin-bottom: 24px;
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

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 24px;
	margin-bottom: 24px;
`;

const StatCard = styled(motion(Card))`
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StatHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
`;

const StatTitle = styled.h3`
	font-size: 16px;
	font-weight: 600;
	margin: 0;
	color: ${(props) => props.color};
`;

const StatIcon = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${(props) => props.color};
	color: ${(props) => props.color};
`;

const StatValue = styled.div`
	font-size: 32px;
	font-weight: 700;
	margin-bottom: 8px;
	color: ${(props) => props.color};
`;

const StatFooter = styled.div`
	font-size: 14px;
	color: ${(props) => props.color};
`;

// const ChartContainer = styled.div`
// 	width: 100%;
// 	height: 200px;
// 	margin-top: 20px;
// `;

const ProgressBar = styled.div<{ width: string; color: string }>`
	height: 8px;
	width: ${(props) => props.width};
	background-color: ${(props) => props.color};
	border-radius: 4px;
	margin-bottom: 8px;
	transition: width 1s ease-in-out;
`;

const StatusGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 16px;
	margin-top: 16px;
`;

const StatusItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const StatusDot = styled.div<{ color: string }>`
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background-color: ${(props) => props.color};
	margin-right: 8px;
`;

const StatusLabel = styled.div`
	display: flex;
	align-items: center;
	font-size: 14px;
	margin-bottom: 4px;
`;

const StatusValue = styled.div`
	font-size: 16px;
	font-weight: 600;
`;

const ChartRow = styled.div`
	display: flex;
	gap: 24px;
	margin-top: 24px;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const ChartColumn = styled.div`
	flex: 1;
`;

// Calculate statistics from anime list
const calculateStats = (animeList: UserAnimeData[]): AnimeStats => {
	// Initialize stats
	const stats: AnimeStats = {
		totalAnime: animeList.length,
		totalEpisodes: 0,
		averageScore: 0,
		statusDistribution: {
			watching: 0,
			completed: 0,
			plan_to_watch: 0,
			on_hold: 0,
			dropped: 0,
		},
		scoreDistribution: {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0,
			7: 0,
			8: 0,
			9: 0,
			10: 0,
		},
	};

	// Skip empty list
	if (animeList.length === 0) return stats;

	// Calculate episode count and score sum
	let scoreSum = 0;
	let scoredAnimeCount = 0;

	animeList.forEach((anime) => {
		// Count total episodes watched
		stats.totalEpisodes += anime.progress;

		// Count status
		stats.statusDistribution[anime.status]++;

		// Score distribution
		if (anime.score > 0) {
			stats.scoreDistribution[anime.score]++;
			scoreSum += anime.score;
			scoredAnimeCount++;
		}
	});

	// Calculate average score (only for anime that have scores)
	stats.averageScore =
		scoredAnimeCount > 0
			? parseFloat((scoreSum / scoredAnimeCount).toFixed(1))
			: 0;

	return stats;
};

// Format number with commas
const formatNumber = (num: number): string => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// StatCard component for reusability
const Stat = ({
	title,
	value,
	icon,
	footer,
	theme,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	footer?: string;
	theme: any;
}) => (
	<StatCard
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
		style={{
			background: theme.colors.surface,
			border: `1px solid ${theme.colors.primary}20`,
		}}
	>
		<StatHeader>
			<StatTitle color={theme.colors.text}>{title}</StatTitle>
			<StatIcon
				style={{
					backgroundColor: `${theme.colors.primary}20`,
					color: theme.colors.primary,
				}}
			>
				{icon}
			</StatIcon>
		</StatHeader>
		<StatValue color={theme.colors.text}>{value}</StatValue>
		{footer && (
			<StatFooter color={theme.colors.textSecondary}>{footer}</StatFooter>
		)}
	</StatCard>
);

export function StatsDashboard({}: StatsDashboardProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const { data: animeList, isLoading } = useUserAnimeList();
	const [stats, setStats] = useState<AnimeStats | null>(null);

	useEffect(() => {
		if (animeList) {
			setStats(calculateStats(animeList));
		}
	}, [animeList]);

	if (isLoading) {
		return <div>Loading statistics...</div>;
	}

	if (!stats) {
		return <div>No stats available</div>;
	}

	// Format the status labels
	const formatStatus = (status: string): string => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Get color for status
	const getStatusColor = (status: string): string => {
		switch (status) {
			case "watching":
				return theme.colors.primary;
			case "completed":
				return theme.colors.success || "#000000";
			case "plan_to_watch":
				return theme.colors.accent || "#000000";
			case "on_hold":
				return theme.colors.warning || "#000000";
			case "dropped":
				return theme.colors.error || "#000000";
			default:
				return theme.colors.primary || "#000000";
		}
	};

	// Prepare data for bar charts
	const statusChartData = Object.entries(stats.statusDistribution).map(
		([status, count]) => ({
			label: formatStatus(status),
			value: count,
			color: getStatusColor(status),
		})
	);

	const scoreChartData = Object.entries(stats.scoreDistribution)
		.filter(([_, count]) => count > 0)
		.map(([score, count]) => ({
			label: score,
			value: count,
			color: theme.colors.primary,
		}));

	return (
		<Container>
			<Header>
				<Title>Statistics Dashboard</Title>
				<Subtitle color={theme.colors.textSecondary}>
					Overview of your anime collection
				</Subtitle>
			</Header>

			<StatsGrid>
				<Stat
					title="Total Anime"
					value={formatNumber(stats.totalAnime)}
					icon={<BarChart2 size={24} />}
					theme={theme}
				/>

				<Stat
					title="Episodes Watched"
					value={formatNumber(stats.totalEpisodes)}
					icon={<PieChartIcon size={24} />}
					theme={theme}
				/>

				<Stat
					title="Average Score"
					value={stats.averageScore.toString()}
					icon={<Star size={24} />}
					footer="Out of 10"
					theme={theme}
				/>
			</StatsGrid>

			<StatCard
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				style={{
					background: theme.colors.surface,
					border: `1px solid ${theme.colors.primary}20`,
				}}
			>
				<StatHeader>
					<StatTitle color={theme.colors.text}>Status Distribution</StatTitle>
				</StatHeader>

				<StatusGrid>
					{Object.entries(stats.statusDistribution).map(([status, count]) => (
						<StatusItem key={status}>
							<StatusLabel>
								<StatusDot color={getStatusColor(status)} />
								<span>{formatStatus(status)}</span>
							</StatusLabel>
							<StatusValue>{count}</StatusValue>
							<ProgressBar
								width={`${(count / stats.totalAnime) * 100}%`}
								color={getStatusColor(status)}
							/>
						</StatusItem>
					))}
				</StatusGrid>

				<ChartRow>
					<ChartColumn>
						<PieChart
							data={statusChartData}
							size={240}
							showLabels={true}
							animate={true}
						/>
					</ChartColumn>

					<ChartColumn>
						<BarChart data={statusChartData} height={240} animate={true} />
					</ChartColumn>
				</ChartRow>
			</StatCard>

			<StatCard
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				style={{
					marginTop: "24px",
					background: theme.colors.surface,
					border: `1px solid ${theme.colors.primary}20`,
				}}
			>
				<StatHeader>
					<StatTitle color={theme.colors.text}>Score Distribution</StatTitle>
				</StatHeader>

				<StatusGrid
					style={{
						gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
					}}
				>
					{Object.entries(stats.scoreDistribution)
						.filter(([_, count]) => count > 0)
						.map(([score, count]) => (
							<StatusItem key={score}>
								<StatusValue>{score}</StatusValue>
								<StatusLabel>{count} anime</StatusLabel>
								<ProgressBar
									width={`${(count / stats.totalAnime) * 100}%`}
									color={theme.colors.primary}
								/>
							</StatusItem>
						))}
				</StatusGrid>

				<BarChart data={scoreChartData} height={200} animate={true} />
			</StatCard>
		</Container>
	);
}
