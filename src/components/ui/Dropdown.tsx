import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
	value: string | number;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	options: { value: string | number; label: string }[];
	disabled?: boolean;
}

export function Dropdown({
	value,
	onChange,
	options,
	disabled = false,
}: DropdownProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<DropdownContainer theme={theme} disabled={disabled}>
			<StyledSelect
				value={value}
				onChange={onChange}
				disabled={disabled}
				theme={theme}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</StyledSelect>
			<IconWrapper>
				<ChevronDown
					size={16}
					color={disabled ? "#9e9e9e" : theme.colors.textSecondary}
				/>
			</IconWrapper>
		</DropdownContainer>
	);
}

const DropdownContainer = styled.div<{ theme: any; disabled: boolean }>`
	position: relative;
	width: 180px;
	height: 38px;
	border-radius: 8px;
	border: 1px solid
		${(props) => (props.disabled ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.15)")};
	background-color: ${(props) => props.theme.colors.background};
	opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const StyledSelect = styled.select<{ theme: any }>`
	width: 100%;
	height: 100%;
	padding: 8px 32px 8px 12px;
	border: none;
	border-radius: 8px;
	background-color: transparent;
	color: ${(props) => props.theme.colors.text};
	font-size: 14px;
	font-weight: 400;
	appearance: none;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	outline: none;
`;

const IconWrapper = styled.div`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
`;
