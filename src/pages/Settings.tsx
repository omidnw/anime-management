import { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
	Sun,
	Moon,
	Cherry,
	Trash,
	Save,
	Download,
	UploadCloud,
} from "lucide-react";

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

interface OptionRowProps {
	borderColorValue?: string;
}

const OptionRow = styled.div<OptionRowProps>`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 0;
	border-bottom: 1px solid ${(props) => props.borderColorValue || "transparent"};

	&:last-child {
		border-bottom: none;
	}
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

interface SettingsProps {
	onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
	const { currentTheme, setTheme } = useTheme();
	const theme = themes[currentTheme];

	const [autoSync, setAutoSync] = useState(true);
	const [notifications, setNotifications] = useState(true);
	const [aiRecommendations, setAiRecommendations] = useState(true);

	return (
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
				<SectionTitle>Application</SectionTitle>
				<SectionContent>
					<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
						<div>
							<OptionLabel>Automatic Sync</OptionLabel>
							<OptionDescription color={theme.colors.textSecondary}>
								Automatically sync anime list with cloud storage
							</OptionDescription>
						</div>
						<ToggleSwitch>
							<ToggleInput
								type="checkbox"
								checked={autoSync}
								onChange={() => setAutoSync(!autoSync)}
								checkedColorValue={theme.colors.primary}
							/>
							<ToggleSlider />
						</ToggleSwitch>
					</OptionRow>

					<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
						<div>
							<OptionLabel>Notifications</OptionLabel>
							<OptionDescription color={theme.colors.textSecondary}>
								Receive notifications for new episodes and updates
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
							<OptionLabel>AI Recommendations</OptionLabel>
							<OptionDescription color={theme.colors.textSecondary}>
								Get personalized anime recommendations based on your list
							</OptionDescription>
						</div>
						<ToggleSwitch>
							<ToggleInput
								type="checkbox"
								checked={aiRecommendations}
								onChange={() => setAiRecommendations(!aiRecommendations)}
								checkedColorValue={theme.colors.primary}
							/>
							<ToggleSlider />
						</ToggleSwitch>
					</OptionRow>
				</SectionContent>
			</SettingsSection>

			<SettingsSection>
				<SectionTitle>Data Management</SectionTitle>
				<SectionContent>
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
								>
									Export Data
								</Button>
								<Button
									variant="outline"
									size="small"
									icon={<UploadCloud size={16} />}
								>
									Import Data
								</Button>
							</ImportExportRow>
						</div>
					</OptionRow>

					<OptionRow borderColorValue={`${theme.colors.textSecondary}20`}>
						<div>
							<OptionLabel>Clear All Data</OptionLabel>
							<OptionDescription color={theme.colors.textSecondary}>
								Delete all your anime list data and start fresh
							</OptionDescription>
						</div>
						<Button variant="outline" size="small" icon={<Trash size={16} />}>
							Clear Data
						</Button>
					</OptionRow>
				</SectionContent>
			</SettingsSection>

			<Button variant="primary" icon={<Save size={16} />} onClick={onClose}>
				Save Settings
			</Button>
		</SettingsContainer>
	);
}
