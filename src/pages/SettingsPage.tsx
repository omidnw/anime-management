import React, { useState } from "react";
import {
	Container,
	Typography,
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Grid,
} from "@mui/material";
import PageHeader from "../components/ui/PageHeader";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import ThemeSettings from "../components/settings/ThemeSettings";
import DisplaySettings from "../components/settings/DisplaySettings";
import LanguageSettings from "../components/settings/LanguageSettings";
import NotificationsPanel from "../components/settings/NotificationsPanel";
import AboutSettings from "../components/settings/AboutSettings";
import StorageLocationSettings from "../components/settings/StorageLocationSettings";
import CacheSettingsPanel from "../components/settings/CacheSettingsPanel";
import MenuSettings from "../components/settings/MenuSettings";
import styled from "@emotion/styled";
import {
	Settings as SettingsIcon,
	Palette,
	LayoutDashboard,
	Globe,
	Bell,
	Database,
	HardDrive,
	Info,
	Save,
	Menu,
} from "lucide-react";
import { Button } from "../components/ui/Button";

// Define the menu items
const menuItems = [
	{ id: "general", label: "General", icon: <SettingsIcon size={20} /> },
	{ id: "theme", label: "Theme", icon: <Palette size={20} /> },
	{ id: "display", label: "Display", icon: <LayoutDashboard size={20} /> },
	{ id: "menu", label: "Menu Display", icon: <Menu size={20} /> },
	{ id: "language", label: "Language & Region", icon: <Globe size={20} /> },
	{ id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
	{ id: "storage", label: "Storage & Cache", icon: <Database size={20} /> },
	{ id: "backup", label: "Backup & Restore", icon: <HardDrive size={20} /> },
	{ id: "about", label: "About", icon: <Info size={20} /> },
];

const MenuCard = styled(Box)`
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SettingsPage: React.FC = () => {
	const [selectedMenuItem, setSelectedMenuItem] = useState("general");
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const renderSettingsContent = () => {
		switch (selectedMenuItem) {
			case "general":
				return (
					<Box
						sx={{
							p: 2,
							borderRadius: 1,
							backgroundColor: theme.colors.surface,
							color: theme.colors.text,
						}}
					>
						<Typography variant="h5" sx={{ mb: 3, color: theme.colors.text }}>
							General Settings
						</Typography>
						<Typography
							variant="body2"
							sx={{ mb: 2, color: theme.colors.textSecondary }}
						>
							Configure general application settings and preferences.
						</Typography>
						<Button
							variant="primary"
							icon={<Save size={16} />}
							onClick={() => console.log("Settings saved")}
						>
							Save Settings
						</Button>
					</Box>
				);
			case "theme":
				return <ThemeSettings />;
			case "display":
				return <DisplaySettings />;
			case "menu":
				return <MenuSettings />;
			case "language":
				return <LanguageSettings />;
			case "notifications":
				return <NotificationsPanel />;
			case "storage":
				return (
					<Box
						sx={{
							p: 2,
							borderRadius: 1,
							backgroundColor: theme.colors.surface,
							color: theme.colors.text,
						}}
					>
						<Typography variant="h5" sx={{ mb: 3, color: theme.colors.text }}>
							Storage & Cache
						</Typography>
						<StorageLocationSettings />
						<Box sx={{ mt: 3 }}>
							<CacheSettingsPanel />
						</Box>
					</Box>
				);
			case "backup":
				return (
					<Box
						sx={{
							p: 2,
							borderRadius: 1,
							backgroundColor: theme.colors.surface,
							color: theme.colors.text,
						}}
					>
						<Typography
							variant="h6"
							sx={{
								mb: 2,
								color: theme.colors.text,
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							<HardDrive size={20} color={theme.colors.primary} />
							Backup & Restore
						</Typography>
						<Typography
							variant="body2"
							sx={{ mb: 2, color: theme.colors.textSecondary }}
						>
							Backup your anime list and application data or restore from a
							previous backup.
						</Typography>
						<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
							<Button
								variant="outline"
								icon={<HardDrive size={16} />}
								onClick={() => console.log("Create Backup")}
							>
								Create Backup
							</Button>
							<Button
								variant="outline"
								onClick={() => console.log("Restore Backup")}
							>
								Restore from Backup
							</Button>
						</Box>
					</Box>
				);
			case "about":
				return <AboutSettings />;
			default:
				return null;
		}
	};

	return (
		<Container maxWidth="lg" sx={{ pb: 4 }}>
			<PageHeader title="Settings" />

			<Grid container spacing={3}>
				{/* Settings Menu */}
				<Grid item xs={12} md={3}>
					<MenuCard sx={{ backgroundColor: theme.colors.surface }}>
						<List component="nav" aria-label="settings menu" sx={{ py: 0 }}>
							{menuItems.map((item, index) => (
								<React.Fragment key={item.id}>
									<ListItem disablePadding>
										<ListItemButton
											selected={selectedMenuItem === item.id}
											onClick={() => setSelectedMenuItem(item.id)}
											sx={{
												borderLeft:
													selectedMenuItem === item.id
														? "3px solid"
														: "3px solid transparent",
												borderLeftColor: theme.colors.primary,
												color:
													selectedMenuItem === item.id
														? theme.colors.primary
														: theme.colors.text,
												backgroundColor:
													selectedMenuItem === item.id
														? `${theme.colors.primary}15`
														: "transparent",
												"&:hover": {
													backgroundColor:
														selectedMenuItem === item.id
															? `${theme.colors.primary}20`
															: `${theme.colors.textSecondary}10`,
												},
											}}
										>
											<ListItemIcon
												sx={{
													minWidth: 40,
													color:
														selectedMenuItem === item.id
															? theme.colors.primary
															: theme.colors.text,
												}}
											>
												{item.icon}
											</ListItemIcon>
											<ListItemText primary={item.label} />
										</ListItemButton>
									</ListItem>
									{index < menuItems.length - 1 && <Divider />}
								</React.Fragment>
							))}
						</List>
					</MenuCard>
				</Grid>

				{/* Settings Content */}
				<Grid item xs={12} md={9}>
					<Box sx={{ width: "100%" }}>{renderSettingsContent()}</Box>
				</Grid>
			</Grid>
		</Container>
	);
};

export default SettingsPage;
