import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { X, AlertTriangle } from "lucide-react";
import { useError } from "../contexts/ErrorContext";
import { motion, AnimatePresence } from "framer-motion";

const NotificationContainer = styled(motion.div)<{ theme: any }>`
	position: fixed;
	bottom: 24px;
	right: 24px;
	background-color: ${(props) => props.theme.colors.surfaceVariant};
	color: ${(props) => props.theme.colors.text};
	padding: 16px;
	border-radius: 8px;
	border-left: 4px solid ${(props) => props.theme.colors.error};
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	width: 400px;
	max-width: calc(100vw - 48px);
	z-index: 9999;
`;

const NotificationHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
`;

const NotificationTitle = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
`;

const ErrorIcon = styled.div`
	color: ${(props) => props.theme.colors.error};
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	color: ${(props) => props.theme.colors.textSecondary};
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	border-radius: 50%;

	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
`;

const ErrorCode = styled.div`
	font-family: monospace;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.surface};
	display: inline-block;
	margin-bottom: 8px;
`;

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.textSecondary};
	margin-bottom: 12px;
	font-size: 14px;
	line-height: 1.5;
`;

const ActionButton = styled.button<{ theme: any }>`
	background-color: transparent;
	border: none;
	color: ${(props) => props.theme.colors.primary};
	font-weight: 600;
	cursor: pointer;
	padding: 4px 8px;
	font-size: 14px;
	border-radius: 4px;
	transition: background-color 0.2s;

	&:hover {
		background-color: ${(props) => `${props.theme.colors.primary}15`};
	}
`;

interface ErrorNotificationProps {
	autoHideDuration?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
	autoHideDuration = 8000,
}) => {
	const { error, clearError } = useError();
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Auto-hide the notification after the specified duration
	React.useEffect(() => {
		if (error && autoHideDuration > 0) {
			const timer = setTimeout(() => {
				clearError();
			}, autoHideDuration);

			return () => clearTimeout(timer);
		}
	}, [error, clearError, autoHideDuration]);

	return (
		<AnimatePresence>
			{error && (
				<NotificationContainer
					theme={theme}
					initial={{ opacity: 0, y: 50, x: 0 }}
					animate={{ opacity: 1, y: 0, x: 0 }}
					exit={{ opacity: 0, y: 50 }}
					transition={{ duration: 0.3 }}
				>
					<NotificationHeader>
						<NotificationTitle>
							<ErrorIcon theme={theme}>
								<AlertTriangle size={18} />
							</ErrorIcon>
							Error Detected
						</NotificationTitle>
						<CloseButton theme={theme} onClick={clearError}>
							<X size={18} />
						</CloseButton>
					</NotificationHeader>

					<ErrorCode theme={theme}>{error.code || "UNKNOWN_ERROR"}</ErrorCode>

					<ErrorMessage theme={theme}>
						{error.message || "An unexpected error occurred. Please try again."}
					</ErrorMessage>

					<div>
						<ActionButton
							theme={theme}
							onClick={() => window.location.reload()}
						>
							Refresh Page
						</ActionButton>
						<ActionButton theme={theme} onClick={clearError}>
							Dismiss
						</ActionButton>
					</div>
				</NotificationContainer>
			)}
		</AnimatePresence>
	);
};

export default ErrorNotification;
