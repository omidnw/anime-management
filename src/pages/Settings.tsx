/// <reference path="../themes/emotion.d.ts" />
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AppTheme } from "../themes/themeTypes";
import { NotificationSettings } from "../components/NotificationSettings";
import { UpcomingNotifications } from "../components/UpcomingNotifications";
import {
	startNotificationService,
	stopNotificationService,
	isNotificationServiceRunning,
} from "../services/backgroundService";
import {
	Sun,
	Moon,
	Cherry,
	Save,
	Download,
	UploadCloud,
	Bell,
	ChevronDown,
	Info,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { CacheSettings } from "../components/CacheSettings";

// Define interface for themed components
interface ThemedProps {
	theme?: AppTheme;
}

const SettingsContainer = styled.div`
	max-width: 800px;
	margin: 0 auto;
`;

const PageTitle = styled.h2`
	margin: 0 0 24px 0;
	font-size: 24px;
	font-weight: 600;
`;

const SettingsSection = styled(Card)`
	margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
`;

const SectionContent = styled.div`
	margin-bottom: 16px;
`;

const ThemeOptionsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-bottom: 24px;
`;

const ThemeOption = styled.div`
	width: 180px;
`;

interface ThemePreviewProps {
	bgColor: string;
	textColor: string;
	isSelected?: boolean;
	accentColor?: string;
}

const ThemePreview = styled.div<ThemePreviewProps>`
	width: 100%;
	height: 100px;
	background-color: ${(props) => props.bgColor};
	color: ${(props) => props.textColor};
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
	border: 2px solid transparent;

	${(props) =>
		props.isSelected &&
		props.accentColor &&
		`
    border-color: ${props.accentColor};
    box-shadow: 0 0 0 2px ${props.accentColor}40;
  `}
`;

const ThemeName = styled.div`
	font-weight: 600;
	margin-bottom: 8px;
`;

const ThemeSample = styled.div`
	display: flex;
	gap: 8px;
`;

const SampleButton = styled.div<{ bgColor: string; textColor: string }>`
	background-color: ${(props) => props.bgColor};
	color: ${(props) => props.textColor};
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
`;

const SampleText = styled.div<{ textColor: string }>`
	width: 40px;
	height: 4px;
	background-color: ${(props) => props.textColor};
	border-radius: 2px;
	margin-top: 8px;
`;

const OptionRow = styled.div<{ borderColorValue?: string }>`
	padding: 12px 0;
	border-bottom: 1px solid
		${(props) =>
			props.borderColorValue ||
			`${props.theme?.colors?.textSecondary || "#6c757d"}20`};
	margin-bottom: 8px;
`;

const OptionLabel = styled.div`
	font-weight: 500;
`;

const OptionDescription = styled.div<{ color: string }>`
	font-size: 14px;
	color: ${(props) => props.color};
	margin-top: 4px;
`;

const ToggleSwitch = styled.label`
	position: relative;
	display: inline-block;
	width: 48px;
	height: 24px;
`;

interface ToggleInputProps {
	checkedColorValue?: string;
}

const ToggleInput = styled.input<ToggleInputProps>`
	opacity: 0;
	width: 0;
	height: 0;

	&:checked + span {
		background-color: ${(props) => props.checkedColorValue || "#4361ee"};
	}

	&:checked + span:before {
		transform: translateX(24px);
	}
`;

const ToggleSlider = styled.span`
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.4s;
	border-radius: 24px;

	&:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}
`;

const ImportExportRow = styled.div`
	display: flex;
	gap: 8px;
	margin-top: 16px;
`;

const SelectWrapper = styled.div`
	position: relative;
	min-width: 200px;
