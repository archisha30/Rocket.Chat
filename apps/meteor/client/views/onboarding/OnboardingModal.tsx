import React from 'react';
import { Modal, Box } from '@rocket.chat/fuselage';
import { OnboardingBot } from './OnboardingBot';

interface OnboardingModalProps {
	onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
	return (
		<Modal open>
			<Modal.Header>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			<Modal.Content>
				<Box height='600px'>
					<OnboardingBot />
				</Box>
			</Modal.Content>
		</Modal>
	);
};
