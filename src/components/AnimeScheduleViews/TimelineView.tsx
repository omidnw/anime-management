import React, { useState, useMemo, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeData } from "../../types/anime";
import { AppTheme } from "../../themes/themeTypes";
import {
	DayOfWeek,
	TimeFormat,
	TimeSlot,
	getCurrentDay,
	formatTime,
	sortDays,
} from "../AnimeScheduleView";

interface TimelineViewProps {
	animeByDay: Record<DayOfWeek, AnimeData[]>;
	timeFormat: TimeFormat;
	setTimeFormat: (format: TimeFormat) => void;
	onAnimeSelect: (id: number) => void;
	theme: AppTheme;
}

const TimelineView: React.FC<TimelineViewProps> = ({
	animeByDay,
	timeFormat,
	setTimeFormat,
	onAnimeSelect,
	theme,
}) => {
	const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDay());
	const [showAllDays, setShowAllDays] = useState(true);
	const [hoveredAnime, setHoveredAnime] = useState<number | null>(null);
	const timelineRef = useRef<HTMLDivElement>(null);
	const [isDataReady, setIsDataReady] = useState(false);
	const [_currentTimePosition, setCurrentTimePosition] = useState<number | null>(
		null
	);

	// Create time slots with 1-hour intervals for all 24 hours
	const timeSlots = useMemo<TimeSlot[]>(() => {
		const slots = [];

		// First blank column for "Day"
		slots.push({
			label: "",
			value: "",
			hour: -1,
			minute: 0,
		});

		// Time slots from 00:00 to 23:00 for full day coverage
		for (let hour = 0; hour < 24; hour++) {
			slots.push({
				label: `${hour.toString().padStart(2, "0")}:00`,
				value: `${hour.toString().padStart(2, "0")}:00`,
				hour: hour,
				minute: 0,
			});
		}

		return slots;
	}, []);

	const currentDay = getCurrentDay();
	const currentHour = new Date().getHours();
	// const currentMinute = new Date().getMinutes();

	// Calculate visible days
	const visibleDays = useMemo(() => {
		if (showAllDays) {
			return Object.keys(animeByDay)
				.filter((day) => day !== "Unknown" || animeByDay.Unknown.length > 0)
				.sort((a, b) => sortDays(a as DayOfWeek, b as DayOfWeek))
				.map((day) => day as DayOfWeek);
		} else {
			return [activeDay];
		}
	}, [animeByDay, activeDay, showAllDays]);

	// Process anime data after fetching
	useEffect(() => {
		if (Object.values(animeByDay).some((day) => day.length > 0)) {
			setIsDataReady(true);
		}
	}, [animeByDay]);

	// Scroll to current time when timeline loads
	useEffect(() => {
		if (timelineRef.current && isDataReady) {
			const scrollToCurrentTime = () => {
				const currentHour = new Date().getHours();

				// Find index of current hour in our time slots
				let targetIndex = timeSlots.findIndex(
					(slot) => slot.hour === currentHour
				);

				// If current hour is not in our time slots, find the closest one
				if (targetIndex === -1) {
					targetIndex = 1; // Default to first hour if not found
				}

				if (targetIndex >= 0) {
					const cellWidth = 90; // Width of each time column
					const scrollPos = Math.max(0, (targetIndex - 2) * cellWidth);
					timelineRef.current?.scrollTo({
						left: scrollPos,
						behavior: "smooth",
					});
				}
			};

			// Wait a bit for the layout to stabilize
			const timer = setTimeout(scrollToCurrentTime, 300);
			return () => clearTimeout(timer);
		}
	}, [timeSlots, isDataReady]);

	// Update current time position
	useEffect(() => {
		if (isDataReady) {
			const updateCurrentTimePosition = () => {
				const now = new Date();
				const hour = now.getHours();
				const minute = now.getMinutes();

				// Find index of current hour in our time slots
				const slotIndex = timeSlots.findIndex((slot) => slot.hour === hour);

				if (slotIndex >= 0) {
					const minutePercentage = minute / 60;
					setCurrentTimePosition(slotIndex + minutePercentage);
				} else {
					setCurrentTimePosition(null);
				}
			};

			updateCurrentTimePosition();
			const interval = setInterval(updateCurrentTimePosition, 60000); // Update every minute

			return () => clearInterval(interval);
		}
	}, [timeSlots, isDataReady]);

	// Helper to get anime for a specific time slot
	const getAnimeForTimeSlot = (day: DayOfWeek, hour: number): AnimeData[] => {
		if (hour < 0) return []; // Skip the Day column

		const dayAnime = animeByDay[day];
		if (!dayAnime || dayAnime.length === 0) return [];

		return dayAnime.filter((anime) => {
			if (!anime.broadcast?.time) return false;

			const [hoursStr] = anime.broadcast.time.split(":");
			const animeHour = parseInt(hoursStr, 10);

			return animeHour === hour;
		});
	};

	// Helper to calculate position within a time slot (in minutes)
	// const getAnimePositionInSlot = (anime: AnimeData): number => {
	// 	if (!anime.broadcast?.time) return 0;

	// 	const [_, minutesStr] = anime.broadcast.time.split(":");
	// 	return parseInt(minutesStr, 10) || 0;
	// };

	return (
		<Container>
			<Controls>
				<ControlGroup>
					<ControlLabel theme={theme}>
						<Clock size={16} />
						<span>Time Format:</span>
					</ControlLabel>
					<ToggleButtons>
						<ToggleButton
							active={timeFormat === "24h"}
							onClick={() => setTimeFormat("24h")}
							theme={theme}
						>
							24h
						</ToggleButton>
						<ToggleButton
							active={timeFormat === "12h"}
							onClick={() => setTimeFormat("12h")}
							theme={theme}
						>
							12h
						</ToggleButton>
					</ToggleButtons>
				</ControlGroup>

				<ControlGroup>
					<ControlLabel theme={theme}>
						<Calendar size={16} />
						<span>View:</span>
					</ControlLabel>
					<ToggleButtons>
						<ToggleButton
							active={showAllDays}
							onClick={() => setShowAllDays(true)}
							theme={theme}
						>
							All Days
						</ToggleButton>
						<ToggleButton
							active={!showAllDays}
							onClick={() => setShowAllDays(false)}
							theme={theme}
						>
							Single Day
						</ToggleButton>
					</ToggleButtons>
				</ControlGroup>
			</Controls>

			{!showAllDays && (
				<DaySelector theme={theme}>
					{Object.keys(animeByDay)
						.filter((day) => day !== "Unknown" || animeByDay.Unknown.length > 0)
						.sort((a, b) => sortDays(a as DayOfWeek, b as DayOfWeek))
						.map((day) => (
							<DayButton
								key={day}
								active={day === activeDay}
								isToday={day === currentDay}
								theme={theme}
								onClick={() => setActiveDay(day as DayOfWeek)}
							>
								{day}
								{day === currentDay && <TodayIndicator theme={theme} />}
								<AnimeCount theme={theme}>
									{animeByDay[day as DayOfWeek].length}
								</AnimeCount>
							</DayButton>
						))}
				</DaySelector>
			)}

			<ScrollHint theme={theme}>
				<ChevronLeft size={16} />
				<span>Scroll to view all hours</span>
				<ChevronRight size={16} />
			</ScrollHint>

			<TimelineContainer ref={timelineRef} theme={theme}>
				<TimelineTable>
					<TimelineHeader theme={theme}>
						{timeSlots.map((slot, index) => (
							<TimeColumnHeader
								key={index}
								isFirst={index === 0}
								isCurrent={slot.hour === currentHour}
								theme={theme}
							>
								{index === 0 ? "Day" : formatTime(slot.value, timeFormat)}
							</TimeColumnHeader>
						))}
					</TimelineHeader>

					<TimelineBody>
						{visibleDays.map((day) => (
							<TimelineRow key={day} isToday={day === currentDay} theme={theme}>
								<DayCell theme={theme}>
									<DayName>{day}</DayName>
									{day === currentDay && (
										<TodayTag theme={theme}>Today</TodayTag>
									)}
								</DayCell>

								{timeSlots.slice(1).map((slot, index) => {
									const animeList = getAnimeForTimeSlot(day, slot.hour);
									const isCurrent = slot.hour === currentHour;

									return (
										<TimeCell
											key={index}
											hasAnime={animeList.length > 0}
											isCurrent={isCurrent}
											theme={theme}
										>
											{animeList.length > 0 && (
												<AnimesContainer>
													{animeList.map((anime) => (
														<AnimeCard
															key={anime.mal_id}
															onClick={() => onAnimeSelect(anime.mal_id)}
															onMouseEnter={() => setHoveredAnime(anime.mal_id)}
															onMouseLeave={() => setHoveredAnime(null)}
															isHovered={hoveredAnime === anime.mal_id}
															theme={theme}
														>
															<AnimeCardContent>
																<AnimeImage
																	src={anime.images.jpg.image_url}
																	alt={anime.title}
																/>
																<AnimeInfo>
																	<AnimeTitle theme={theme} title={anime.title}>
																		{anime.title}
																	</AnimeTitle>
																	<AnimeTime theme={theme}>
																		<Clock size={10} />
																		{formatTime(
																			anime.broadcast.time,
																			timeFormat
																		)}
																	</AnimeTime>
																</AnimeInfo>
															</AnimeCardContent>

															{hoveredAnime === anime.mal_id && (
																<AnimeTooltip theme={theme}>
																	<AnimeDetails>
																		{anime.type && (
																			<AnimeTag
																				theme={theme}
																				title={anime.type}
																			>
																				{anime.type}
																			</AnimeTag>
																		)}
																		{anime.studios?.length > 0 && (
																			<AnimeTag
																				theme={theme}
																				title={anime.studios[0].name}
																			>
																				{anime.studios[0].name}
																			</AnimeTag>
																		)}
																	</AnimeDetails>
																	{anime.score && (
																		<AnimeScore theme={theme}>
																			<span
																				style={{
																					fontSize: "12px",
																					color: "#f5b400",
																				}}
																			>
																				★
																			</span>{" "}
																			{anime.score}
																		</AnimeScore>
																	)}
																</AnimeTooltip>
															)}
														</AnimeCard>
													))}
												</AnimesContainer>
											)}

											{isCurrent && <CurrentTimeMarker theme={theme} />}
										</TimeCell>
									);
								})}
							</TimelineRow>
						))}
					</TimelineBody>
				</TimelineTable>
			</TimelineContainer>

			<Legend theme={theme}>
				<LegendItem theme={theme}>
					<LegendBox isTodayBox theme={theme} /> Today
				</LegendItem>
				<LegendItem theme={theme}>
					<LegendBox isAnimeBox theme={theme} /> Has Anime
				</LegendItem>
				<LegendItem theme={theme}>
					<LegendBox isCurrentBox theme={theme} /> Current Time
				</LegendItem>
			</Legend>
		</Container>
	);
};

