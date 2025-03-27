import { useTheme } from "../../themes/ThemeProvider";
import { themes } from "../../themes/themes";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

interface BarChartProps {
	data: {
		label: string;
		value: number;
		color?: string;
	}[];
	height?: number;
	showValues?: boolean;
	maxValue?: number;
	animate?: boolean;
	className?: string;
}

const ChartContainer = styled.div<{ height: number }>`
	width: 100%;
	height: ${(props) => props.height}px;
	display: flex;
	align-items: flex-end;
	gap: 8px;
	margin-top: 16px;
`;

const BarContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	position: relative;
`;

const BarWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	width: 100%;
`;

const Bar = styled(motion.div)<{ color: string }>`
	background-color: ${(props) => props.color};
	width: 100%;
	border-radius: 4px 4px 0 0;
`;

const BarLabel = styled.div`
	font-size: 12px;
	text-align: center;
	margin-top: 8px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
`;

const BarValue = styled.div`
	font-size: 12px;
	text-align: center;
	margin-bottom: 4px;
	font-weight: 500;
`;

export function BarChart({
	data,
	height = 200,
	showValues = true,
	maxValue,
	animate = true,
	className,
}: BarChartProps) {
	const { currentTheme } = useTheme();
	const theme = themes[currentTheme];

	// Calculate max value for scaling
	const chartMaxValue =
		maxValue || Math.max(...data.map((item) => item.value), 1);

	return (
		<ChartContainer height={height} className={className}>
			{data.map((item, index) => {
				const percentage = (item.value / chartMaxValue) * 100;
				const barColor = item.color || theme.colors.primary;

				return (
					<BarContainer key={index}>
						{showValues && <BarValue>{item.value}</BarValue>}
						<BarWrapper>
							<Bar
								color={barColor}
								style={{ height: `${percentage}%` }}
								initial={animate ? { height: 0 } : undefined}
								animate={animate ? { height: `${percentage}%` } : undefined}
								transition={{ duration: 0.8, delay: index * 0.1 }}
							/>
						</BarWrapper>
						<BarLabel>{item.label}</BarLabel>
					</BarContainer>
				);
			})}
		</ChartContainer>
	);
}
