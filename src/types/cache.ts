/**
 * Interface for cache statistics
 */
export interface CacheStats {
	sizeInBytes: number;
	imageCount: number;
}

/**
 * Interface for cache settings
 */
export interface CacheSettings {
	enabled: boolean;
	maxSize: number; // in bytes
	autoCleanup: boolean;
	cleanupThreshold: number; // percentage (0-100)
}
