import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";
import { AppError } from "../contexts/ErrorContext";
import { Button } from "./ui/Button";
import { AlertTriangle } from "lucide-react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: AppError | null;
}

const ErrorDisplay = ({
	error,
	resetError,
}: {
	error: AppError | null;
	resetError: () => void;
}) => {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const containerStyle = {
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center" as const,
		justifyContent: "center" as const,
		padding: "48px 24px",
		margin: "24px auto",
		maxWidth: "600px",
		borderRadius: "8px",
		backgroundColor: theme.colors.surface,
		color: theme.colors.text,
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
	};

	const iconStyle = {
		color: theme.colors.error,
		marginBottom: "24px",
	};

	const titleStyle = {
		fontSize: "24px",
		fontWeight: 600,
		marginBottom: "16px",
	};

	const codeStyle = {
		fontFamily: "monospace",
		backgroundColor: theme.colors.surface,
		padding: "8px 16px",
		borderRadius: "4px",
		marginBottom: "24px",
		fontSize: "14px",
	};

	const messageStyle = {
		marginBottom: "24px",
		textAlign: "center" as const,
		lineHeight: 1.6,
		color: theme.colors.textSecondary,
	};

	const buttonContainerStyle = {
		display: "flex",
		gap: "16px",
	};

	return (
		<div style={containerStyle}>
			<div style={iconStyle}>
				<AlertTriangle size={48} />
			</div>
			<h2 style={titleStyle}>Oops! Something went wrong</h2>
			<div style={codeStyle}>Error Code: {error?.code || "UNKNOWN_ERROR"}</div>
			<p style={messageStyle}>
				{error?.message || "An unexpected error occurred. Please try again."}
				{error?.details && (
					<div style={{ marginTop: "8px" }}>{error.details}</div>
				)}
			</p>
			<div style={buttonContainerStyle}>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Refresh Page
				</Button>
				<Button variant="primary" onClick={resetError}>
					Dismiss
				</Button>
			</div>
		</div>
	);
};

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error: {
				code: "RENDER_ERROR",
				message: error.message,
				timestamp: new Date(),
				details: error.stack,
			},
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Error boundary caught an error:", error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<ErrorDisplay error={this.state.error} resetError={this.resetError} />
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
