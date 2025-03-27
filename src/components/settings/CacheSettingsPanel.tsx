import { useState, useEffect } from "react";
import { Box, LinearProgress } from "@mui/material";
import { Database, HardDrive, Trash2, RefreshCw } from "lucide-react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { Button } from "../ui/Button";
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
import { imageCacheService } from "../../services/ImageCacheService";

const CacheSettingsPanel: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [cacheSize, setCacheSize] = useState<string>("0 KB");
	const [imageCount, setImageCount] = useState<number>(0);
	const [maxCacheSize, _setMaxCacheSize] = useState<number>(500); // In MB
	const [autoClearCache, setAutoClearCache] = useState<boolean>(true);
	const [isClearing, setIsClearing] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [cacheUsage, setCacheUsage] = useState<number>(0);
	const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);

	useEffect(() => {
		// Load cache statistics when component mounts
		loadCacheStats();
	}, []);

	const loadCacheStats = async () => {
		setIsLoading(true);
		try {
			const stats = await imageCacheService.getCacheStats();
			if (stats) {
				setCacheSize(imageCacheService.formatBytes(stats.sizeInBytes));
				setImageCount(stats.imageCount);
				setCacheUsage(
					Math.min(
						(stats.sizeInBytes / (maxCacheSize * 1024 * 1024)) * 100,
						100
					)
				);
			}
		} catch (error) {
			console.error("Failed to load cache statistics:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearCache = async () => {
		setIsClearing(true);
		try {
			await imageCacheService.clearCache();
			await loadCacheStats();
		} catch (error) {
			console.error("Failed to clear cache:", error);
		} finally {
			setIsClearing(false);
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

	// const handleMaxCacheSizeChange = (newSize: number) => {
	// 	setMaxCacheSize(newSize);
	// 	// Here you would typically save this setting to persistent storage
	// };

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<Database size={20} color={theme.colors.primary} />
				Cache Management
			</SectionTitle>

			<Box sx={{ mb: 4 }}>
				<OptionRow theme={theme}>
					<div>
						<OptionLabel theme={theme}>Current Cache Size</OptionLabel>
						<OptionDescription color={theme.colors.textSecondary}>
							{isLoading ? "Loading..." : cacheSize} of {maxCacheSize} MB
							allocated
						</OptionDescription>
						<Box sx={{ mt: 2, mb: 1, width: "100%" }}>
							<LinearProgress
								variant="determinate"
								value={cacheUsage}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: `${theme.colors.textSecondary}20`,
									"& .MuiLinearProgress-bar": {
										backgroundColor: theme.colors.primary,
									},
								}}
							/>
						</Box>
					</div>
				</OptionRow>

				<OptionRow theme={theme}>
					<div>
						<OptionLabel theme={theme}>Cached Images</OptionLabel>
						<OptionDescription color={theme.colors.textSecondary}>
							{isLoading ? "Loading..." : imageCount} images stored in cache
						</OptionDescription>
					</div>
				</OptionRow>

				<OptionRow theme={theme}>
					<div>
						<OptionLabel theme={theme}>Auto-clear Cache</OptionLabel>
						<OptionDescription color={theme.colors.textSecondary}>
							Automatically clear cache when it exceeds the maximum size
						</OptionDescription>
					</div>
					<ToggleSwitch>
						<ToggleInput
							type="checkbox"
							checked={autoClearCache}
							onChange={() => setAutoClearCache(!autoClearCache)}
							checkedColorValue={theme.colors.primary}
						/>
						<ToggleSlider />
					</ToggleSwitch>
				</OptionRow>

				<Box
					sx={{
						mt: 3,
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
					}}
				>
					<Button
						variant="outline"
						icon={<RefreshCw size={16} />}
						onClick={loadCacheStats}
						disabled={isLoading}
					>
						Refresh Stats
					</Button>

					<Button
						variant="outline"
						icon={<Trash2 size={16} />}
						onClick={handleClearCache}
						disabled={isLoading || isClearing || imageCount === 0}
					>
						{isClearing ? "Clearing..." : "Clear Cache"}
					</Button>

					<Button
						variant="outline"
						icon={<HardDrive size={16} />}
						onClick={handleCreateBackup}
						disabled={isLoading || isCreatingBackup || imageCount === 0}
					>
						{isCreatingBackup ? "Creating Backup..." : "Create Backup"}
					</Button>
				</Box>
			</Box>
		</SettingsCard>
	);
};

export default CacheSettingsPanel;