`;

const StyledSelect = styled.select<{ theme?: AppTheme }>`
	width: 100%;
	padding: 8px 12px;
	padding-right: 32px;
	appearance: none;
	border: 1px solid
		${(props) => props.theme?.colors?.textSecondary || "#6c757d"}60;
	background-color: ${(props) => props.theme?.colors?.surface || "#f8f9fa"};
	color: ${(props) => props.theme?.colors?.text || "#212529"};
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme?.colors?.primary || "#4361ee"};
	}
`;

const SelectIcon = styled.div`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
`;

const RadioGroup = styled.div`
	display: flex;
	gap: 16px;
	margin-top: 12px;
`;

const RadioOption = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
`;

const RadioInput = styled.input<{ accentColor: string }>`
	cursor: pointer;
	&:checked {
		accent-color: ${(props) => props.accentColor};
	}
`;

const SliderContainer = styled.div`
	width: 100%;
	max-width: 300px;
	margin-top: 12px;
`;

const SliderInput = styled.input<{ accentColor: string; theme: any }>`
	width: 100%;
	height: 4px;
	background: ${(props) => props.theme.colors.textSecondary}40;
	outline: none;
	-webkit-appearance: none;
	border-radius: 4px;
	cursor: pointer;

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: ${(props) => props.accentColor};
		cursor: pointer;
	}

	&::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: ${(props) => props.accentColor};
		cursor: pointer;
		border: none;
	}
`;

const SliderValue = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: ${(props) => props.color};
	margin-top: 8px;
`;

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContent = styled.div<ThemedProps>`
	background-color: ${(props) => props.theme?.colors?.background || "#121212"};
	border-radius: 8px;
	padding: 24px;
	width: 100%;
	max-width: 500px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
`;

const ModalButtons = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 24px;
`;

const ProgressContainer = styled.div`
	margin: 24px 0;
`;

const ProgressBar = styled.div<{ progress: number; color: string }>`
	height: 4px;
	width: ${(props) => props.progress}%;
	background: ${(props) =>
		props.color || props.theme?.colors?.textSecondary || "#6c757d"}40;
	transition: width 0.3s ease-in-out;
`;

const ResultSummary = styled.div<ThemedProps>`
	background-color: ${(props) =>
		`${props.theme?.colors?.textSecondary || "#6c757d"}10`};
	border-radius: 8px;
	padding: 16px;
	margin: 16px 0;
`;

const ResultItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;

	&:last-child {
		margin-bottom: 0;
	}
`;

const ResultIcon = styled.div<{ color: string }>`
	color: ${(props) => props.color};
