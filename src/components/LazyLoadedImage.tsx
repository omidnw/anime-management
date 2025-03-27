import React, { useState, useRef, useEffect, memo } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { imageCacheService } from "../services/ImageCacheService";

interface LazyLoadedImageProps {
	src: string;
	alt: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

const ImagePlaceholder = styled.div<{ height?: string | number }>`
	background-color: rgba(0, 0, 0, 0.1);
	width: 100%;
	height: ${(props) => props.height || "100%"};
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: inherit;
`;

const ImagePulse = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0.05),
		rgba(255, 255, 255, 0.1),
		rgba(255, 255, 255, 0.05)
	);
`;

const StyledImage = styled.img<{ loaded: boolean; objectFit?: string }>`
	width: 100%;
	height: 100%;
	object-fit: ${(props) => props.objectFit || "cover"};
	opacity: ${(props) => (props.loaded ? 1 : 0)};
	transition: opacity 0.3s ease;
	border-radius: inherit;
`;

export const LazyLoadedImage = memo(
	({
		src,
		alt,
		width,
		height,
		className,
		objectFit = "cover",
	}: LazyLoadedImageProps) => {
		const [cachedSrc, setCachedSrc] = useState<string | null>(null);
		const [isLoaded, setIsLoaded] = useState(false);
		const [isError, setIsError] = useState(false);
		const imageRef = useRef<HTMLImageElement>(null);
		const observerRef = useRef<IntersectionObserver | null>(null);

		// Try to use the cache service
		useEffect(() => {
			const loadImage = async () => {
				if (!src) return;

				try {
					// Get image from cache or download it
					const cachedImageUrl = await imageCacheService.getCachedImageUrl(src);
					setCachedSrc(cachedImageUrl);
				} catch (error) {
					console.error("Error loading cached image:", error);
					// Fall back to original source
					setCachedSrc(src);
				}
			};

			loadImage();
		}, [src]);

		useEffect(() => {
			if (!imageRef.current || !cachedSrc) return;

			// Create intersection observer to load image only when visible
			observerRef.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						// Prefetch the image when it becomes visible
						const img = new Image();
						img.src = cachedSrc;
						img.onload = () => setIsLoaded(true);
						img.onerror = () => {
							setIsError(true);
							// If cached image fails, try original source as fallback
							if (cachedSrc !== src) {
								console.warn(
									"Cached image failed, falling back to original source"
								);
								setCachedSrc(src);
							}
						};

						// Disconnect the observer once the image is in view
						if (observerRef.current) {
							observerRef.current.disconnect();
							observerRef.current = null;
						}
					}
				},
				{ rootMargin: "200px" } // Start loading when image is 200px from viewport
			);

			observerRef.current.observe(imageRef.current);

			return () => {
				if (observerRef.current) {
					observerRef.current.disconnect();
					observerRef.current = null;
				}
			};
		}, [cachedSrc, src]);

		return (
			<ImagePlaceholder height={height} className={className} style={{ width }}>
				{!isLoaded && !isError && (
					<ImagePulse
						animate={{ x: ["0%", "100%", "0%"] }}
						transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
					/>
				)}

				{cachedSrc && (
					<StyledImage
						ref={imageRef}
						src={cachedSrc}
						alt={alt}
						loaded={isLoaded}
						objectFit={objectFit}
						onLoad={() => setIsLoaded(true)}
						onError={() => {
							setIsError(true);
							// If cached image fails, try original source as fallback
							if (cachedSrc !== src) {
								setCachedSrc(src);
							}
						}}
					/>
				)}
			</ImagePlaceholder>
		);
	}
);

// Use displayName for debugging purposes
LazyLoadedImage.displayName = "LazyLoadedImage";
