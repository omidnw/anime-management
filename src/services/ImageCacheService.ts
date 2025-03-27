import { invoke } from "@tauri-apps/plugin-tauri";
import { appDataDir, documentDir, join } from "@tauri-apps/plugin-path";
import { convertFileSrc } from "@tauri-apps/plugin-tauri";

// Define types for our cache statistics
interface CacheStats {
	sizeInBytes: number;
	imageCount: number;
}

class ImageCacheService {
	private cacheDir: string | null = null;
	private initialized = false;

	async init(): Promise<void> {
		if (this.initialized) return;

		try {
			// Get the app's data directory using the global Tauri object
			const appData = await window.__TAURI__.path.appDataDir();
			this.cacheDir = await window.__TAURI__.path.join(appData, "image_cache");

			// Ensure the cache directory exists
			await window.__TAURI__.invoke("create_dir_if_not_exists", {
				path: this.cacheDir,
			});

			this.initialized = true;
			console.log("Image cache initialized at:", this.cacheDir);
		} catch (error) {
			console.error("Failed to initialize image cache:", error);
			throw error;
		}
	}

	async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			await this.init();
		}
	}

	/**
	 * Get a cached image URL if available, otherwise cache the image and return its URL
	 */
	async getCachedImageUrl(imageUrl: string): Promise<string> {
		await this.ensureInitialized();

		if (!imageUrl || !this.cacheDir) return imageUrl;

		const imageId = this.getImageId(imageUrl);
		const imagePath = await window.__TAURI__.path.join(this.cacheDir, imageId);

		try {
			// Check if the image exists in cache using Rust
			const exists = await window.__TAURI__.invoke("file_exists", {
				file_path: imagePath,
				location: "Custom",
				custom_path: "",
			});

			if (exists) {
				// Return the cached image URL
				return window.__TAURI__.tauri.convertFileSrc(imagePath);
			} else {
				// Download and cache the image
				await this.downloadAndCacheImage(imageUrl, imagePath);
				return window.__TAURI__.tauri.convertFileSrc(imagePath);
			}
		} catch (error) {
			console.error("Error accessing cached image:", error);
			// Fall back to original URL on error
			return imageUrl;
		}
	}

	/**
	 * Download an image and save it to the cache
	 */
	private async downloadAndCacheImage(
		imageUrl: string,
		targetPath: string
	): Promise<void> {
		try {
			// Download the image using fetch
			const response = await fetch(imageUrl);
			if (!response.ok) {
				throw new Error(
					`Failed to download image: ${response.status} ${response.statusText}`
				);
			}

			// Convert to blob
			const imageBlob = await response.blob();

			// Convert blob to ArrayBuffer
			const arrayBuffer = await imageBlob.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			// Write to file using Rust
			await window.__TAURI__.invoke("write_binary_file", {
				path: targetPath,
				contents: Array.from(uint8Array),
			});

			console.log("Image cached successfully:", imageUrl);
		} catch (error) {
			console.error("Failed to cache image:", error);
			throw error;
		}
	}

	/**
	 * Generate a unique ID for an image URL
	 */
	private getImageId(url: string): string {
		// Create a hash of the URL to use as the filename
		let hash = 0;
		for (let i = 0; i < url.length; i++) {
			const char = url.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}

		// Extract file extension from URL if possible
		const extension = url.split(".").pop()?.split("?")[0] || "jpg";

		// Return the hashed filename with extension
		return `${Math.abs(hash).toString(16)}.${extension}`;
	}

	/**
	 * Clear the image cache
	 */
	async clearCache(): Promise<void> {
		await this.ensureInitialized();

		if (!this.cacheDir) return;

		try {
			// Clear cache using Rust
			await window.__TAURI__.invoke("clear_image_cache", {
				cache_path: this.cacheDir,
			});

			console.log("Image cache cleared successfully");
		} catch (error) {
			console.error("Failed to clear image cache:", error);
			throw error;
		}
	}

	/**
	 * Get cache statistics (size and image count)
	 */
	async getCacheStats(): Promise<CacheStats> {
		await this.ensureInitialized();

		if (!this.cacheDir) return { sizeInBytes: 0, imageCount: 0 };

		try {
			// Get cache stats using Rust
			const stats = await window.__TAURI__.invoke<{
				size_in_bytes: number;
				image_count: number;
			}>("get_cache_stats", {
				cache_path: this.cacheDir,
			});

			// Map from snake_case (Rust) to camelCase (TypeScript)
			return {
				sizeInBytes: stats.size_in_bytes,
				imageCount: stats.image_count,
			};
		} catch (error) {
			console.error("Failed to get cache stats:", error);
			return { sizeInBytes: 0, imageCount: 0 };
		}
	}

	/**
	 * Format bytes to a human-readable string (e.g., 1.2 MB)
	 */
	formatBytes(bytes: number, decimals = 2): string {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	}

	/**
	 * Get the documents directory path
	 */
	async getDocumentsDir(): Promise<string> {
		try {
			return await window.__TAURI__.invoke("get_documents_dir");
		} catch (error) {
			console.error("Failed to get documents directory:", error);
			// Fallback to Tauri's documentDir
			return await window.__TAURI__.path.documentDir();
		}
	}

	/**
	 * Create a zip archive of the cache for backup purposes
	 */
	async createBackupZip(): Promise<string> {
		await this.ensureInitialized();

		if (!this.cacheDir) throw new Error("Cache directory not initialized");

		try {
			// Create zip in the documents directory using Rust
			const documentsDir = await this.getDocumentsDir();
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const zipName = `anitrack_image_cache_backup_${timestamp}.zip`;

			// Let Rust handle the full path construction
			const zipPath = await window.__TAURI__.invoke<string>(
				"create_backup_zip",
				{
					source_dir: this.cacheDir,
					destination_dir: documentsDir,
					zip_name: zipName,
				}
			);

			return zipPath;
		} catch (error) {
			console.error("Failed to create backup zip:", error);
			throw error;
		}
	}
}

// Export a singleton instance
export const imageCacheService = new ImageCacheService();