// Styled components
const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	max-width: 100%;
	padding-bottom: 16px;
`;

const Controls = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 16px;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

const ControlGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ControlLabel = styled.div<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 15px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const ToggleButtons = styled.div`
	display: flex;
	border-radius: 4px;
	overflow: hidden;
`;

const ToggleButton = styled.button<{ active: boolean; theme: AppTheme }>`
	padding: 6px 12px;
	background: ${(props) =>
		props.active ? props.theme.colors.primary : props.theme.colors.surface};
	color: ${(props) => (props.active ? "#fff" : props.theme.colors.text)};
	border: 1px solid ${(props) => props.theme.colors.primary};
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;

	&:first-of-type {
		border-radius: 4px 0 0 4px;
	}

	&:last-of-type {
		border-radius: 0 4px 4px 0;
	}

	&:hover {
		background: ${(props) =>
			props.active
				? props.theme.colors.primary
				: props.theme.colors.surfaceHover};
	}
`;

const DaySelector = styled.div<{ theme: AppTheme }>`
	display: flex;
	overflow-x: auto;
	gap: 2px;
	background: ${(props) => props.theme.colors.surface};
	border-radius: 8px 8px 0 0;
	padding: 2px;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const DayButton = styled.button<{
	active: boolean;
	isToday: boolean;
	theme: AppTheme;
}>`
	padding: 12px 20px;
	min-width: 100px;
	background: ${(props) =>
		props.active ? props.theme.colors.background : "transparent"};
	color: ${(props) =>
		props.active ? props.theme.colors.primary : props.theme.colors.text};
	border: none;
	border-radius: 6px 6px 0 0;
	font-weight: ${(props) => (props.active ? 600 : 400)};
	font-size: 15px;
	cursor: pointer;
	position: relative;
	transition: all 0.2s;

	&:hover {
		background: ${(props) =>
			props.active
				? props.theme.colors.background
				: "rgba(255, 255, 255, 0.5)"};
	}
`;

