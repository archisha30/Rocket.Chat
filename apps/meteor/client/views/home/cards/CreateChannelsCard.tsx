import type { Card } from '@rocket.chat/fuselage';
import { useTranslation, useSetModal } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement } from 'react';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';
import CreateChannelWithData from '../../../sidebar/header/CreateChannel';

const CreateChannelsCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const t = useTranslation();
	const setModal = useSetModal();

	const openCreateChannelModal = (): void => setModal(<CreateChannelWithData onClose={(): void => setModal(null)} />);

	return (
		<GenericCard
			title={t('Create_channels')}
			body={t('Create_a_public_channel_that_new_workspace_members_can_join')}
			buttons={[<GenericCardButton key={1} onClick={openCreateChannelModal} children={t('Create_channel')} />]}
			data-qa-id='homepage-create-channels-card'
			width='x340'
			icon='hash'
			type='success'
			style={{
				borderLeft: '4px solid #10b981',
				transition: 'all 0.3s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e: any) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.2)';
			}}
			onMouseLeave={(e: any) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = 'none';
			}}
			{...props}
		/>
	);
};

export default CreateChannelsCard;
