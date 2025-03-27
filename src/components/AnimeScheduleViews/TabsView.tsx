import React, { useState } from "react";
import styled from "@emotion/styled";
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

interface TabsViewProps {
	animeByDay: Record<DayOfWeek, AnimeData[]>;
	timeFormat: TimeFormat;
	setTimeFormat: (format: TimeFormat) => void;
	onAnimeSelect: (id: number) => void;
	theme: AppTheme;
}

const TabsView: React.FC<TabsViewProps> = ({
	animeByDay,
	timeFormat,
	setTimeFormat,
	onAnimeSelect,
	theme,
}) => {
	const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDay());
	const currentDay = getCurrentDay();

	return (
		<HorizontalContainer>
			<Controls>
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
			</Controls>

			<DayTabs>
				{Object.keys(animeByDay)
					.filter((day) => day !== "Unknown" || animeByDay.Unknown.length > 0)
					.sort((a, b) => sortDays(a as DayOfWeek, b as DayOfWeek))
					.map((day) => {
						const isActive = day === activeDay;
						const isToday = day === currentDay;
						const dayAnime = animeByDay[day as DayOfWeek];

						return (
							<DayTab
								key={day}
								isActive={isActive}
								isToday={isToday}
								onClick={() => setActiveDay(day as DayOfWeek)}
								theme={theme}
							>
								{day}
								{isToday && <TodayIndicator theme={theme} />}
								<DayCount theme={theme}>{dayAnime.length}</DayCount>
							</DayTab>
						);
					})}
			</DayTabs>

			<TimelineView>
				{animeByDay[activeDay].length > 0 ? (
					animeByDay[activeDay].map((anime) => (
						<TimelineAnimeItem
							key={anime.mal_id}
							onClick={() => onAnimeSelect(anime.mal_id)}
							theme={theme}
						>
							<TimelineAnimeContent>
								<AnimeImage
									src={anime.images.jpg.image_url}
									alt={anime.title}
								/>
								<TimelineAnimeInfo>
									<AnimeTitle>{anime.title}</AnimeTitle>
									<AnimeStats>
										{anime.type && (
											<AnimeStat theme={theme}>{anime.type}</AnimeStat>
										)}
										{anime.studios && anime.studios.length > 0 && (
											<AnimeStat theme={theme}>
												{anime.studios[0].name}
											</AnimeStat>
										)}
										{anime.score && (
											<AnimeStat theme={theme}>⭐ {anime.score}</AnimeStat>
										)}
									</AnimeStats>
								</TimelineAnimeInfo>
							</TimelineAnimeContent>
							<TimeDisplayBox theme={theme}>
								<div>{formatTime(anime.broadcast?.time, "12h")}</div>
								<TimeDivider theme={theme} />
								<div>{formatTime(anime.broadcast?.time, "24h")}</div>
							</TimeDisplayBox>
						</TimelineAnimeItem>
					))
				) : (
					<EmptyDay theme={theme}>No anime scheduled for {activeDay}</EmptyDay>
				)}
			</TimelineView>
		</HorizontalContainer>
	);
};

// Styled components for the tabs layout
const HorizontalContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const Controls = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-bottom: 8px;
`;

const TimeToggle = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
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

const DayTabs = styled.div`
	display: flex;
	overflow-x: auto;
	gap: 2px;
	background-color: #f5f5f5;
	border-radius: 8px 8px 0 0;
	padding: 2px;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const DayTab = styled.div<{
	isActive: boolean;
	isToday: boolean;
	theme: AppTheme;
}>`
	padding: 12px 20px;
	min-width: 100px;
	text-align: center;
	font-weight: ${(props) => (props.isActive ? 600 : 400)};
	cursor: pointer;
	position: relative;
	background-color: ${(props) =>
		props.isActive ? props.theme?.colors?.surface || "#fff" : "transparent"};
	color: ${(props) =>
		props.isActive
			? props.theme?.colors?.primary || "#007bff"
			: props.theme?.colors?.text || "#333"};
	border-radius: 6px 6px 0 0;

	&:hover {
		background-color: ${(props) =>
			props.isActive
				? props.theme?.colors?.surface || "#fff"
				: `${props.theme?.colors?.surface || "#fff"}80`};
	}
`;

const TodayIndicator = styled.div<{ theme: AppTheme }>`
	position: absolute;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: ${(props) => props.theme?.colors?.primary || "#007bff"};
	top: 8px;
	right: 8px;
`;

const DayCount = styled.span<{ theme: AppTheme }>`
	display: block;
	font-size: 12px;
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
	margin-top: 4px;
`;

const TimelineView = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
	background-color: #ffffff;
	border-radius: 0 0 8px 8px;
	overflow: hidden;
	padding: 16px;
`;

const TimelineAnimeItem = styled.div<{ theme: AppTheme }>`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	background-color: ${(props) => props.theme?.colors?.background || "#f5f5f5"};
	margin-bottom: 16px;
	border-radius: 8px;
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: ${(props) =>
			props.theme?.boxShadow || "0 2px 8px rgba(0, 0, 0, 0.1)"};
	}
`;

const TimelineAnimeContent = styled.div`
	display: flex;
	gap: 16px;
	flex: 1;
`;

const TimelineAnimeInfo = styled.div`
	display: flex;
	flex-direction: column;
`;

const AnimeImage = styled.img`
	width: 60px;
	height: 85px;
	object-fit: cover;
	border-radius: 6px;
`;

const AnimeTitle = styled.h4`
	margin: 0 0 4px 0;
	font-size: 16px;
	font-weight: 500;
`;

const AnimeStats = styled.div`
	display: flex;
	gap: 12px;
	font-size: 13px;
`;

const AnimeStat = styled.span<{ theme: AppTheme }>`
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
`;

const TimeDisplayBox = styled.div<{ theme: AppTheme }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8px 12px;
	background-color: ${(props) =>
		`${props.theme?.colors?.primary || "#007bff"}10`};
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	color: ${(props) => props.theme?.colors?.text || "#333"};
	min-width: 100px;
	text-align: center;
`;

const TimeDivider = styled.div<{ theme: AppTheme }>`
	height: 1px;
	width: 80%;
	background-color: ${(props) =>
		`${props.theme?.colors?.primary || "#007bff"}30`};
	margin: 4px 0;
`;

const EmptyDay = styled.div<{ theme: AppTheme }>`
	padding: 16px 20px;
	font-size: 15px;
	color: ${(props) => props.theme?.colors?.textSecondary || "#666"};
	text-align: center;
	font-style: italic;
`;

export default TabsView;
