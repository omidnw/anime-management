interface TauriPath {
	appDataDir(): Promise<string>;
	documentDir(): Promise<string>;
	join(...paths: string[]): Promise<string>;
}

interface TauriCore {
	invoke<T = any>(command: string, args?: Record<string, unknown>): Promise<T>;
	convertFileSrc(filePath: string): string;
}

interface TauriDialog {
	open(options?: {
		title?: string;
		message?: string;
		type?: "info" | "warning" | "error" | "question";
		okLabel?: string;
		cancelLabel?: string;
		directory?: boolean;
		multiple?: boolean;
	}): Promise<string | string[] | null>;
}

interface TauriShell {
	open(path: string): Promise<void>;
}

interface TauriGlobal {
	path: TauriPath;
	tauri: TauriCore;
	dialog: TauriDialog;
	shell: TauriShell;
	invoke: <T = any>(
		command: string,
		args?: Record<string, unknown>
	) => Promise<T>;
}

interface Window {
	__TAURI__: TauriGlobal;
}
