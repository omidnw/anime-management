import React, { useState } from "react";
import { NotificationSettings } from "../NotificationSettings";
import {
	startNotificationService,
	stopNotificationService,
	isNotificationServiceRunning,
} from "../../services/backgroundService";
import { Bell } from "lucide-react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import {
	OptionRow,
	OptionLabel,
	OptionDescription,
	ToggleSwitch,
	ToggleInput,
	ToggleSlider,
	SettingsCard,
	SectionTitle,
} from "./SettingsStyles";

const NotificationsPanel: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// State for notifications
	const [notifications, setNotifications] = useState(true);
	const [episodeNotifications, setEpisodeNotifications] = useState(true);

	const handleNotificationSave = () => {
		// Restart notification service when settings are saved
		if (isNotificationServiceRunning()) {
			stopNotificationService();
			startNotificationService();
		}
	};

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<Bell size={20} color={theme.colors.primary} />
				Notifications
			</SectionTitle>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>General Notifications</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Receive general app notifications and updates
					</OptionDescription>
				</div>
				<ToggleSwitch>
					<ToggleInput
						type="checkbox"
						checked={notifications}
						onChange={() => setNotifications(!notifications)}
						checkedColorValue={theme.colors.primary}
					/>
					<ToggleSlider />
				</ToggleSwitch>
			</OptionRow>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>Episode Release Notifications</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Get notified when new episodes of anime you're watching are released
					</OptionDescription>
				</div>
				<ToggleSwitch>
					<ToggleInput
						type="checkbox"
						checked={episodeNotifications}
						onChange={() => setEpisodeNotifications(!episodeNotifications)}
						checkedColorValue={theme.colors.primary}
					/>
					<ToggleSlider />
				</ToggleSwitch>
			</OptionRow>

			<NotificationSettings onSave={handleNotificationSave} />
		</SettingsCard>
	);
};

export default NotificationsPanel;
