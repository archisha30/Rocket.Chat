import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextInput, Icon } from '@rocket.chat/fuselage';
import { useEndpoint } from '@rocket.chat/ui-contexts';

interface Message {
	id: string;
	text: string;
	sender: 'bot' | 'user';
	timestamp: Date;
}

interface UserProfile {
	name?: string;
	role?: string;
	experience?: string;
	teamSize?: string;
	interests?: string;
}

export const MinimalistChatbot: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [onboardingComplete, setOnboardingComplete] = useState(false);
	const [userProfile, setUserProfile] = useState<UserProfile>({});
	const [currentStep, setCurrentStep] = useState(0);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatbotEndpoint = useEndpoint('POST', '/api/v1/chatbot.message');

	const onboardingSteps = [
		{
			question: "👋 Welcome to Rocket.Chat! I'm your AI assistant. What's your name?",
			key: 'name' as keyof UserProfile,
		},
		{
			question: "Nice to meet you, {name}! 🤝 What's your role?",
			key: 'role' as keyof UserProfile,
			suggestions: ['Team Leader', 'Developer', 'Designer', 'Product Manager', 'Other'],
		},
		{
			question: "Great! How experienced are you with team chat tools?",
			key: 'experience' as keyof UserProfile,
			suggestions: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
		},
	];

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		// Start onboarding
		setTimeout(() => {
			addBotMessage(onboardingSteps[0].question);
		}, 500);
	}, []);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const addBotMessage = (text: string) => {
		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			setMessages(prev => [
				...prev,
				{
					id: Date.now().toString(),
					text,
					sender: 'bot',
					timestamp: new Date(),
				},
			]);
		}, 800);
	};

	const addUserMessage = (text: string) => {
		setMessages(prev => [
			...prev,
			{
				id: Date.now().toString(),
				text,
				sender: 'user',
				timestamp: new Date(),
			},
		]);
	};

	const handleOnboardingResponse = (answer: string) => {
		const step = onboardingSteps[currentStep];
		const newProfile = { ...userProfile, [step.key]: answer };
		setUserProfile(newProfile);

		if (currentStep < onboardingSteps.length - 1) {
			const nextStep = onboardingSteps[currentStep + 1];
			let question = nextStep.question;
			Object.keys(newProfile).forEach(key => {
				question = question.replace(`{${key}}`, newProfile[key as keyof UserProfile] || '');
			});
			
			setTimeout(() => {
				addBotMessage(question);
			}, 1000);
			
			setCurrentStep(currentStep + 1);
		} else {
			setTimeout(() => {
				addBotMessage(`Perfect! You're all set, ${newProfile.name}! 🎉\n\nI'm here to help with anything you need. Just ask me about channels, messages, video calls, or anything else!`);
				setOnboardingComplete(true);
			}, 1000);
		}
	};

	const handleAIResponse = async (userMessage: string) => {
		try {
			const response = await chatbotEndpoint({ message: userMessage });
			if (response.success && response.response) {
				addBotMessage(response.response);
			}
		} catch (error) {
			addBotMessage("I'm having trouble connecting right now. Please try again!");
		}
	};

	const handleSend = () => {
		if (!inputValue.trim()) return;

		const message = inputValue.trim();
		addUserMessage(message);
		setInputValue('');

		if (!onboardingComplete) {
			handleOnboardingResponse(message);
		} else {
			handleAIResponse(message);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		addUserMessage(suggestion);
		handleOnboardingResponse(suggestion);
	};

	const currentSuggestions = !onboardingComplete && currentStep < onboardingSteps.length 
		? onboardingSteps[currentStep].suggestions 
		: undefined;

	return (
		<Box
			display='flex'
			flexDirection='column'
			height='100vh'
			width='100vw'
			bg='#f8f9fa'
		>
			{/* Header */}
			<Box
				bg='white'
				borderBlockEndWidth='1px'
				borderBlockEndColor='neutral-200'
				padding='16px 24px'
				display='flex'
				alignItems='center'
				justifyContent='space-between'
				boxShadow='0 1px 2px rgba(0,0,0,0.05)'
			>
				<Box display='flex' alignItems='center' gap='12px'>
					<Box
						width='40px'
						height='40px'
						borderRadius='50%'
						bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
						display='flex'
						alignItems='center'
						justifyContent='center'
						fontSize='20px'
					>
						🤖
					</Box>
					<Box>
						<Box fontWeight='600' fontSize='16px' color='#1f2937'>
							Rocket.Chat Assistant
						</Box>
						<Box fontSize='12px' color='#6b7280' display='flex' alignItems='center' gap='4px'>
							<Box width='6px' height='6px' borderRadius='50%' bg='#10b981' />
							Online
						</Box>
					</Box>
				</Box>
				<Button
					small
					onClick={() => onComplete(userProfile)}
					ghost
				>
					Skip
				</Button>
			</Box>

			{/* Messages */}
			<Box
				flex={1}
				overflowY='auto'
				padding='24px'
				display='flex'
				flexDirection='column'
				gap='16px'
			>
				{messages.map((msg) => (
					<Box
						key={msg.id}
						display='flex'
						justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
						animation='fadeIn 0.3s ease'
					>
						<Box
							maxWidth='70%'
							padding='12px 16px'
							borderRadius='12px'
							bg={msg.sender === 'user' ? '#667eea' : 'white'}
							color={msg.sender === 'user' ? 'white' : '#1f2937'}
							boxShadow={msg.sender === 'user' ? '0 2px 8px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'}
							whiteSpace='pre-line'
							lineHeight='1.5'
						>
							{msg.text}
						</Box>
					</Box>
				))}

				{isTyping && (
					<Box display='flex' justifyContent='flex-start'>
						<Box
							padding='12px 16px'
							borderRadius='12px'
							bg='white'
							boxShadow='0 2px 8px rgba(0, 0, 0, 0.05)'
						>
							<Box display='flex' gap='4px' alignItems='center'>
								<Box width='8px' height='8px' borderRadius='50%' bg='#667eea' animation='bounce 1.4s infinite' />
								<Box width='8px' height='8px' borderRadius='50%' bg='#667eea' animation='bounce 1.4s infinite 0.2s' />
								<Box width='8px' height='8px' borderRadius='50%' bg='#667eea' animation='bounce 1.4s infinite 0.4s' />
							</Box>
						</Box>
					</Box>
				)}

				{currentSuggestions && !isTyping && (
					<Box display='flex' flexWrap='wrap' gap='8px' justifyContent='flex-start'>
						{currentSuggestions.map((suggestion, idx) => (
							<Button
								key={idx}
								small
								onClick={() => handleSuggestionClick(suggestion)}
								secondary
							>
								{suggestion}
							</Button>
						))}
					</Box>
				)}

				<div ref={messagesEndRef} />
			</Box>

			{/* Input */}
			<Box
				bg='white'
				borderBlockStartWidth='1px'
				borderBlockStartColor='neutral-200'
				padding='16px 24px'
				boxShadow='0 -1px 2px rgba(0,0,0,0.05)'
			>
				<Box display='flex' gap='12px' alignItems='center'>
					<TextInput
						value={inputValue}
						onChange={(e) => setInputValue(e.currentTarget.value)}
						onKeyPress={(e) => e.key === 'Enter' && handleSend()}
						placeholder='Type your message...'
						flexGrow={1}
					/>
					<Button
						primary
						onClick={handleSend}
						disabled={!inputValue.trim()}
					>
						<Icon name='send' size='x20' />
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
