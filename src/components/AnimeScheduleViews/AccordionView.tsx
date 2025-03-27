import React, { useState } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { AnimeData } from "../../types/anime";
import { AppTheme } from "../../themes/themeTypes";
import {
	DayOfWeek,
	TimeFormat,
	getCurrentDay,
	formatTime,
	sortDays,
} from "../AnimeScheduleView";

interface AccordionViewProps {
	animeByDay: Record<DayOfWeek, AnimeData[]>;
	timeFormat: TimeFormat;
	setTimeFormat: (format: TimeFormat) => void;
	onAnimeSelect: (id: number) => void;
	theme: AppTheme;
}

const AccordionView: React.FC<AccordionViewProps> = ({
	animeByDay,
	timeFormat,
	setTimeFormat,
	onAnimeSelect,
	theme,
}) => {
	const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(
		new Set([getCurrentDay()])
	);

	const currentDay = getCurrentDay();

	const toggleDay = (day: DayOfWeek) => {
		const newExpandedDays = new Set(expandedDays);
		if (newExpandedDays.has(day)) {
			newExpandedDays.delete(day);
		} else {
			newExpandedDays.add(day);
		}
		setExpandedDays(newExpandedDays);
	};

	return (
		<Container>
			<TimeToggle>
				<ToggleLabel theme={theme}>
					<Clock size={14} />
					Time Format:
				</ToggleLabel>
				<ToggleButton
					isActive={timeFormat === "24h"}
					onClick={() => setTimeFormat("24h")}
					theme={theme}
				>
					24h
				</ToggleButton>
				<ToggleButton
					isActive={timeFormat === "12h"}
					onClick={() => setTimeFormat("12h")}
					theme={theme}
				>
					12h
				</ToggleButton>
			</TimeToggle>

			{Object.keys(animeByDay)
				.filter((day) => day !== "Unknown" || animeByDay.Unknown.length > 0)
				.sort((a, b) => sortDays(a as DayOfWeek, b as DayOfWeek))
				.map((day) => {
					const dayAnime = animeByDay[day as DayOfWeek];
					const isToday = day === currentDay;
					const isExpanded = expandedDays.has(day as DayOfWeek);

					return (
						<DayContainer key={day} isToday={isToday} theme={theme}>
							<DayHeader
								onClick={() => toggleDay(day as DayOfWeek)}
								isExpanded={isExpanded}
								theme={theme}
							>
								<DayTitle>
									{day}{" "}
									{isToday && <TodayBadge theme={theme}>Today</TodayBadge>}
								</DayTitle>
								<Count theme={theme}>{dayAnime.length} anime</Count>
							</DayHeader>

							{isExpanded && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3 }}
								>
									<AnimeList>
										{dayAnime.length > 0 ? (
											dayAnime.map((anime) => (
												<AnimeItem
													key={anime.mal_id}
													onClick={() => onAnimeSelect(anime.mal_id)}
													theme={theme}
												>
													<AnimeImage
														src={anime.images.jpg.image_url}
														alt={anime.title}
													/>
													<AnimeInfo>
														<AnimeTitle>{anime.title}</AnimeTitle>
														<AnimeTime theme={theme}>
															<Clock size={14} />
															{formatTime(anime.broadcast?.time, timeFormat)}
														</AnimeTime>
														<AnimeStats>
															{anime.type && (
																<AnimeStat theme={theme}>
																	{anime.type}
																</AnimeStat>
															)}
															{anime.studios && anime.studios.length > 0 && (
																<AnimeStat theme={theme}>
																	{anime.studios[0].name}
																</AnimeStat>
															)}
															{anime.score && (
																<AnimeStat theme={theme}>
																	⭐ {anime.score}
																</AnimeStat>
															)}
														</AnimeStats>
													</AnimeInfo>
												</AnimeItem>
											))
										) : (
											<EmptyDay theme={theme}>
												No anime scheduled for this day
											</EmptyDay>
										)}
									</AnimeList>
								</motion.div>
							)}
						</DayContainer>
					);
				})}
		</Container>
	);
};

