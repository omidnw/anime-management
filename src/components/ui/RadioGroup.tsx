import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

interface RadioOption {
	value: string;
	label: string;
}

interface RadioGroupProps {
	options: RadioOption[];
	value: string;
	onChange: (value: string) => void;
	name: string;
	disabled?: boolean;
	horizontal?: boolean;
}

export function RadioGroup({
	options,
	value,
	onChange,
	name,
	disabled = false,
	horizontal = false,
}: RadioGroupProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<RadioContainer horizontal={horizontal} disabled={disabled}>
			{options.map((option) => (
				<RadioLabel key={option.value} theme={theme} disabled={disabled}>
					<RadioInput
						type="radio"
						name={name}
						value={option.value}
						checked={value === option.value}
						onChange={handleChange}
						disabled={disabled}
						theme={theme}
					/>
					<RadioControl theme={theme} checked={value === option.value} />
					<span>{option.label}</span>
				</RadioLabel>
			))}
		</RadioContainer>
	);
}

const RadioContainer = styled.div<{ horizontal: boolean; disabled: boolean }>`
	display: flex;
	flex-direction: ${(props) => (props.horizontal ? "row" : "column")};
	gap: ${(props) => (props.horizontal ? "16px" : "12px")};
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const RadioLabel = styled.label<{ theme: any; disabled: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: ${(props) => props.theme.colors.text};
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

const RadioInput = styled.input<{ theme: any }>`
	position: absolute;
	opacity: 0;
	height: 0;
	width: 0;
	margin: 0;
`;

const RadioControl = styled.div<{ theme: any; checked: boolean }>`
	position: relative;
	display: inline-block;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 2px solid
		${(props) =>
			props.checked ? props.theme.colors.primary : "rgba(0, 0, 0, 0.3)"};
	transition: border-color 0.2s;

	&::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: ${(props) => props.theme.colors.primary};
		opacity: ${(props) => (props.checked ? 1 : 0)};
		transition: opacity 0.2s;
	}
`;
