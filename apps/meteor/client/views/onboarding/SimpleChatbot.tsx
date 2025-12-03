import React, { useState, useEffect, useRef } from 'react';

interface Message {
	id: string;
	text: string;
	sender: 'bot' | 'user';
}

async function getResponseFromBackend(message: string): Promise<string> {
	try {
		const response = await fetch('/api/v1/chatbot.message', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ message }),
		});

		const data = await response.json();
		if (data.success && data.response) {
			return data.response;
		}
		return "I'm having trouble connecting right now. Please try again!";
	} catch (error) {
		console.error('Chatbot API error:', error);
		return "I'm having trouble connecting right now. Please try again!";
	}
}

interface OnboardingStep {
	question: string;
	options: string[];
	key: string;
}

const onboardingFlow: OnboardingStep[] = [
	{
		question: "Let's get you set up! Which organization do you belong to?",
		options: ['Tech Company', 'Startup', 'Enterprise', 'Educational Institution', 'Non-Profit', 'Other'],
		key: 'organization',
	},
	{
		question: "Great! What's your primary role?",
		options: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'Debugger/QA', 'Designer', 'Product Manager', 'Other'],
		key: 'role',
	},
	{
		question: "Perfect! What type of channels would you like to join?",
		options: ['Team Collaboration', 'Video Chats', 'Discussion Forums', 'Project Updates', 'Social/Casual', 'All of the above'],
		key: 'channels',
	},
];