`;

export interface SettingsProps {
	onClose?: () => void;
}

const languages = [
	{ code: "en", name: "English" },
	{ code: "ja", name: "Japanese (日本語)" },
	{ code: "es", name: "Spanish (Español)" },
	{ code: "fr", name: "French (Français)" },
	{ code: "de", name: "German (Deutsch)" },
	{ code: "pt", name: "Portuguese (Português)" },
	{ code: "ru", name: "Russian (Русский)" },
	{ code: "zh", name: "Chinese (中文)" },
	{ code: "ko", name: "Korean (한국어)" },
];

interface ExportResponse {
	path: string;
	entry_count: number;
	export_type: string;
	timestamp: string;
}

interface ImportOptions {
	import_path: string;
	merge_strategy: string; // "merge", "replace", "skip_existing"
	conflict_resolution: string; // "keep_existing", "use_imported", "keep_newer"
	import_type: string; // "all", "watching", "completed", etc.
}

interface ImportResult {
	total_entries: number;
	imported_entries: number;
	updated_entries: number;
	skipped_entries: number;
	conflict_entries: number;
	error_message: string | null;
	import_type: string;
	merge_strategy: string;
}

const SettingsPage = ({ onClose }: SettingsProps) => {
	const { currentTheme, setTheme } = useTheme();
	const theme = themes[currentTheme];

	// Add extended color palette with fallbacks for missing colors
	const themeColors = {
		...theme.colors,
		success: theme.colors.success || "#4caf50", // Green
		error: theme.colors.error || "#e63946", // Red
		warning: theme.colors.warning || "#ff9f1c", // Amber
		info: theme.colors.info || "#3a86ff", // Blue
	};

	const [autoSync, _setAutoSync] = useState(true);
	const [notifications, setNotifications] = useState(true);
	const [aiRecommendations, _setAiRecommendations] = useState(true);

	const [defaultView, setDefaultView] = useState<"grid" | "list">("grid");
	const [language, setLanguage] = useState("en");
	const [episodeNotifications, setEpisodeNotifications] = useState(true);
	const [notificationTime, setNotificationTime] = useState(15);
	const [autoMarkWatched, _setAutoMarkWatched] = useState(false);
	const [loadingAnimations, setLoadingAnimations] = useState(true);
	const [listDisplayDensity, setListDisplayDensity] = useState<
		"compact" | "normal" | "relaxed"
	>("normal");
	const [offlineMode, _setOfflineMode] = useState(false);
	const [dataSyncFrequency, _setDataSyncFrequency] = useState<
		"realtime" | "hourly" | "daily"
	>("hourly");

	const [showImportModal, setShowImportModal] = useState(false);
	const [_importMergeMode, _setImportMergeMode] = useState(true);
	const [importProgress, setImportProgress] = useState(0);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [importError, setImportError] = useState<string | null>(null);
	const [exportPath, setExportPath] = useState<string | null>(null);
	const [exportError, setExportError] = useState<string | null>(null);
	const [exportResponse, setExportResponse] = useState<ExportResponse | null>(
		null
	);

	const [showExportModal, setShowExportModal] = useState(false);
	const [exportType, setExportType] = useState<string>("full");
	const [importOptions, setImportOptions] = useState<ImportOptions>({
		import_path: "",
		merge_strategy: "merge",
		conflict_resolution: "use_imported",
		import_type: "all",
	});

	// Start notification service when the component mounts
	useEffect(() => {
		if (!isNotificationServiceRunning()) {
			startNotificationService();
		}

		// Clean up when the component unmounts
		return () => {
			// We don't stop the service here to keep it running in the background
		};
	}, []);

	const handleSaveSettings = () => {
		console.log({
			theme: currentTheme,
			defaultView,
			language,
			autoSync,
			notifications,
			episodeNotifications,
			notificationTime,
			aiRecommendations,
			autoMarkWatched,
			loadingAnimations,
			listDisplayDensity,
			offlineMode,
			dataSyncFrequency,
		});

		if (onClose) onClose();
	};

	const handleExportData = async () => {
		setShowExportModal(true);
	};

	const handleExportConfirm = async () => {
		try {
			// Ask user where to save the file
			// const defaultFilename = `anitrack_export_${exportType}_${
			// 	new Date().toISOString().split("T")[0]
			// }.json`;

			// const selectedPath = await open({
			// 	multiple: false,
			// 	// filters: [
			// 	// 	{
			// 	// 		name: "JSON",
			// 	// 		extensions: ["json"],
			// 	// 	},
			// 	// ],
			// });

			const selectedPath = await open({
				multiple: false,
				// The 'filters' property is not recognized, so we will remove it
			});

			if (!selectedPath) {
				setShowExportModal(false);
				return; // User cancelled
			}

			// Call the backend to export data
			const result = await invoke<ExportResponse>("export_user_data", {
				exportPath: selectedPath,
				exportType: exportType,
			});

			setExportResponse(result);
			setExportPath(result.path);
			setExportError(null);
		} catch (error) {
			console.error("Export failed:", error);
			setExportError(String(error));
		}
	};

	const closeExportModal = () => {
		setShowExportModal(false);
		setExportPath(null);
		setExportResponse(null);
		setExportError(null);
	};

	const handleImportData = async () => {
		setShowImportModal(true);
	};

	const handleImportConfirm = async () => {
		try {
			setImportProgress(10);
			setImportError(null);

			// Ask user for file to import
			const selectedPath = await open({
				multiple: false,
				// filters: [
				// 	{
				// 		name: "JSON",
				// 		extensions: ["json"],
				// 	},
				// ],
			});

			if (!selectedPath) {
				setShowImportModal(false);
				return; // User cancelled
			}

			setImportProgress(30);

			// Call the backend to import data with detailed options
			const options: ImportOptions = {
				...importOptions,
				import_path: selectedPath as string,
			};

			const result = await invoke<ImportResult>("import_user_data", {
				options,
			});

			setImportProgress(100);
			setImportResult(result);
		} catch (error) {
			console.error("Import failed:", error);
			setImportError(String(error));
			setImportProgress(0);
		}
	};

	const closeImportModal = () => {
		setShowImportModal(false);
		setImportProgress(0);
		setImportResult(null);
		setImportError(null);
	};

	return (
		<EmotionThemeProvider theme={theme}>
			<SettingsContainer>
				<PageTitle>Settings</PageTitle>

				<SettingsSection>
					<SectionTitle>Theme</SectionTitle>
					<SectionContent>
						<ThemeOptionsContainer>
							<ThemeOption>
								<ThemePreview
									bgColor={themes.light.colors.background}
									textColor={themes.light.colors.text}
									isSelected={currentTheme === "light"}
									accentColor={theme.colors.primary}
								>
									<ThemeName>Light</ThemeName>
									<ThemeSample>
										<SampleButton
											bgColor={themes.light.colors.primary}
											textColor="white"
										>
											Button
										</SampleButton>
									</ThemeSample>
									<SampleText textColor={themes.light.colors.text} />
								</ThemePreview>
								<Button
									variant={currentTheme === "light" ? "primary" : "outline"}
									icon={<Sun size={16} />}
									fullWidth
									onClick={() => setTheme("light")}
								>
									Light Mode
								</Button>
							</ThemeOption>

							<ThemeOption>
								<ThemePreview
									bgColor={themes.dark.colors.background}
									textColor={themes.dark.colors.text}
									isSelected={currentTheme === "dark"}
									accentColor={theme.colors.primary}
								>
									<ThemeName>Dark</ThemeName>
									<ThemeSample>
										<SampleButton
											bgColor={themes.dark.colors.primary}
											textColor="white"
										>
											Button
										</SampleButton>
									</ThemeSample>
									<SampleText textColor={themes.dark.colors.text} />
								</ThemePreview>
								<Button
									variant={currentTheme === "dark" ? "primary" : "outline"}
									icon={<Moon size={16} />}
									fullWidth
									onClick={() => setTheme("dark")}
								>
									Dark Mode
								</Button>
							</ThemeOption>

							<ThemeOption>
								<ThemePreview
									bgColor={themes.sakura.colors.background}
									textColor={themes.sakura.colors.text}
									isSelected={currentTheme === "sakura"}
									accentColor={theme.colors.primary}
								>
									<ThemeName>Sakura</ThemeName>
									<ThemeSample>
										<SampleButton
											bgColor={themes.sakura.colors.primary}
											textColor="white"
										>
											Button
										</SampleButton>
									</ThemeSample>
									<SampleText textColor={themes.sakura.colors.text} />
								</ThemePreview>
								<Button
									variant={currentTheme === "sakura" ? "primary" : "outline"}
									icon={<Cherry size={16} />}
									fullWidth
									onClick={() => setTheme("sakura")}
								>
									Sakura
								</Button>
							</ThemeOption>
						</ThemeOptionsContainer>
					</SectionContent>
				</SettingsSection>

				<SettingsSection>
					<SectionTitle>
						<Bell size={18} style={{ marginRight: "8px" }} />
						Notifications
					</SectionTitle>
					<SectionContent>
						<NotificationSettings
							onSave={() => {
								// Restart notification service when settings are saved
								if (isNotificationServiceRunning()) {
									stopNotificationService();
									startNotificationService();
								}
							}}
						/>

						<div
							style={{
								margin: "24px 0",
								borderTop: "1px solid rgba(0,0,0,0.1)",
							}}
						></div>

						<UpcomingNotifications maxItems={3} showClearButton={true} />
					</SectionContent>
				</SettingsSection>

				<SettingsSection>
					<SectionTitle>Display Preferences</SectionTitle>
					<SectionContent>
						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Default View Mode</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Choose how anime lists are displayed by default
								</OptionDescription>

								<RadioGroup>
									<RadioOption>
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
									<RadioOption>
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

						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>List Display Density</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Control how compact the anime items appear in lists
								</OptionDescription>

								<RadioGroup>
									<RadioOption>
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
									<RadioOption>
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
									<RadioOption>
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

						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Loading Animations</OptionLabel>
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
					</SectionContent>
				</SettingsSection>

				<SettingsSection>
					<SectionTitle>Language & Region</SectionTitle>
					<SectionContent>
						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Application Language</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Set your preferred language for the interface
								</OptionDescription>

								<SelectWrapper>
									<StyledSelect
										value={language}
										onChange={(e) => setLanguage(e.target.value)}
										theme={theme}
									>
										{languages.map((lang) => (
											<option key={lang.code} value={lang.code}>
												{lang.name}
											</option>
										))}
									</StyledSelect>
									<SelectIcon>
										<ChevronDown size={16} color={theme.colors.textSecondary} />
									</SelectIcon>
								</SelectWrapper>
							</div>
						</OptionRow>

						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Preferred Title Language</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Language to display anime titles in when available
								</OptionDescription>

								<RadioGroup>
									<RadioOption>
										<RadioInput
											type="radio"
											name="titleLanguage"
											value="romanized"
											checked={true}
											accentColor={theme.colors.primary}
										/>
										Romanized
									</RadioOption>
									<RadioOption>
										<RadioInput
											type="radio"
											name="titleLanguage"
											value="native"
											checked={false}
											accentColor={theme.colors.primary}
										/>
										Native
									</RadioOption>
									<RadioOption>
										<RadioInput
											type="radio"
											name="titleLanguage"
											value="english"
											checked={false}
											accentColor={theme.colors.primary}
										/>
										English
									</RadioOption>
								</RadioGroup>
							</div>
						</OptionRow>
					</SectionContent>
				</SettingsSection>

				<SettingsSection>
					<SectionTitle>Notifications</SectionTitle>
					<SectionContent>
						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>General Notifications</OptionLabel>
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

						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Episode Release Notifications</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Get notified when new episodes of anime you're watching are
									released
								</OptionDescription>
							</div>
							<ToggleSwitch>
								<ToggleInput
									type="checkbox"
									checked={episodeNotifications}
									onChange={() =>
										setEpisodeNotifications(!episodeNotifications)
									}
									checkedColorValue={theme.colors.primary}
								/>
								<ToggleSlider />
							</ToggleSwitch>
						</OptionRow>

						{episodeNotifications && (
							<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
								<div>
									<OptionLabel>Notification Time</OptionLabel>
									<OptionDescription color={theme.colors.textSecondary}>
										Get notified {notificationTime} minutes before episode airs
									</OptionDescription>

									<SliderContainer>
										<SliderInput
											type="range"
											min="0"
											max="60"
											step="5"
											value={notificationTime}
											onChange={(e) =>
												setNotificationTime(parseInt(e.target.value))
											}
											accentColor={theme.colors.primary}
											theme={theme}
										/>
										<SliderValue color={theme.colors.textSecondary}>
											<span>Immediately</span>
											<span>1 hour before</span>
										</SliderValue>
									</SliderContainer>
								</div>
							</OptionRow>
						)}
					</SectionContent>
				</SettingsSection>

				<SettingsSection>
					<SectionTitle>Data Management & Sync</SectionTitle>
					<SectionContent>
						<CacheSettings />

						<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
							<div>
								<OptionLabel>Export/Import Data</OptionLabel>
								<OptionDescription color={theme.colors.textSecondary}>
									Backup or restore your anime list data
								</OptionDescription>

								<ImportExportRow>
									<Button
										variant="outline"
										size="small"
										icon={<Download size={16} />}
										onClick={handleExportData}
									>
										Export Data
									</Button>
									<Button
										variant="outline"
										size="small"
										icon={<UploadCloud size={16} />}
										onClick={handleImportData}
									>
										Import Data
									</Button>
								</ImportExportRow>

								{exportPath && (
									<ResultSummary>
										<ResultItem>
											<ResultIcon color={themeColors.success}>
												<CheckCircle size={16} />
											</ResultIcon>
											Export completed successfully
										</ResultItem>
										<ResultItem>
											<ResultIcon color={themeColors.info}>
												<Info size={16} />
											</ResultIcon>
											Exported {exportPath}
										</ResultItem>
									</ResultSummary>
								)}

								{exportError && (
									<ResultSummary>
										<ResultItem>
											<ResultIcon color={themeColors.error}>
												<AlertCircle size={16} />
											</ResultIcon>
											Export failed: {exportError}
										</ResultItem>
									</ResultSummary>
								)}
							</div>
						</OptionRow>
					</SectionContent>
				</SettingsSection>

				<Button
					variant="primary"
					icon={<Save size={16} />}
					onClick={handleSaveSettings}
				>
					Save Settings
				</Button>

				{showExportModal && (
					<ModalOverlay>
						<ModalContent>
							<ModalTitle>Export Anime List</ModalTitle>

							{!exportPath && !exportError && !exportResponse && (
								<>
									<OptionDescription color={theme.colors.textSecondary}>
										Choose which anime data to export
									</OptionDescription>

									<OptionRow
										borderColorValue={`${theme.colors.textSecondary}20`}
									>
										<RadioGroup>
											<RadioOption>
												<RadioInput
													type="radio"
													name="exportType"
													value="full"
													checked={exportType === "full"}
													onChange={() => setExportType("full")}
													accentColor={theme.colors.primary}
												/>
												Full Backup (All Anime)
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="exportType"
													value="watching"
													checked={exportType === "watching"}
													onChange={() => setExportType("watching")}
													accentColor={theme.colors.primary}
												/>
												Currently Watching
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="exportType"
													value="completed"
													checked={exportType === "completed"}
													onChange={() => setExportType("completed")}
													accentColor={theme.colors.primary}
												/>
												Completed
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="exportType"
													value="planned"
													checked={exportType === "planned"}
													onChange={() => setExportType("planned")}
													accentColor={theme.colors.primary}
												/>
												Plan to Watch
											</RadioOption>
										</RadioGroup>
									</OptionRow>
								</>
							)}

							{exportResponse && (
								<ResultSummary>
									<ResultItem>
										<ResultIcon color={themeColors.success}>
											<CheckCircle size={16} />
										</ResultIcon>
										Export completed successfully
									</ResultItem>
									<ResultItem>
										<ResultIcon color={themeColors.info}>
											<Info size={16} />
										</ResultIcon>
										Exported {exportResponse.entry_count} anime entries
									</ResultItem>
									<ResultItem>
										<ResultIcon color={themeColors.info}>
											<Info size={16} />
										</ResultIcon>
										Type: {exportResponse.export_type}
									</ResultItem>
									<ResultItem>
										<ResultIcon color={themeColors.info}>
											<Info size={16} />
										</ResultIcon>
										File: {exportResponse.path}
									</ResultItem>
								</ResultSummary>
							)}

							{exportPath && !exportResponse && (
								<ResultSummary>
									<ResultItem>
										<ResultIcon color={themeColors.success}>
											<CheckCircle size={16} />
										</ResultIcon>
										Export completed successfully
									</ResultItem>
									<ResultItem>
										<ResultIcon color={themeColors.info}>
											<Info size={16} />
										</ResultIcon>
										Exported {exportPath}
									</ResultItem>
								</ResultSummary>
							)}

							{exportError && (
								<ResultSummary>
									<ResultItem>
										<ResultIcon color={themeColors.error}>
											<AlertCircle size={16} />
										</ResultIcon>
										Export failed: {exportError}
									</ResultItem>
								</ResultSummary>
							)}

							<ModalButtons>
								{!exportPath && !exportError && !exportResponse && (
									<>
										<Button
											variant="outline"
											size="small"
											onClick={closeExportModal}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											size="small"
											onClick={handleExportConfirm}
										>
											Export
										</Button>
									</>
								)}

								{(exportPath || exportError || exportResponse) && (
									<Button
										variant="primary"
										size="small"
										onClick={closeExportModal}
									>
										Close
									</Button>
								)}
							</ModalButtons>
						</ModalContent>
					</ModalOverlay>
				)}

				{showImportModal && (
					<ModalOverlay>
						<ModalContent>
							<ModalTitle>Import Anime List Data</ModalTitle>

							{!importResult && !importError && importProgress === 0 && (
								<>
									<OptionDescription color={theme.colors.textSecondary}>
										Configure how to import your anime list data
									</OptionDescription>

									<SectionTitle>Merge Strategy</SectionTitle>
									<OptionRow
										borderColorValue={`${theme.colors.textSecondary}20`}
									>
										<RadioGroup>
											<RadioOption>
												<RadioInput
													type="radio"
													name="mergeStrategy"
													value="merge"
													checked={importOptions.merge_strategy === "merge"}
													onChange={() =>
														setImportOptions({
															...importOptions,
															merge_strategy: "merge",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Merge with existing data
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="mergeStrategy"
													value="replace"
													checked={importOptions.merge_strategy === "replace"}
													onChange={() =>
														setImportOptions({
															...importOptions,
															merge_strategy: "replace",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Replace all existing data
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="mergeStrategy"
													value="skip_existing"
													checked={
														importOptions.merge_strategy === "skip_existing"
													}
													onChange={() =>
														setImportOptions({
															...importOptions,
															merge_strategy: "skip_existing",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Add only new entries
											</RadioOption>
										</RadioGroup>
									</OptionRow>

									{importOptions.merge_strategy === "merge" && (
										<>
											<SectionTitle>Conflict Resolution</SectionTitle>
											<OptionRow
												borderColorValue={`${theme.colors.textSecondary}20`}
											>
												<RadioGroup>
													<RadioOption>
														<RadioInput
															type="radio"
															name="conflictResolution"
															value="use_imported"
															checked={
																importOptions.conflict_resolution ===
																"use_imported"
															}
															onChange={() =>
																setImportOptions({
																	...importOptions,
																	conflict_resolution: "use_imported",
																})
															}
															accentColor={theme.colors.primary}
														/>
														Always use imported data
													</RadioOption>
													<RadioOption>
														<RadioInput
															type="radio"
															name="conflictResolution"
															value="keep_existing"
															checked={
																importOptions.conflict_resolution ===
																"keep_existing"
															}
															onChange={() =>
																setImportOptions({
																	...importOptions,
																	conflict_resolution: "keep_existing",
																})
															}
															accentColor={theme.colors.primary}
														/>
														Keep existing data
													</RadioOption>
													<RadioOption>
														<RadioInput
															type="radio"
															name="conflictResolution"
															value="keep_newer"
															checked={
																importOptions.conflict_resolution ===
																"keep_newer"
															}
															onChange={() =>
																setImportOptions({
																	...importOptions,
																	conflict_resolution: "keep_newer",
																})
															}
															accentColor={theme.colors.primary}
														/>
														Keep newer data
													</RadioOption>
												</RadioGroup>
											</OptionRow>
										</>
									)}

									<SectionTitle>Data Selection</SectionTitle>
									<OptionRow
										borderColorValue={`${theme.colors.textSecondary}20`}
									>
										<RadioGroup>
											<RadioOption>
												<RadioInput
													type="radio"
													name="importType"
													value="all"
													checked={importOptions.import_type === "all"}
													onChange={() =>
														setImportOptions({
															...importOptions,
															import_type: "all",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Import all anime
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="importType"
													value="watching"
													checked={importOptions.import_type === "watching"}
													onChange={() =>
														setImportOptions({
															...importOptions,
															import_type: "watching",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Import only watching
											</RadioOption>
											<RadioOption>
												<RadioInput
													type="radio"
													name="importType"
													value="completed"
													checked={importOptions.import_type === "completed"}
													onChange={() =>
														setImportOptions({
															...importOptions,
															import_type: "completed",
														})
													}
													accentColor={theme.colors.primary}
												/>
												Import only completed
											</RadioOption>
										</RadioGroup>
									</OptionRow>
								</>
							)}

							{importProgress > 0 && !importResult && !importError && (
								<ProgressContainer>
									<ProgressBar
										progress={importProgress}
										color={theme.colors.primary}
									/>
									<OptionDescription color={theme.colors.textSecondary}>
										Importing data...
									</OptionDescription>
								</ProgressContainer>
							)}

							{importResult && (
								<ResultSummary>
									<ResultItem>
										<ResultIcon color={themeColors.success}>
											<CheckCircle size={16} />
										</ResultIcon>
										Import completed successfully
									</ResultItem>
									<ResultItem>
										<ResultIcon color={themeColors.info}>
											<Info size={16} />
										</ResultIcon>
										Total entries: {importResult.total_entries}
									</ResultItem>
									{importResult.imported_entries > 0 && (
										<ResultItem>
											<ResultIcon color={themeColors.success}>
												<CheckCircle size={16} />
											</ResultIcon>
											Newly imported: {importResult.imported_entries}
										</ResultItem>
									)}
									{importResult.updated_entries > 0 && (
										<ResultItem>
											<ResultIcon color={themeColors.info}>
												<Info size={16} />
											</ResultIcon>
											Updated entries: {importResult.updated_entries}
										</ResultItem>
									)}
									{importResult.skipped_entries > 0 && (
										<ResultItem>
											<ResultIcon color={themeColors.warning}>
												<AlertCircle size={16} />
											</ResultIcon>
											Skipped entries: {importResult.skipped_entries}
										</ResultItem>
									)}
									{importResult.conflict_entries > 0 && (
										<ResultItem>
											<ResultIcon color={themeColors.warning}>
												<AlertCircle size={16} />
											</ResultIcon>
											Conflict entries: {importResult.conflict_entries}
										</ResultItem>
									)}
								</ResultSummary>
							)}

							{importError && (
								<ResultSummary>
									<ResultItem>
										<ResultIcon color={themeColors.error}>
											<AlertCircle size={16} />
										</ResultIcon>
										Import failed: {importError}
									</ResultItem>
								</ResultSummary>
							)}

							<ModalButtons>
								{!importResult && !importError && importProgress === 0 && (
									<>
										<Button
											variant="outline"
											size="small"
											onClick={closeImportModal}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											size="small"
											onClick={handleImportConfirm}
										>
											Select File to Import
										</Button>
									</>
								)}

								{(importResult || importError || importProgress > 0) && (
									<Button
										variant="primary"
										size="small"
										onClick={closeImportModal}
									>
										Close
									</Button>
								)}
							</ModalButtons>
						</ModalContent>
					</ModalOverlay>
				)}
			</SettingsContainer>
		</EmotionThemeProvider>
	);
};

export default SettingsPage;
