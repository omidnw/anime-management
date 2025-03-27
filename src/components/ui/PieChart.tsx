import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { useState } from "react";

interface PieChartProps {
	data: {
		label: string;
		value: number;
		color?: string;
	}[];
	size?: number;
	showLabels?: boolean;
	animate?: boolean;
	className?: string;
}

interface SliceProps {
	percentage: number;
	color: string;
	startAngle: number;
	index: number;
}

const ChartContainer = styled.div<{ size: number }>`
	width: ${(props) => props.size}px;
	height: ${(props) => props.size}px;
	position: relative;
	margin: 20px auto;
`;

const SVGContainer = styled(motion.svg)`
	transform: rotate(-90deg);
	overflow: visible;
`;

const Slice = styled(motion.path)<{ color: string; isHovered: boolean }>`
	fill: ${(props) => props.color};
	stroke: ${(props) => (props.isHovered ? "#fff" : "rgba(255, 255, 255, 0.5)")};
	stroke-width: ${(props) => (props.isHovered ? 2 : 1)}px;
	cursor: pointer;
	transition: filter 0.2s ease-in-out;
	filter: ${(props) => (props.isHovered ? "brightness(1.1)" : "brightness(1)")};
`;

const Legend = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 16px;
	margin-top: 16px;
`;

const LegendItem = styled.div<{ isHighlighted: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	opacity: ${(props) => (props.isHighlighted ? 1 : 0.7)};
	transition: opacity 0.2s ease-in-out;
`;

const LegendColor = styled.div<{ color: string }>`
	width: 12px;
	height: 12px;
	border-radius: 2px;
	background-color: ${(props) => props.color};
`;

const LegendLabel = styled.span``;

const LegendValue = styled.span`
	font-weight: 500;
`;

const Tooltip = styled.div<{ x: number; y: number }>`
	position: absolute;
	left: ${(props) => props.x}px;
	top: ${(props) => props.y}px;
	transform: translate(-50%, -100%);
	background: rgba(0, 0, 0, 0.8);
	color: white;
	padding: 8px 12px;
	border-radius: 4px;
	font-size: 14px;
	pointer-events: none;
	z-index: 100;
	white-space: nowrap;
`;

// Calculate the coordinates of a point on a circle
const polarToCartesian = (
	centerX: number,
	centerY: number,
	radius: number,
	angleInDegrees: number
) => {
	const angleInRadians = (angleInDegrees * Math.PI) / 180;
	return {
		x: centerX + radius * Math.cos(angleInRadians),
		y: centerY + radius * Math.sin(angleInRadians),
	};
};

// Create an SVG arc path
const createArcPath = (
	x: number,
	y: number,
	radius: number,
	startAngle: number,
	endAngle: number
) => {
	const start = polarToCartesian(x, y, radius, endAngle);
	const end = polarToCartesian(x, y, radius, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

	return [
		`M ${x} ${y}`,
		`L ${start.x} ${start.y}`,
		`A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
		"Z",
	].join(" ");
};

const PieSlice = ({ percentage, color, startAngle, index }: SliceProps) => {
	const [isHovered, setIsHovered] = useState(false);

	// A non-zero percentage should represent at least 1 degree arc
	const degrees = percentage === 0 ? 0 : Math.max(percentage * 360, 1);
	const endAngle = startAngle + degrees;

	const pathData = createArcPath(50, 50, 50, startAngle, endAngle);

	return (
		<Slice
			d={pathData}
			color={color}
			isHovered={isHovered}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			initial={{ pathLength: 0, opacity: 0 }}
			animate={{ pathLength: 1, opacity: 1 }}
			transition={{ duration: 0.6, delay: index * 0.1 }}
		/>
	);
};

export function PieChart({
	data,
	size = 200,
	showLabels = true,
	className,
}: PieChartProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [tooltipInfo, setTooltipInfo] = useState<{
		x: number;
		y: number;
		text: string;
	} | null>(null);

	// Calculate total for percentages
	const total = data.reduce((sum, item) => sum + item.value, 0);

	// Prevent division by zero
	if (total === 0) {
		return <div>No data available</div>;
	}

	// Calculate angles for each slice
	let currentAngle = 0;
	const slices = data.map((item, index) => {
		const startAngle = currentAngle;
		const percentage = item.value / total;
		currentAngle += percentage * 360;

		return {
			...item,
			percentage,
			startAngle,
			index,
		};
	});

	const handleMouseMove = (e: React.MouseEvent, item: any) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		setTooltipInfo({
			x,
			y,
			text: `${item.label}: ${item.value} (${Math.round(
				item.percentage * 100
			)}%)`,
		});
	};

	return (
		<div className={className}>
			<ChartContainer
				size={size}
				onMouseLeave={() => {
					setHoveredIndex(null);
					setTooltipInfo(null);
				}}
			>
				<SVGContainer width={size} height={size} viewBox="0 0 100 100">
					{slices.map((slice, i) => (
						<g
							key={i}
							onMouseEnter={() => setHoveredIndex(i)}
							onMouseMove={(e) => handleMouseMove(e, slice)}
						>
							<PieSlice
								percentage={slice.percentage}
								color={slice.color || theme.colors.primary}
								startAngle={slice.startAngle}
								index={i}
							/>
						</g>
					))}
				</SVGContainer>

				{tooltipInfo && (
					<Tooltip x={tooltipInfo.x} y={tooltipInfo.y}>
						{tooltipInfo.text}
					</Tooltip>
				)}
			</ChartContainer>

			{showLabels && (
				<Legend>
					{data.map((item, i) => (
						<LegendItem
							key={i}
							isHighlighted={hoveredIndex === i || hoveredIndex === null}
							onMouseEnter={() => setHoveredIndex(i)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							<LegendColor color={item.color || theme.colors.primary} />
							<LegendLabel>{item.label}</LegendLabel>
							<LegendValue>({item.value})</LegendValue>
						</LegendItem>
					))}
				</Legend>
			)}
		</div>
	);
}
