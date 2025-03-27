import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
	return (
		<Box sx={{ mb: 4, mt: 2 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 1,
				}}
			>
				<Box>
					<Typography variant="h4" component="h1" gutterBottom>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="subtitle1" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>
				{action && <Box>{action}</Box>}
			</Box>
			<Divider />
		</Box>
	);
};

export default PageHeader;
