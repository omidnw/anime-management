import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bell,
	X,
	Check,
	MailOpen,
	Calendar,
	Clock,
	ExternalLink,
} from "lucide-react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import {
	getInAppNotifications,
	markInAppNotificationAsRead,
	clearInAppNotifications,
	InAppNotification,
} from "../services/notificationService";
import { Button } from "./ui/Button";
import { formatRelativeTime } from "../utils/timeUtils";

interface InAppNotificationCenterProps {
	isOpen: boolean;
	onClose: () => void;
	maxNotifications?: number;
}

export function InAppNotificationCenter({
	isOpen,
	onClose,
	maxNotifications = 10,
}: InAppNotificationCenterProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [notifications, setNotifications] = useState<InAppNotification[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load notifications when component mounts or when it's opened
	useEffect(() => {
		if (isOpen) {
			loadNotifications();
		}
	}, [isOpen]);

	// Refresh notifications every minute
	useEffect(() => {
		if (!isOpen) return;

		const intervalId = setInterval(() => {
			loadNotifications();
		}, 60000);

		return () => clearInterval(intervalId);
	}, [isOpen]);

	const loadNotifications = () => {
		setIsLoading(true);
		try {
			const notifications = getInAppNotifications();
			setNotifications(notifications);
		} catch (error) {
			console.error("Failed to load in-app notifications:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMarkAsRead = (id: string) => {
		try {
			markInAppNotificationAsRead(id);
			// Update local state
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n))
			);
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
		}
	};

	const handleMarkAllAsRead = () => {
		try {
			// Mark all as read
			notifications.forEach((n) => {
				if (!n.read) {
					markInAppNotificationAsRead(n.id);
				}
			});

			// Update local state
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		} catch (error) {
			console.error("Failed to mark all notifications as read:", error);
		}
	};

	const handleClearAll = () => {
		try {
			clearInAppNotifications();
			setNotifications([]);
		} catch (error) {
			console.error("Failed to clear notifications:", error);
		}
	};

	// Check if there are any unread notifications
	const hasUnread = notifications.some((n) => !n.read);

	// Get the notifications to display
	const displayedNotifications = notifications.slice(0, maxNotifications);

	return (
		<AnimatePresence>
			{isOpen && (
				<Overlay
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<CenterContainer
						theme={theme}
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: "spring", bounce: 0.25 }}
						onClick={(e) => e.stopPropagation()}
					>
						<CenterHeader theme={theme}>
							<HeaderTitle>
								<Bell size={18} />
								Notifications
								{hasUnread && <UnreadBadge theme={theme} />}
							</HeaderTitle>

							<HeaderActions>
								{hasUnread && (
									<ActionButton
										onClick={handleMarkAllAsRead}
										title="Mark all as read"
									>
										<Check size={16} />
									</ActionButton>
								)}

								{notifications.length > 0 && (
									<ActionButton
										onClick={handleClearAll}
										title="Clear all notifications"
									>
										<X size={16} />
									</ActionButton>
								)}

								<ActionButton onClick={onClose} title="Close">
									<X size={18} />
								</ActionButton>
							</HeaderActions>
						</CenterHeader>

						<CenterContent>
							{isLoading ? (
								<EmptyState>
									<p>Loading notifications...</p>
								</EmptyState>
							) : notifications.length === 0 ? (
								<EmptyState>
									<MailOpen size={36} opacity={0.5} />
									<p>No notifications</p>
								</EmptyState>
							) : (
								<>
									<NotificationList>
										<AnimatePresence initial={false}>
											{displayedNotifications.map((notification) => (
												<NotificationItem
													key={notification.id}
													theme={theme}
													isRead={notification.read}
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													exit={{ opacity: 0, height: 0 }}
												>
													<NotificationContent>
														<NotificationTitle isRead={notification.read}>
															{notification.title}
														</NotificationTitle>
														<NotificationBody>
															{notification.body}
														</NotificationBody>
														<NotificationMeta>
															<MetaItem>
																<Calendar size={14} />
																{formatRelativeTime(notification.createdAt)}
															</MetaItem>
															{!notification.read && (
																<ReadButton
																	theme={theme}
																	onClick={() =>
																		handleMarkAsRead(notification.id)
																	}
																>
																	Mark as read
																</ReadButton>
															)}
														</NotificationMeta>
													</NotificationContent>
												</NotificationItem>
											))}
										</AnimatePresence>
									</NotificationList>

									{notifications.length > maxNotifications && (
										<MoreNotifications>
											{notifications.length - maxNotifications} more
											notifications
										</MoreNotifications>
									)}
								</>
							)}
						</CenterContent>
					</CenterContainer>
				</Overlay>
			)}
		</AnimatePresence>
	);
}

const Overlay = styled(motion.div)`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	backdrop-filter: blur(2px);
`;

const CenterContainer = styled(motion.div)<{ theme: AppTheme }>`
	width: 100%;
	max-width: 450px;
	max-height: 80vh;
	background-color: ${(props) => props.theme.colors.background};
	border-radius: 12px;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

const CenterHeader = styled.div<{ theme: AppTheme }>`
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid
		${(props) => props.theme.colors.border || "rgba(0,0,0,0.1)"};
`;

const HeaderTitle = styled.h2`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`;

const UnreadBadge = styled.span<{ theme: AppTheme }>`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: ${(props) => props.theme.colors.primary};
	display: inline-block;
`;

const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ActionButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.7;
	transition: opacity 0.2s;

	&:hover {
		opacity: 1;
	}
`;

const CenterContent = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 8px;
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	text-align: center;

	p {
		margin: 12px 0 0 0;
		opacity: 0.7;
	}
`;

const NotificationList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const NotificationItem = styled(motion.div)<{
	theme: AppTheme;
	isRead: boolean;
}>`
	background-color: ${(props) =>
		props.isRead ? "transparent" : `${props.theme.colors.primary}08`};
	border-left: 3px solid
		${(props) => (props.isRead ? "transparent" : props.theme.colors.primary)};
	border-radius: 8px;
	padding: 12px;
	transition: background-color 0.2s;

	&:hover {
		background-color: ${(props) =>
			props.isRead ? "rgba(0,0,0,0.03)" : `${props.theme.colors.primary}12`};
	}
`;

const NotificationContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const NotificationTitle = styled.h3<{ isRead: boolean }>`
	margin: 0;
	font-size: 15px;
	font-weight: ${(props) => (props.isRead ? "500" : "600")};
	line-height: 1.4;
`;

const NotificationBody = styled.p`
	margin: 0;
	font-size: 14px;
	opacity: 0.8;
	line-height: 1.4;
`;

const NotificationMeta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
`;

const MetaItem = styled.span`
	font-size: 12px;
	display: flex;
	align-items: center;
	gap: 4px;
	opacity: 0.6;
`;

const ReadButton = styled.button<{ theme: AppTheme }>`
	background: none;
	border: none;
	font-size: 12px;
	color: ${(props) => props.theme.colors.primary};
	cursor: pointer;
	padding: 2px 4px;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
	}
`;

const MoreNotifications = styled.div`
	text-align: center;
	font-size: 13px;
	opacity: 0.6;
	padding: 8px 0;
`;
