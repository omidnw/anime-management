import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorProvider } from "./contexts/ErrorContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorNotification from "./components/ErrorNotification";
import { OfflineProvider } from "./contexts/OfflineContext";
import { NotificationProvider } from "./contexts/NotificationProvider";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
			refetchOnWindowFocus: false,
		},
		mutations: {},
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ErrorProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<OfflineProvider>
						<NotificationProvider>
							<ErrorBoundary>
								<App />
								<ErrorNotification />
							</ErrorBoundary>
						</NotificationProvider>
					</OfflineProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</ErrorProvider>
	</React.StrictMode>
);
