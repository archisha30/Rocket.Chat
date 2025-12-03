import type { Card } from '@rocket.chat/fuselage';
import { Box, Button } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import { useState } from 'react';

import { GenericCard } from '../../../components/GenericCard';

const AIChatbotCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const [showChatbot, setShowChatbot] = useState(false);

	const openChatbot = () => {
		setShowChatbot(true);
		// Open chatbot in a modal or new window
		window.open('/chatbot', 'chatbot', 'width=800,height=600');
	};

	return (
		<GenericCard
			title='🤖 AI Assistant'
			body={
				<Box>
					<Box mb={12}>Get instant help with onboarding, channel creation, and workspace setup from your AI assistant.</Box>
					<Button primary onClick={openChatbot}>
						Launch AI Assistant
					</Button>
				</Box>
			}
			data-qa-id='homepage-ai-chatbot-card'
			width='x340'
			{...props}
		/>
	);
};

export default AIChatbotCard;
