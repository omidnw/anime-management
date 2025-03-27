import React from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

interface SwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	size?: "small" | "medium" | "large";
}

export function Switch({
	checked,
	onChange,
	disabled = false,
	size = "medium",
}: SwitchProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const switchSize = getSwitchSize(size);

	const handleChange = () => {
		if (!disabled) {
			onChange(!checked);
		}
	};

	return (
		<SwitchContainer
			role="switch"
			aria-checked={checked}
			onClick={handleChange}
			disabled={disabled}
			size={size}
			theme={theme}
		>
			<SwitchTrack
				animate={{
					backgroundColor: checked
						? theme.colors.primary + "30"
						: "rgba(0, 0, 0, 0.1)",
				}}
				transition={{ duration: 0.2 }}
			/>
			<SwitchThumb
				animate={{
					x: checked
						? switchSize.width - switchSize.thumbSize - 4 // 4px is total padding (2px on each side)
						: 2,
					backgroundColor: checked ? theme.colors.primary : "#D1D1D1",
				}}
				transition={{ type: "spring", stiffness: 500, damping: 30 }}
				size={size}
			/>
		</SwitchContainer>
	);
}

interface SwitchContainerProps {
	disabled: boolean;
	size: "small" | "medium" | "large";
	theme: any;
}

const getSwitchSize = (size: "small" | "medium" | "large") => {
	switch (size) {
		case "small":
			return { width: 36, height: 20, thumbSize: 16 };
		case "large":
			return { width: 56, height: 30, thumbSize: 26 };
		case "medium":
		default:
			return { width: 46, height: 26, thumbSize: 22 };
	}
};

const SwitchContainer = styled.div<SwitchContainerProps>`
	position: relative;
	display: inline-block;
	width: ${(props) => getSwitchSize(props.size).width}px;
	height: ${(props) => getSwitchSize(props.size).height}px;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	vertical-align: middle;
`;

const SwitchTrack = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 999px;
`;

const SwitchThumb = styled(motion.div)<{ size?: "small" | "medium" | "large" }>`
	position: absolute;
	top: 2px;
	width: ${(props) => getSwitchSize(props.size || "medium").thumbSize}px;
	height: ${(props) => getSwitchSize(props.size || "medium").thumbSize}px;
	border-radius: 50%;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
