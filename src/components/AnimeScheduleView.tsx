import React, { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { AnimeData } from "../types/anime";
import { AppTheme } from "../themes/themeTypes";
import AccordionView from "./AnimeScheduleViews/AccordionView";
import TabsView from "./AnimeScheduleViews/TabsView";
import TimelineView from "./AnimeScheduleViews/TimelineView";
import styled from "@emotion/styled";

// Types
interface AnimeScheduleViewProps {
	animeList: AnimeData[];
	onAnimeSelect: (id: number) => void;
	theme: AppTheme;
	layoutMode?: "vertical" | "horizontal" | "timeline";
	isLoading?: boolean;
}

export type TimeFormat = "12h" | "24h";
export type DayOfWeek =
	| "Monday"
	| "Tuesday"
	| "Wednesday"
	| "Thursday"
	| "Friday"
	| "Saturday"
	| "Sunday"
	| "Unknown";

// Add an interface for time slots to improve type safety
export interface TimeSlot {
	label: string;
	value: string;
	hour: number;
	minute: number;
}

// Helper functions
export const getCurrentDay = (): DayOfWeek => {
	const days: DayOfWeek[] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	return days[new Date().getDay()];
};

export const formatTime = (
	timeString: string | null,
	format: TimeFormat = "24h"
): string => {
	if (!timeString) return "Unknown time";

	// Parse time (assuming format from API is "HH:MM")
	const [hours, minutes] = timeString
		.split(":")
		.map((part) => parseInt(part, 10));

	if (isNaN(hours) || isNaN(minutes)) return "Unknown time";

	if (format === "12h") {
		const period = hours >= 12 ? "PM" : "AM";
		const hours12 = hours % 12 || 12; // Convert 0 to 12
		return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
	} else {
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;
	}
};

// Map API day to standard day name
export const mapApiDayToStandard = (apiDay: string | null): DayOfWeek => {
	if (!apiDay) return "Unknown";

	const dayMap: Record<string, DayOfWeek> = {
		mondays: "Monday",
		tuesdays: "Tuesday",
		wednesdays: "Wednesday",
		thursdays: "Thursday",
		fridays: "Friday",
		saturdays: "Saturday",
		sundays: "Sunday",
	};

	return dayMap[apiDay.toLowerCase()] || "Unknown";
};

// Sort function for days of the week
export const sortDays = (a: DayOfWeek, b: DayOfWeek): number => {
	const order: Record<DayOfWeek, number> = {
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
		Sunday: 7,
		Unknown: 8,
	};

	return order[a] - order[b];
};

// Sort function for anime by airing time
export const sortAnimeByTime = (a: AnimeData, b: AnimeData): number => {
	const timeA = a.broadcast.time || "99:99";
	const timeB = b.broadcast.time || "99:99";

	return timeA.localeCompare(timeB);
};

const AnimeScheduleView: React.FC<AnimeScheduleViewProps> = ({
	animeList,
	onAnimeSelect,
	theme,
	layoutMode = "vertical",
	isLoading = false,
}) => {
	const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");

	// Organize anime by day
	const animeByDay = useMemo(() => {
		const result: Record<DayOfWeek, AnimeData[]> = {
			Monday: [],
			Tuesday: [],
			Wednesday: [],
			Thursday: [],
			Friday: [],
			Saturday: [],
			Sunday: [],
			Unknown: [],
		};

		animeList.forEach((anime) => {
			const day = mapApiDayToStandard(anime.broadcast?.day);
			if (result[day]) {
				result[day].push(anime);
			} else {
				result.Unknown.push(anime);
			}
		});

		// Sort anime in each day by airing time
		Object.keys(result).forEach((day) => {
			result[day as DayOfWeek].sort(sortAnimeByTime);
		});

		return result;
	}, [animeList]);

	const hasScheduleData = useMemo(() => {
		return Object.values(animeByDay).some((animeList) => animeList.length > 0);
	}, [animeByDay]);

	if (isLoading) {
		return (
			<LoadingState theme={theme}>
				<LoadingSpinner theme={theme} />
				<LoadingText theme={theme}>Loading anime schedule...</LoadingText>
			</LoadingState>
		);
	}

	if (!hasScheduleData) {
		return (
			<NoAnimeMessage theme={theme}>
				<NoAnimeIcon theme={theme}>
					<Clock size={30} />
				</NoAnimeIcon>
				<NoAnimeTitle>No Schedule Information</NoAnimeTitle>
				<NoAnimeDescription theme={theme}>
					There is no airing schedule information available for the selected
					anime.
				</NoAnimeDescription>
			</NoAnimeMessage>
		);
	}

	// Render the appropriate view based on layoutMode
	if (layoutMode === "vertical") {
		return (
			<AccordionView
				animeByDay={animeByDay}
				timeFormat={timeFormat}
				setTimeFormat={setTimeFormat}
				onAnimeSelect={onAnimeSelect}
				theme={theme}
			/>
		);
	} else if (layoutMode === "horizontal") {
		return (
			<TabsView
				animeByDay={animeByDay}
				timeFormat={timeFormat}
				setTimeFormat={setTimeFormat}
				onAnimeSelect={onAnimeSelect}
				theme={theme}
			/>
		);
	} else {
		// Timeline view
		return (
			<TimelineView
				animeByDay={animeByDay}
				timeFormat={timeFormat}
				setTimeFormat={setTimeFormat}
				onAnimeSelect={onAnimeSelect}
				theme={theme}
			/>
		);
	}
};

// Styled components for loading and empty states
const LoadingState = styled.div<{ theme: AppTheme }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius};
	text-align: center;
`;

const LoadingSpinner = styled.div<{ theme: AppTheme }>`
	width: 40px;
	height: 40px;
	border: 3px solid ${(props) => `${props.theme.colors.primary}20`};
	border-top-color: ${(props) => props.theme.colors.primary};
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 16px;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

const LoadingText = styled.p<{ theme: AppTheme }>`
	margin: 0;
	font-size: 16px;
	color: ${(props) => props.theme.colors.textSecondary};
`;

const NoAnimeMessage = styled.div<{ theme: AppTheme }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: ${(props) => props.theme.borderRadius};
	text-align: center;
`;

const NoAnimeIcon = styled.div<{ theme: AppTheme }>`
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background-color: ${(props) => `${props.theme.colors.primary}10`};
	color: ${(props) => props.theme.colors.primary};
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
`;

const NoAnimeTitle = styled.h3`
	margin: 0 0 8px 0;
	font-size: 18px;
	font-weight: 600;
`;

const NoAnimeDescription = styled.p<{ theme: AppTheme }>`
	margin: 0;
	font-size: 16px;
	color: ${(props) => props.theme.colors.textSecondary};
	max-width: 400px;
`;

export default AnimeScheduleView;
