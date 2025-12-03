import { api } from '@rocket.chat/core-services';
import type { SlashCommandCallbackParams } from '@rocket.chat/core-typings';

import { slashCommands } from '../../utils/server/slashCommand';

/*
 * Onboarding is a named function that will trigger the onboarding chatbot
 * Usage: /onboarding
 */

slashCommands.add({
	command: 'onboarding',
	callback: async function Onboarding({ message, userId }: SlashCommandCallbackParams<'onboarding'>): Promise<void> {
		// Send an ephemeral message to the user with instructions
		void api.broadcast('notify.ephemeralMessage', userId, message.rid, {
			msg: `🤖 **Onboarding Assistant**

Welcome! I'm here to help you get started with Rocket.Chat.

To launch the interactive onboarding chatbot:
1. Click on your profile picture (top right)
2. Select "Preferences"
3. Or simply refresh your home page

You can also ask me questions here! Try:
• "How do I set up my profile?"
• "What are channels?"
• "How do I invite team members?"
• "Show me keyboard shortcuts"

Type \`/help\` for more commands!`,
		});

		// Optionally, you could trigger a client-side event to open the modal
		// This would require additional client-side code to listen for the event
		void api.broadcast('notify.userAction', userId, {
			action: 'openOnboardingModal',
			data: {},
		});
	},
	options: {
		description: 'Launch_the_onboarding_assistant',
		params: '',
	},
});
