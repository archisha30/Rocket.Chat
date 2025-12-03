import React, { useState, useEffect } from 'react';
import { Box, Button, TextInput } from '@rocket.chat/fuselage';

interface UserProfile {
	name?: string;
	role?: string;
	experience?: string;
	teamSize?: string;
	interests?: string;
}

interface Question {
	text: string;
	type: 'input' | 'options';
	key: keyof UserProfile;
	options?: string[];
}

const questions: Question[] = [
	{
		text: '👋 Hi there! Welcome to Rocket.Chat!\n\nI\'m your personal onboarding assistant. Let\'s get you set up!\n\nFirst, what should I call you? 😊',
		type: 'input',
		key: 'name'
	},
	{
		text: 'Nice to meet you, {name}! 🤝\n\nWhat\'s your role?',
		type: 'options',
		key: 'role',
		options: [
			'👨‍💼 Team Leader',
			'👨‍💻 Developer',
			'🎨 Designer',
			'📊 Product Manager',
			'💼 Business/Sales',
			'🎓 Student'
		]
	},
	{
		text: 'Awesome! How experienced are you with team chat tools?',
		type: 'options',
		key: 'experience',
		options: [
			'🆕 Brand new to this',
			'📚 Used a few before',
			'⭐ Pretty experienced',
			'🚀 Expert level'
		]
	},
	{
		text: 'Got it! How big is your team?',
		type: 'options',
		key: 'teamSize',
		options: [
			'Just me',
			'2-10 people',
			'11-50 people',
			'50+ people'
		]
	},
	{
		text: 'What features are you most interested in?',
		type: 'options',
		key: 'interests',
		options: [
			'💬 Team Communication',
			'📹 Video Calls',
			'📁 File Sharing',
			'🤖 Automation & Bots',
			'🔒 Security & Privacy'
		]
	}
];

