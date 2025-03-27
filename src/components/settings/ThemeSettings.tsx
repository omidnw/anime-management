import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { Button } from "../ui/Button";
import { AppTheme } from "../../themes/themeTypes";
import { Sun, Moon, Cherry } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { SettingsCard, SectionTitle } from "./SettingsStyles";

// Define interface for theme preview props
interface ThemePreviewProps {
	bgColor: string;
	textColor: string;
	isSelected?: boolean;
	accentColor?: string;
}

const ThemeOptionsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	margin-bottom: 24px;
`;

const ThemeOption = styled.div`
	width: 180px;
`;

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

const ThemeSettings: React.FC = () => {
	const { currentTheme, setTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<Sun size={20} color={theme.colors.primary} />
				Theme
			</SectionTitle>

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
		</SettingsCard>
	);
};

export default ThemeSettings;
