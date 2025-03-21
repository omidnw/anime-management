import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorProvider } from "./contexts/ErrorContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorNotification from "./components/ErrorNotification";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
		},
		mutations: {},
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ErrorProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<ErrorBoundary>
						<App />
						<ErrorNotification />
					</ErrorBoundary>
				</ThemeProvider>
			</QueryClientProvider>
		</ErrorProvider>
	</React.StrictMode>
);
