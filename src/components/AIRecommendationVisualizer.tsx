import React from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import {
	TagWeight,
	RecommendationSource,
	AIRecommendation,
} from "../services/aiRecommendationService";
import {
	BrainCircuit,
	Sparkles,
	Braces,
	GitBranch,
	Zap,
	RefreshCw,
	X,
} from "lucide-react";
import { Button } from "./ui/Button";

interface AIRecommendationVisualizerProps {
	sources: RecommendationSource[];
	recommendations: AIRecommendation[];
	userProfile: {
		topGenres: TagWeight[];
		topThemes: TagWeight[];
		topStudios: TagWeight[];
		preferredYears: TagWeight[];
		preferredTypes: TagWeight[];
	};
	confidence: number;
	processingTime: number;
	onRegenerate: () => void;
	onClear: () => void;
	isGenerating: boolean;
}

export function AIRecommendationVisualizer({
	sources,
	recommendations,
	userProfile,
	confidence,
	processingTime,
	onRegenerate,
	onClear,
	isGenerating,
}: AIRecommendationVisualizerProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<VisualizerContainer>
			<VisualizerHeader theme={theme}>
				<div>
					<HeaderTitle>
						<BrainCircuit size={24} />
						AI Recommendation Engine
					</HeaderTitle>
				</div>

				<HeaderContent>
					<HeaderStats>
						<StatItem>
							<StatLabel>Confidence</StatLabel>
							<ConfidenceBar theme={theme} confidence={confidence}>
								<ConfidenceFill confidence={confidence} />
							</ConfidenceBar>
							<StatValue>{Math.round(confidence * 100)}%</StatValue>
						</StatItem>
						<StatItem>
							<StatLabel>Processing Time</StatLabel>
							<StatValue>{(processingTime / 1000).toFixed(1)}s</StatValue>
						</StatItem>
					</HeaderStats>

					<HeaderActions>
						<Button
							variant="primary"
							size="small"
							icon={<RefreshCw size={16} />}
							onClick={onRegenerate}
							disabled={isGenerating}
						>
							{isGenerating ? "Generating..." : "Regenerate"}
						</Button>
						<Button
							variant="outline"
							size="small"
							icon={<X size={16} />}
							onClick={onClear}
							disabled={isGenerating}
						>
							Clear
						</Button>
					</HeaderActions>
				</HeaderContent>
			</VisualizerHeader>

			<VisualizerContent>
				<SourceSection>
					<SectionTitle theme={theme}>
						<Braces size={20} />
						Source Analysis
					</SectionTitle>

					<SourceFlow>
						{sources.slice(0, 5).map((source, index) => (
							<SourceNode
								key={source.animeId}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								theme={theme}
							>
								<SourceImage src={source.imageUrl} alt={source.title} />
								<SourceInfo>
									<SourceTitle>{source.title}</SourceTitle>
									<SourceContribution>
										<ContributionBar
											width={`${source.contribution}%`}
											theme={theme}
										/>
										<span>{source.contribution}%</span>
									</SourceContribution>
									<SourceTags>
										{source.matchingTags?.map((tag) => (
											<TagChip key={tag} theme={theme}>
												{tag}
											</TagChip>
										))}
									</SourceTags>
								</SourceInfo>
								<SourceConnector theme={theme} />
							</SourceNode>
						))}
					</SourceFlow>
				</SourceSection>

				<ProfileSection>
					<SectionTitle theme={theme}>
						<GitBranch size={20} />
						Taste Profile
					</SectionTitle>

					<ProfileGrid>
						<ProfileCategory theme={theme}>
							<CategoryTitle>Top Genres</CategoryTitle>
							<TagGroup>
								{userProfile.topGenres.map((genreItem) => (
									<WeightedTag
										key={genreItem.tag}
										weight={genreItem.weight}
										theme={theme}
									>
										{genreItem.tag}
									</WeightedTag>
								))}
							</TagGroup>
						</ProfileCategory>

						<ProfileCategory theme={theme}>
							<CategoryTitle>Top Themes</CategoryTitle>
							<TagGroup>
								{userProfile.topThemes.map((themeItem) => (
									<WeightedTag
										key={themeItem.tag}
										weight={themeItem.weight}
										theme={theme}
									>
										{themeItem.tag}
									</WeightedTag>
								))}
							</TagGroup>
						</ProfileCategory>

						<ProfileCategory theme={theme}>
							<CategoryTitle>Preferred Studios</CategoryTitle>
							<TagGroup>
								{userProfile.topStudios.map((studioItem) => (
									<WeightedTag
										key={studioItem.tag}
										weight={studioItem.weight}
										theme={theme}
									>
										{studioItem.tag}
									</WeightedTag>
								))}
							</TagGroup>
						</ProfileCategory>
					</ProfileGrid>
				</ProfileSection>

				<RecommendationFlow>
					<SectionTitle theme={theme}>
						<Zap size={20} />
						Match Generation
					</SectionTitle>

					<FlowVisualization>
						{recommendations.slice(0, 5).map((rec, index) => (
							<MatchNode
								key={rec.animeId}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3 + index * 0.15 }}
								theme={theme}
								matchScore={rec.matchScore}
							>
								<MatchImage src={rec.imageUrl} alt={rec.title} />
								<MatchInfo>
									<MatchTitle>{rec.title}</MatchTitle>
									<MatchScoreBadge score={rec.matchScore} theme={theme}>
										<Sparkles size={12} />
										{rec.matchScore}% Match
									</MatchScoreBadge>
									<MatchTags>
										{rec.matchedTags.map((tag) => (
											<TagChip key={tag} theme={theme} small>
												{tag}
											</TagChip>
										))}
									</MatchTags>
								</MatchInfo>
							</MatchNode>
						))}
					</FlowVisualization>
				</RecommendationFlow>
			</VisualizerContent>
		</VisualizerContainer>
	);
}

