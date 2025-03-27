import React, { useState } from "react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { ChevronDown, Globe } from "lucide-react";
import {
	OptionRow,
	OptionLabel,
	OptionDescription,
	RadioGroup,
	RadioOption,
	RadioInput,
	SelectWrapper,
	StyledSelect,
	SelectIcon,
	SettingsCard,
	SectionTitle,
} from "./SettingsStyles";

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

const LanguageSettings: React.FC = () => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [language, setLanguage] = useState("en");

	return (
		<SettingsCard theme={theme}>
			<SectionTitle theme={theme} variant="h6">
				<Globe size={20} color={theme.colors.primary} />
				Language & Region
			</SectionTitle>

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>Application Language</OptionLabel>
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

			<OptionRow theme={theme}>
				<div>
					<OptionLabel theme={theme}>Preferred Title Language</OptionLabel>
					<OptionDescription color={theme.colors.textSecondary}>
						Language to display anime titles in when available
					</OptionDescription>

					<RadioGroup>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="titleLanguage"
								value="romanized"
								checked={true}
								accentColor={theme.colors.primary}
							/>
							Romanized
						</RadioOption>
						<RadioOption theme={theme}>
							<RadioInput
								type="radio"
								name="titleLanguage"
								value="native"
								checked={false}
								accentColor={theme.colors.primary}
							/>
							Native
						</RadioOption>
						<RadioOption theme={theme}>
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
		</SettingsCard>
	);
};

export default LanguageSettings;
