import React, { useState } from "react";
import styled from "@emotion/styled";
import { useOffline } from "../contexts/OfflineContext";
import {
	Wifi,
	WifiOff,
	CloudOff,
	RefreshCw,
	ChevronDown,
	ChevronUp,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { format } from "date-fns";
import { useTheme } from "../themes/ThemeProvider";
import { themes } from "../themes/themes";

const OfflineIndicator: React.FC = () => {
	const {
		isOffline,
		hasPendingChanges,
		isPendingSyncInProgress,
		lastSyncTime,
		lastSyncResult,
		pendingChangesCount,
		manuallyToggleOfflineMode,
		syncNow,
		formatLastSyncTime,
	} = useOffline();

	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<Container isOffline={isOffline} theme={theme}>
			<MainSection>
				<StatusIcon isOffline={isOffline} theme={theme}>
					{isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
				</StatusIcon>

				<StatusText>
					{isOffline ? "Offline Mode" : "Online"}
					{hasPendingChanges && (
						<PendingChanges theme={theme}>
							<CloudOff size={12} /> {pendingChangesCount} pending changes
						</PendingChanges>
					)}
					{lastSyncTime && !hasPendingChanges && !isOffline && (
						<LastSync theme={theme}>
							Last synced {formatLastSyncTime()}
						</LastSync>
					)}
				</StatusText>

				<Actions>
					{hasPendingChanges && !isOffline && (
						<Button
							size="small"
							variant="text"
							icon={
								<RefreshCw
									size={14}
									className={isPendingSyncInProgress ? "spinning" : ""}
								/>
							}
							onClick={() => syncNow()}
							disabled={isPendingSyncInProgress}
						>
							Sync
						</Button>
					)}
					<ToggleButton
						onClick={() => manuallyToggleOfflineMode()}
						isOffline={isOffline}
						theme={theme}
					>
						{isOffline ? "Go Online" : "Go Offline"}
					</ToggleButton>
					<ExpandButton onClick={toggleExpanded} theme={theme}>
						{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</ExpandButton>
				</Actions>
			</MainSection>

			{isExpanded && (
				<ExpandedSection theme={theme}>
					<DetailRow>
						<DetailLabel theme={theme}>Status:</DetailLabel>
						<DetailValue theme={theme}>
							{isOffline ? "Offline" : "Online"}
							{isPendingSyncInProgress && " (Syncing...)"}
						</DetailValue>
					</DetailRow>

					<DetailRow>
						<DetailLabel theme={theme}>Pending Changes:</DetailLabel>
						<DetailValue theme={theme}>
							{pendingChangesCount > 0 ? (
								<span className="warning">{pendingChangesCount} changes</span>
							) : (
								<span className="success">All synced</span>
							)}
						</DetailValue>
					</DetailRow>

					<DetailRow>
						<DetailLabel theme={theme}>Last Sync:</DetailLabel>
						<DetailValue theme={theme}>
							{lastSyncTime ? formatLastSyncTime() : "Never"}
						</DetailValue>
					</DetailRow>

					{lastSyncResult && (
						<>
							<DetailRow>
								<DetailLabel theme={theme}>Last Sync Result:</DetailLabel>
								<DetailValue theme={theme}>
									{lastSyncResult.success > 0 && (
										<span className="success">
											<CheckCircle size={12} /> {lastSyncResult.success}{" "}
											successful
										</span>
									)}
									{lastSyncResult.failed > 0 && (
										<span className="warning">
											<AlertTriangle size={12} /> {lastSyncResult.failed} failed
										</span>
									)}
									{lastSyncResult.success === 0 &&
										lastSyncResult.failed === 0 && <span>No changes</span>}
								</DetailValue>
							</DetailRow>

							<DetailRow>
								<DetailLabel theme={theme}>Sync Time:</DetailLabel>
								<DetailValue theme={theme}>
									{format(new Date(lastSyncResult.timestamp), "h:mm:ss a")}
								</DetailValue>
							</DetailRow>
						</>
					)}

					<SyncButtonRow>
						<Button
							size="small"
							variant="primary"
							icon={
								<RefreshCw
									size={14}
									className={isPendingSyncInProgress ? "spinning" : ""}
								/>
							}
							onClick={() => syncNow()}
							disabled={isPendingSyncInProgress || isOffline}
							fullWidth
						>
							{isPendingSyncInProgress ? "Syncing..." : "Force Sync Now"}
						</Button>
					</SyncButtonRow>
				</ExpandedSection>
			)}
		</Container>
	);
};

const Container = styled.div<{ isOffline: boolean; theme: any }>`
	display: flex;
	flex-direction: column;
	border-radius: 6px;
	background-color: ${(props) => props.theme.colors?.surface || "#ffffff"};
	box-shadow: ${(props) =>
		props.theme.name === "dark"
			? "0 1px 3px rgba(0, 0, 0, 0.3)"
			: "0 1px 3px rgba(0, 0, 0, 0.1)"};
	margin-bottom: 16px;
	border-left: 3px solid
		${(props) =>
			props.isOffline
				? props.theme.colors?.warning || "#ed6c02"
				: props.theme.colors?.success || "#2e7d32"};
	color: ${(props) => props.theme.colors?.text || "#333"};
	transition: background-color 0.2s, box-shadow 0.2s;
`;

const MainSection = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 12px;
`;

const StatusIcon = styled.div<{ isOffline: boolean; theme: any }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	margin-right: 8px;
	color: ${(props) =>
		props.isOffline
			? props.theme.colors?.warning || "#ed6c02"
			: props.theme.colors?.success || "#2e7d32"};
`;

const StatusText = styled.div`
	flex: 1;
	font-size: 14px;
	font-weight: 500;
	display: flex;
	flex-direction: column;
`;

const PendingChanges = styled.span<{ theme: any }>`
	font-size: 12px;
	font-weight: normal;
	color: ${(props) => props.theme.colors?.warning || "#ed6c02"};
	display: flex;
	align-items: center;
	gap: 4px;
	margin-top: 2px;
`;

const LastSync = styled.span<{ theme: any }>`
	font-size: 12px;
	font-weight: normal;
	color: ${(props) => props.theme.colors?.textSecondary || "#666"};
	opacity: 0.7;
	margin-top: 2px;
`;

const Actions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const ToggleButton = styled.button<{ isOffline: boolean; theme: any }>`
	background-color: ${(props) =>
		props.isOffline
			? props.theme.colors?.success || "#2e7d32"
			: props.theme.colors?.warning || "#ed6c02"};
	color: ${(props) => (props.theme.name === "dark" ? "#ffffff" : "#ffffff")};
	border: none;
	border-radius: 4px;
	padding: 5px 10px;
	font-size: 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-weight: 500;
	box-shadow: ${(props) =>
		props.theme.name === "dark"
			? "0 1px 3px rgba(0, 0, 0, 0.3)"
			: "0 1px 2px rgba(0, 0, 0, 0.2)"};

	&:hover {
		background-color: ${(props) =>
			props.isOffline
				? props.theme.colors?.success
					? `${props.theme.colors.success}d0`
					: "#1b5e20"
				: props.theme.colors?.warning
				? `${props.theme.colors.warning}d0`
				: "#e65100"};
		transform: translateY(-1px);
		box-shadow: ${(props) =>
			props.theme.name === "dark"
				? "0 2px 5px rgba(0, 0, 0, 0.4)"
				: "0 2px 4px rgba(0, 0, 0, 0.25)"};
	}

	&:active {
		transform: translateY(0);
		box-shadow: ${(props) =>
			props.theme.name === "dark"
				? "0 1px 2px rgba(0, 0, 0, 0.3)"
				: "0 1px 1px rgba(0, 0, 0, 0.2)"};
	}
`;

const ExpandButton = styled.button<{ theme: any }>`
	background: none;
	border: none;
	color: ${(props) => props.theme.colors?.textSecondary || "#666"};
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	cursor: pointer;
	border-radius: 50%;
	transition: background-color 0.2s;

	&:hover {
		background-color: ${(props) =>
			props.theme.name === "dark"
				? `${props.theme.colors?.textSecondary}30` || "#66666630"
				: props.theme.colors?.surfaceHover || "#f5f5f5"};
	}
`;

const ExpandedSection = styled.div<{ theme: any }>`
	padding: 12px;
	border-top: 1px solid ${(props) => props.theme.colors?.border || "#eee"};
	font-size: 13px;
	background-color: ${(props) =>
		props.theme.name === "dark"
			? `${props.theme.colors?.surface}90` || "#1e1e1e90"
			: props.theme.colors?.surface || "#ffffff"};
`;

const DetailRow = styled.div`
	display: flex;
	margin-bottom: 8px;
	align-items: baseline;
`;

const DetailLabel = styled.div<{ theme: any }>`
	width: 120px;
	font-weight: 500;
	color: ${(props) => props.theme.colors?.textSecondary || "#666"};
`;

const DetailValue = styled.div<{ theme: any }>`
	flex: 1;
	color: ${(props) => props.theme.colors?.text || "#333"};

	.success {
		color: ${(props) => props.theme.colors?.success || "#2e7d32"};
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.warning {
		color: ${(props) => props.theme.colors?.warning || "#ed6c02"};
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
`;

const SyncButtonRow = styled.div`
	margin-top: 12px;
`;

// Add spinning animation for the refresh icon
const globalStyle = document.createElement("style");
globalStyle.innerHTML = `
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	.spinning {
		animation: spin 1s linear infinite;
	}
`;
document.head.appendChild(globalStyle);

export default OfflineIndicator;
