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
		<Page color='default' data-qa='page-home' data-qa-type='default' background='tint'>
			<HomePageHeader />
			<PageScrollableContent>
				<Box is='h2' fontScale='h1' mb={20} data-qa-id='homepage-welcome-text'>
					{t('Welcome_to_workspace', { Site_Name: workspaceName || 'Rocket.Chat' })}
				</Box>
				<Box is='h3' fontScale='h3' mb={16}>
					{t('Some_ideas_to_get_you_started')}
				</Box>
				<Box mi='neg-x8'>
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
