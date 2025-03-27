import styled from "@emotion/styled";
import { AppTheme } from "../../themes/themeTypes";
import { Box, Typography } from "@mui/material";

export const OptionRow = styled.div<{ theme?: AppTheme }>`
	padding: 12px 0;
	border-bottom: 1px solid
		${(props) =>
			props.theme?.colors?.textSecondary + "20" || "rgba(0, 0, 0, 0.1)"};
	margin-bottom: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const OptionLabel = styled.div<{ theme?: AppTheme }>`
	font-weight: 500;
	color: ${(props) => props.theme?.colors?.text || "#212529"};
`;

export const OptionDescription = styled.div<{ color?: string }>`
	font-size: 14px;
	color: ${(props) => props.color || "#6c757d"};
	margin-top: 4px;
`;

export const ToggleSwitch = styled.label`
	position: relative;
	display: inline-block;
	width: 48px;
	height: 24px;
`;

export const ToggleInput = styled.input<{ checkedColorValue?: string }>`
	opacity: 0;
	width: 0;
	height: 0;

	&:checked + span {
		background-color: ${(props) => props.checkedColorValue || "#4361ee"};
	}

	&:checked + span:before {
		transform: translateX(24px);
	}
`;

export const ToggleSlider = styled.span`
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	transition: 0.4s;
	border-radius: 24px;

	&:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}
`;

export const RadioGroup = styled.div`
	display: flex;
	gap: 16px;
	margin-top: 12px;
`;

export const RadioOption = styled.label<{ theme?: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	color: ${(props) => props.theme?.colors?.text || "#212529"};
`;

export const RadioInput = styled.input<{ accentColor?: string }>`
	cursor: pointer;

	&:checked {
		accent-color: ${(props) => props.accentColor || "#4361ee"};
	}
`;

export const SelectWrapper = styled.div`
	position: relative;
	min-width: 200px;
	margin-top: 8px;
`;

export const StyledSelect = styled.select<{ theme?: AppTheme }>`
	width: 100%;
	padding: 8px 12px;
	padding-right: 32px;
	appearance: none;
	border: 1px solid
		${(props) =>
			props.theme?.colors?.textSecondary + "40" || "rgba(0, 0, 0, 0.2)"};
	background-color: ${(props) => props.theme?.colors?.surface || "#f8f9fa"};
	color: ${(props) => props.theme?.colors?.text || "#212529"};
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme?.colors?.primary || "#4361ee"};
	}
`;

export const SelectIcon = styled.div`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
`;

export const SettingsContainer = styled.div`
	max-width: 800px;
`;

export const SettingGroup = styled.div`
	margin-bottom: 24px;
`;

export const SettingHeader = styled.h3`
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const SettingContent = styled.div`
	margin-bottom: 16px;
`;

export const SettingsCard = styled(Box)<{ theme: AppTheme }>`
	padding: 16px;
	border-radius: 8px;
	background-color: ${(props) => props.theme.colors.surface};
	color: ${(props) => props.theme.colors.text};
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	margin-bottom: 16px;
	border: 1px solid ${(props) => props.theme.colors.textSecondary + "15"};
	transition: background-color 0.3s ease, color 0.3s ease;
`;

export const SectionTitle = styled(Typography)<{ theme: AppTheme }>`
	margin-bottom: 16px;
	color: ${(props) => props.theme.colors.text};
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 1.125rem;
	font-weight: 500;
`;
