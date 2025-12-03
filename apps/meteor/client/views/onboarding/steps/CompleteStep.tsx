import React from 'react';
import { Box, Icon, Button } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const CompleteStep: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='circle-check' size='x64' color='success' />
			<Box fontSize='h1' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('You\'re All Set!')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('Congratulations! You\'ve completed the onboarding process. You\'re ready to start collaborating with your team.')}
			</Box>
			<Box marginBlockStart='x24' display='flex' flexDirection='column' gap='x12' width='100%' maxWidth='400px'>
				<Box padding='x16' backgroundColor='success-light' borderRadius='x4'>
					<Box display='flex' alignItems='center' gap='x12' marginBlockEnd='x8'>
						<Icon name='info-circled' size='x20' color='success' />
						<Box fontWeight='bold'>{t('Quick Tips')}</Box>
					</Box>
					<Box fontSize='p2' color='hint'>
						<ul style={{ margin: 0, paddingLeft: '20px' }}>
							<li>{t('Use @ to mention team members')}</li>
							<li>{t('Press Ctrl+K to quickly search')}</li>
							<li>{t('Star important messages for later')}</li>
							<li>{t('Use threads to organize discussions')}</li>
						</ul>
					</Box>
				</Box>
			</Box>
			<Box marginBlockStart='x24' display='flex' gap='x12'>
				<Button secondary>
					{t('View Help Center')}
				</Button>
				<Button primary>
					{t('Start Chatting')}
				</Button>
			</Box>
		</Box>
	);
};
