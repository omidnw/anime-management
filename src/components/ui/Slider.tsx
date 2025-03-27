import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

interface SliderProps {
	min: number;
	max: number;
	value: number;
	onChange: (value: number) => void;
	step?: number;
	disabled?: boolean;
	showValue?: boolean;
	valueFormatter?: (value: number) => string;
}

export function Slider({
	min,
	max,
	value,
	onChange,
	step = 1,
	disabled = false,
	showValue = true,
	valueFormatter = (value) => value.toString(),
}: SliderProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [isDragging, setIsDragging] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(Number(e.target.value));
	};

	return (
		<SliderContainer disabled={disabled}>
			<StyledSlider
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={handleChange}
				disabled={disabled}
				theme={theme}
				onMouseDown={() => setIsDragging(true)}
				onMouseUp={() => setIsDragging(false)}
				onTouchStart={() => setIsDragging(true)}
				onTouchEnd={() => setIsDragging(false)}
				$percentage={((value - min) / (max - min)) * 100}
				$isDragging={isDragging}
			/>
			{showValue && (
				<SliderValue theme={theme} disabled={disabled}>
					{valueFormatter(value)}
				</SliderValue>
			)}
		</SliderContainer>
	);
}

const SliderContainer = styled.div<{ disabled: boolean }>`
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	max-width: 300px;
	gap: 12px;
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const StyledSlider = styled.input<{
	theme: any;
	$percentage: number;
	$isDragging: boolean;
}>`
	-webkit-appearance: none;
	width: 100%;
	height: 4px;
	border-radius: 8px;
	background: ${(props) => `linear-gradient(
    to right,
    ${props.theme.colors.primary} 0%,
    ${props.theme.colors.primary} ${props.$percentage}%,
    rgba(0, 0, 0, 0.1) ${props.$percentage}%,
    rgba(0, 0, 0, 0.1) 100%
  )`};
	outline: none;
	transition: background 0.2s;

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: ${(props) => (props.$isDragging ? "22px" : "16px")};
		height: ${(props) => (props.$isDragging ? "22px" : "16px")};
		border-radius: 50%;
		background: ${(props) => props.theme.colors.primary};
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: width 0.2s, height 0.2s;
	}

	&::-moz-range-thumb {
		width: ${(props) => (props.$isDragging ? "22px" : "16px")};
		height: ${(props) => (props.$isDragging ? "22px" : "16px")};
		border-radius: 50%;
		background: ${(props) => props.theme.colors.primary};
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: width 0.2s, height 0.2s;
		border: none;
	}

	&:disabled {
		cursor: not-allowed;
	}
`;

const SliderValue = styled.div<{ theme: any; disabled: boolean }>`
	min-width: 36px;
	text-align: center;
	font-size: 14px;
	font-weight: 500;
	color: ${(props) => props.theme.colors.text};
`;
