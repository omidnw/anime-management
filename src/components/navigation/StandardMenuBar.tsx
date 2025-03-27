import React from "react";
import styled from "@emotion/styled";
import {
	Home,
	Search,
	ListFilter,
	BarChart2,
	ThumbsUp,
	Calendar,
	Compass,
	TrendingUp,
} from "lucide-react";
import { AppTheme } from "../../themes/themeTypes";

export type NavItem = {
	id: string;
	label: string;
	icon: React.ReactNode;
};

interface StandardMenuBarProps {
	currentPage: string;
	onNavigation: (page: string) => void;
	theme: AppTheme;
}

// Standard navigation items
export const standardNavItems: NavItem[] = [
	{ id: "home", label: "Home", icon: <Home size={16} /> },
	{ id: "discovery", label: "Discover", icon: <Compass size={16} /> },
	{ id: "trending", label: "Trending", icon: <TrendingUp size={16} /> },
	{ id: "seasonal", label: "Seasonal", icon: <Calendar size={16} /> },
	{ id: "search", label: "Search", icon: <Search size={16} /> },
	{ id: "myList", label: "My List", icon: <ListFilter size={16} /> },
	{ id: "stats", label: "Stats", icon: <BarChart2 size={16} /> },
	{ id: "recommendations", label: "For You", icon: <ThumbsUp size={16} /> },
];

const StandardMenuBar: React.FC<StandardMenuBarProps> = ({
	currentPage,
	onNavigation,
	theme,
}) => {
	return (
		<Navigation>
			<NavList>
				{standardNavItems.map((item) => (
					<li key={item.id}>
						<NavButton
							isActive={currentPage === item.id}
							onClick={() => onNavigation(item.id)}
							theme={theme}
						>
							{item.icon}
							<span>{item.label}</span>
						</NavButton>
					</li>
				))}
			</NavList>
		</Navigation>
	);
};

const Navigation = styled.nav`
	margin-bottom: 24px;

	@media (max-width: 576px) {
		overflow-x: auto;
		padding-bottom: 8px;
		margin-bottom: 16px;

		&::-webkit-scrollbar {
			height: 4px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: rgba(0, 0, 0, 0.2);
			border-radius: 4px;
		}
	}
`;

const NavList = styled.ul`
	display: flex;
	gap: 8px;
	list-style: none;
	padding: 0;
	margin: 0;

	@media (max-width: 576px) {
		width: max-content;
	}
`;

const NavButton = styled.button<{ isActive: boolean; theme: AppTheme }>`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-radius: 8px;
	border: 1px solid
		${(props) => (props.isActive ? props.theme.colors.primary : "transparent")};
	background-color: ${(props) =>
		props.isActive ? `${props.theme.colors.primary}15` : "transparent"};
	color: ${(props) =>
		props.isActive ? props.theme.colors.primary : props.theme.colors.text};
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) =>
			props.isActive
				? `${props.theme.colors.primary}20`
				: `${props.theme.colors.textSecondary}10`};
	}

	@media (max-width: 576px) {
		padding: 8px;

		span {
			display: none;
		}
	}
`;

export default StandardMenuBar;