const VisualizerContainer = styled.div`
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
	padding: 16px;
`;

const VisualizerHeader = styled.div<{ theme: AppTheme }>`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 12px;
	padding: 16px 24px;
	margin-bottom: 24px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

	@media (max-width: 768px) {
		flex-direction: column;
		gap: 16px;
	}
`;

const HeaderContent = styled.div`
	display: flex;
	gap: 24px;
	align-items: center;

	@media (max-width: 768px) {
		width: 100%;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
`;

const HeaderActions = styled.div`
	display: flex;
	gap: 8px;

	@media (max-width: 768px) {
		width: 100%;
		justify-content: flex-end;
	}
`;

const HeaderTitle = styled.h2`
	margin: 0;
	font-size: 20px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 10px;
`;

const HeaderStats = styled.div`
	display: flex;
	gap: 24px;

	@media (max-width: 768px) {
		width: 100%;
		justify-content: space-between;
	}
`;

const StatItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4px;
`;

const StatLabel = styled.span`
	font-size: 12px;
	opacity: 0.7;
`;

const StatValue = styled.span`
	font-size: 16px;
	font-weight: 600;
`;

const ConfidenceBar = styled.div<{ theme: AppTheme; confidence: number }>`
	width: 100px;
	height: 4px;
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 2px;
	overflow: hidden;
