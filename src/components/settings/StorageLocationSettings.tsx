import React, { useState, useEffect } from "react";
import {
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Box,
	Typography,
	SelectChangeEvent,
} from "@mui/material";
import { FolderOpen, HardDrive, Save } from "lucide-react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { Button } from "../ui/Button";
import {
	OptionRow,
	OptionLabel,
	OptionDescription,
	SettingsCard,
	SectionTitle,
} from "./SettingsStyles";
import { offlineStorage } from "../../services/offlineStorage";

type StorageLocation = "documents" | "home" | "appdata" | "custom";

const StorageLocationSettings: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [location, setLocation] = useState<StorageLocation>("documents");
	const [customPath, setCustomPath] = useState("");
	const [currentPath, setCurrentPath] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState("");

	useEffect(() => {
		// Load current storage location settings
		const loadSettings = async () => {
			try {
				const storageInfo = offlineStorage.getStorageLocation();
				setLocation(storageInfo.location);
				setCustomPath(storageInfo.customPath);
				setCurrentPath(storageInfo.path);
			} catch (error) {
				console.error("Failed to load storage settings:", error);
			}
		};

		loadSettings();
	}, []);

	const handleLocationChange = (event: SelectChangeEvent<StorageLocation>) => {
		setLocation(event.target.value as StorageLocation);
	};

	const handleBrowse = async () => {
		try {
			const selected = await window.__TAURI__.dialog.open({
				directory: true,
				multiple: false,
				title: "Select Storage Location",
			});

			if (selected && !Array.isArray(selected)) {
				setCustomPath(selected as string);
			}
		} catch (error) {
			console.error("Failed to select directory:", error);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		setSaveMessage("");

		try {
			await offlineStorage.configureStorageLocation(location, customPath);
			const storageInfo = offlineStorage.getStorageLocation();
			setCurrentPath(storageInfo.path);
			setSaveMessage(
				"Storage location updated successfully. Restart may be required for changes to take effect."
			);
		} catch (error) {
			console.error("Failed to save storage configuration:", error);
			setSaveMessage(`Error saving storage configuration: ${error}`);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<HardDrive size={20} color={theme.colors.primary} />
				Storage Location Settings
			</SectionTitle>

			<Box mb={2}>
				<OptionRow theme={theme}>
					<div>
						<OptionLabel theme={theme}>Current Storage Path</OptionLabel>
						<OptionDescription color={theme.colors.textSecondary}>
							<code
								style={{
									backgroundColor: `${theme.colors.textSecondary}15`,
									padding: "2px 4px",
									borderRadius: "4px",
								}}
							>
								{currentPath}
							</code>
						</OptionDescription>
						<Typography
							variant="caption"
							sx={{
								color: theme.colors.textSecondary,
								mt: 1,
								display: "block",
							}}
						>
							Changes to the storage location may require restarting the
							application.
						</Typography>
					</div>
				</OptionRow>
			</Box>

			<OptionRow theme={theme}>
				<FormControl fullWidth sx={{ mb: location === "custom" ? 0 : 2 }}>
					<InputLabel
						id="storage-location-label"
						sx={{
							color: theme.colors.text,
							"&.Mui-focused": {
								color: theme.colors.primary,
							},
						}}
					>
						Storage Location
					</InputLabel>
					<Select
						labelId="storage-location-label"
						value={location}
						label="Storage Location"
						onChange={handleLocationChange}
						sx={{
							color: theme.colors.text,
							".MuiOutlinedInput-notchedOutline": {
								borderColor: `${theme.colors.textSecondary}50`,
							},
							"&:hover .MuiOutlinedInput-notchedOutline": {
								borderColor: `${theme.colors.textSecondary}`,
							},
							"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
								borderColor: theme.colors.primary,
							},
							".MuiSvgIcon-root": {
								color: theme.colors.textSecondary,
							},
						}}
					>
						<MenuItem value="documents">Documents Folder</MenuItem>
						<MenuItem value="home">User Home Directory</MenuItem>
						<MenuItem value="appdata">App Data Directory</MenuItem>
						<MenuItem value="custom">Custom Location</MenuItem>
					</Select>
					<FormHelperText sx={{ color: theme.colors.textSecondary }}>
						Choose where AniTrack should store cache files and offline data
					</FormHelperText>
				</FormControl>
			</OptionRow>

			{location === "custom" && (
				<OptionRow theme={theme}>
					<Box sx={{ display: "flex", gap: 1, width: "100%" }}>
						<TextField
							fullWidth
							label="Custom Storage Path"
							value={customPath}
							onChange={(e) => setCustomPath(e.target.value)}
							disabled={isSaving}
							placeholder="Select a custom storage directory"
							sx={{
								"& .MuiInputBase-root": {
									color: theme.colors.text,
									backgroundColor: `${theme.colors.surface}50`,
								},
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: `${theme.colors.textSecondary}50`,
								},
								"& .MuiInputLabel-root": {
									color: theme.colors.textSecondary,
								},
								"& .MuiInputLabel-root.Mui-focused": {
									color: theme.colors.primary,
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: theme.colors.textSecondary,
								},
								"& .Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: theme.colors.primary,
								},
							}}
						/>
						<Button
							variant="outline"
							icon={<FolderOpen size={16} />}
							onClick={handleBrowse}
							disabled={isSaving}
						>
							Browse
						</Button>
					</Box>
				</OptionRow>
			)}

			<Box mt={3} display="flex" flexDirection="column" gap={2}>
				<Button
					variant="primary"
					icon={<Save size={16} />}
					onClick={handleSave}
					disabled={isSaving || (location === "custom" && !customPath)}
				>
					{isSaving ? "Saving..." : "Save Storage Location"}
				</Button>

				{saveMessage && (
					<Typography
						variant="body2"
						sx={{
							color: saveMessage.includes("Error")
								? theme.colors.error
								: theme.colors.success,
							mt: 1,
							padding: "8px 12px",
							borderRadius: "4px",
							backgroundColor: saveMessage.includes("Error")
								? `${theme.colors.error}15`
								: `${theme.colors.success}15`,
						}}
					>
						{saveMessage}
					</Typography>
				)}
			</Box>
		</SettingsCard>
	);
};

export default StorageLocationSettings;
