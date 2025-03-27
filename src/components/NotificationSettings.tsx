import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { BellRing, Clock, Heart, Volume2, BellDot } from "lucide-react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppTheme } from "../themes/themeTypes";
import { useNotification } from "../contexts/NotificationProvider";
import {
	NotificationSettings as NotificationSettingsType,
	getNotificationSettings,
	saveNotificationSettings,
	DEFAULT_NOTIFICATION_SETTINGS,
} from "../services/notificationService";
import { Dropdown } from "./ui/Dropdown";
import { RadioGroup } from "./ui/RadioGroup";

// Options for reminder timing
const reminderTimeOptions = [
	{ value: 5, label: "5 minutes before" },
	{ value: 10, label: "10 minutes before" },
	{ value: 15, label: "15 minutes before" },
	{ value: 30, label: "30 minutes before" },
	{ value: 60, label: "1 hour before" },
	{ value: 120, label: "2 hours before" },
	{ value: 1440, label: "1 day before" },
];

// Options for notification delivery
const deliveryOptions = [
	{ value: "system", label: "System Notifications" },
	{ value: "app", label: "Application Notifications" },
	{ value: "both", label: "Both" },
];

interface NotificationSettingsProps {
	onSave?: () => void;
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const { permission, requestPermission, hasPermission } = useNotification();

	const [settings, setSettings] = useState<NotificationSettingsType>(
		DEFAULT_NOTIFICATION_SETTINGS
	);
	const [isLoading, setIsLoading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Load settings on mount
	useEffect(() => {
		const savedSettings = getNotificationSettings();
		setSettings(savedSettings);
	}, []);

	const handleRequestPermission = async () => {
		setIsLoading(true);
		try {
			const result = await requestPermission();
			// Enable notifications if permission granted
			if (result === "granted") {
				setSettings({
					...settings,
					enableReleaseReminders: true,
				});
			}
		} catch (error) {
			console.error("Failed to request notification permission:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveSettings = () => {
		setIsLoading(true);
		setSaveSuccess(false);

		try {
			saveNotificationSettings(settings);
			setSaveSuccess(true);

			if (onSave) {
				onSave();
			}

			// Reset success message after 3 seconds
			setTimeout(() => {
				setSaveSuccess(false);
			}, 3000);
		} catch (error) {
			console.error("Failed to save notification settings:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Update a single setting
	const updateSetting = <K extends keyof NotificationSettingsType>(
		key: K,
		value: NotificationSettingsType[K]
	) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	return (
		<Container>
			<SectionTitle theme={theme}>
				<BellRing size={20} />
				Notification Settings
			</SectionTitle>

			{/* Permission request section */}
			{permission !== "granted" && (
				<PermissionSection theme={theme}>
					<p>System notifications are not enabled for this application.</p>
					<Button
						variant="primary"
						onClick={handleRequestPermission}
						disabled={isLoading}
						size="small"
					>
						{isLoading ? "Requesting..." : "Enable System Notifications"}
					</Button>
				</PermissionSection>
			)}

			{/* Settings form */}
			<SettingsForm>
				<SettingRow>
					<SettingLabel theme={theme}>
						<BellRing size={16} />
						Enable Episode Reminders
					</SettingLabel>
					<Switch
						checked={settings.enableReleaseReminders}
						onChange={(isChecked: boolean) =>
							updateSetting("enableReleaseReminders", isChecked)
						}
						disabled={!hasPermission}
					/>
				</SettingRow>

				<SettingRow>
					<SettingLabel theme={theme}>
						<Clock size={16} />
						Reminder Time
					</SettingLabel>
					<Dropdown
						value={settings.reminderTime}
						onChange={(e) =>
							updateSetting("reminderTime", Number(e.target.value))
						}
						options={reminderTimeOptions}
						disabled={!hasPermission || !settings.enableReleaseReminders}
					/>
				</SettingRow>

				<SettingRow direction="column">
					<SettingLabel theme={theme}>
						<BellDot size={16} />
						Notification Delivery
					</SettingLabel>
					<DeliveryOptionsWrapper>
						<RadioGroup
							options={deliveryOptions}
							value={settings.notificationDelivery || "both"}
							onChange={(value) => {
								if (["system", "app", "both"].includes(value)) {
									updateSetting(
										"notificationDelivery",
										value as "system" | "app" | "both"
									);
								}
							}}
							name="notificationDelivery"
							disabled={!hasPermission || !settings.enableReleaseReminders}
							horizontal={true}
						/>
						{settings.notificationDelivery === "system" &&
							permission !== "granted" && (
								<DeliveryNote theme={theme}>
									System notifications require permission
								</DeliveryNote>
							)}
					</DeliveryOptionsWrapper>
				</SettingRow>

				<SettingRow>
					<SettingLabel theme={theme}>
						<Heart size={16} />
						Only Notify for Favorites
					</SettingLabel>
					<Switch
						checked={settings.notifyOnlyFavorites}
						onChange={(isChecked: boolean) =>
							updateSetting("notifyOnlyFavorites", isChecked)
						}
						disabled={!hasPermission || !settings.enableReleaseReminders}
					/>
				</SettingRow>

				<SettingRow>
					<SettingLabel theme={theme}>
						<Volume2 size={16} />
						Enable Notification Sounds
					</SettingLabel>
					<Switch
						checked={settings.soundEnabled}
						onChange={(isChecked: boolean) =>
							updateSetting("soundEnabled", isChecked)
						}
						disabled={!hasPermission || !settings.enableReleaseReminders}
					/>
				</SettingRow>

				<ButtonRow>
					<Button
						variant="primary"
						onClick={handleSaveSettings}
						disabled={isLoading || !hasPermission}
					>
						{isLoading ? "Saving..." : "Save Settings"}
					</Button>

					{saveSuccess && (
						<SuccessMessage
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							theme={theme}
						>
							Settings saved successfully!
						</SuccessMessage>
					)}
				</ButtonRow>
			</SettingsForm>
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

const PermissionSection = styled.div<{ theme: AppTheme }>`
	background-color: ${(props) => props.theme.colors.surface};
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

	p {
		margin: 0;
		font-size: 14px;
		color: ${(props) => props.theme.colors.textSecondary};
	}
`;

const SettingsForm = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const SettingRow = styled.div<{ direction?: "row" | "column" }>`
	display: flex;
	flex-direction: ${(props) => props.direction || "row"};
	justify-content: ${(props) =>
		props.direction === "column" ? "flex-start" : "space-between"};
	align-items: ${(props) =>
		props.direction === "column" ? "flex-start" : "center"};
	padding: 12px 0;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	gap: ${(props) => (props.direction === "column" ? "12px" : "0")};
`;

const SettingLabel = styled.label<{ theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	font-weight: 500;
	color: ${(props) => props.theme.colors.text};
`;

const DeliveryOptionsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;
`;

const DeliveryNote = styled.div<{ theme: AppTheme }>`
	font-size: 12px;
	color: ${(props) => props.theme.colors.warning || "orange"};
	margin-top: 4px;
`;

const ButtonRow = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 16px;
	margin-top: 16px;
`;

const SuccessMessage = styled(motion.div)<{ theme: AppTheme }>`
	color: ${(props) => props.theme.colors.success || "green"};
	font-size: 14px;
`;
