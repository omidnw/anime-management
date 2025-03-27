import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";

interface InputFieldProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	type?: string;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
	label?: string;
}

export function InputField({
	value,
	onChange,
	type = "text",
	placeholder = "",
	disabled = false,
	error,
	label,
}: InputFieldProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<InputContainer>
			{label && <Label theme={theme}>{label}</Label>}
			<StyledInput
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				hasError={!!error}
				theme={theme}
			/>
			{error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
		</InputContainer>
	);
}

const InputContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	margin-bottom: 8px;
`;

const Label = styled.label<{ theme: any }>`
	font-size: 14px;
	font-weight: 500;
	margin-bottom: 6px;
	color: ${(props) => props.theme.colors.text};
`;

const StyledInput = styled.input<{ hasError: boolean; theme: any }>`
	height: 38px;
	padding: 8px 12px;
	font-size: 14px;
	border-radius: 8px;
	border: 1px solid
		${(props) =>
			props.hasError
				? props.theme.colors.error || "#f44336"
				: props.disabled
				? "rgba(0,0,0,0.1)"
				: "rgba(0,0,0,0.15)"};
	background-color: ${(props) => props.theme.colors.background};
	color: ${(props) => props.theme.colors.text};

	&:focus {
		outline: none;
		border-color: ${(props) =>
			props.hasError
				? props.theme.colors.error || "#f44336"
				: props.theme.colors.primary};
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&::placeholder {
		color: ${(props) => props.theme.colors.textSecondary};
		opacity: 0.6;
	}
`;

const ErrorMessage = styled.div<{ theme: any }>`
	color: ${(props) => props.theme.colors.error || "#f44336"};
	font-size: 12px;
	margin-top: 4px;
`;
