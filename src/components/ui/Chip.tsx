import React from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { AppTheme } from "../../themes/themeTypes";

export interface ChipProps {
	label: string;
	color?: string;
	outlined?: boolean;
	size?: "small" | "medium" | "large";
	onDelete?: () => void;
	onClick?: () => void;
	icon?: React.ReactNode;
	selected?: boolean;
	disabled?: boolean;
	className?: string;
}

export function Chip({
	label,
	color,
	outlined = false,
	size = "medium",
	onDelete,
	onClick,
	icon,
	selected = false,
	disabled = false,
	className,
}: ChipProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Use provided color or theme primary
	const chipColor = color || theme.colors.primary;

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled && onDelete) {
			onDelete();
		}
	};

	return (
		<ChipContainer
			color={chipColor}
			outlined={outlined}
			size={size}
			onClick={disabled || !onClick ? undefined : onClick}
			selected={selected}
			disabled={disabled}
			hasClickHandler={!!onClick}
			className={className}
			whileTap={onClick && !disabled ? { scale: 0.97 } : undefined}
			theme={theme}
		>
			{icon && <ChipIcon>{icon}</ChipIcon>}
			<ChipLabel>{label}</ChipLabel>
			{onDelete && (
				<DeleteButton
					onClick={handleDelete}
					whileTap={{ scale: 0.9 }}
					disabled={disabled}
				>
					<X size={size === "small" ? 12 : size === "large" ? 18 : 14} />
				</DeleteButton>
			)}
		</ChipContainer>
	);
}

interface ChipContainerProps {
	color: string;
	outlined: boolean;
	size: "small" | "medium" | "large";
	selected: boolean;
	disabled: boolean;
	hasClickHandler: boolean;
	theme: AppTheme;
}

const getChipHeight = (size: string) => {
	switch (size) {
		case "small":
			return "24px";
		case "large":
			return "36px";
		default:
			return "30px";
	}
};

const getChipFontSize = (size: string) => {
	switch (size) {
		case "small":
			return "11px";
		case "large":
			return "14px";
		default:
			return "12px";
	}
};

const getChipPadding = (size: string) => {
	switch (size) {
		case "small":
			return "0 8px";
		case "large":
			return "0 16px";
		default:
			return "0 12px";
	}
};

const ChipContainer = styled(motion.div)<ChipContainerProps>`
	display: inline-flex;
	align-items: center;
	height: ${(props) => getChipHeight(props.size)};
	padding: ${(props) => getChipPadding(props.size)};
	border-radius: 100px;
	font-size: ${(props) => getChipFontSize(props.size)};
	font-weight: 500;
	cursor: ${(props) =>
		props.disabled
			? "not-allowed"
			: props.hasClickHandler
			? "pointer"
			: "default"};
	user-select: none;
	transition: all 0.2s ease;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	/* Outlined style */
	background-color: ${(props) =>
		props.outlined
			? "transparent"
			: props.selected
			? props.color
			: `${props.color}20`};

	color: ${(props) =>
		props.outlined || !props.selected ? props.color : "#ffffff"};

	border: ${(props) => (props.outlined ? `1px solid ${props.color}` : "none")};

	&:hover {
		background-color: ${(props) =>
			props.hasClickHandler && !props.disabled
				? props.outlined
					? `${props.color}10`
					: props.selected
					? props.color
					: `${props.color}30`
				: props.outlined
				? "transparent"
				: props.selected
				? props.color
				: `${props.color}20`};
	}
`;

const ChipIcon = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 6px;
`;

const ChipLabel = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const DeleteButton = styled(motion.button)<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	padding: 0;
	margin-left: 4px;
	margin-right: -4px;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	color: inherit;
	opacity: 0.7;

	&:hover {
		opacity: ${(props) => (props.disabled ? 0.7 : 1)};
	}

	&:focus {
		outline: none;
	}
`;
