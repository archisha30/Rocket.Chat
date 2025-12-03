import type { Card } from '@rocket.chat/fuselage';
import { useTranslation, useRouter } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement } from 'react';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';

const JoinRoomsCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const t = useTranslation();

	const router = useRouter();
	const handleDirectory = (): void => {
		router.navigate('/directory');
	};

	return (
		<GenericCard
			title={t('Join_rooms')}
			body={t('Discover_public_channels_and_teams_in_the_workspace_directory')}
			buttons={[<GenericCardButton key={1} onClick={handleDirectory} children={t('Open_directory')} />]}
			data-qa-id='homepage-join-rooms-card'
			width='x340'
			icon='discover'
			type='info'
			style={{
				borderLeft: '4px solid #3b82f6',
				transition: 'all 0.3s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e: any) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.3)';
			}}
			onMouseLeave={(e: any) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = 'none';
			}}
			{...props}
		/>
	);
};

export default JoinRoomsCard;
