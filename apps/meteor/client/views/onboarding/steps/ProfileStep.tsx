import React from 'react';
import { Box, Icon, Button } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const ProfileStep: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='user' size='x64' color='primary' />
			<Box fontSize='h2' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('Complete Your Profile')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('Add a profile picture and update your information to help your team recognize you.')}
			</Box>
			<Box marginBlockStart='x24' display='flex' flexDirection='column' gap='x16' width='100%' maxWidth='400px'>
				<Box padding='x16' backgroundColor='surface-light' borderRadius='x4'>
					<Box display='flex' alignItems='center' gap='x12' marginBlockEnd='x8'>
						<Icon name='image' size='x20' />
						<Box fontWeight='bold'>{t('Profile Picture')}</Box>
					</Box>
					<Box fontSize='p2' color='hint'>
						{t('Upload a photo to personalize your profile')}
					</Box>
					<Button marginBlockStart='x12' small>
						{t('Upload Photo')}
					</Button>
				</Box>
				<Box padding='x16' backgroundColor='surface-light' borderRadius='x4'>
					<Box display='flex' alignItems='center' gap='x12' marginBlockEnd='x8'>
						<Icon name='edit' size='x20' />
						<Box fontWeight='bold'>{t('Personal Information')}</Box>
					</Box>
					<Box fontSize='p2' color='hint'>
						{t('Update your name, bio, and contact details')}
					</Box>
					<Button marginBlockStart='x12' small>
						{t('Edit Profile')}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
