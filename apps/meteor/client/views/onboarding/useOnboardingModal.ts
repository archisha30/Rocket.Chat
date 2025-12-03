import { useEffect } from 'react';
import { useStream } from '@rocket.chat/ui-contexts';

export const useOnboardingModalTrigger = (onOpen: () => void) => {
	const subscribeToNotifyUser = useStream('notify-user');

	useEffect(() => {
		const unsubscribe = subscribeToNotifyUser('action', (data: { action: string }) => {
			if (data.action === 'openOnboardingModal') {
				onOpen();
			}
		});

		return () => {
			unsubscribe();
		};
	}, [subscribeToNotifyUser, onOpen]);
};
