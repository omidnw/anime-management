import React, { createContext, useState, useContext, ReactNode } from "react";

interface ErrorContextType {
	error: AppError | null;
	setError: (error: AppError | null) => void;
	clearError: () => void;
}

export interface AppError {
	code: string;
	message: string;
	details?: string;
	timestamp: Date;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [error, setErrorState] = useState<AppError | null>(null);

	const setError = (error: AppError | null) => {
		console.error("Application error:", error);
		setErrorState(error);
	};

	const clearError = () => {
		setErrorState(null);
	};

	return (
		<ErrorContext.Provider value={{ error, setError, clearError }}>
			{children}
		</ErrorContext.Provider>
	);
};

export const useError = () => {
	const context = useContext(ErrorContext);
	if (context === undefined) {
		throw new Error("useError must be used within an ErrorProvider");
	}
	return context;
};

// Utility function to handle errors throughout the app
export const handleAppError = (
	error: unknown,
	code: string = "UNKNOWN_ERROR"
): AppError => {
	const errorMessage = error instanceof Error ? error.message : String(error);

	const appError: AppError = {
		code,
		message: errorMessage,
		timestamp: new Date(),
	};

	return appError;
};
