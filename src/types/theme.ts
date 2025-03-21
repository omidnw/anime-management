export interface ThemeColors {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	surface: string;
	surfaceVariant: string;
	text: string;
	textSecondary: string;
	border: string;
	success: string;
	warning: string;
	error: string;
	info: string;
	shadow: string;
	[key: string]: string;
}

export interface Theme {
	name: string;
	colors: ThemeColors;
	isDark: boolean;
}

// Helper type guard for theme objects
export function isTheme(theme: any): theme is Theme {
	return (
		theme &&
		typeof theme === "object" &&
		"colors" in theme &&
		typeof theme.colors === "object" &&
		"name" in theme &&
		typeof theme.name === "string"
	);
}
