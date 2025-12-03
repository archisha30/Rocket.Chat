import type { Card } from '@rocket.chat/fuselage';
import { Box, Button, ButtonGroup } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';

import { GenericCard } from '../../../components/GenericCard';
import { useExternalLink } from '../../../hooks/useExternalLink';

const IntegrationsCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const handleOpenLink = useExternalLink();

	const openGoogleCalendar = () => {
		handleOpenLink('https://calendar.google.com');
	};

	const openMicrosoftTeams = () => {
		handleOpenLink('https://teams.microsoft.com');
	};

	const openOutlookCalendar = () => {
		handleOpenLink('https://outlook.office.com/calendar');
	};

	return (
		<GenericCard
			title='🔗 Integrations'
			body={
				<Box>
					<Box mb={8}>Quick access to your productivity tools and calendars.</Box>
					
					<Box mb={12}>
						<Box fontScale='p2' fontWeight='bold' mb={8}>
							📅 Calendar
						</Box>
						<ButtonGroup>
							<Button small onClick={openGoogleCalendar}>
								Google
							</Button>
							<Button small onClick={openOutlookCalendar}>
								Outlook
							</Button>
						</ButtonGroup>
					</Box>

					<Box>
						<Box fontScale='p2' fontWeight='bold' mb={8}>
							💬 Collaboration
						</Box>
						<Button small onClick={openMicrosoftTeams}>
							Microsoft Teams
						</Button>
					</Box>
				</Box>
			}
			data-qa-id='homepage-integrations-card'
			width='x340'
			{...props}
		/>
	);
};

export default IntegrationsCard;
