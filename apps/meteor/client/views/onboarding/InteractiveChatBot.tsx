import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextInput, Icon, Avatar, CheckBox, RadioButton } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';
import { useRocketChatActions } from './hooks/useRocketChatActions';

interface Message {
	id: string;
	text: string;
	sender: 'bot' | 'user';
	timestamp: Date;
	type?: 'text' | 'options' | 'input' | 'multiselect' | 'radio';
	options?: string[];
	inputPlaceholder?: string;
	multiOptions?: Array<{ id: string; label: string; checked?: boolean }>;
}

interface UserProfile {
	name?: string;
	role?: string;
	interests?: string[];
	teamSize?: string;
	goals?: string[];
	experience?: string;
	preferredChannels?: string[];
	workStyle?: string;
}

interface ChannelInfo {
	_id: string;
	name: string;
	msgs: number;
	usersCount: number;
}

export const InteractiveChatBot: React.FC = () => {
	const { t } = useTranslation();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [userProfile, setUserProfile] = useState<UserProfile>({});
	const [waitingForInput, setWaitingForInput] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [availableChannels, setAvailableChannels] = useState<ChannelInfo[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { getCurrentUser, getJoinedChannels, sendMessage, isAuthenticated } = useRocketChatActions();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		startConversation();
	}, []);

	const startConversation = async () => {
		setTimeout(async () => {
			// Fetch real user data and channels
			const [userInfo, channelsData] = await Promise.all([
				getCurrentUser(),
				getJoinedChannels()
			]);
			
			const userName = userInfo?.user?.name || 'there';
			
			// Store available channels for later use
			if (channelsData?.success && channelsData.channels) {
				setAvailableChannels(channelsData.channels);
			}
			
			// Dynamic greeting based on time of day
			const hour = new Date().getHours();
			let greeting = '👋 Hi';
			if (hour < 12) greeting = '🌅 Good morning';
			else if (hour < 18) greeting = '☀️ Good afternoon';
			else greeting = '🌙 Good evening';
			
			addBotMessage(`${greeting}, ${userName}! Welcome to Rocket.Chat!`);
			
			setTimeout(() => {
				// Check if user has channels already
				const channelCount = channelsData?.channels?.length || 0;
				if (channelCount > 1) {
					addBotMessage(
						`I see you're already in ${channelCount} channels! Let me help you get the most out of Rocket.Chat. 🚀`
					);
				} else {
					addBotMessage(
						"I'm your personal onboarding assistant. Let's get you set up with a personalized experience! 🎯"
					);
				}
				
				setTimeout(() => {
					askQuestion(0);
				}, 1500);
			}, 1500);
		}, 500);
	};

	// Dynamic question generator based on context and user responses
	const getNextQuestion = (questionIndex: number) => {
		const baseQuestions = [
			{
				question: "First, what should I call you? 😊",
				type: 'input' as const,
				placeholder: 'Enter your preferred name...',
				key: 'name',
			},
			{
				question: "Nice to meet you, {name}! What's your role?",
				type: 'radio' as const,
				options: [
					'👨‍💼 Team Leader',
					'👨‍💻 Developer',
					'🎨 Designer',
					'📊 Product Manager',
					'💼 Business/Sales',
					'🎓 Student',
					'👤 Other',
				],
				key: 'role',
			},
			{
				question: "Awesome! How experienced are you with team chat tools?",
				type: 'options' as const,
				options: [
					'🆕 Brand new to this',
					'📚 Used a few before',
					'⭐ Pretty experienced',
					'🚀 Expert level',
				],
				key: 'experience',
			},
			{
				question: "Got it! How big is your team?",
				type: 'options' as const,
				options: ['Just me', '2-10 people', '11-50 people', '50+ people'],
				key: 'teamSize',
			},
		];

		// Dynamic question based on role - personalized for each role type
		if (questionIndex === 4) {
			if (userProfile.role?.includes('Developer')) {
				return {
					question: "As a developer, what interests you most? (Select all that apply)",
					type: 'multiselect' as const,
					options: [
						'💻 API & Integrations',
						'🤖 Bot Development',
						'📁 File Sharing',
						'🔒 Security Features',
						'📱 Mobile Development',
						'🔧 Custom Plugins',
					],
					key: 'interests',
				};
			} else if (userProfile.role?.includes('Team Leader') || userProfile.role?.includes('Manager')) {
				return {
					question: "As a leader, what's most important to you? (Select all that apply)",
					type: 'multiselect' as const,
					options: [
						'👥 Team Collaboration',
						'📊 Analytics & Reports',
						'🔒 Security & Compliance',
						'📹 Video Conferencing',
						'🎯 Project Management',
						'💼 Client Communication',
					],
					key: 'interests',
				};
			} else if (userProfile.role?.includes('Designer')) {
				return {
					question: "As a designer, what features matter to you? (Select all that apply)",
					type: 'multiselect' as const,
					options: [
						'🎨 File Sharing & Preview',
						'💬 Quick Feedback',
						'📱 Mobile Access',
						'🖼️ Media Management',
						'👥 Creative Collaboration',
						'🔗 Tool Integrations',
					],
					key: 'interests',
				};
			} else {
				return {
					question: "What features are you most interested in? (Select all that apply)",
					type: 'multiselect' as const,
					options: [
						'💬 Team Communication',
						'📹 Video Calls',
						'📁 File Sharing',
						'🤖 Automation & Bots',
						'🔒 Security & Privacy',
						'📱 Mobile Access',
					],
					key: 'interests',
				};
			}
		}

		// Dynamic question based on team size - different goals for different team sizes
		if (questionIndex === 5) {
			if (userProfile.teamSize === 'Just me') {
				return {
					question: "Since you're solo, what's your main goal?",
					type: 'options' as const,
					options: [
						'🔍 Exploring for future team',
						'💼 Personal project management',
						'🎓 Learning & experimenting',
						'🤝 Connecting with communities',
					],
					key: 'goals',
				};
			} else if (userProfile.teamSize === '50+ people') {
				return {
					question: "For a large team, what's your priority?",
					type: 'options' as const,
					options: [
						'🚀 Migrating from another tool',
						'📊 Scaling communication',
						'🔒 Enterprise security',
						'🔧 Custom integrations',
					],
					key: 'goals',
				};
			} else {
				return {
					question: "What's your main goal with Rocket.Chat?",
					type: 'options' as const,
					options: [
						'🚀 Replace existing chat tool',
						'🆕 Start team communication',
						'🔧 Integrate with our tools',
						'📚 Just exploring',
					],
					key: 'goals',
				};
			}
		}

		// Dynamic channel selection based on available channels from API
		if (questionIndex === 6 && availableChannels.length > 0) {
			const channelOptions = availableChannels
				.slice(0, 6)
				.map(ch => `#${ch.name} (${ch.usersCount} members)`);
			
			return {
				question: "I see you have access to these channels. Which ones interest you? (Select all)",
				type: 'multiselect' as const,
				options: channelOptions,
				key: 'preferredChannels',
			};
		}

		// Work style question
		if (questionIndex === 7 || (questionIndex === 6 && availableChannels.length === 0)) {
			return {
				question: "Last one! How do you prefer to work?",
				type: 'radio' as const,
				options: [
					'⚡ Quick messages, fast responses',
					'📝 Detailed discussions, thoughtful replies',
					'📹 Video calls over text',
					'🔕 Async communication, check when I can',
				],
				key: 'workStyle',
			};
		}

		return baseQuestions[questionIndex];
	};

	const askQuestion = (index: number) => {
		// Determine when to end based on dynamic flow
		const maxQuestions = availableChannels.length > 0 ? 8 : 7;
		
		if (index >= maxQuestions) {
			showSummaryAndRecommendations();
			return;
		}

		const q = getNextQuestion(index);
		if (!q) {
			showSummaryAndRecommendations();
			return;
		}

		let questionText = q.question;

		// Replace placeholders with user data
		if (userProfile.name) {
			questionText = questionText.replace('{name}', userProfile.name);
		}

		setTimeout(() => {
			if (q.type === 'input') {
				addBotMessage(questionText, undefined, 'input', q.placeholder);
				setWaitingForInput(true);
			} else if (q.type === 'options') {
				addBotMessage(questionText, q.options, 'options');
			} else if (q.type === 'radio') {
				addBotMessage(questionText, q.options, 'radio');
			} else if (q.type === 'multiselect') {
				addBotMessage(questionText, q.options, 'multiselect');
			}
		}, 800);
	};

	const handleAnswer = (answer: string | string[], questionIndex: number) => {
		const q = getNextQuestion(questionIndex);
		
		// Add user's answer to chat
		if (Array.isArray(answer)) {
			addUserMessage(answer.join(', '));
		} else {
			addUserMessage(answer);
		}

		// Save to profile
		const newProfile = { ...userProfile };
		if (Array.isArray(answer)) {
			newProfile[q.key as keyof UserProfile] = answer as any;
		} else {
			newProfile[q.key as keyof UserProfile] = answer as any;
		}
		setUserProfile(newProfile);

		// Dynamic, contextual acknowledgments based on the answer
		setTimeout(() => {
			let acknowledgment = "Got it! ✅";
			
			// Personalized responses based on answer
			if (q.key === 'name') {
				acknowledgment = `Great to meet you, ${answer}! 🤝`;
			} else if (q.key === 'role') {
				if (answer.toString().includes('Developer')) {
					acknowledgment = "Nice! Developers love our API and integrations! 💻";
				} else if (answer.toString().includes('Team Leader')) {
					acknowledgment = "Perfect! You'll love our team management features! 👨‍💼";
				} else if (answer.toString().includes('Designer')) {
					acknowledgment = "Awesome! Our file sharing will be great for you! 🎨";
				} else {
					acknowledgment = "Excellent choice! 🌟";
				}
			} else if (q.key === 'experience') {
				if (answer.toString().includes('Brand new')) {
					acknowledgment = "No worries! I'll make sure you feel right at home! 🏠";
				} else if (answer.toString().includes('Expert')) {
					acknowledgment = "Impressive! You'll appreciate our advanced features! 🚀";
				} else {
					acknowledgment = "Perfect! You'll pick this up quickly! ⚡";
				}
			} else if (q.key === 'teamSize') {
				if (answer === 'Just me') {
					acknowledgment = "Solo mode! You can still do amazing things! 💪";
				} else if (answer === '50+ people') {
					acknowledgment = "Big team! We've got enterprise features for you! 🏢";
				} else {
					acknowledgment = "Great team size for collaboration! 👥";
				}
			} else if (q.key === 'interests' && Array.isArray(answer)) {
				acknowledgment = `${answer.length} interests noted! I'll tailor my suggestions! 📝`;
			} else if (q.key === 'workStyle') {
				acknowledgment = "Perfect! I'll keep that in mind! 🎯";
			} else {
				const acknowledgments = [
					"Got it! ✅",
					"Perfect! 👍",
					"Awesome! 🎉",
					"Excellent! ⭐",
					"Love it! 💯",
				];
				acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
			}
			
			addBotMessage(acknowledgment);
			
			// Move to next question
			setTimeout(() => {
				setCurrentQuestion(questionIndex + 1);
				askQuestion(questionIndex + 1);
			}, 1000);
		}, 500);
	};

	const showSummaryAndRecommendations = () => {
		setTimeout(() => {
			addBotMessage(
				`🎉 Perfect! I've got everything I need, ${userProfile.name}!`
			);

			setTimeout(() => {
				// Generate personalized summary
				let summary = "Here's what I learned about you:\n\n";
				summary += `👤 Name: ${userProfile.name}\n`;
				summary += `💼 Role: ${userProfile.role}\n`;
				if (userProfile.experience) {
					summary += `📚 Experience: ${userProfile.experience}\n`;
				}
				summary += `👥 Team Size: ${userProfile.teamSize}\n`;
				if (userProfile.interests && userProfile.interests.length > 0) {
					summary += `❤️ Interests: ${userProfile.interests.join(', ')}\n`;
				}
				summary += `🎯 Goal: ${userProfile.goals}`;
				if (userProfile.workStyle) {
					summary += `\n💼 Work Style: ${userProfile.workStyle}`;
				}

				addBotMessage(summary);

				setTimeout(() => {
					generateRecommendations();
				}, 2000);
			}, 1500);
		}, 800);
	};

	const generateRecommendations = async () => {
		addBotMessage("Based on your answers, here's what I recommend:");

		setTimeout(async () => {
			const recommendations: string[] = [];

			// Personalized recommendations based on profile
			if (userProfile.interests?.includes('💬 Team Communication') || userProfile.interests?.includes('👥 Team Collaboration')) {
				recommendations.push("📢 Join #general to connect with your team");
			}
			if (userProfile.interests?.includes('📹 Video Calls') || userProfile.interests?.includes('📹 Video Conferencing')) {
				recommendations.push("🎥 Try our video conferencing feature");
			}
			if (userProfile.interests?.includes('🤖 Automation & Bots') || userProfile.interests?.includes('🤖 Bot Development')) {
				recommendations.push("🤖 Check out our bot integrations");
			}
			if (userProfile.teamSize === '2-10 people' || userProfile.teamSize === '11-50 people') {
				recommendations.push("👥 Invite your team members to get started");
			}
			if (userProfile.role?.includes('Developer')) {
				recommendations.push("💻 Explore our API and integrations");
			}
			if (userProfile.interests?.includes('💻 API & Integrations')) {
				recommendations.push("📚 Check out our developer documentation");
			}
			if (userProfile.interests?.includes('🔒 Security Features') || userProfile.interests?.includes('🔒 Security & Compliance')) {
				recommendations.push("🔒 Review our security and privacy settings");
			}
			if (userProfile.experience?.includes('Brand new')) {
				recommendations.push("📖 Take a quick tour of the interface");
			}
			if (userProfile.workStyle?.includes('Video calls')) {
				recommendations.push("📹 Set up your video call preferences");
			}
			if (userProfile.preferredChannels && userProfile.preferredChannels.length > 0) {
				recommendations.push(`💬 Start chatting in your selected channels`);
			}

			// Show recommendations
			for (let i = 0; i < recommendations.length; i++) {
				setTimeout(() => {
					addBotMessage(`${i + 1}. ${recommendations[i]}`);
				}, i * 800);
			}

			// Final options
			setTimeout(() => {
				addBotMessage(
					"What would you like to do next?",
					[
						'🚀 Start Chatting',
						'📢 Post Welcome Message',
						'👥 Invite Team',
						'⚙️ Customize Settings',
						'🔄 Start Over',
					],
					'options'
				);
			}, recommendations.length * 800 + 1000);
		}, 1500);
	};

	const addBotMessage = (
		text: string,
		options?: string[],
		type: Message['type'] = 'text',
		placeholder?: string
	) => {
		setIsTyping(true);
		setTimeout(() => {
			const newMessage: Message = {
				id: Date.now().toString(),
				text,
				sender: 'bot',
				timestamp: new Date(),
				type,
				options,
				inputPlaceholder: placeholder,
			};
			setMessages((prev) => [...prev, newMessage]);
			setIsTyping(false);
		}, 600);
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
		// Check if this is a final action
		if (option === '🚀 Start Chatting') {
			addUserMessage(option);
			setTimeout(() => {
				addBotMessage("Awesome! You're all set to start chatting. Have fun! 🎉");
			}, 500);
			return;
		}

		if (option === '📢 Post Welcome Message') {
			addUserMessage(option);
			postWelcomeMessage();
			return;
		}

		if (option === '🔄 Start Over') {
			addUserMessage(option);
			restartConversation();
			return;
		}

		// Otherwise, it's an answer to a question
		handleAnswer(option, currentQuestion);
	};

	const handleInputSubmit = () => {
		if (inputValue.trim()) {
			handleAnswer(inputValue.trim(), currentQuestion);
			setInputValue('');
			setWaitingForInput(false);
		}
	};

	const handleMultiSelectSubmit = () => {
		if (selectedOptions.length > 0) {
			handleAnswer(selectedOptions, currentQuestion);
			setSelectedOptions([]);
		}
	};

	const postWelcomeMessage = async () => {
		setTimeout(async () => {
			const channelsData = await getJoinedChannels();
			if (channelsData && channelsData.success) {
				const generalChannel = channelsData.channels.find((ch) => ch.name === 'general');
				if (generalChannel) {
					const success = await sendMessage(
						generalChannel._id,
						`👋 Hi everyone! ${userProfile.name} (${userProfile.role}) just joined the team! Say hello! 🎉`
					);
					if (success) {
						addBotMessage("✅ Welcome message posted to #general! Your team will see it.");
					}
				}
			}
		}, 500);
	};

	const restartConversation = () => {
		setMessages([]);
		setUserProfile({});
		setCurrentQuestion(0);
		setSelectedOptions([]);
		startConversation();
	};

	return (
		<Box display='flex' flexDirection='column' height='100%' style={{ backgroundColor: '#edf2f4' }}>
			{/* Header */}
			<Box
				padding='x16'
				display='flex'
				alignItems='center'
				gap='x12'
				borderRadius='x4 x4 0 0'
				style={{
					backgroundColor: '#ef233c',
					background: 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)',
					boxShadow: '0 2px 8px rgba(239, 35, 60, 0.3)',
				}}
			>
				<Avatar size='x32' url='/images/logo/logo.svg' style={{ border: '2px solid white' }} />
				<Box>
					<Box fontWeight='bold' style={{ color: 'white', fontSize: '18px' }}>
						🤖 Your Personal Assistant
					</Box>
					<Box fontSize='p2' style={{ color: '#edf2f4', opacity: 0.95 }}>
						● Online • Personalizing your experience
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
						<Box maxWidth='80%'>
							{message.sender === 'bot' && (
								<Box display='flex' alignItems='center' gap='x8' marginBlockEnd='x4'>
									<Avatar size='x24' url='/images/logo/logo.svg' />
									<Box fontSize='p2' style={{ color: '#2b2d42', fontWeight: '600' }}>
										Assistant
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
									boxShadow:
										message.sender === 'user'
											? '0 2px 8px rgba(239, 35, 60, 0.3)'
											: '0 2px 8px rgba(0, 0, 0, 0.1)',
									border: message.sender === 'bot' ? '1px solid #d8dbe0' : 'none',
								}}
							>
								{message.text}
							</Box>

							{/* Options (Single Select) */}
							{message.type === 'options' && message.options && (
								<Box display='flex' flexDirection='column' gap='x8' marginBlockStart='x8'>
									{message.options.map((option, index) => (
										<Button
											key={index}
											onClick={() => handleOptionClick(option)}
											style={{
												backgroundColor: 'white',
												color: '#ef233c',
												border: '2px solid #ef233c',
												fontWeight: '600',
												textAlign: 'left',
												justifyContent: 'flex-start',
												padding: '12px 16px',
												transition: 'all 0.2s ease',
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = '#ef233c';
												e.currentTarget.style.color = 'white';
												e.currentTarget.style.transform = 'translateX(4px)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'white';
												e.currentTarget.style.color = '#ef233c';
												e.currentTarget.style.transform = 'translateX(0)';
											}}
										>
											{option}
										</Button>
									))}
								</Box>
							)}

							{/* Radio Buttons */}
							{message.type === 'radio' && message.options && (
								<Box display='flex' flexDirection='column' gap='x8' marginBlockStart='x8'>
									{message.options.map((option, index) => (
										<Box
											key={index}
											onClick={() => handleOptionClick(option)}
											padding='x12'
											borderRadius='x4'
											style={{
												backgroundColor: 'white',
												border: '2px solid #d8dbe0',
												cursor: 'pointer',
												transition: 'all 0.2s ease',
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.borderColor = '#ef233c';
												e.currentTarget.style.backgroundColor = '#fff5f6';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.borderColor = '#d8dbe0';
												e.currentTarget.style.backgroundColor = 'white';
											}}
										>
											<Box display='flex' alignItems='center' gap='x8'>
												<Box
													style={{
														width: '16px',
														height: '16px',
														borderRadius: '50%',
														border: '2px solid #ef233c',
													}}
												/>
												<Box style={{ color: '#2b2d42' }}>{option}</Box>
											</Box>
										</Box>
									))}
								</Box>
							)}

							{/* Multi-Select Checkboxes */}
							{message.type === 'multiselect' && message.options && (
								<Box marginBlockStart='x8'>
									<Box display='flex' flexDirection='column' gap='x8'>
										{message.options.map((option, index) => (
											<Box
												key={index}
												padding='x12'
												borderRadius='x4'
												style={{
													backgroundColor: selectedOptions.includes(option)
														? '#fff5f6'
														: 'white',
													border: selectedOptions.includes(option)
														? '2px solid #ef233c'
														: '2px solid #d8dbe0',
													cursor: 'pointer',
													transition: 'all 0.2s ease',
												}}
												onClick={() => {
													setSelectedOptions((prev) =>
														prev.includes(option)
															? prev.filter((o) => o !== option)
															: [...prev, option]
													);
												}}
											>
												<Box display='flex' alignItems='center' gap='x8'>
													<Box
														style={{
															width: '16px',
															height: '16px',
															borderRadius: '4px',
															border: '2px solid #ef233c',
															backgroundColor: selectedOptions.includes(option)
																? '#ef233c'
																: 'white',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															color: 'white',
															fontSize: '12px',
														}}
													>
														{selectedOptions.includes(option) && '✓'}
													</Box>
													<Box style={{ color: '#2b2d42' }}>{option}</Box>
												</Box>
											</Box>
										))}
									</Box>
									<Button
										primary
										marginBlockStart='x12'
										onClick={handleMultiSelectSubmit}
										disabled={selectedOptions.length === 0}
										style={{
											backgroundColor: '#ef233c',
											opacity: selectedOptions.length === 0 ? 0.5 : 1,
										}}
									>
										Continue →
									</Button>
								</Box>
							)}

							{/* Input Field */}
							{message.type === 'input' && waitingForInput && (
								<Box marginBlockStart='x8' display='flex' gap='x8'>
									<TextInput
										placeholder={message.inputPlaceholder}
										value={inputValue}
										onChange={(e) => setInputValue(e.currentTarget.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
										style={{
											border: '2px solid #ef233c',
											borderRadius: '8px',
											padding: '10px',
										}}
										autoFocus
									/>
									<Button
										primary
										onClick={handleInputSubmit}
										disabled={!inputValue.trim()}
										style={{
											backgroundColor: '#ef233c',
											opacity: inputValue.trim() ? 1 : 0.5,
										}}
									>
										→
									</Button>
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
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
							}}
						>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite',
								}}
							/>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite 0.2s',
								}}
							/>
							<Box
								width='x8'
								height='x8'
								borderRadius='full'
								style={{
									backgroundColor: '#ef233c',
									animation: 'pulse 1.4s infinite 0.4s',
								}}
							/>
						</Box>
					</Box>
				)}

				<div ref={messagesEndRef} />
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