const TodayIndicator = styled.div<{ theme: AppTheme }>`
	position: absolute;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: ${(props) => props.theme.colors.primary};
	top: 8px;
	right: 8px;
`;

const AnimeCount = styled.div<{ theme: AppTheme }>`
	font-size: 13px;
	color: ${(props) => props.theme.colors.textSecondary};
	margin-top: 4px;
`;

const ScrollHint = styled.div<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-size: 14px;
	color: ${(props) => props.theme.colors.textSecondary};
	padding: 6px;
	background: ${(props) => `${props.theme.colors.primary}05`};
	border-radius: 20px;
	width: fit-content;
	margin: 0 auto;

	svg {
		animation: bounce 1.5s infinite;
		opacity: 0.7;
	}

	svg:first-of-type {
		animation-name: bounce-left;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(3px);
		}
	}

	@keyframes bounce-left {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(-3px);
		}
	}
`;

const TimelineContainer = styled.div<{ theme: AppTheme }>`
	width: 100%;
	overflow-x: auto;
	border-radius: 8px;
	border: 1px solid ${(props) => props.theme.colors.border};
	box-shadow: ${(props) => props.theme.boxShadow};
`;

const TimelineTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
`;

const TimelineHeader = styled.tr<{ theme: AppTheme }>`
	background: ${(props) => props.theme.colors.surface};
	border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const TimeColumnHeader = styled.th<{
	isFirst?: boolean;
	isCurrent?: boolean;
	theme: AppTheme;
}>`
	padding: 14px 10px;
	text-align: center;
	font-weight: 500;
	font-size: 15px;
	color: ${(props) =>
		props.isCurrent ? props.theme.colors.primary : props.theme.colors.text};
	border-right: 1px solid ${(props) => props.theme.colors.border};
	white-space: nowrap;
	width: ${(props) => (props.isFirst ? "120px" : "90px")};
	min-width: ${(props) => (props.isFirst ? "120px" : "90px")};
	background: ${(props) =>
		props.isCurrent
			? `${props.theme.colors.primary}10`
			: props.theme.colors.surface};
	position: ${(props) => (props.isFirst ? "sticky" : "static")};
	left: ${(props) => (props.isFirst ? "0" : "auto")};
	z-index: ${(props) => (props.isFirst ? "10" : "1")};
