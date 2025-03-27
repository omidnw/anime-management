declare module "@tauri-apps/plugin-tauri" {
	export function invoke<T>(
		command: string,
		args?: Record<string, unknown>
	): Promise<T>;
	export function convertFileSrc(filePath: string): string;
}

declare module "@tauri-apps/plugin-path" {
	export function appDataDir(): Promise<string>;
	export function documentDir(): Promise<string>;
	export function join(...pathSegments: string[]): Promise<string>;
}

declare module "@tauri-apps/plugin-dialog" {
	export interface DialogOptions {
		title?: string;
		message?: string;
		type?: "info" | "warning" | "error" | "question";
		okLabel?: string;
		cancelLabel?: string;
		directory?: boolean;
		multiple?: boolean;
	}

	export function open(
		options?: DialogOptions
	): Promise<string | string[] | null>;
}

declare module "@tauri-apps/plugin-shell" {
	export function open(target: string): Promise<void>;
}