`;

const ConfidenceFill = styled.div<{ confidence: number }>`
	height: 100%;
	width: ${(props) => props.confidence * 100}%;
	background: linear-gradient(90deg, #12c2e9, #c471ed, #f64f59);
	border-radius: 2px;
`;

const VisualizerContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 32px;
`;

const SectionTitle = styled.h3<{ theme: AppTheme }>`
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
	color: ${(props) => props.theme.colors.text};
`;

const SourceSection = styled.div`
	margin-bottom: 20px;
`;

const SourceFlow = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
`;

const SourceNode = styled(motion.div)<{ theme: AppTheme }>`
	position: relative;
	display: flex;
	width: calc(20% - 14px);
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
	flex-direction: column;
	min-width: 150px;

	@media (max-width: 768px) {
		width: calc(33.33% - 12px);
	}

	@media (max-width: 500px) {
		width: calc(50% - 8px);
	}
`;

const SourceImage = styled.img`
	width: 100%;
	aspect-ratio: 0.7;
	object-fit: cover;
`;

const SourceInfo = styled.div`
	padding: 12px;
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const SourceTitle = styled.h4`
	margin: 0 0 8px 0;
	font-size: 14px;
	font-weight: 600;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.3;
`;

const SourceContribution = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
	font-size: 12px;
	font-weight: 500;
`;

const ContributionBar = styled.div<{ width: string; theme: AppTheme }>`
	height: 4px;
	width: ${(props) => props.width};
	max-width: 70%;
	background-color: ${(props) => props.theme.colors.primary};
	border-radius: 2px;
`;

const SourceTags = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: auto;
`;

const TagChip = styled.span<{ theme: AppTheme; small?: boolean }>`
	font-size: ${(props) => (props.small ? "10px" : "11px")};
	padding: ${(props) => (props.small ? "2px 4px" : "3px 6px")};
	background-color: ${(props) =>
		props.theme && props.theme.colors && props.theme.colors.primary
			? `${props.theme.colors.primary}20`
			: "rgba(67, 97, 238, 0.2)"};
	color: ${(props) =>
		props.theme && props.theme.colors && props.theme.colors.primary
			? props.theme.colors.primary
			: "#4361ee"};
	border-radius: 4px;
	font-weight: 500;
`;

const SourceConnector = styled.div<{ theme: AppTheme }>`
	position: absolute;
	bottom: -20px;
	left: 50%;
	width: 2px;
	height: 20px;
	background-color: ${(props) =>
		props.theme && props.theme.colors && props.theme.colors.primary
			? `${props.theme.colors.primary}50`
			: "rgba(67, 97, 238, 0.5)"};
	z-index: 1;

	&::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: -4px;
		width: 10px;
		height: 10px;
		background-color: ${(props) =>
			props.theme && props.theme.colors && props.theme.colors.primary
				? props.theme.colors.primary
				: "#4361ee"};
		border-radius: 50%;
	}
`;

const ProfileSection = styled.div`
	position: relative;
	padding: 20px;
	background-color: rgba(0, 0, 0, 0.03);
	border-radius: 12px;
	margin-bottom: 40px;

	&::after {
		content: "";
		position: absolute;
		bottom: -20px;
		left: 50%;
		width: 2px;
		height: 20px;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent);
	}
`;

const ProfileGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;

	@media (max-width: 768px) {
		grid-template-columns: repeat(2, 1fr);
	}

	@media (max-width: 500px) {
		grid-template-columns: 1fr;
	}
`;

const ProfileCategory = styled.div<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 8px;
	padding: 16px;
`;

const CategoryTitle = styled.h4`
	margin: 0 0 12px 0;
	font-size: 14px;
	font-weight: 600;
`;

const TagGroup = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

const WeightedTag = styled.span<{ weight: number; theme: AppTheme }>`
	font-size: 13px;
	padding: 4px 10px;
	background-color: ${(props) =>
		props.theme && props.theme.colors && props.theme.colors.primary
			? `${props.theme.colors.primary}${Math.min(
					80,
					Math.round(props.weight * 15)
			  )}`
			: `rgba(67, 97, 238, ${Math.min(0.8, props.weight * 0.15)})`};
	color: ${(props) =>
		props.weight > 3
			? "#fff"
			: props.theme && props.theme.colors && props.theme.colors.text
			? props.theme.colors.text
			: "#212529"};
	border-radius: 16px;
	font-weight: 500;
`;

const RecommendationFlow = styled.div`
	margin-top: 20px;
`;

const FlowVisualization = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	justify-content: center;
`;

const MatchNode = styled(motion.div)<{ theme: AppTheme; matchScore: number }>`
	display: flex;
	width: calc(20% - 14px);
	background: ${(props) =>
		props.theme && props.theme.colors && props.theme.colors.primary
			? `linear-gradient(45deg, ${props.theme.colors.surface}, ${props.theme.colors.surface}, ${props.theme.colors.primary}10)`
			: "linear-gradient(45deg, #f8f9fa, #f8f9fa, rgba(67, 97, 238, 0.1))"};
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	border: 2px solid
		${(props) => {
			const intensity = Math.min(80, Math.round(props.matchScore / 1.5));
			return props.theme && props.theme.colors && props.theme.colors.primary
				? `${props.theme.colors.primary}${intensity}`
				: `rgba(67, 97, 238, ${intensity / 100})`;
		}};
	flex-direction: column;
	min-width: 150px;

	@media (max-width: 768px) {
		width: calc(33.33% - 12px);
	}

	@media (max-width: 500px) {
		width: calc(50% - 8px);
	}
`;

const MatchImage = styled.img`
	width: 100%;
	aspect-ratio: 0.7;
	object-fit: cover;
`;

const MatchInfo = styled.div`
	padding: 12px;
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const MatchTitle = styled.h4`
	margin: 0 0 8px 0;
	font-size: 14px;
	font-weight: 600;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	line-height: 1.3;
`;

const MatchScoreBadge = styled.div<{ score: number; theme: AppTheme }>`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	font-weight: 600;
	padding: 4px 8px;
	border-radius: 16px;
	margin-bottom: 10px;
	color: #fff;
	background: ${(props) => {
		const score = props.score;
		if (score >= 90) return "linear-gradient(45deg, #FF5F6D, #FFC371)";
		if (score >= 80) return "linear-gradient(45deg, #36D1DC, #5B86E5)";
		if (score >= 70) return "linear-gradient(45deg, #8A2387, #E94057)";
		return "linear-gradient(45deg, #414345, #232526)";
	}};
`;

const MatchTags = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: auto;
`;
