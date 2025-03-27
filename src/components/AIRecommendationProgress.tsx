import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import {
	BrainCircuit,
	Zap,
	DatabaseBackup,
	Search,
	Code2,
	Sparkles,
	ListFilter,
	ChevronRight,
} from "lucide-react";

interface AIRecommendationProgressProps {
	stage: string;
	progress: number;
	detail?: string;
}

export function AIRecommendationProgress({
	stage,
	progress,
	detail,
}: AIRecommendationProgressProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Define the stages and their corresponding icons
	const stages = [
		{ name: "Initializing AI engine", icon: <BrainCircuit size={18} /> },
		{
			name: "Analyzing your anime preferences",
			icon: <DatabaseBackup size={18} />,
		},
		{ name: "Extracting anime features", icon: <Code2 size={18} /> },
		{ name: "Building your taste profile", icon: <ListFilter size={18} /> },
		{ name: "Searching for perfect matches", icon: <Search size={18} /> },
		{ name: "Ranking candidate recommendations", icon: <Zap size={18} /> },
		{
			name: "Finalizing your personalized recommendations",
			icon: <Sparkles size={18} />,
		},
		{ name: "Complete!", icon: <ChevronRight size={18} /> },
	];

	// Find current stage
	const currentStageIndex = stages.findIndex((s) => s.name === stage);
	const currentStage = stages[currentStageIndex] || stages[0];

	// Convert progress to percentage
	const progressPercentage = `${Math.min(100, Math.max(0, progress))}%`;

	return (
		<ProgressContainer theme={theme}>
			<ProgressHeader>
				<ProgressTitle>
					<BrainCircuit size={20} />
					AI Recommendation Engine
				</ProgressTitle>
				<ProgressPercentage>{Math.round(progress)}%</ProgressPercentage>
			</ProgressHeader>

			<ProgressBar theme={theme}>
				<ProgressFill
					style={{ width: progressPercentage }}
					initial={{ width: "0%" }}
					animate={{ width: progressPercentage }}
					transition={{ ease: "easeOut", duration: 0.5 }}
				/>
			</ProgressBar>

			<StageInfo>
				<StageIcon theme={theme}>
					<AnimatePresence mode="wait">
						<motion.div
							key={stage}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.3 }}
						>
							{currentStage.icon}
						</motion.div>
					</AnimatePresence>
				</StageIcon>
				<StageDetails>
					<StageName>
						<AnimatePresence mode="wait">
							<motion.div
								key={stage}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
							>
								{currentStage.name}
							</motion.div>
						</AnimatePresence>
					</StageName>

					{detail && (
						<StageDetail>
							<AnimatePresence mode="wait">
								<motion.div
									key={detail}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									transition={{ duration: 0.2 }}
								>
									{detail}
								</motion.div>
							</AnimatePresence>
						</StageDetail>
					)}
				</StageDetails>
			</StageInfo>

			<StagesTimeline>
				{stages.map((s, index) => (
					<TimelineStage
						key={s.name}
						completed={index <= currentStageIndex}
						active={index === currentStageIndex}
						theme={theme}
					/>
				))}
			</StagesTimeline>

			<AnimatingDots>
				<AnimatePresence>
					{progress < 100 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<Dot
								initial={{ y: 0 }}
								animate={{ y: [0, -5, 0] }}
								transition={{
									repeat: Infinity,
									duration: 1,
									delay: 0,
									ease: "easeInOut",
								}}
							/>
							<Dot
								initial={{ y: 0 }}
								animate={{ y: [0, -5, 0] }}
								transition={{
									repeat: Infinity,
									duration: 1,
									delay: 0.2,
									ease: "easeInOut",
								}}
							/>
							<Dot
								initial={{ y: 0 }}
								animate={{ y: [0, -5, 0] }}
								transition={{
									repeat: Infinity,
									duration: 1,
									delay: 0.4,
									ease: "easeInOut",
								}}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</AnimatingDots>
		</ProgressContainer>
	);
}

const ProgressContainer = styled.div<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme?.colors?.surface || "#ffffff"};
	border-radius: 12px;
	padding: 20px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	max-width: 500px;
	margin: 0 auto;
`;

const ProgressHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
`;

const ProgressTitle = styled.h3`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ProgressPercentage = styled.div`
	font-size: 16px;
	font-weight: 600;
`;

const ProgressBar = styled.div<{ theme: AppTheme }>`
	height: 6px;
	background-color: ${(props) =>
		`${props.theme?.colors?.primary || "#1976d2"}10`};
	border-radius: 3px;
	overflow: hidden;
	margin-bottom: 20px;
`;

const ProgressFill = styled(motion.div)`
	height: 100%;
	background: linear-gradient(
		90deg,
		${(props) => props.theme?.colors?.primary || "#1976d2"},
		${(props) => props.theme?.colors?.secondary || "#dc004e"}
	);
	border-radius: 3px;
	box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
`;

const StageInfo = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 20px;
	min-height: 50px;
`;

const StageIcon = styled.div<{ theme: AppTheme }>`
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background-color: ${(props) =>
		`${props.theme?.colors?.primary || "#1976d2"}20`};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${(props) => props.theme?.colors?.primary || "#1976d2"};
	flex-shrink: 0;
`;

const StageDetails = styled.div`
	flex: 1;
`;

const StageName = styled.div`
	font-weight: 600;
	font-size: 16px;
	margin-bottom: 4px;
	min-height: 24px;
	overflow: hidden;
`;

const StageDetail = styled.div`
	font-size: 14px;
	opacity: 0.7;
	min-height: 21px;
	overflow: hidden;
`;

const StagesTimeline = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 16px;
`;

const TimelineStage = styled.div<{
	completed: boolean;
	active: boolean;
	theme: AppTheme;
}>`
	height: 4px;
	flex: 1;
	border-radius: 2px;
	background-color: ${(props) =>
		props.completed
			? props.active
				? props.theme?.colors?.primary || "#1976d2"
				: `${props.theme?.colors?.primary || "#1976d2"}90`
			: `${props.theme?.colors?.primary || "#1976d2"}20`};
	transition: background-color 0.3s ease;
`;

const AnimatingDots = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 8px;
	min-height: 20px;
`;

const Dot = styled(motion.span)`
	display: inline-block;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: currentColor;
	margin: 0 3px;
	opacity: 0.6;
`;
