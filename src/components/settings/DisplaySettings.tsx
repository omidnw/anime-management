import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import {
	OptionRow,
	OptionLabel,
	OptionDescription,
	ToggleSwitch,
	ToggleInput,
	ToggleSlider,
	RadioGroup,
	RadioOption,
	RadioInput,
	SettingsCard,
	SectionTitle,
} from "./SettingsStyles";
import { LayoutDashboard, Eye, Layers } from "lucide-react";

const DisplaySettings: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// State for display preferences
	const [defaultView, setDefaultView] = useState<"grid" | "list">("grid");
	const [listDisplayDensity, setListDisplayDensity] = useState<
		"compact" | "normal" | "relaxed"
	>("normal");
	const [loadingAnimations, setLoadingAnimations] = useState(true);

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<LayoutDashboard size={20} color={theme.colors.primary} />
				Display Preferences
			</SectionTitle>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>Default View Mode</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Choose how anime lists are displayed by default
					</OptionDescription>

					<RadioGroup>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="viewMode"
								value="grid"
								checked={defaultView === "grid"}
								onChange={() => setDefaultView("grid")}
								accentColor={theme.colors.primary}
							/>
							Grid View
						</RadioOption>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="viewMode"
								value="list"
								checked={defaultView === "list"}
								onChange={() => setDefaultView("list")}
								accentColor={theme.colors.primary}
							/>
							List View
						</RadioOption>
					</RadioGroup>
				</div>
			</OptionRow>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>List Display Density</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Control how compact the anime items appear in lists
					</OptionDescription>

					<RadioGroup>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="density"
								value="compact"
								checked={listDisplayDensity === "compact"}
								onChange={() => setListDisplayDensity("compact")}
								accentColor={theme.colors.primary}
							/>
							Compact
						</RadioOption>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="density"
								value="normal"
								checked={listDisplayDensity === "normal"}
								onChange={() => setListDisplayDensity("normal")}
								accentColor={theme.colors.primary}
							/>
							Normal
						</RadioOption>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="density"
								value="relaxed"
								checked={listDisplayDensity === "relaxed"}
								onChange={() => setListDisplayDensity("relaxed")}
								accentColor={theme.colors.primary}
							/>
							Relaxed
						</RadioOption>
					</RadioGroup>
				</div>
			</OptionRow>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>Loading Animations</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Show animations when loading content
					</OptionDescription>
				</div>
				<ToggleSwitch>
					<ToggleInput
						type="checkbox"
						checked={loadingAnimations}
						onChange={() => setLoadingAnimations(!loadingAnimations)}
						checkedColorValue={theme.colors.primary}
					/>
					<ToggleSlider />
				</ToggleSwitch>
			</OptionRow>
		</SettingsCard>
	);
};

export default DisplaySettings;
