import React, { createContext, useContext, useState, useEffect } from "react";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";

// Our simplified notification options
interface NotificationOptions {
	title: string;
	body: string;
	icon?: string;
}

export type NotificationPermission = "granted" | "denied" | "default";

interface NotificationContextType {
	permission: NotificationPermission;
	requestPermission: () => Promise<NotificationPermission>;
	sendNotification: (options: NotificationOptions) => Promise<void>;
	hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotification must be used within a NotificationProvider"
		);
	}
	return context;
}

interface NotificationProviderProps {
	children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
	const [permission, setPermission] =
		useState<NotificationPermission>("default");
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Check permission on mount
	useEffect(() => {
		const checkPermission = async () => {
			try {
				const granted = await isPermissionGranted();
				setPermission(granted ? "granted" : "default");
			} catch (error) {
				console.error("Failed to check notification permission:", error);
				setPermission("default");
			}
		};

		checkPermission();
	}, []);

	const requestNotificationPermission =
		async (): Promise<NotificationPermission> => {
			try {
				const permissionResult = await requestPermission();
				setPermission(permissionResult);
				return permissionResult;
			} catch (error) {
				console.error("Failed to request notification permission:", error);
				return "denied";
			}
		};

	const sendAppNotification = async (
		options: NotificationOptions
	): Promise<void> => {
		// Only send if permission is granted
		if (permission !== "granted") {
			console.warn("Notification permission not granted");
			return;
		}

		try {
			await sendNotification({
				title: options.title,
				body: options.body,
				icon: options.icon || "app-icon.png",
			});
		} catch (error) {
			console.error("Failed to send notification:", error);
		}
	};

	const value = {
		permission,
		requestPermission: requestNotificationPermission,
		sendNotification: sendAppNotification,
		hasPermission: permission === "granted",
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
}
