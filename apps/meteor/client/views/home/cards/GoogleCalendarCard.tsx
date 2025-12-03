import type { Card } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';
import { useExternalLink } from '../../../hooks/useExternalLink';

const GOOGLE_CALENDAR_URL = 'https://calendar.google.com';

const GoogleCalendarCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const { t } = useTranslation();
	const handleOpenLink = useExternalLink();

	return (
		<GenericCard
			title='Google Calendar'
			body='View and manage your schedule, meetings, and events directly from Google Calendar.'
			buttons={[
				<GenericCardButton key={1} onClick={() => handleOpenLink(GOOGLE_CALENDAR_URL)} children='Open Calendar' role='link' />,
			]}
			data-qa-id='homepage-google-calendar-card'
			width='x340'
			{...props}
		/>
	);
};

export default GoogleCalendarCard;
