import type { RouteName } from '@rocket.chat/ui-contexts';
import { useRouter, useUser, useUserId } from '@rocket.chat/ui-contexts';
import { useEffect, useState } from 'react';

import { SimpleChatbot } from '../onboarding/SimpleChatbot';
import PageLoading from './PageLoading';

const IndexRoute = () => {
	const router = useRouter();
	const uid = useUserId();
	const user = useUser();
	const [showChatbot, setShowChatbot] = useState(true);

	// Prevent automatic routing while chatbot is showing
	useEffect(() => {
		if (!showChatbot) {
			// Only route after chatbot is closed
			if (!uid) {
				router.navigate('/home');
			} else if (user?.defaultRoom) {
				const room = user.defaultRoom.split('/') as [routeName: RouteName, routeParam: string];
				router.navigate({
					name: room[0],
					params: { name: room[1] },
				});
			} else {
				router.navigate('/home');
			}
		}
	}, [showChatbot, uid, user?.defaultRoom, router]);

	const handleCloseChatbot = () => {
		setShowChatbot(false);
	};

	if (showChatbot) {
		return <SimpleChatbot onClose={handleCloseChatbot} />;
	}

	return <PageLoading />;
};

export default IndexRoute;
