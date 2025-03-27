import React, { useState } from "react";
import styled from "@emotion/styled";
import { X, Menu as MenuIcon } from "lucide-react";
import { NavItem, standardNavItems } from "./StandardMenuBar";
import { AppTheme } from "../../themes/themeTypes";
import { motion, AnimatePresence } from "framer-motion";

interface HamburgerMenuProps {
	currentPage: string;
	onNavigation: (page: string) => void;
	theme: AppTheme;
	hideToggleButton?: boolean;
	isMenuOpen?: boolean;
	onMenuToggle?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
	currentPage,
	onNavigation,
	theme,
	hideToggleButton = false,
	isMenuOpen: externalIsOpen,
	onMenuToggle,
}) => {
	// Use internal state if external control isn't provided
	const [internalIsOpen, setInternalIsOpen] = useState(false);

	// Determine if we're using internal or external state for the menu open status
	const isControlled =
		externalIsOpen !== undefined && onMenuToggle !== undefined;
	const isOpen = isControlled ? externalIsOpen : internalIsOpen;

	const toggleMenu = () => {
		if (isControlled && onMenuToggle) {
			onMenuToggle();
		} else {
			setInternalIsOpen(!internalIsOpen);
		}
	};

	const handleNavigation = (pageId: string) => {
		onNavigation(pageId);
		toggleMenu();
	};

	return (
		<MenuContainer>
			{!hideToggleButton && (
				<MenuToggleButton onClick={toggleMenu} theme={theme}>
					<MenuIcon size={24} />
				</MenuToggleButton>
			)}

			<AnimatePresence>
				{isOpen && (
					<MenuOverlay
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={toggleMenu}
					/>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{isOpen && (
					<Sidebar
						theme={theme}
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
					>
						<SidebarHeader>
							<SidebarTitle theme={theme}>Navigation</SidebarTitle>
							<CloseButton onClick={toggleMenu} theme={theme}>
								<X size={24} />
							</CloseButton>
						</SidebarHeader>

						<SidebarNav>
							{standardNavItems.map((item) => (
								<SidebarNavItem
									key={item.id}
									isActive={currentPage === item.id}
									onClick={() => handleNavigation(item.id)}
									theme={theme}
								>
									<ItemIcon>{item.icon}</ItemIcon>
									<ItemLabel>{item.label}</ItemLabel>
								</SidebarNavItem>
							))}
						</SidebarNav>
					</Sidebar>
				)}
			</AnimatePresence>
		</MenuContainer>
	);
};

const MenuContainer = styled.div`
	position: relative;
	display: flex;
	justify-content: flex-end;
	margin-bottom: 24px;
`;

const MenuToggleButton = styled.button<{ theme: AppTheme }>`
	background: ${(props) => props.theme.colors.surface};
	border: 1px solid ${(props) => `${props.theme.colors.textSecondary}20`};
	color: ${(props) => props.theme.colors.text};
	cursor: pointer;
	padding: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => `${props.theme.colors.textSecondary}10`};
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	&:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
`;

const MenuOverlay = styled(motion.div)`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 990;
`;

const Sidebar = styled(motion.div)<{ theme: AppTheme }>`
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	width: 280px;
	background-color: ${(props) => props.theme.colors.surface};
	box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	display: flex;
	flex-direction: column;
	padding: 16px 0;
`;

const SidebarHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px 16px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	margin-bottom: 16px;
`;

const SidebarTitle = styled.h3<{ theme: AppTheme }>`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: ${(props) => props.theme.colors.text};
`;

const CloseButton = styled.button<{ theme: AppTheme }>`
	background: transparent;
	border: none;
	color: ${(props) => props.theme.colors.text};
	cursor: pointer;
	padding: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: background-color 0.2s;

	&:hover {
		background-color: ${(props) => `${props.theme.colors.textSecondary}15`};
	}
`;

const SidebarNav = styled.nav`
	display: flex;
	flex-direction: column;
	overflow-y: auto;
`;

const SidebarNavItem = styled.button<{ isActive: boolean; theme: AppTheme }>`
	display: flex;
	align-items: center;
	padding: 12px 16px;
	background-color: ${(props) =>
		props.isActive ? `${props.theme.colors.primary}15` : "transparent"};
	color: ${(props) =>
		props.isActive ? props.theme.colors.primary : props.theme.colors.text};
	border: none;
	cursor: pointer;
	text-align: left;
	transition: background-color 0.2s;
	border-left: 4px solid
		${(props) => (props.isActive ? props.theme.colors.primary : "transparent")};

	&:hover {
		background-color: ${(props) =>
			props.isActive
				? `${props.theme.colors.primary}20`
				: `${props.theme.colors.textSecondary}10`};
	}
`;

const ItemIcon = styled.span`
	display: flex;
	align-items: center;
	margin-right: 12px;
`;

const ItemLabel = styled.span`
	font-size: 16px;
	font-weight: 500;
`;

export default HamburgerMenu;
