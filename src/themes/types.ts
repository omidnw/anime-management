export type ThemeName = "light" | "dark" | "sakura";

export interface ThemeColors {
	primary: string;
	secondary: string;
	background: string;
	surface: string;
	text: string;
	textSecondary: string;
	error: string;
	warning: string;
	success: string;
	info: string;
}

export interface AppTheme {
	name: ThemeName;
	colors: ThemeColors;
}

export interface ThemeProviderState {
	currentTheme: ThemeName;
	setTheme: (theme: ThemeName) => void;
}
