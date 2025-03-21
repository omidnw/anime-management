import { ReactNode } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

// Define the types for button variants and sizes
type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	children?: ReactNode;
	onClick?: () => void;
	fullWidth?: boolean;
	disabled?: boolean;
	icon?: ReactNode;
	type?: "button" | "submit" | "reset";
	className?: string;
	style?: React.CSSProperties;
}

const StyledButton = styled.button<{
	variant: ButtonVariant;
	size: ButtonSize;
	fullWidth?: boolean;
	theme: any;
	iconOnly: boolean;
}>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	font-weight: 500;
	transition: all 0.2s ease;
	cursor: pointer;
	outline: none;
	border: none;
	padding: ${({ size, iconOnly }) =>
		iconOnly
			? size === "small"
				? "8px"
				: size === "medium"
				? "10px"
				: "12px"
			: size === "small"
			? "8px 12px"
			: size === "medium"
			? "10px 16px"
			: "12px 20px"};
	font-size: ${({ size }) =>
		size === "small" ? "14px" : size === "medium" ? "16px" : "18px"};

	${({ variant, theme }) => {
		switch (variant) {
			case "primary":
				return `
          background-color: ${theme.colors.primary};
          color: ${theme.name === "sakura" ? "#3D2E39" : "#ffffff"};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primaryActive};
          }
        `;
			case "secondary":
				return `
          background-color: ${theme.colors.secondary};
          color: ${theme.name === "sakura" ? "#3D2E39" : "#ffffff"};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondaryHover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.secondaryActive};
          }
        `;
			case "outline":
				return `
          background-color: transparent;
          border: 1px solid ${theme.colors.primary};
          color: ${theme.name === "sakura" ? "#5D4E59" : theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.surfaceHover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.surfaceActive};
          }
        `;
			case "text":
				return `
          background-color: transparent;
          color: ${theme.name === "sakura" ? "#5D4E59" : theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.surfaceHover};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.surfaceActive};
          }
        `;
			default:
				return "";
		}
	}}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	svg {
		margin-right: ${({ iconOnly }) => (iconOnly ? "0" : "8px")};
	}
`;

export function Button({
	variant = "primary",
	size = "medium",
	children,
	fullWidth,
	icon,
	...props
}: ButtonProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const iconOnly = Boolean(icon && !children);

	return (
		<StyledButton
			variant={variant}
			size={size}
			fullWidth={fullWidth}
			theme={theme}
			iconOnly={iconOnly}
			{...props}
		>
			{icon && <span className="button-icon">{icon}</span>}
			{children}
		</StyledButton>
	);
}
