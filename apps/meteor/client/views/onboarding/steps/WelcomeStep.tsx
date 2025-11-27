import React from 'react';
import { Box, Icon } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const WelcomeStep: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='rocket' size='x64' color='primary' />
			<Box fontSize='h1' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('Welcome to Rocket.Chat!')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('We\'re excited to have you here. This quick guide will help you get started and make the most of your Rocket.Chat experience.')}
			</Box>
			<Box marginBlockStart='x24' display='flex' flexDirection='column' gap='x12' width='100%' maxWidth='400px'>
				<Box display='flex' alignItems='center' gap='x12'>
					<Icon name='check' size='x20' color='success' />
					<Box fontSize='p2'>{t('Real-time messaging')}</Box>
				</Box>
				<Box display='flex' alignItems='center' gap='x12'>
					<Icon name='check' size='x20' color='success' />
					<Box fontSize='p2'>{t('Video and audio calls')}</Box>
				</Box>
				<Box display='flex' alignItems='center' gap='x12'>
					<Icon name='check' size='x20' color='success' />
					<Box fontSize='p2'>{t('File sharing and collaboration')}</Box>
				</Box>
				<Box display='flex' alignItems='center' gap='x12'>
					<Icon name='check' size='x20' color='success' />
					<Box fontSize='p2'>{t('Customizable and secure')}</Box>
				</Box>
			</Box>
		</Box>
	);
};
