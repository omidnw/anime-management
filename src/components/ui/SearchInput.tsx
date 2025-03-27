import { useState, useEffect, ChangeEvent, ReactNode } from "react";
import styled from "@emotion/styled";
import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import { Search, X, Loader } from "lucide-react";

interface SearchInputProps {
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onClear?: () => void;
	onSearch?: () => void;
	placeholder?: string;
	isLoading?: boolean;
	autoFocus?: boolean;
	icon?: ReactNode;
	className?: string;
	style?: React.CSSProperties;
	debounceMs?: number;
}

const Container = styled.div`
	position: relative;
	width: 100%;
`;

const InputIcon = styled.div`
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: ${(props) => props.color};
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledInput = styled.input<{ theme: any }>`
	padding: 12px 12px 12px 40px;
	border-radius: 8px;
	border: 1px solid ${(props) => props.theme.colors.textSecondary}60;
	background-color: ${(props) => props.theme.colors.surface};
	color: ${(props) => props.theme.colors.text};
	width: 100%;
	height: 42px;
	font-size: 16px;
	outline: none;
	box-sizing: border-box;
	transition: all 0.2s ease;

	&:focus {
		border-color: ${(props) => props.theme.colors.primary};
		box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}30;
	}

	&::placeholder {
		color: ${(props) => props.theme.colors.textSecondary}90;
	}
`;

const ActionButton = styled.button`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	cursor: pointer;
	color: ${(props) => props.color};
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => props.color}15;
	}
`;

const LoadingSpinner = styled(Loader)`
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	animation: spin 1s linear infinite;
	color: ${(props) => props.color};

	@keyframes spin {
		0% {
			transform: translateY(-50%) rotate(0deg);
		}
		100% {
			transform: translateY(-50%) rotate(360deg);
		}
	}
`;

export function SearchInput({
	value,
	onChange,
	onClear,
	onSearch,
	placeholder = "Search...",
	isLoading = false,
	autoFocus = false,
	icon = <Search size={18} />,
	debounceMs = 0,
	...props
}: SearchInputProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [localValue, setLocalValue] = useState(value);

	// Sync value prop with local state
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Handle debouncing
	useEffect(() => {
		if (debounceMs <= 0) return;

		const handler = setTimeout(() => {
			if (localValue !== value) {
				const event = {
					target: { value: localValue },
				} as ChangeEvent<HTMLInputElement>;
				onChange(event);
			}
		}, debounceMs);

		return () => {
			clearTimeout(handler);
		};
	}, [localValue, debounceMs, onChange, value]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setLocalValue(e.target.value);
		if (debounceMs <= 0) {
			onChange(e);
		}
	};

	const handleClear = () => {
		setLocalValue("");
		if (onClear) {
			onClear();
		} else {
			const event = {
				target: { value: "" },
			} as ChangeEvent<HTMLInputElement>;
			onChange(event);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && onSearch) {
			onSearch();
		}
	};

	return (
		<Container className={props.className} style={props.style}>
			<InputIcon color={theme.colors.textSecondary}>{icon}</InputIcon>

			<StyledInput
				type="text"
				value={localValue}
				onChange={handleChange}
				placeholder={placeholder}
				theme={theme}
				autoFocus={autoFocus}
				onKeyDown={handleKeyDown}
			/>

			{isLoading ? (
				<LoadingSpinner size={18} color={theme.colors.textSecondary} />
			) : (
				localValue && (
					<ActionButton
						onClick={handleClear}
						color={theme.colors.textSecondary}
						title="Clear search"
					>
						<X size={18} />
					</ActionButton>
				)
			)}
		</Container>
	);
}
