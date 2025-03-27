import { ReactNode, forwardRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

interface CardProps {
	children: ReactNode;
	padding?: string;
	elevation?: "low" | "medium" | "high";
	width?: string;
	height?: string;
	onClick?: () => void;
	hoverEffect?: boolean;
	className?: string;
	backgroundColor?: string;
}

const StyledCard = styled.div<{
	padding: string;
	elevation: string;
	width?: string;
	height?: string;
	clickable: boolean;
	hoverEffect: boolean;
	theme: any;
	backgroundColor?: string;
}>`
	background-color: ${(props) =>
		props.backgroundColor || props.theme?.colors?.surface || "#121212"};
	color: ${(props) => props.theme?.colors?.text || "#ffffff"};
	border-radius: ${(props) => props.theme?.borderRadius || "8px"};
	padding: ${(props) => props.padding};
	width: ${(props) => props.width || "auto"};
	height: ${(props) => props.height || "auto"};
	cursor: ${(props) => (props.clickable ? "pointer" : "default")};
	transition: all 0.2s ease-in-out;

	${(props) => {
		switch (props.elevation) {
			case "low":
				return `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);`;
			case "high":
				return `box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);`;
			default:
				return `box-shadow: ${
					props.theme?.boxShadow || "0 4px 8px rgba(0, 0, 0, 0.07)"
				};`;
		}
	}}

	${(props) =>
		props.hoverEffect &&
		`
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
    }
  `}
`;

// Convert to forwardRef to support refs
export const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			children,
			padding = "16px",
			elevation = "medium",
			width,
			height,
			onClick,
			hoverEffect = false,
			className,
			backgroundColor,
		},
		ref
	) => {
		const { currentTheme } = useTheme();
		const theme = themes[currentTheme] || {
			colors: {
				surface: "#121212",
				text: "#ffffff",
			},
			borderRadius: "8px",
			boxShadow: "0 4px 8px rgba(0, 0, 0, 0.07)",
		};

		return (
			<StyledCard
				padding={padding}
				elevation={elevation}
				width={width}
				height={height}
				clickable={!!onClick}
				onClick={onClick}
				hoverEffect={hoverEffect}
				className={className}
				theme={theme}
				backgroundColor={backgroundColor}
				ref={ref}
			>
				{children}
			</StyledCard>
		);
	}
);
