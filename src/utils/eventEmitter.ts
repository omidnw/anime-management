/**
 * Simple event emitter for pub/sub pattern
 */
export class EventEmitter {
	private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

	/**
	 * Subscribe to an event
	 * @param event Event name
	 * @param callback Function to call when event occurs
	 * @returns Unsubscribe function
	 */
	public on(event: string, callback: (...args: any[]) => void): () => void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}

		const eventListeners = this.listeners.get(event)!;
		eventListeners.push(callback);

		// Return unsubscribe function
		return () => {
			const index = eventListeners.indexOf(callback);
			if (index !== -1) {
				eventListeners.splice(index, 1);
			}
		};
	}

	/**
	 * Alias for on() to maintain compatibility
	 * @param event Event name
	 * @param callback Function to call when event occurs
	 * @returns Unsubscribe function
	 */
	public subscribe(
		event: string,
		callback: (...args: any[]) => void
	): () => void {
		return this.on(event, callback);
	}

	/**
	 * Subscribe to an event once
	 * @param event Event name
	 * @param callback Function to call when event occurs
	 * @returns Unsubscribe function
	 */
	public once(event: string, callback: (...args: any[]) => void): () => void {
		const unsubscribe = this.on(event, (...args: any[]) => {
			unsubscribe();
			callback(...args);
		});

		return unsubscribe;
	}

	/**
	 * Emit an event
	 * @param event Event name
	 * @param args Arguments to pass to listeners
	 */
	public emit(event: string, ...args: any[]): void {
		if (!this.listeners.has(event)) {
			return;
		}

		const eventListeners = this.listeners.get(event)!;

		// Create a copy of the listeners array in case listeners are removed during execution
		const listenersCopy = [...eventListeners];

		for (const listener of listenersCopy) {
			try {
				listener(...args);
			} catch (error) {
				console.error(`Error in event listener for ${event}:`, error);
			}
		}
	}

	/**
	 * Remove all listeners for an event
	 * @param event Event name
	 */
	public removeAllListeners(event?: string): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get the number of listeners for an event
	 * @param event Event name
	 * @returns Number of listeners
	 */
	public listenerCount(event: string): number {
		if (!this.listeners.has(event)) {
			return 0;
		}

		return this.listeners.get(event)!.length;
	}
}