`;

const TimelineBody = styled.tbody``;

const TimelineRow = styled.tr<{ isToday: boolean; theme: AppTheme }>`
	background: ${(props) =>
		props.isToday
			? `${props.theme.colors.primary}10`
			: props.theme.colors.background};

	&:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border};
	}

	&:hover {
		background: ${(props) =>
			props.isToday
				? `${props.theme.colors.primary}15`
				: props.theme.colors.surfaceHover};
	}
`;

const DayCell = styled.td<{ theme: AppTheme }>`
	padding: 12px;
	text-align: center;
	font-weight: 500;
	border-right: 1px solid ${(props) => props.theme.colors.border};
	position: sticky;
	left: 0;
	z-index: 2;
	background: inherit;
	width: 120px;
	min-width: 120px;
`;

const DayName = styled.div`
	font-weight: 500;
	font-size: 15px;
`;

const TodayTag = styled.div<{ theme: AppTheme }>`
	font-size: 12px;
	font-weight: 600;
	color: #fff;
	background: ${(props) => props.theme.colors.primary};
	border-radius: 10px;
	padding: 2px 8px;
	margin-top: 4px;
	display: inline-block;
`;

const TimeCell = styled.td<{
	hasAnime: boolean;
	isCurrent: boolean;
	theme: AppTheme;
}>`
	padding: 4px;
	vertical-align: top;
	height: 110px;
	border-right: 1px solid ${(props) => props.theme.colors.border};
	min-width: 90px;
	position: relative;
	background: ${(props) => {
		if (props.isCurrent) return `${props.theme.colors.primary}10`;
		if (props.hasAnime) return `${props.theme.colors.primary}05`;
		return "transparent";
	}};
