import type { Card } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';
import { useExternalLink } from '../../../hooks/useExternalLink';
import { links } from '../../../lib/links';

const GOOGLE_PLAY_URL = links.go.mobileAppGoogle;
const APP_STORE_URL = links.go.mobileAppApple;

const MobileAppsCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const { t } = useTranslation();
	const handleOpenLink = useExternalLink();

	return (
		<GenericCard
			title={t('Mobile_apps')}
			body={t('Take_rocket_chat_with_you_with_mobile_applications')}
			buttons={[
				<GenericCardButton key={1} onClick={() => handleOpenLink(GOOGLE_PLAY_URL)} children={t('Google_Play')} role='link' />,
				<GenericCardButton key={2} onClick={() => handleOpenLink(APP_STORE_URL)} children={t('App_Store')} role='link' />,
			]}
			data-qa-id='homepage-mobile-apps-card'
			width='x340'
			icon='mobile'
			type='info'
			style={{
				borderLeft: '4px solid #8b5cf6',
				transition: 'all 0.3s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e: any) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.2)';
			}}
			onMouseLeave={(e: any) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = 'none';
			}}
			{...props}
		/>
	);
};

export default MobileAppsCard;
