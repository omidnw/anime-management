export type ThemeMode = "light" | "dark" | "sakura";

export interface ThemeColors {
	primary: string;
	primaryHover?: string;
	primaryActive?: string;
	secondary: string;
	secondaryHover?: string;
	secondaryActive?: string;
	background: string;
	surface: string;
	surfaceHover: string;
	surfaceActive?: string;
	surfaceVariant?: string;
	text: string;
	textSecondary: string;
	border: string;
	accent: string;
	error?: string;
	success?: string;
	warning?: string;
	info?: string;
}

export interface AppTheme {
	name: ThemeMode;
	colors: ThemeColors;
	borderRadius: string;
	boxShadow: string;
}
