export type ThemeMode = "light" | "dark" | "sakura";

export interface ThemeColors {
	primary: string;
	secondary: string;
	background: string;
	surface: string;
	text: string;
	textSecondary: string;
	accent: string;
	error: string;
	warning: string;
	success: string;
}

export interface AppTheme {
	name: ThemeMode;
	colors: ThemeColors;
	borderRadius: string;
	boxShadow: string;
}
