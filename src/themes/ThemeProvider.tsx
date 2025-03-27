import {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { ThemeMode } from "./themeTypes";
import { themes } from "./themes";
import { Global, css } from "@emotion/react";

interface ThemeContextType {
	currentTheme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
	currentTheme: "light",
	setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light");

	// Load theme from localStorage on mount
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as ThemeMode;
		if (savedTheme && themes[savedTheme]) {
			setCurrentTheme(savedTheme);
		}
	}, []);

	const setTheme = (theme: ThemeMode) => {
		localStorage.setItem("theme", theme);
		setCurrentTheme(theme);
	};

	const globalStyles = css`
		body {
			background-color: ${themes[currentTheme]?.colors?.background ||
			"#121212"};
			color: ${themes[currentTheme]?.colors?.text || "#ffffff"};
			font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
				Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
				sans-serif;
			transition: all 0.2s ease-in-out;
			margin: 0;
			padding: 0;
		}
	`;

	return (
		<ThemeContext.Provider value={{ currentTheme, setTheme }}>
			<Global styles={globalStyles} />
			{children}
		</ThemeContext.Provider>
	);
};
