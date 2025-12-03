import { Box, CardGroup } from '@rocket.chat/fuselage';
import { useAtLeastOnePermission, useSetting, useTranslation, useRole, usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import { useState, useEffect, useCallback } from 'react';

import HomePageHeader from './HomePageHeader';
import AddUsersCard from './cards/AddUsersCard';
import CreateChannelsCard from './cards/CreateChannelsCard';
import CustomContentCard from './cards/CustomContentCard';
import DesktopAppsCard from './cards/DesktopAppsCard';
import DocumentationCard from './cards/DocumentationCard';
import JoinRoomsCard from './cards/JoinRoomsCard';
import MobileAppsCard from './cards/MobileAppsCard';
import Page from '../../components/Page/Page';
import PageScrollableContent from '../../components/Page/PageScrollableContent';
import { OnboardingModal } from '../onboarding';
import { useOnboardingModalTrigger } from '../onboarding/useOnboardingModal';

const CREATE_CHANNEL_PERMISSIONS = ['create-c', 'create-p'];

const DefaultHomePage = (): ReactElement => {
	const t = useTranslation();
	const canAddUsers = usePermission('view-user-administration');
	const isAdmin = useRole('admin');
	const canCreateChannel = useAtLeastOnePermission(CREATE_CHANNEL_PERMISSIONS);
	const workspaceName = useSetting('Site_Name');
	const isCustomContentBodyEmpty = useSetting('Layout_Home_Body', '') === '';
	const isCustomContentVisible = useSetting('Layout_Home_Custom_Block_Visible', false);
	
	const [showOnboarding, setShowOnboarding] = useState(true);

	// Chatbot loads every time the page loads
	useEffect(() => {
		setShowOnboarding(true);
	}, []);

	const handleOpenOnboarding = useCallback(() => {
		setShowOnboarding(true);
	}, []);

	const handleCloseOnboarding = () => {
		setShowOnboarding(false);
		// Note: Chatbot will reappear on next page load
	};

	// Listen for /onboarding command trigger
	useOnboardingModalTrigger(handleOpenOnboarding);

	return (
		<Page 
			color='default' 
			data-qa='page-home' 
			data-qa-type='default' 
			style={{
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				minHeight: '100vh',
			}}
		>
			<style>
				{`
					@keyframes fadeInUp {
						from {
							opacity: 0;
							transform: translateY(30px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}
					
					@keyframes gradient {
						0% { background-position: 0% 50%; }
						50% { background-position: 100% 50%; }
						100% { background-position: 0% 50%; }
					}
					
					@keyframes backgroundGradient {
						0% { background-position: 0% 50%; }
						50% { background-position: 100% 50%; }
						100% { background-position: 0% 50%; }
					}
					
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-10px); }
					}
					
					@keyframes pulse {
						0%, 100% { transform: scale(1); }
						50% { transform: scale(1.05); }
					}
					
					[data-qa='page-home'] {
						background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%) !important;
						background-size: 400% 400% !important;
						animation: backgroundGradient 15s ease infinite !important;
					}
					
					.welcome-header {
						animation: fadeInUp 0.8s ease-out;
						color: #000000 !important;
						font-weight: 800;
						letter-spacing: -0.5px;
						text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
					}
					
					.subtitle {
						animation: fadeInUp 1s ease-out;
						color: #ffffff;
						font-weight: 600;
						text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
					}
					
					.card-container {
						animation: fadeInUp 1.2s ease-out;
					}
					
					.emoji-float {
						display: inline-block;
						animation: float 3s ease-in-out infinite;
						filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
					}
				`}
			</style>
			<HomePageHeader />
			<PageScrollableContent>
				<Box 
					display='flex' 
					flexDirection='column' 
					alignItems='center' 
					mb={24}
					padding='x24'
					borderRadius='x16'
					style={{
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
						border: '2px solid rgba(255, 255, 255, 0.3)',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
					}}
				>
					<Box 
						is='h2' 
						fontScale='h1' 
						mb={12} 
						data-qa-id='homepage-welcome-text'
						className='welcome-header'
						textAlign='center'
					>
						<span className='emoji-float' style={{ marginRight: '12px' }}>🚀</span>
						{t('Welcome_to_workspace', { Site_Name: workspaceName || 'Rocket.Chat' })}
						<span className='emoji-float' style={{ marginLeft: '12px', animationDelay: '1s' }}>✨</span>
					</Box>
					<Box 
						is='p' 
						fontScale='p1' 
						style={{ 
							color: '#6366f1',
							textAlign: 'center',
							maxWidth: '600px',
							fontWeight: '500'
						}}
					>
						Your journey to better team collaboration starts here! Let's make something amazing together.
					</Box>
				</Box>
				
				<Box 
					is='h3' 
					fontScale='h3' 
					mb={20}
					className='subtitle'
					display='flex'
					alignItems='center'
					gap='x8'
					padding='x12'
					borderRadius='x8'
					style={{
						background: 'rgba(255, 255, 255, 0.2)',
						backdropFilter: 'blur(10px)',
						width: 'fit-content',
					}}
				>
					<span style={{ fontSize: '24px' }}>💡</span>
					{t('Some_ideas_to_get_you_started')}
				</Box>
				
				<Box mi='neg-x8' className='card-container'>
					<CardGroup wrap stretch>
						{canAddUsers && <AddUsersCard />}
						{canCreateChannel && <CreateChannelsCard />}
						<JoinRoomsCard />
						<MobileAppsCard />
						<DesktopAppsCard />
						<DocumentationCard />
						{(isAdmin || (isCustomContentVisible && !isCustomContentBodyEmpty)) && <CustomContentCard />}
					</CardGroup>
				</Box>
			</PageScrollableContent>
			{showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
		</Page>
	);
};

export default DefaultHomePage;
