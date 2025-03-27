import React from "react";
import { Typography } from "@mui/material";
import { Info } from "lucide-react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { SettingsCard, SectionTitle } from "./SettingsStyles";

const AboutSettings: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<Info size={20} color={theme.colors.primary} />
				About Anime Management
			</SectionTitle>

			<Typography variant="body1" sx={{ color: theme.colors.text }}>
				Version: 1.0.0
			</Typography>

			<Typography
				variant="body2"
				sx={{ mt: 1, color: theme.colors.textSecondary }}
			>
				Anime Management is an application to help you track and manage your
				anime collection. You can keep track of your watching progress,
				favorites, and more.
			</Typography>
		</SettingsCard>
	);
};

export default AboutSettings;