// Styled components for the accordion layout
const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px 0;
`;

const TimeToggle = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-bottom: 16px;
`;

const ToggleLabel = styled.span<{ theme: AppTheme }>`
	margin-right: 8px;
	font-size: 14px;
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
	display: flex;
	align-items: center;
	gap: 4px;
`;

const ToggleButton = styled.button<{ isActive: boolean; theme: AppTheme }>`
	background: ${(props) =>
		props.isActive
			? props.theme?.colors?.primary || "#007bff"
			: props.theme?.colors?.surface || "#fff"};
	color: ${(props) =>
		props.isActive ? "white" : props.theme?.colors?.text || "#333"};
	border: 1px solid ${(props) => props.theme?.colors?.primary || "#007bff"};
	padding: 6px 12px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:first-of-type {
		border-radius: 4px 0 0 4px;
	}

	&:last-of-type {
		border-radius: 0 4px 4px 0;
	}

	&:hover {
		background: ${(props) =>
			props.isActive
				? props.theme?.colors?.primary || "#007bff"
				: `${props.theme?.colors?.primary || "#007bff"}20`};
	}
`;

const DayContainer = styled.div<{ isToday: boolean; theme: AppTheme }>`
	background-color: ${(props) =>
		props.isToday
			? `${props.theme?.colors?.primary || "#007bff"}10`
			: props.theme?.colors?.surface || "#fff"};
	border-radius: ${(props) => props.theme?.borderRadius || "8px"};
	box-shadow: ${(props) =>
		props.theme?.boxShadow || "0 2px 8px rgba(0, 0, 0, 0.1)"};
	overflow: hidden;
	border-left: ${(props) =>
		props.isToday
			? `4px solid ${props.theme?.colors?.primary || "#007bff"}`
			: "none"};
`;

const DayHeader = styled.div<{ isExpanded: boolean; theme: AppTheme }>`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	cursor: pointer;
	user-select: none;
	background-color: ${(props) =>
		props.isExpanded
			? `${props.theme?.colors?.primary || "#007bff"}05`
			: "transparent"};

	&:hover {
		background-color: ${(props) =>
			`${props.theme?.colors?.primary || "#007bff"}08`};
	}
`;

const DayTitle = styled.h3`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const TodayBadge = styled.span<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme?.colors?.primary || "#007bff"};
	color: white;
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 12px;
	font-weight: 500;
`;

const AnimeList = styled.div`
	display: flex;
	flex-direction: column;
`;

const AnimeItem = styled.div<{ theme: AppTheme }>`
	display: flex;
	padding: 12px 20px;
	gap: 16px;
	border-top: 1px solid
		${(props) => props.theme?.colors?.background || "#f5f5f5"};
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			`${props.theme?.colors?.primary || "#007bff"}08`};
	}
`;

const AnimeImage = styled.img`
	width: 60px;
	height: 85px;
	object-fit: cover;
	border-radius: 6px;
`;

const AnimeInfo = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
`;

const AnimeTitle = styled.h4`
	margin: 0 0 4px 0;
	font-size: 16px;
	font-weight: 500;
`;

const AnimeTime = styled.span<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 14px;
	color: ${(props) => props.theme?.colors?.primary || "#007bff"};
	margin-bottom: 8px;
`;

const AnimeStats = styled.div`
	display: flex;
	gap: 12px;
	font-size: 13px;
`;

const AnimeStat = styled.span<{ theme: AppTheme }>`
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
`;

const EmptyDay = styled.div<{ theme: AppTheme }>`
	padding: 16px 20px;
	font-size: 15px;
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
	text-align: center;
	font-style: italic;
`;

const Count = styled.span<{ theme: AppTheme }>`
	font-size: 14px;
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
`;

export default AccordionView;