`;

const AnimesContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-width: calc(100% - 4px);
`;

const AnimeCard = styled.div<{ isHovered?: boolean; theme: AppTheme }>`
	padding: 8px;
	background: ${(props) => props.theme.colors.background};
	border-radius: 8px;
	border-left: 3px solid ${(props) => props.theme.colors.primary};
	box-shadow: ${(props) =>
		props.isHovered ? props.theme.boxShadow : "0 1px 3px rgba(0, 0, 0, 0.1)"};
	transition: all 0.2s;
	cursor: pointer;
	z-index: ${(props) => (props.isHovered ? "10" : "1")};
	max-width: 100%;
	overflow: hidden;

	&:hover {
		transform: translateY(-2px);
		box-shadow: ${(props) => props.theme.boxShadow};
	}
`;

const AnimeCardContent = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	width: 100%;
`;

const AnimeImage = styled.img`
	width: 35px;
	height: 50px;
	object-fit: cover;
	border-radius: 4px;
	flex-shrink: 0;
`;

const AnimeInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	flex: 1;
	min-width: 0;
	overflow: hidden;
`;

const AnimeTitle = styled.div<{ theme: AppTheme; title: string }>`
	font-size: 14px;
	font-weight: 500;
	line-height: 1.3;
	max-height: 2.6em;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	color: ${(props) => props.theme.colors.text};
`;

const AnimeTime = styled.div<{ theme: AppTheme }>`
	font-size: 12px;
	color: ${(props) => props.theme.colors.primary};
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 2px;
`;

const AnimeTooltip = styled.div<{ theme: AppTheme }>`
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px dashed ${(props) => `${props.theme.colors.primary}20`};
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 11px;
	flex-wrap: wrap;
	width: 100%;
`;

const AnimeDetails = styled.div`
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
	max-width: calc(100% - 40px);
`;

const AnimeTag = styled.span<{ theme: AppTheme; title: string }>`
	background: ${(props) => `${props.theme.colors.primary}10`};
	color: ${(props) => props.theme.colors.primary};
	padding: 3px 6px;
	border-radius: 4px;
	font-size: 11px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
	position: relative;
	cursor: help;
`;

const AnimeScore = styled.div<{ theme: AppTheme }>`
	color: ${(props) => props.theme.colors.accent};
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: 3px;
	margin-left: auto;
	font-size: 12px;
	white-space: nowrap;
`;

const CurrentTimeMarker = styled.div<{ theme: AppTheme }>`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	width: 3px;
	background: ${(props) => props.theme.colors.primary};
	animation: pulse 2s infinite;

	&::before {
		content: "";
		position: absolute;
		top: -4px;
		left: -3px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: ${(props) => props.theme.colors.primary};
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
`;

const Legend = styled.div<{ theme: AppTheme }>`
	display: flex;
	justify-content: flex-end;
	gap: 16px;
	padding: 8px;
	font-size: 13px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const LegendItem = styled.div<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 6px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const LegendBox = styled.div<{
	isTodayBox?: boolean;
	isAnimeBox?: boolean;
	isCurrentBox?: boolean;
	theme: AppTheme;
}>`
	width: 12px;
	height: 12px;
	border-radius: 2px;
	background: ${(props) => {
		if (props.isTodayBox) return `${props.theme.colors.primary}10`;
		if (props.isAnimeBox) return props.theme.colors.surface;
		if (props.isCurrentBox) return props.theme.colors.primary;
		return "transparent";
	}};
`;

export default TimelineView;
