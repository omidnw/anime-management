import { useState, useEffect, ReactNode } from "react";
import styled from "@emotion/styled";

type DeviceType = "mobile" | "tablet" | "desktop";

interface LayoutProps {
	children: ReactNode;
	className?: string;
}

const Container = styled.div`
	width: 100%;
	margin: 0 auto;
	transition: padding 0.3s ease;

	/* Mobile (portrait) */
	@media (max-width: 576px) {
		padding: 10px;
		max-width: 100%;
	}

	/* Mobile (landscape) / Tablet (portrait) */
	@media (min-width: 577px) and (max-width: 768px) {
		padding: 16px;
		max-width: 100%;
	}

	/* Tablet (landscape) / Small desktop */
	@media (min-width: 769px) and (max-width: 1024px) {
		padding: 20px;
		max-width: 960px;
	}

	/* Desktop */
	@media (min-width: 1025px) {
		padding: 24px;
		max-width: 1200px;
	}
`;

export function useResponsive(): DeviceType {
	const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;

			if (width <= 576) {
				setDeviceType("mobile");
			} else if (width <= 1024) {
				setDeviceType("tablet");
			} else {
				setDeviceType("desktop");
			}
		};

		// Set initial device type
		handleResize();

		// Add resize event listener
		window.addEventListener("resize", handleResize);

		// Clean up event listener
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return deviceType;
}

export function ResponsiveLayout({ children, className }: LayoutProps) {
	return <Container className={className}>{children}</Container>;
}
