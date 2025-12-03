import type { Card } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';
import { useExternalLink } from '../../../hooks/useExternalLink';

const MICROSOFT_TEAMS_URL = 'https://teams.microsoft.com';

const MicrosoftTeamsCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const { t } = useTranslation();
	const handleOpenLink = useExternalLink();

	return (
		<GenericCard
			title='Microsoft Teams'
			body='Connect with your team through Microsoft Teams for meetings, calls, and collaboration.'
			buttons={[
				<GenericCardButton key={1} onClick={() => handleOpenLink(MICROSOFT_TEAMS_URL)} children='Open Teams' role='link' />,
			]}
			data-qa-id='homepage-microsoft-teams-card'
			width='x340'
			{...props}
		/>
	);
};

export default MicrosoftTeamsCard;
