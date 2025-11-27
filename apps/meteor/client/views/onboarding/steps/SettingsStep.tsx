import React from 'react';
import { Box, Icon, ToggleSwitch } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const SettingsStep: React.FC = () => {
	const { t } = useTranslation();

	const settings = [
		{
			id: 'desktop-notifications',
			label: t('Desktop Notifications'),
			description: t('Get notified about new messages'),
			icon: 'bell',
		},
		{
			id: 'sound-notifications',
			label: t('Sound Notifications'),
			description: t('Play a sound for new messages'),
			icon: 'volume',
		},
		{
			id: 'email-notifications',
			label: t('Email Notifications'),
			description: t('Receive email summaries'),
			icon: 'mail',
		},
		{
			id: 'mobile-notifications',
			label: t('Mobile Push Notifications'),
			description: t('Get notifications on your mobile device'),
			icon: 'mobile',
		},
	];

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='customize' size='x64' color='primary' />
			<Box fontSize='h2' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('Customize Settings')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('Personalize your notification preferences to stay informed without being overwhelmed.')}
			</Box>
			<Box marginBlockStart='x24' display='flex' flexDirection='column' gap='x12' width='100%' maxWidth='500px'>
				{settings.map((setting) => (
					<Box
						key={setting.id}
						padding='x16'
						backgroundColor='surface-light'
						borderRadius='x4'
						display='flex'
						justifyContent='space-between'
						alignItems='center'
					>
						<Box display='flex' alignItems='center' gap='x12' flexGrow={1}>
							<Icon name={setting.icon as any} size='x24' />
							<Box>
								<Box fontWeight='bold'>{setting.label}</Box>
								<Box fontSize='p2' color='hint'>
									{setting.description}
								</Box>
							</Box>
						</Box>
						<ToggleSwitch defaultChecked />
					</Box>
				))}
			</Box>
		</Box>
	);
};
