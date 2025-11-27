import React, { useState } from 'react';
import { Box, Icon, Button, TextInput, Field } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const TeamStep: React.FC = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='team' size='x64' color='primary' />
			<Box fontSize='h2' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('Invite Team Members')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('Collaboration is better with your team. Invite colleagues to join your workspace.')}
			</Box>
			<Box marginBlockStart='x24' width='100%' maxWidth='500px'>
				<Box padding='x20' backgroundColor='surface-light' borderRadius='x4'>
					<Field>
						<Field.Label>{t('Email Address')}</Field.Label>
						<Field.Row>
							<TextInput
								placeholder={t('colleague@example.com')}
								value={email}
								onChange={(e) => setEmail(e.currentTarget.value)}
							/>
						</Field.Row>
					</Field>
					<Button marginBlockStart='x12' primary>
						{t('Send Invitation')}
					</Button>
				</Box>
				<Box marginBlockStart='x16' padding='x16' backgroundColor='info-light' borderRadius='x4'>
					<Box display='flex' alignItems='start' gap='x12'>
						<Icon name='info-circled' size='x20' color='info' />
						<Box>
							<Box fontWeight='bold' marginBlockEnd='x4'>
								{t('Tip')}
							</Box>
							<Box fontSize='p2' color='hint'>
								{t('You can also share your workspace link or generate invitation codes for bulk invites.')}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