export const SimpleChatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [currentStep, setCurrentStep] = useState(-1); // -1 = initial, 0+ = onboarding steps
	const [userProfile, setUserProfile] = useState<Record<string, string>>({});
	const [showOptions, setShowOptions] = useState(false);
	const [redirecting, setRedirecting] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setTimeout(() => {
			addBotMessage('👋 Welcome to Rocket.Chat! I\'m here to help you get started.');
			setTimeout(() => {
				setShowOptions(true);
			}, 1000);
		}, 500);
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const addBotMessage = (text: string) => {
		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					text,
					sender: 'bot',
				},
			]);
		}, 800);
	};

	const startOnboarding = () => {
		setShowOptions(false);
		setCurrentStep(0);
		setTimeout(() => {
			addBotMessage(onboardingFlow[0].question);
		}, 500);
	};

	const handleOptionSelect = (option: string) => {
		// Add user's selection
		setMessages((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				text: option,
				sender: 'user',
			},
		]);

		// Save to profile
		const step = onboardingFlow[currentStep];
		setUserProfile((prev) => ({ ...prev, [step.key]: option }));

		// Move to next step or finish
		if (currentStep < onboardingFlow.length - 1) {
			setTimeout(() => {
				addBotMessage(onboardingFlow[currentStep + 1].question);
				setCurrentStep(currentStep + 1);
			}, 1000);
		} else {
			// Onboarding complete
			setTimeout(() => {
				finishOnboarding();
			}, 1000);
		}
	};

	const finishOnboarding = async () => {
		setIsTyping(true);
		
		// Call onboarding API to set up channels
		try {
			await fetch('/api/v1/onboarding.complete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userProfile),
			});
		} catch (error) {
			console.error('Error completing onboarding:', error);
		}
		
		setTimeout(() => {
			setIsTyping(false);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					text: `🎉 Thank you for completing the setup! Based on your preferences, we've personalized your experience.\n\nWe've created channels and teams for you:\n\n📢 Channels: teams, discussion, schedules\n💬 Groups: tech-talk, product-ideas, random\n👥 Teams: project-alpha, debugging-squad\n\nYou're all set to explore your workspace. We hope you enjoy using Rocket.Chat!\n\nHappy collaborating! 🚀`,
					sender: 'bot',
				},
			]);
			setCurrentStep(-2); // Mark as complete
			setRedirecting(true);
			
			// Auto-redirect after 4 seconds (give time to read)
			setTimeout(() => {
				onClose();
			}, 4000);
		}, 1500);
	};

	const handleSend = async (messageText?: string) => {
		const message = messageText || inputValue.trim();
		if (!message) return;

		setMessages((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				text: message,
				sender: 'user',
			},
		]);
		setInputValue('');

		// Get response from backend API
		setIsTyping(true);
		const response = await getResponseFromBackend(message);
		setIsTyping(false);
		
		setMessages((prev) => [
			...prev,
			{
				id: Date.now().toString(),
				text: response,
				sender: 'bot',
			},
		]);
	};

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'linear-gradient(135deg, #F5D3C4 0%, #F2AEBB 100%)',
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{/* Header */}
			<div
				style={{
					background: 'linear-gradient(135deg, #696FC7 0%, #A7AAE1 100%)',
					color: 'white',
					padding: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					boxShadow: '0 4px 12px rgba(105, 111, 199, 0.3)',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
					<div
						style={{
							width: '48px',
							height: '48px',
							borderRadius: '50%',
							background: 'white',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '24px',
						}}
					>
						🤖
					</div>
					<div>
						<div style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>Rocket.Chat AI Assistant</div>
						<div style={{ fontSize: '13px', opacity: 0.95, color: 'white' }}>● Online • Ready to help</div>
					</div>
				</div>
				<button
					onClick={onClose}
					style={{
						background: 'rgba(255,255,255,0.25)',
						border: '2px solid white',
						color: 'white',
						padding: '8px 16px',
						borderRadius: '8px',
						cursor: 'pointer',
						fontWeight: 600,
						transition: 'all 0.2s',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = 'white';
						e.currentTarget.style.color = '#696FC7';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
						e.currentTarget.style.color = 'white';
					}}
				>
					Skip
				</button>
			</div>

			{/* Messages */}
			<div
				style={{
					flex: 1,
					overflowY: 'auto',
					padding: '20px',
					maxWidth: '800px',
					width: '100%',
					margin: '0 auto',
				}}
			>
				{messages.map((msg) => (
					<div
						key={msg.id}
						style={{
							marginBottom: '16px',
							display: 'flex',
							justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
						}}
					>
						<div
							style={{
								maxWidth: '70%',
								padding: '12px 16px',
								borderRadius: '12px',
								background: msg.sender === 'user' ? '#696FC7' : 'white',
								color: msg.sender === 'user' ? 'white' : '#2d3748',
								boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(105, 111, 199, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
								whiteSpace: 'pre-line',
								lineHeight: '1.5',
								fontWeight: 500,
							}}
						>
							{msg.text}
						</div>
					</div>
				))}

				{isTyping && (
					<div style={{ display: 'flex', justifyContent: 'flex-start' }}>
						<div
							style={{
								padding: '12px 16px',
								borderRadius: '12px',
								background: 'white',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
								display: 'flex',
								gap: '4px',
							}}
						>
							<span
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									background: '#696FC7',
									animation: 'bounce 1.4s infinite',
								}}
							/>
							<span
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									background: '#A7AAE1',
									animation: 'bounce 1.4s infinite 0.2s',
								}}
							/>
							<span
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									background: '#F2AEBB',
									animation: 'bounce 1.4s infinite 0.4s',
								}}
							/>
						</div>
					</div>
				)}

				{/* Redirecting Indicator */}
				{redirecting && (
					<div
						style={{
							marginTop: '20px',
							padding: '16px 20px',
							borderRadius: '12px',
							background: 'linear-gradient(135deg, #696FC7 0%, #A7AAE1 100%)',
							color: 'white',
							textAlign: 'center',
							boxShadow: '0 4px 12px rgba(105, 111, 199, 0.4)',
							animation: 'fadeIn 0.5s ease',
						}}
					>
						<div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'white' }}>
							🚀 Redirecting to your workspace...
						</div>
						<div style={{ fontSize: '13px', opacity: 0.95, color: 'white' }}>
							Setting up your personalized channels and teams
						</div>
					</div>
				)}

				{/* Initial Options */}
				{showOptions && currentStep === -1 && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
						<div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
							What would you like to do?
						</div>
						<button
							onClick={startOnboarding}
							style={{
								padding: '16px 20px',
								border: '2px solid #696FC7',
								borderRadius: '12px',
								background: 'linear-gradient(135deg, #696FC7 0%, #A7AAE1 100%)',
								color: 'white',
								fontSize: '15px',
								fontWeight: 600,
								cursor: 'pointer',
								textAlign: 'center',
								transition: 'all 0.2s',
								boxShadow: '0 4px 12px rgba(105, 111, 199, 0.3)',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 6px 16px rgba(105, 111, 199, 0.4)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 4px 12px rgba(105, 111, 199, 0.3)';
							}}
						>
							🚀 Start Interactive Setup
						</button>
						<button
							onClick={() => handleSend('I need help')}
							style={{
								padding: '12px 16px',
								border: '2px solid #F2AEBB',
								borderRadius: '8px',
								background: 'white',
								color: '#696FC7',
								fontSize: '14px',
								fontWeight: 500,
								cursor: 'pointer',
								textAlign: 'center',
								transition: 'all 0.2s',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = '#696FC7';
								e.currentTarget.style.background = '#F5D3C4';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = '#F2AEBB';
								e.currentTarget.style.background = 'white';
							}}
						>
							💬 Ask a Question
						</button>
					</div>
				)}

				{/* Onboarding Options */}
				{currentStep >= 0 && currentStep < onboardingFlow.length && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
						<div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
							Select one:
						</div>
						{onboardingFlow[currentStep].options.map((option, idx) => (
							<button
								key={idx}
								onClick={() => handleOptionSelect(option)}
								style={{
									padding: '12px 16px',
									border: '2px solid #696FC7',
									borderRadius: '8px',
									background: 'white',
									color: '#696FC7',
									fontSize: '14px',
									fontWeight: 500,
									cursor: 'pointer',
									textAlign: 'left',
									transition: 'all 0.2s',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'linear-gradient(135deg, #696FC7 0%, #A7AAE1 100%)';
									e.currentTarget.style.color = 'white';
									e.currentTarget.style.transform = 'translateX(4px)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'white';
									e.currentTarget.style.color = '#696FC7';
									e.currentTarget.style.transform = 'translateX(0)';
								}}
							>
								{option}
							</button>
						))}
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div
				style={{
					background: 'white',
					borderTop: '2px solid #F5D3C4',
					padding: '16px 20px',
					maxWidth: '800px',
					width: '100%',
					margin: '0 auto',
				}}
			>
				<div style={{ display: 'flex', gap: '12px' }}>
					<input
						type='text'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && handleSend()}
						placeholder='Type your message...'
						style={{
							flex: 1,
							padding: '12px 16px',
							border: '2px solid #F5D3C4',
							borderRadius: '8px',
							fontSize: '14px',
							color: '#2d3748',
						}}
						onFocus={(e) => {
							e.currentTarget.style.borderColor = '#696FC7';
						}}
						onBlur={(e) => {
							e.currentTarget.style.borderColor = '#F5D3C4';
						}}
					/>
					<button
						onClick={handleSend}
						disabled={!inputValue.trim()}
						style={{
							padding: '12px 24px',
							border: 'none',
							borderRadius: '8px',
							background: 'linear-gradient(135deg, #696FC7 0%, #A7AAE1 100%)',
							color: 'white',
							fontSize: '14px',
							fontWeight: 600,
							cursor: 'pointer',
							opacity: inputValue.trim() ? 1 : 0.5,
							transition: 'all 0.2s',
						}}
						onMouseEnter={(e) => {
							if (inputValue.trim()) {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow = '0 4px 12px rgba(105, 111, 199, 0.3)';
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'translateY(0)';
							e.currentTarget.style.boxShadow = 'none';
						}}
					>
						Send
					</button>
				</div>
			</div>

			<style>
				{`
					@keyframes bounce {
						0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
						30% { transform: translateY(-10px); opacity: 1; }
					}
				`}
			</style>
		</div>
	);
};
