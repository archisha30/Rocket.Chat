import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextInput, Icon, Avatar } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

interface Message {
	id: string;
	text: string;
	sender: 'bot' | 'user';
	timestamp: Date;
	options?: string[];
}

export const OnboardingChatBot: React.FC = () => {
	const { t } = useTranslation();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		// Initial greeting
		setTimeout(() => {
			addBotMessage(
				"👋 Hi there! I'm your Rocket.Chat assistant. I'm here to help you get started!",
				['Get Started', 'Skip Tour']
			);
		}, 500);
	}, []);

	const addBotMessage = (text: string, options?: string[]) => {
		setIsTyping(true);
		setTimeout(() => {
			const newMessage: Message = {
				id: Date.now().toString(),
				text,
				sender: 'bot',
				timestamp: new Date(),
				options,
			};
			setMessages((prev) => [...prev, newMessage]);
			setIsTyping(false);
		}, 800);
	};

	const addUserMessage = (text: string) => {
		const newMessage: Message = {
			id: Date.now().toString(),
			text,
			sender: 'user',
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const handleOptionClick = (option: string) => {
		addUserMessage(option);
		handleBotResponse(option);
	};

	const handleSendMessage = () => {
		if (inputValue.trim()) {
			addUserMessage(inputValue);
			handleBotResponse(inputValue);
			setInputValue('');
		}
	};

	const handleBotResponse = (userInput: string) => {
		const input = userInput.toLowerCase();

		// Conversation flow based on steps
		if (input.includes('get started') || input.includes('yes') || input.includes('sure')) {
			setCurrentStep(1);
			setTimeout(() => {
				addBotMessage(
					"Great! Let's start by setting up your profile. A complete profile helps your team recognize you. Would you like to:",
					['Upload Profile Photo', 'Update Personal Info', 'Skip for Now']
				);
			}, 1000);
		} else if (input.includes('upload profile photo') || input.includes('photo')) {
			setCurrentStep(2);
			setTimeout(() => {
				addBotMessage(
					"📸 Perfect! You can upload your profile photo from Account Settings → Profile. Next, let's explore channels!",
					['Show Me Channels', 'What are Channels?']
				);
			}, 1000);
		} else if (input.includes('update personal info') || input.includes('personal')) {
			setCurrentStep(2);
			setTimeout(() => {
				addBotMessage(
					"✏️ You can update your name, bio, and contact details in Account Settings. Now, let's talk about channels!",
					['Show Me Channels', 'What are Channels?']
				);
			}, 1000);
		} else if (input.includes('what are channels')) {
			setTimeout(() => {
				addBotMessage(
					"Channels are where conversations happen! Think of them as chat rooms for different topics. You can join public channels or create private ones.",
					['Join a Channel', 'Create My Own Channel']
				);
			}, 1000);
		} else if (input.includes('show me channels') || input.includes('join a channel')) {
			setCurrentStep(3);
			setTimeout(() => {
				addBotMessage(
					"🔍 Here are some popular channels you might like:\n\n• #general - Company-wide announcements\n• #random - Casual conversations\n• #help - Get support from the team\n\nWould you like to invite your team members?",
					['Yes, Invite Team', 'Maybe Later']
				);
			}, 1000);
		} else if (input.includes('create my own channel')) {
			setCurrentStep(3);
			setTimeout(() => {
				addBotMessage(
					"🎨 Great idea! You can create channels for projects, departments, or any topic. Click the '+' button in the sidebar to create one. Ready to invite your team?",
					['Yes, Invite Team', 'Maybe Later']
				);
			}, 1000);
		} else if (input.includes('yes, invite') || input.includes('invite team')) {
			setCurrentStep(4);
			setTimeout(() => {
				addBotMessage(
					"👥 Awesome! You can invite team members by:\n\n1. Email invitation\n2. Sharing your workspace link\n3. Generating invite codes\n\nShall we customize your notification settings?",
					['Customize Notifications', 'I\'m Good']
				);
			}, 1000);
		} else if (input.includes('customize notifications') || input.includes('notifications')) {
			setCurrentStep(5);
			setTimeout(() => {
				addBotMessage(
					"🔔 Smart choice! You can control:\n\n• Desktop notifications\n• Sound alerts\n• Email summaries\n• Mobile push notifications\n\nYou can adjust these in Preferences → Notifications.",
					['Got It!', 'Show Me More Features']
				);
			}, 1000);
		} else if (input.includes('got it') || input.includes('i\'m good') || input.includes('maybe later')) {
			setCurrentStep(6);
			setTimeout(() => {
				addBotMessage(
					"🎉 Excellent! You're all set! Here are some quick tips:\n\n• Use @ to mention teammates\n• Press Ctrl+K for quick search\n• Star important messages\n• Use threads to organize discussions\n\nNeed anything else?",
					['Start Chatting', 'Show Help Center', 'Restart Tour']
				);
			}, 1000);
		} else if (input.includes('skip')) {
			setTimeout(() => {
				addBotMessage(
					"No problem! You can always access this guide from the Help menu. Happy chatting! 🚀",
					['Start Chatting']
				);
			}, 1000);
		} else if (input.includes('help') || input.includes('?')) {
			setTimeout(() => {
				addBotMessage(
					"I'm here to help! You can ask me about:\n\n• Setting up your profile\n• Joining channels\n• Inviting team members\n• Notification settings\n• General features\n\nWhat would you like to know?",
					['Profile Setup', 'Channels', 'Notifications', 'Start Over']
				);
			}, 1000);
		} else if (input.includes('start over') || input.includes('restart')) {
			setCurrentStep(0);
			setMessages([]);
			setTimeout(() => {
				addBotMessage(
					"👋 Let's start fresh! I'm here to help you get started with Rocket.Chat.",
					['Get Started', 'Skip Tour']
				);
			}, 1000);
		} else {
			// Default response for unrecognized input
			setTimeout(() => {
				addBotMessage(
					"I'm not sure I understand. You can:\n\n• Click the suggested options below\n• Ask me about profiles, channels, or settings\n• Type 'help' for more options",
					['Get Started', 'Help', 'Skip Tour']
				);
			}, 1000);
		}
	};

	return (
		<Box display='flex' flexDirection='column' height='100%' style={{ backgroundColor: '#edf2f4' }}>
			{/* Chat Header */}
			<Box
				padding='x16'
				display='flex'
				alignItems='center'
				gap='x12'
				borderRadius='x4 x4 0 0'
				style={{ 
					backgroundColor: '#ef233c',
					background: 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)',
					boxShadow: '0 2px 8px rgba(239, 35, 60, 0.3)'
				}}
			>
				<Avatar size='x32' url='/images/logo/logo.svg' style={{ border: '2px solid white' }} />
				<Box>
					<Box fontWeight='bold' style={{ color: 'white', fontSize: '18px' }}>
						🤖 Rocket.Chat Assistant
					</Box>
					<Box fontSize='p2' style={{ color: '#edf2f4', opacity: 0.95 }}>
						● Online • Here to help
					</Box>
				</Box>
			</Box>

			{/* Messages Area */}
			<Box
				flexGrow={1}
				overflow='auto'
				padding='x16'
				display='flex'
				flexDirection='column'
				gap='x12'
				style={{ backgroundColor: '#edf2f4' }}
			>
				{messages.map((message) => (
					<Box
						key={message.id}
						display='flex'
						justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
					>
						<Box maxWidth='70%'>
							{message.sender === 'bot' && (
								<Box display='flex' alignItems='center' gap='x8' marginBlockEnd='x4'>
									<Avatar size='x24' url='/images/logo/logo.svg' />
									<Box fontSize='p2' style={{ color: '#2b2d42', fontWeight: '600' }}>
										Bot
									</Box>
								</Box>
							)}
							<Box
								padding='x12'
								borderRadius='x4'
								style={{
									backgroundColor: message.sender === 'user' ? '#ef233c' : 'white',
									color: message.sender === 'user' ? 'white' : '#2b2d42',
									whiteSpace: 'pre-line',
									boxShadow: message.sender === 'user' 
										? '0 2px 8px rgba(239, 35, 60, 0.3)' 
										: '0 2px 8px rgba(0, 0, 0, 0.1)',
									border: message.sender === 'bot' ? '1px solid #d8dbe0' : 'none'
								}}
							>
								{message.text}
							</Box>
							{message.options && (
								<Box display='flex' flexWrap='wrap' gap='x8' marginBlockStart='x8'>
									{message.options.map((option, index) => (
										<Button
											key={index}
											small
											onClick={() => handleOptionClick(option)}
											style={{
												backgroundColor: 'white',
												color: '#ef233c',
												border: '2px solid #ef233c',
												fontWeight: '600',
												transition: 'all 0.2s ease'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = '#ef233c';
												e.currentTarget.style.color = 'white';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'white';
												e.currentTarget.style.color = '#ef233c';
											}}
										>
											{option}
										</Button>
									))}
								</Box>
							)}
							<Box fontSize='p2' marginBlockStart='x4' style={{ color: '#8d99ae' }}>
								{message.timestamp.toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</Box>
						</Box>
					</Box>
				))}

				{isTyping && (
					<Box display='flex' alignItems='center' gap='x8'>
						<Avatar size='x24' url='/images/logo/logo.svg' />
						<Box
							padding='x12'
							borderRadius='x4'
							display='flex'
							gap='x4'
							style={{ 
								backgroundColor: 'white',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
							}}
						>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{ 
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite'
								}}
							/>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{ 
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite 0.2s'
								}}
							/>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{ 
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite 0.4s'
								}}
							/>
						</Box>
					</Box>
				)}

				<div ref={messagesEndRef} />
			</Box>

			{/* Input Area */}
			<Box
				padding='x16'
				display='flex'
				gap='x8'
				alignItems='center'
				borderRadius='0 0 x4 x4'
				style={{ 
					backgroundColor: 'white',
					borderTop: '2px solid #d8dbe0',
					boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
				}}
			>
				<TextInput
					placeholder='Type your message...'
					value={inputValue}
					onChange={(e) => setInputValue(e.currentTarget.value)}
					onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
					flexGrow={1}
					style={{
						border: '2px solid #d8dbe0',
						borderRadius: '8px',
						padding: '10px',
						fontSize: '14px'
					}}
				/>
				<Button 
					onClick={handleSendMessage} 
					disabled={!inputValue.trim()}
					style={{
						backgroundColor: '#ef233c',
						color: 'white',
						border: 'none',
						borderRadius: '8px',
						padding: '10px 16px',
						cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
						opacity: inputValue.trim() ? 1 : 0.5,
						transition: 'all 0.2s ease',
						boxShadow: inputValue.trim() ? '0 2px 8px rgba(239, 35, 60, 0.3)' : 'none'
					}}
					onMouseEnter={(e) => {
						if (inputValue.trim()) {
							e.currentTarget.style.backgroundColor = '#d90429';
							e.currentTarget.style.transform = 'scale(1.05)';
						}
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '#ef233c';
						e.currentTarget.style.transform = 'scale(1)';
					}}
				>
					<Icon name='send' size='x20' />
				</Button>
			</Box>

			<style>
				{`
					@keyframes pulse {
						0%, 100% { opacity: 0.4; transform: scale(1); }
						50% { opacity: 1; transform: scale(1.2); }
					}
				`}
			</style>
		</Box>
	);
};