export const OnboardingChatbot: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
	const [messages, setMessages] = useState<Array<{ text: string; sender: 'bot' | 'user'; options?: string[] }>>([]);
	const [userProfile, setUserProfile] = useState<UserProfile>({});
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);

	useEffect(() => {
		setTimeout(() => askQuestion(0), 500);
	}, []);

	const askQuestion = (index: number) => {
		if (index >= questions.length) {
			showSummary();
			return;
		}

		const q = questions[index];
		let text = q.text;

		Object.keys(userProfile).forEach(key => {
			text = text.replace(`{${key}}`, userProfile[key as keyof UserProfile] || '');
		});

		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			setMessages(prev => [...prev, {
				text,
				sender: 'bot',
				options: q.type === 'options' ? q.options : undefined
			}]);
		}, 1000);
	};

	const handleOption = (answer: string) => {
		setMessages(prev => [...prev, { text: answer, sender: 'user' }]);
		
		const q = questions[currentQuestion];
		const newProfile = { ...userProfile, [q.key]: answer };
		setUserProfile(newProfile);

		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			
			let ack = 'Got it! ✅';
			if (q.key === 'name') {
				ack = `Great to meet you, ${answer}! 🤝`;
			}
			
			setMessages(prev => [...prev, { text: ack, sender: 'bot' }]);
			
			setTimeout(() => {
				setCurrentQuestion(currentQuestion + 1);
				askQuestion(currentQuestion + 1);
			}, 1000);
		}, 800);
	};

	const handleInputSubmit = () => {
		if (inputValue.trim()) {
			handleOption(inputValue.trim());
			setInputValue('');
		}
	};

	const showSummary = () => {
		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			setMessages(prev => [...prev, {
				text: `🎉 Perfect! I've got everything I need, ${userProfile.name}!`,
				sender: 'bot'
			}]);
			
			setTimeout(() => {
				onComplete(userProfile);
			}, 2000);
		}, 1000);
	};

	const currentQ = questions[currentQuestion];
	const showInput = currentQ && currentQ.type === 'input' && !isTyping;

	return (
		<Box
			display='flex'
			flexDirection='column'
			height='100vh'
			bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
			alignItems='center'
			justifyContent='center'
			padding='20px'
		>
			<Box
				maxWidth='600px'
				width='100%'
				bg='white'
				borderRadius='16px'
				boxShadow='0 20px 60px rgba(0, 0, 0, 0.3)'
				overflow='hidden'
				height='700px'
				display='flex'
				flexDirection='column'
			>
				<Box
					bg='linear-gradient(135deg, #ef233c 0%, #d90429 100%)'
					color='white'
					padding='20px'
					display='flex'
					alignItems='center'
					gap='15px'
				>
					<Box
						width='48px'
						height='48px'
						borderRadius='50%'
						bg='white'
						display='flex'
						alignItems='center'
						justifyContent='center'
						fontSize='28px'
					>
						🤖
					</Box>
					<Box>
						<Box fontWeight='bold' fontSize='18px'>Rocket.Chat Onboarding Bot</Box>
						<Box fontSize='13px' opacity={0.9}>● Online • Personalizing your experience</Box>
					</Box>
				</Box>

				<Box
					flex={1}
					overflowY='auto'
					padding='20px'
					bg='#f5f5f5'
				>
					{messages.map((msg, idx) => (
						<Box
							key={idx}
							display='flex'
							gap='10px'
							marginBottom='16px'
							justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
						>
							{msg.sender === 'bot' && (
								<Box
									width='32px'
									height='32px'
									borderRadius='50%'
									bg='#ef233c'
									color='white'
									display='flex'
									alignItems='center'
									justifyContent='center'
									fontSize='18px'
									flexShrink={0}
								>
									🤖
								</Box>
							)}
							<Box maxWidth='75%'>
								<Box
									padding='12px 16px'
									borderRadius='12px'
									bg={msg.sender === 'bot' ? 'white' : '#667eea'}
									color={msg.sender === 'bot' ? '#2b2d42' : 'white'}
									boxShadow={msg.sender === 'bot' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(102, 126, 234, 0.3)'}
									whiteSpace='pre-line'
								>
									{msg.text}
								</Box>
								{msg.options && (
									<Box display='flex' flexDirection='column' gap='8px' marginTop='12px'>
										{msg.options.map((option, optIdx) => (
											<Button
												key={optIdx}
												onClick={() => handleOption(option)}
												bg='white'
												color='#ef233c'
												border='2px solid #ef233c'
												padding='12px 16px'
												borderRadius='8px'
												fontWeight='600'
											>
												{option}
											</Button>
										))}
									</Box>
								)}
							</Box>
							{msg.sender === 'user' && (
								<Box
									width='32px'
									height='32px'
									borderRadius='50%'
									bg='#667eea'
									color='white'
									display='flex'
									alignItems='center'
									justifyContent='center'
									fontSize='18px'
									flexShrink={0}
								>
									👤
								</Box>
							)}
						</Box>
					))}
					{isTyping && (
						<Box display='flex' gap='10px' marginBottom='16px'>
							<Box
								width='32px'
								height='32px'
								borderRadius='50%'
								bg='#ef233c'
								color='white'
								display='flex'
								alignItems='center'
								justifyContent='center'
								fontSize='18px'
							>
								🤖
							</Box>
							<Box
								padding='12px 16px'
								borderRadius='12px'
								bg='white'
								boxShadow='0 2px 8px rgba(0, 0, 0, 0.1)'
							>
								<Box display='flex' gap='4px'>
									<Box width='8px' height='8px' borderRadius='50%' bg='#ef233c' />
									<Box width='8px' height='8px' borderRadius='50%' bg='#ef233c' />
									<Box width='8px' height='8px' borderRadius='50%' bg='#ef233c' />
								</Box>
							</Box>
						</Box>
					)}
				</Box>

				{showInput && (
					<Box padding='20px' bg='white' borderTop='1px solid #e0e0e0' display='flex' gap='10px'>
						<TextInput
							value={inputValue}
							onChange={(e) => setInputValue(e.currentTarget.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
							placeholder='Type your answer...'
							flexGrow={1}
						/>
						<Button onClick={handleInputSubmit} primary>
							Send
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
};
