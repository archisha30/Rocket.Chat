import type { ReactElement } from 'react';
import { memo } from 'react';

import ChatbotPage from './ChatbotPage';

const ChatbotRoute = (): ReactElement => {
	return <ChatbotPage />;
};

export default memo(ChatbotRoute);
