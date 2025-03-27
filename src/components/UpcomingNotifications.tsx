import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { Bell, Clock, Calendar, Trash2 } from "lucide-react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import {
	getScheduledNotifications,
	cancelScheduledNotification,
	ScheduledNotification,
} from "../services/notificationService";
import { formatDate, formatTime } from "../utils/timeUtils";
import { Button } from "./ui/Button";

interface UpcomingNotificationsProps {
	maxItems?: number;
	showClearButton?: boolean;
	onClear?: () => void;
}

export function UpcomingNotifications({
	maxItems = 5,
	showClearButton = true,
	onClear,
}: UpcomingNotificationsProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [notifications, setNotifications] = useState<ScheduledNotification[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);

	// Load notifications on mount
	useEffect(() => {
		loadNotifications();
	}, []);

	const loadNotifications = () => {
		setIsLoading(true);
		try {
			// Get all scheduled notifications and sort by time
			const scheduled = getScheduledNotifications().sort(
				(a, b) => a.scheduledTime - b.scheduledTime
			);
			setNotifications(scheduled);
		} catch (error) {
			console.error("Failed to load scheduled notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelNotification = (id: string) => {
		try {
			cancelScheduledNotification(id);
			// Refresh the list
			loadNotifications();
		} catch (error) {
			console.error("Failed to cancel notification:", error);
		}
	};

	const handleClearAll = () => {
		try {
			// Cancel all notifications
			notifications.forEach((notification) => {
				cancelScheduledNotification(notification.id);
			});

			// Refresh the list
			loadNotifications();

			if (onClear) {
				onClear();
			}
		} catch (error) {
			console.error("Failed to clear all notifications:", error);
		}
	};

	// Format the scheduled time for display
	const formatScheduledTime = (timestamp: number): string => {
		const date = new Date(timestamp);
		return `${formatDate(date)} at ${formatTime(
			date.getHours() + ":" + date.getMinutes()
		)}`;
	};

	// Get the time remaining until the notification
	const getTimeRemaining = (timestamp: number): string => {
		const now = new Date().getTime();
		const diff = timestamp - now;

		if (diff <= 0) return "Now";

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (days > 0) {
			return `${days}d ${hours}h`;
		} else if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else {
			return `${minutes}m`;
		}
	};

	// Limit the number of notifications shown
	const displayedNotifications = notifications.slice(0, maxItems);

	return (
		<Container>
			<SectionTitle theme={theme}>
				<Bell size={20} />
				Upcoming Notifications
				<Count theme={theme}>{notifications.length}</Count>
			</SectionTitle>

			{isLoading ? (
				<LoadingState theme={theme}>
					Loading scheduled notifications...
				</LoadingState>
			) : notifications.length === 0 ? (
				<EmptyState theme={theme}>
					<p>No upcoming episode notifications scheduled.</p>
				</EmptyState>
			) : (
				<>
					<NotificationList>
						{displayedNotifications.map((notification) => (
							<NotificationItem
								key={notification.id}
								theme={theme}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<NotificationContent>
									<NotificationTitle>{notification.title}</NotificationTitle>
									<NotificationBody>{notification.body}</NotificationBody>
									<NotificationMeta>
										<NotificationTime>
											<Calendar size={14} />
											{formatScheduledTime(notification.scheduledTime)}
										</NotificationTime>
										<NotificationTime>
											<Clock size={14} />
											{getTimeRemaining(notification.scheduledTime)} remaining
										</NotificationTime>
									</NotificationMeta>
								</NotificationContent>
								<CancelButton
									onClick={() => handleCancelNotification(notification.id)}
									theme={theme}
								>
									<Trash2 size={16} />
								</CancelButton>
							</NotificationItem>
						))}
					</NotificationList>

					{notifications.length > maxItems && (
						<MoreNotifications theme={theme}>
							{notifications.length - maxItems} more notifications scheduled
						</MoreNotifications>
					)}

					{showClearButton && notifications.length > 0 && (
						<ButtonRow>
							<Button variant="outline" onClick={handleClearAll} size="small">
								Clear All Notifications
							</Button>
						</ButtonRow>
					)}
				</>
			)}
		</Container>
	);
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
	max-width: 500px;
	margin: 0 auto;
`;

const SectionTitle = styled.h2<{ theme: AppTheme }>`
	font-size: 20px;
	font-weight: 600;
	margin: 0 0 16px 0;
	display: flex;
	align-items: center;
	gap: 8px;
	color: ${(props) => props.theme.colors.text};
`;

const Count = styled.span<{ theme: AppTheme }>`
	font-size: 14px;
	background-color: ${(props) => props.theme.colors.primary}20;
	color: ${(props) => props.theme.colors.primary};
	border-radius: 12px;
	padding: 2px 8px;
	margin-left: auto;
`;

const LoadingState = styled.div<{ theme: AppTheme }>`
	color: ${(props) => props.theme.colors.textSecondary};
	font-size: 14px;
	font-style: italic;
	padding: 16px 0;
`;

const EmptyState = styled.div<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 8px;
	padding: 16px;
	text-align: center;

	p {
		margin: 0;
		font-size: 14px;
		color: ${(props) => props.theme.colors.textSecondary};
	}
`;

const NotificationList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const NotificationItem = styled(motion.div)<{ theme: AppTheme }>`
	display: flex;
	align-items: flex-start;
	gap: 12px;
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 8px;
	padding: 12px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NotificationContent = styled.div`
	flex: 1;
`;

const NotificationTitle = styled.h3`
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 4px 0;
`;

const NotificationBody = styled.p`
	font-size: 14px;
	margin: 0 0 8px 0;
	opacity: 0.8;
`;

const NotificationMeta = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
`;

const NotificationTime = styled.span`
	font-size: 12px;
	display: flex;
	align-items: center;
	gap: 4px;
	opacity: 0.7;
`;

const CancelButton = styled.button<{ theme: AppTheme }>`
	background: none;
	border: none;
	cursor: pointer;
	color: ${(props) => props.theme.colors.textSecondary};
	opacity: 0.7;
	transition: all 0.2s;

	&:hover {
		opacity: 1;
		color: ${(props) => props.theme.colors.error};
	}
`;

const MoreNotifications = styled.div<{ theme: AppTheme }>`
	font-size: 14px;
	text-align: center;
	color: ${(props) => props.theme.colors.textSecondary};
	padding: 8px 0;
`;

const ButtonRow = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 8px;
`;
