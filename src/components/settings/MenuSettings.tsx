import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import { Menu as MenuIcon, List as ListIcon } from "lucide-react";
import {
	SettingsCard,
	SectionTitle,
	OptionDescription,
} from "./SettingsStyles";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

// Menu display type options
export type MenuDisplayType = "standard" | "hamburger";

interface MenuSettingsProps {
	initialMenuType?: MenuDisplayType;
	onMenuTypeChange?: (menuType: MenuDisplayType) => void;
}

const MenuSettings: React.FC<MenuSettingsProps> = ({
	initialMenuType = "standard",
	onMenuTypeChange,
}) => {
	const [menuType, setMenuType] = useState<MenuDisplayType>(initialMenuType);
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Handle menu type change
	const handleMenuTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newMenuType = event.target.value as MenuDisplayType;
		setMenuType(newMenuType);

		// Save to localStorage
		localStorage.setItem("menuDisplayType", newMenuType);

		// Notify parent component
		if (onMenuTypeChange) {
			onMenuTypeChange(newMenuType);
		}

		// For real-time updates, manually force UI to reflect changes immediately
		// This custom event will be caught by the App component
		window.dispatchEvent(
			new CustomEvent("menuSettingsChanged", {
				detail: { menuType: newMenuType },
			})
		);
	};

	// Load saved menu type on mount
	useEffect(() => {
		const savedMenuType = localStorage.getItem(
			"menuDisplayType"
		) as MenuDisplayType | null;
		if (savedMenuType) {
			setMenuType(savedMenuType);
			if (onMenuTypeChange) {
				onMenuTypeChange(savedMenuType);
			}
		}
	}, [onMenuTypeChange]);

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<MenuIcon size={20} color={theme.colors.primary} />
				Menu Display
			</SectionTitle>

			<OptionDescription color={theme.colors.textSecondary}>
				Choose how you want the navigation menu to be displayed in the
				application.
			</OptionDescription>

			<Box sx={{ mt: 2 }}>
				<FormControl component="fieldset">
					<RadioGroup
						aria-label="menu-type"
						name="menu-type"
						value={menuType}
						onChange={handleMenuTypeChange}
					>
						<FormControlLabel
							value="standard"
							control={<Radio sx={{ color: theme.colors.primary }} />}
							label={
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<ListIcon size={16} />
									<Typography variant="body2">Standard Menu Bar</Typography>
									<Typography
										variant="caption"
										sx={{ color: theme.colors.textSecondary, ml: 1 }}
									>
										(Always visible at the top)
									</Typography>
								</Box>
							}
						/>
						<FormControlLabel
							value="hamburger"
							control={<Radio sx={{ color: theme.colors.primary }} />}
							label={
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<MenuIcon size={16} />
									<Typography variant="body2">Hamburger Menu</Typography>
									<Typography
										variant="caption"
										sx={{ color: theme.colors.textSecondary, ml: 1 }}
									>
										(Collapsible sidebar)
									</Typography>
								</Box>
							}
						/>
					</RadioGroup>
				</FormControl>
			</Box>
		</SettingsCard>
	);
};

export default MenuSettings;
