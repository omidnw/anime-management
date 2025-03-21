import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/Button";
import { Edit, Share2 } from "lucide-react";

interface ActionButtonsProps {
	onSave: () => void;
}

const ButtonsContainer = styled(motion.div)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 24px;
`;

const ShareButton = styled(Button)`
	margin-left: auto;
`;

export function ActionButtons({ onSave }: ActionButtonsProps) {
	return (
		<ButtonsContainer
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.9 }}
		>
			<Button variant="primary" onClick={onSave} icon={<Edit size={16} />}>
				Save Changes
			</Button>

			<ShareButton variant="outline" icon={<Share2 size={16} />}>
				Share
			</ShareButton>
		</ButtonsContainer>
	);
}
