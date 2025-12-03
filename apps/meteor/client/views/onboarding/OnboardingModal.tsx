import React from 'react';
import { Box } from '@rocket.chat/fuselage';
import { GenericModal } from '@rocket.chat/ui-client';
import { InteractiveChatBot } from './InteractiveChatBot';

interface OnboardingModalProps {
	onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
	return (
		<GenericModal
			title=""
			onClose={onClose}
			variant="info"
			wrapperFunction={(props) => <Box {...props} width='100%' maxWidth='700px' />}
		>
			<Box height='650px'>
				<InteractiveChatBot />
			</Box>
		</GenericModal>
	);
};
