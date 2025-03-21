import styled from "@emotion/styled";
import { Grid, List } from "lucide-react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
	currentView: ViewMode;
	onViewChange: (view: ViewMode) => void;
}

const ToggleContainer = styled.div`
	display: flex;
	border-radius: 8px;
	overflow: hidden;
	border: 1px solid ${(props) => props.color};
`;

const ToggleButton = styled.button<{ isActive: boolean; theme: any }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 36px;
	border: none;
	background-color: ${(props) =>
		props.isActive ? props.theme.colors.primary : "transparent"};
	color: ${(props) =>
		props.isActive
			? props.theme.name === "sakura"
				? "#3D2E39"
				: "#ffffff"
			: props.theme.colors.text};
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover:not(:disabled) {
		background-color: ${(props) =>
			props.isActive
				? props.theme.colors.primary
				: props.theme.colors.surfaceHover};
	}

	&:first-of-type {
		border-right: 1px solid ${(props) => props.color};
	}
`;

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<ToggleContainer color={theme.colors.textSecondary}>
			<ToggleButton
				isActive={currentView === "grid"}
				onClick={() => onViewChange("grid")}
				theme={theme}
				aria-label="Grid view"
			>
				<Grid size={18} />
			</ToggleButton>
			<ToggleButton
				isActive={currentView === "list"}
				onClick={() => onViewChange("list")}
				theme={theme}
				aria-label="List view"
			>
				<List size={18} />
			</ToggleButton>
		</ToggleContainer>
	);
}
