import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";

const ErrorContainer = styled.div<{ theme: any }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 24px;
	margin: 24px 0;
	border-radius: 8px;
	background-color: ${(props) => `${props.theme.colors.error}10`};
	border: 1px solid ${(props) => `${props.theme.colors.error}30`};
`;

const ErrorHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
`;

const ErrorIcon = styled.div`
	color: ${(props) => props.theme.colors.error};
`;

const ErrorTitle = styled.h3`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: ${(props) => props.theme.colors.text};
`;

const ErrorMessage = styled.p`
	margin: 0 0 20px 0;
	text-align: center;
	color: ${(props) => props.theme.colors.textSecondary};
	line-height: 1.5;
`;

const ErrorCode = styled.div`
	font-family: monospace;
	padding: 4px 8px;
	background-color: ${(props) => `${props.theme.colors.error}15`};
	border-radius: 4px;
	margin-bottom: 20px;
	font-size: 13px;
	color: ${(props) => props.theme.colors.error};
`;

interface FilterErrorsProps {
	errorCode: string;
	message: string;
	onReload?: () => void;
	onReset?: () => void;
}

const FilterErrors: React.FC<FilterErrorsProps> = ({
	errorCode,
	message,
	onReload,
	onReset,
}) => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	return (
		<ErrorContainer theme={theme}>
			<ErrorHeader>
				<ErrorIcon theme={theme}>
					<AlertCircle size={24} />
				</ErrorIcon>
				<ErrorTitle theme={theme}>Filter Error</ErrorTitle>
			</ErrorHeader>

			<ErrorCode theme={theme}>{errorCode}</ErrorCode>

			<ErrorMessage theme={theme}>
				{message ||
					"An error occurred while applying filters. Please try again."}
			</ErrorMessage>

			<div style={{ display: "flex", gap: "12px" }}>
				{onReset && (
					<Button variant="outline" onClick={onReset}>
						Reset Filters
					</Button>
				)}
				{onReload && (
					<Button variant="primary" onClick={onReload}>
						Reload Data
					</Button>
				)}
			</div>
		</ErrorContainer>
	);
};

export default FilterErrors;
