import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/Button";
import { AppTheme } from "../../../../themes/themeTypes";
import { MessageCircle, Send, User } from "lucide-react";

interface NotesProps {
	notes: string;
	theme: AppTheme;
	onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onSave: () => void;
}

const NotesSection = styled(motion.div)`
	margin-top: 24px;
`;

const NotesHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
`;

const SectionTitle = styled(motion.h3)`
	margin: 0 0 12px 0;
	font-size: 20px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 8px;

	&::after {
		content: "";
		height: 2px;
		flex: 1;
		background: linear-gradient(
			90deg,
			${(props: { theme: AppTheme }) => props.theme.colors.primary}50 0%,
			transparent 100%
		);
	}
`;

const CommentsList = styled(motion.div)`
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const CommentCard = styled(motion.div)`
	padding: 16px;
	border-radius: 8px;
	background-color: ${(props: { theme: AppTheme }) =>
		props.theme.colors.surface};
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	border-left: 3px solid
		${(props: { theme: AppTheme }) => props.theme.colors.primary};
`;

const CommentHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
`;

const CommentAvatar = styled.div`
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: ${(props: { theme: AppTheme }) => `linear-gradient(135deg, 
    ${props.theme.colors.primary}, 
    ${props.theme.colors.accent})`};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${(props: { theme: AppTheme }) =>
		props.theme.name === "sakura" ? "#3D2E39" : "#FFFFFF"};
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const CommentUser = styled.div`
	font-weight: 500;
`;

const CommentDate = styled.div`
	font-size: 12px;
	color: ${(props: { theme: AppTheme }) => props.theme.colors.textSecondary};
	margin-left: auto;
`;

const CommentText = styled.p`
	margin: 0;
	line-height: 1.5;
`;

const CommentInput = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;
`;

const NotesTextarea = styled.textarea<{ theme: AppTheme }>`
	width: 100%;
	padding: 12px 16px;
	border: 1px solid ${(props) => props.theme.colors.textSecondary}30;
	border-radius: 8px;
	font-size: 15px;
	min-height: 100px;
	background-color: ${(props) => props.theme.colors.surface};
	color: ${(props) => props.theme.colors.text};
	resize: vertical;
	font-family: inherit;
	transition: all 0.2s ease;

	&:focus {
		border-color: ${(props) => props.theme.colors.primary};
		outline: none;
		box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}30;
	}
`;

export function Notes({ notes, theme, onNotesChange, onSave }: NotesProps) {
	return (
		<NotesSection
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.8 }}
		>
			<NotesHeader>
				<SectionTitle theme={theme}>
					<MessageCircle size={20} />
					Notes & Comments
				</SectionTitle>
			</NotesHeader>

			<NotesTextarea
				value={notes}
				onChange={onNotesChange}
				placeholder="Add personal notes or comments about this anime..."
				theme={theme}
			/>

			<CommentInput>
				<CommentAvatar theme={theme}>
					<User size={18} />
				</CommentAvatar>
				<Button variant="primary" icon={<Send size={16} />} onClick={onSave}>
					Save
				</Button>
			</CommentInput>

			{notes && (
				<CommentsList
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<CommentCard
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						theme={theme}
					>
						<CommentHeader>
							<CommentAvatar theme={theme}>
								<User size={18} />
							</CommentAvatar>
							<CommentUser>You</CommentUser>
							<CommentDate theme={theme}>
								{new Date().toLocaleDateString()}
							</CommentDate>
						</CommentHeader>
						<CommentText>{notes}</CommentText>
					</CommentCard>
				</CommentsList>
			)}
		</NotesSection>
	);
}
