import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Paper,
	Button,
	Grid,
	Card,
	CardContent,
} from "@mui/material";
import {
	Storage as DatabaseIcon,
	Delete as TrashIcon,
	Archive as ArchiveIcon,
	Refresh as RefreshIcon,
	Info as InfoIcon,
} from "@mui/icons-material";
import { imageCacheService } from "../services/ImageCacheService";

export function CacheSettings() {
	const [cacheStats, setCacheStats] = useState({
		sizeInBytes: 0,
		imageCount: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isClearing, setIsClearing] = useState(false);
	const [isCreatingBackup, setIsCreatingBackup] = useState(false);

	useEffect(() => {
		loadCacheStats();
	}, []);

	const loadCacheStats = async () => {
		setIsLoading(true);
		try {
			const stats = await imageCacheService.getCacheStats();
			setCacheStats(stats);
		} catch (error) {
			console.error("Failed to load cache stats:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearCache = async () => {
		const confirmed = await window.__TAURI__.dialog.open({
			title: "Confirm Cache Clearing",
			message:
				"Are you sure you want to clear the image cache? This will delete all cached images and they will need to be downloaded again when viewed.",
			type: "warning",
			okLabel: "Clear Cache",
			cancelLabel: "Cancel",
		});

		if (confirmed) {
			setIsClearing(true);
			try {
				await imageCacheService.clearCache();
				await loadCacheStats();
			} catch (error) {
				console.error("Failed to clear cache:", error);
			} finally {
				setIsClearing(false);
			}
		}
	};

	const handleCreateBackup = async () => {
		setIsCreatingBackup(true);
		try {
			const backupPath = await imageCacheService.createBackupZip();

			// Ask user if they want to open the folder containing the backup
			const openFolder = await window.__TAURI__.dialog.open({
				title: "Backup Created",
				message: `Backup created successfully at:\n${backupPath}\n\nWould you like to open the folder?`,
				type: "info",
				okLabel: "Open Folder",
				cancelLabel: "Close",
			});

			if (openFolder) {
				// Extract the directory path from the full path
				const lastSlashIndex = backupPath.lastIndexOf("/");
				const folderPath = backupPath.substring(0, lastSlashIndex);
				await window.__TAURI__.shell.open(`file://${folderPath}`);
			}
		} catch (error) {
			console.error("Failed to create backup:", error);
			await window.__TAURI__.dialog.open({
				title: "Backup Failed",
				message: "Failed to create a backup of the image cache.",
				type: "error",
			});
		} finally {
			setIsCreatingBackup(false);
		}
	};

	return (
		<Paper sx={{ p: 3, mb: 3 }}>
			<Box display="flex" alignItems="center" mb={2}>
				<DatabaseIcon color="primary" sx={{ mr: 1 }} />
				<Typography variant="h6">Image Cache Settings</Typography>
			</Box>

			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid item xs={12} sm={6}>
					<Card variant="outlined">
						<CardContent>
							<Typography variant="subtitle2" color="text.secondary">
								Cache Size
							</Typography>
							<Typography variant="h5">
								{isLoading
									? "Loading..."
									: imageCacheService.formatBytes(cacheStats.sizeInBytes)}
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} sm={6}>
					<Card variant="outlined">
						<CardContent>
							<Typography variant="subtitle2" color="text.secondary">
								Cached Images
							</Typography>
							<Typography variant="h5">
								{isLoading ? "Loading..." : cacheStats.imageCount}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<Box
				sx={{
					p: 2,
					mb: 3,
					bgcolor: "info.light",
					color: "info.contrastText",
					borderRadius: 1,
					display: "flex",
					alignItems: "flex-start",
					gap: 1,
				}}
			>
				<InfoIcon />
				<Typography variant="body2">
					Images are cached locally to improve loading speed and reduce data
					usage. Cached images are stored on your device and will be used
					instead of downloading them again each time they are needed.
				</Typography>
			</Box>

			<Box display="flex" gap={1} flexWrap="wrap">
				<Button
					variant="outlined"
					startIcon={<RefreshIcon />}
					onClick={loadCacheStats}
					disabled={isLoading}
				>
					Refresh Stats
				</Button>

				<Button
					variant="outlined"
					color="error"
					startIcon={<TrashIcon />}
					onClick={handleClearCache}
					disabled={isLoading || isClearing || cacheStats.imageCount === 0}
				>
					{isClearing ? "Clearing..." : "Clear Cache"}
				</Button>

				<Button
					variant="outlined"
					startIcon={<ArchiveIcon />}
					onClick={handleCreateBackup}
					disabled={
						isLoading || isCreatingBackup || cacheStats.imageCount === 0
					}
				>
					{isCreatingBackup ? "Creating Backup..." : "Create Backup"}
				</Button>
			</Box>
		</Paper>
	);
}
