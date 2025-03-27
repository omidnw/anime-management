import React, { useState, useEffect } from "react";
import {
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Box,
	Typography,
	Paper,
	SelectChangeEvent,
} from "@mui/material";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { offlineStorage } from "../services/offlineStorage";

type StorageLocation = "documents" | "home" | "appdata" | "custom";

const SettingsStorage: React.FC = () => {
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
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select Storage Location",
			});

			if (selected && !Array.isArray(selected)) {
				setCustomPath(selected);
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
		<Paper sx={{ p: 3, mb: 3 }}>
			<Typography variant="h6" mb={2}>
				Storage Location Settings
			</Typography>

			<Box mb={2}>
				<Typography variant="body2" mb={1}>
					Current storage path: <code>{currentPath}</code>
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Changes to the storage location may require restarting the
					application.
				</Typography>
			</Box>

			<FormControl fullWidth margin="normal">
				<InputLabel id="storage-location-label">Storage Location</InputLabel>
				<Select
					labelId="storage-location-label"
					value={location}
					label="Storage Location"
					onChange={handleLocationChange}
				>
					<MenuItem value="documents">Documents Folder</MenuItem>
					<MenuItem value="home">User Home Directory</MenuItem>
					<MenuItem value="appdata">App Data Directory</MenuItem>
					<MenuItem value="custom">Custom Location</MenuItem>
				</Select>
				<FormHelperText>
					Choose where Anime Management should store cache files and offline
					data
				</FormHelperText>
			</FormControl>

			{location === "custom" && (
				<Box mt={2} sx={{ display: "flex", gap: 1 }}>
					<TextField
						fullWidth
						label="Custom Storage Path"
						value={customPath}
						onChange={(e) => setCustomPath(e.target.value)}
						disabled={isSaving}
						placeholder="Select a custom storage directory"
					/>
					<Button
						variant="outlined"
						onClick={handleBrowse}
						disabled={isSaving}
						startIcon={<FolderOpen />}
					>
						Browse
					</Button>
				</Box>
			)}

			<Box
				mt={3}
				display="flex"
				justifyContent="space-between"
				alignItems="center"
			>
				<Button
					variant="contained"
					onClick={handleSave}
					disabled={isSaving || (location === "custom" && !customPath)}
				>
					{isSaving ? "Saving..." : "Save Storage Location"}
				</Button>

				{saveMessage && (
					<Typography
						variant="body2"
						color={saveMessage.includes("Error") ? "error" : "success"}
						ml={2}
					>
						{saveMessage}
					</Typography>
				)}
			</Box>
		</Paper>
	);
};

export default SettingsStorage;
