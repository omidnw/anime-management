import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Bell } from "lucide-react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import { getInAppNotifications } from "../services/notificationService";
import { InAppNotificationCenter } from "./InAppNotificationCenter";

interface NotificationIconProps {
	size?: number;
}

export function NotificationIcon({ size = 24 }: NotificationIconProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
		useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	// Check for unread notifications on mount and periodically
	useEffect(() => {
		updateUnreadCount();

		// Update count every minute
		const intervalId = setInterval(updateUnreadCount, 60000);

		return () => clearInterval(intervalId);
	}, []);

	const updateUnreadCount = () => {
		try {
			const notifications = getInAppNotifications();
			const unread = notifications.filter((n) => !n.read).length;
			setUnreadCount(unread);
		} catch (error) {
			console.error("Failed to get unread notifications count:", error);
		}
	};

	const toggleNotificationCenter = () => {
		setIsNotificationCenterOpen((prev) => !prev);
	};

	const handleCloseNotificationCenter = () => {
		setIsNotificationCenterOpen(false);
		// Update the unread count when closed
		updateUnreadCount();
	};

	return (
		<>
			<IconContainer onClick={toggleNotificationCenter}>
				<Bell size={size} />
				{unreadCount > 0 && (
					<Badge theme={theme}>{unreadCount > 99 ? "99+" : unreadCount}</Badge>
				)}
			</IconContainer>

			<InAppNotificationCenter
				isOpen={isNotificationCenterOpen}
				onClose={handleCloseNotificationCenter}
			/>
		</>
	);
}

const IconContainer = styled.div`
	position: relative;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	border-radius: 50%;
	transition: background-color 0.2s;

	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
`;

const Badge = styled.div<{ theme: AppTheme }>`
	position: absolute;
	top: 0;
	right: 0;
	background-color: ${(props) => props.theme.colors.primary};
	color: white;
	font-size: 10px;
	font-weight: 600;
	min-width: 16px;
	height: 16px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 4px;
`;
