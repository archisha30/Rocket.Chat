import React from 'react';
import { Box, Icon, Button } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

export const ChannelsStep: React.FC = () => {
	const { t } = useTranslation();

	const suggestedChannels = [
		{ name: 'general', description: 'General discussions and announcements', icon: 'hash' },
		{ name: 'random', description: 'Off-topic conversations and fun', icon: 'hash' },
		{ name: 'help', description: 'Get help from the community', icon: 'hash' },
	];

	return (
		<Box display='flex' flexDirection='column' alignItems='center' padding='x24'>
			<Icon name='hash' size='x64' color='primary' />
			<Box fontSize='h2' fontWeight='bold' marginBlockStart='x16' textAlign='center'>
				{t('Join Channels')}
			</Box>
			<Box fontSize='p1' color='hint' marginBlockStart='x12' textAlign='center' maxWidth='500px'>
				{t('Channels are where conversations happen. Join channels to stay connected with your team.')}
			</Box>
			<Box marginBlockStart='x24' display='flex' flexDirection='column' gap='x12' width='100%' maxWidth='500px'>
				{suggestedChannels.map((channel) => (
					<Box
						key={channel.name}
						padding='x16'
						backgroundColor='surface-light'
						borderRadius='x4'
						display='flex'
						justifyContent='space-between'
						alignItems='center'
					>
						<Box display='flex' alignItems='center' gap='x12'>
							<Icon name={channel.icon as any} size='x24' />
							<Box>
								<Box fontWeight='bold'>#{channel.name}</Box>
								<Box fontSize='p2' color='hint'>
									{channel.description}
								</Box>
							</Box>
						</Box>
						<Button small primary>
							{t('Join')}
						</Button>
					</Box>
				))}
			</Box>
			<Button marginBlockStart='x24' secondary>
				{t('Browse All Channels')}
			</Button>
		</Box>
	);
};
