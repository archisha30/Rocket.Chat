import { check } from 'meteor/check';

import { API } from '../api';

// Simple AI-like response system
const responses: Record<string, string[]> = {
	greeting: [
		"Hello! 👋 How can I help you today?",
		"Hi there! Welcome to Rocket.Chat! What can I do for you?",
		"Hey! Great to see you! How may I assist you?",
	],
	help: [
		"I can help you with:\n• Getting started with Rocket.Chat\n• Creating channels and teams\n• Sending messages\n• Video calls\n• File sharing\n• And much more!",
		"Need assistance? I'm here to help with setup, features, and any questions you have!",
	],
	channels: [
		"To create a channel, click the '+' button in the sidebar and select 'Create Channel'. You can make it public or private!",
		"Channels are great for team communication! You can create public channels for open discussions or private ones for specific teams.",
	],
	messages: [
		"Sending messages is easy! Just type in the message box at the bottom and press Enter. You can also format text, add emojis, and attach files!",
		"You can edit messages by hovering over them and clicking the edit icon. You can also delete, quote, or react to messages!",
	],
	video: [
		"Start a video call by clicking the camera icon in any channel or direct message. It's that simple!",
		"Video calls support screen sharing, recording, and multiple participants. Perfect for remote teams!",
	],
	files: [
		"Share files by clicking the attachment icon or simply drag and drop files into the chat!",
		"You can share documents, images, videos, and more. Files are stored securely and can be previewed inline.",
	],
	security: [
		"Rocket.Chat takes security seriously! We offer end-to-end encryption, two-factor authentication, and compliance with major security standards.",
		"Your data is encrypted and secure. You can also enable additional security features in Settings > Security.",
	],
	pricing: [
		"Rocket.Chat offers a free Community edition and paid plans for advanced features. Check out rocket.chat/pricing for details!",
		"We have flexible pricing for teams of all sizes, from startups to enterprises.",
	],
	integrations: [
		"Rocket.Chat integrates with hundreds of tools including Jira, GitHub, GitLab, Trello, and more!",
		"You can add integrations from the Administration > Integrations menu. We support webhooks, bots, and custom apps!",
	],
	mobile: [
		"Yes! Rocket.Chat has mobile apps for iOS and Android. Download them from the App Store or Google Play!",
		"Stay connected on the go with our mobile apps. They support all features including push notifications!",
	],
	default: [
		"I'm not sure I understand. Could you rephrase that? Or type 'help' to see what I can assist with!",
		"Hmm, I didn't quite get that. Try asking about channels, messages, video calls, or type 'help' for more options!",
	],
};

const keywords: Record<string, string> = {
	'hello': 'greeting',
	'hi': 'greeting',
	'hey': 'greeting',
	'greetings': 'greeting',
	'help': 'help',
	'assist': 'help',
	'support': 'help',
	'channel': 'channels',
	'room': 'channels',
	'create': 'channels',
	'message': 'messages',
	'chat': 'messages',
	'send': 'messages',
	'video': 'video',
	'call': 'video',
	'meeting': 'video',
	'file': 'files',
	'upload': 'files',
	'attach': 'files',
	'share': 'files',
	'security': 'security',
	'secure': 'security',
	'encryption': 'security',
	'privacy': 'security',
	'price': 'pricing',
	'cost': 'pricing',
	'plan': 'pricing',
	'payment': 'pricing',
	'integration': 'integrations',
	'integrate': 'integrations',
	'connect': 'integrations',
	'plugin': 'integrations',
	'mobile': 'mobile',
	'app': 'mobile',
	'ios': 'mobile',
	'android': 'mobile',
};

function getResponse(message: string): string {
	const lowerMessage = message.toLowerCase();
	
	// Check for keywords
	for (const [keyword, category] of Object.entries(keywords)) {
		if (lowerMessage.includes(keyword)) {
			const categoryResponses = responses[category];
			return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
		}
	}
	
	// Default response
	const defaultResponses = responses.default;
	return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Register API endpoint
API.v1.addRoute(
	'chatbot.message',
	{ authRequired: false },
	{
		async post() {
			check(this.bodyParams, {
				message: String,
			});

			const { message } = this.bodyParams;
			const response = getResponse(message);

			return API.v1.success({
				response,
				timestamp: new Date(),
			});
		},
	},
);
