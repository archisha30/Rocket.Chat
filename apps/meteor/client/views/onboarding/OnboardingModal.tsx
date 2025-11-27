import React from 'react';
import { Box } from '@rocket.chat/fuselage';
import { GenericModal } from '@rocket.chat/ui-client';
import { OnboardingBot } from './OnboardingBot';

interface OnboardingModalProps {
	onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
	return (
		<GenericModal
			title="Welcome to Rocket.Chat"
			onClose={onClose}
			variant="warning"
			wrapperFunction={(props) => <Box {...props} width='100%' maxWidth='900px' />}
		>
			<Box height='600px' overflow='auto'>
				<OnboardingBot />
			</Box>
		</GenericModal>
	);
};
