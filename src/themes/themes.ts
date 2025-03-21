import { AppTheme } from "./themeTypes";

export const lightTheme: AppTheme = {
	name: "light",
	colors: {
		primary: "#4361ee",
		secondary: "#3f37c9",
		background: "#ffffff",
		surface: "#f8f9fa",
		text: "#212529",
		textSecondary: "#6c757d",
		accent: "#4cc9f0",
		error: "#ef476f",
		warning: "#ffd166",
		success: "#06d6a0",
	},
	borderRadius: "8px",
	boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

export const darkTheme: AppTheme = {
	name: "dark",
	colors: {
		primary: "#4361ee",
		secondary: "#3f37c9",
		background: "#121212",
		surface: "#1e1e1e",
		text: "#e9ecef",
		textSecondary: "#adb5bd",
		accent: "#4cc9f0",
		error: "#ef476f",
		warning: "#ffd166",
		success: "#06d6a0",
	},
	borderRadius: "8px",
	boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
};

export const sakuraTheme: AppTheme = {
	name: "sakura",
	colors: {
		primary: "#f7cac9",
		secondary: "#dec2cb",
		background: "#f6e8ea",
		surface: "#ffffff",
		text: "#2b2b2b",
		textSecondary: "#6d6875",
		accent: "#ffb7c5",
		error: "#e84a5f",
		warning: "#ffcc99",
		success: "#a3d9b1",
	},
	borderRadius: "12px",
	boxShadow: "0 4px 10px rgba(222, 194, 203, 0.3)",
};

export const themes: Record<string, AppTheme> = {
	light: lightTheme,
	dark: darkTheme,
	sakura: sakuraTheme,
};
