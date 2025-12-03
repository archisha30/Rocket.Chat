import type { Card } from '@rocket.chat/fuselage';
import { useTranslation, useRouter } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement } from 'react';

import { GenericCard, GenericCardButton } from '../../../components/GenericCard';

const AddUsersCard = (props: Omit<ComponentProps<typeof Card>, 'type'>): ReactElement => {
	const t = useTranslation();

	const router = useRouter();
	const handleOpenUsersRoute = (): void => {
		router.navigate('/admin/users');
	};

	return (
		<GenericCard
			title={t('Add_users')}
			body={t('Invite_and_add_members_to_this_workspace_to_start_communicating')}
			buttons={[<GenericCardButton key={1} onClick={handleOpenUsersRoute} children={t('Add_users')} primary />]}
			data-qa-id='homepage-add-users-card'
			width='x340'
			icon='user-plus'
			type='warning'
			style={{
				borderLeft: '4px solid #f59e0b',
				transition: 'all 0.3s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e: any) => {
				e.currentTarget.style.transform = 'translateY(-4px)';
				e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.2)';
			}}
			onMouseLeave={(e: any) => {
				e.currentTarget.style.transform = 'translateY(0)';
				e.currentTarget.style.boxShadow = 'none';
			}}
			{...props}
		/>
	);
};

export default AddUsersCard;
