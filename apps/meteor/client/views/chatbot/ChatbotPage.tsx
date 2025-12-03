import { Box } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Page, PageHeader, PageScrollableContentWithShadow } from '../../components/Page';

const ChatbotPage = (): ReactElement => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Page bg='tint'>
			<PageHeader title='🤖 AI Assistant' />
			<PageScrollableContentWithShadow>
				<Box width='full' height='calc(100vh - 120px)' position='relative'>
					{isLoading && (
						<Box
							position='absolute'
							top='50%'
							left='50%'
							style={{ transform: 'translate(-50%, -50%)' }}
							fontSize='h2'
							color='hint'
						>
							Loading AI Assistant...
						</Box>
					)}
					<iframe
						ref={iframeRef}
						src='/chatbot.html'
						style={{
							width: '100%',
							height: '100%',
							border: 'none',
							borderRadius: '8px',
							display: isLoading ? 'none' : 'block',
						}}
						title='AI Chatbot Assistant'
						onLoad={() => setIsLoading(false)}
					/>
				</Box>
			</PageScrollableContentWithShadow>
		</Page>
	);
};

export default ChatbotPage;
