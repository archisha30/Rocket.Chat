import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useEffect, useState } from 'react';

const SUGGESTED_CHANNELS = [
	{
		name: 'general',
		description: 'General discussion and announcements',
		type: 'c', // public channel
	},
	{
		name: 'random',
		description: 'Random conversations and fun',
		type: 'c',
	},
	{
		name: 'support',
		description: 'Get help and support from the team',
		type: 'c',
	},
	{
		name: 'announcements',
		description: 'Important company announcements',
		type: 'c',
	},
	{
		name: 'team-updates',
		description: 'Team updates and progress reports',
		type: 'c',
	},
];

const SUGGESTED_DISCUSSIONS = [
	{
		name: 'product-ideas',
		description: 'Share and discuss product ideas',
		type: 'c',
	},
	{
		name: 'feedback',
		description: 'Share your feedback and suggestions',
		type: 'c',
	},
	{
		name: 'watercooler',
		description: 'Casual conversations and social chat',
		type: 'c',
	},
];

export const useAutoCreateChannels = () => {
	const createChannel = useEndpoint('POST', '/v1/channels.create');
	const getChannelInfo = useEndpoint('GET', '/v1/channels.info');
	const [isCreating, setIsCreating] = useState(false);
	const [hasRun, setHasRun] = useState(false);
	const [createdChannels, setCreatedChannels] = useState<string[]>([]);
	const [errors, setErrors] = useState<string[]>([]);

	useEffect(() => {
		// Only run once
		if (hasRun) return;

		const createChannelsAndDiscussions = async () => {
			console.log('🚀 Starting auto-create channels...');
			setIsCreating(true);
			setHasRun(true);
			const created: string[] = [];
			const errorList: string[] = [];

			// Combine all suggested channels and discussions
			const allChannels = [...SUGGESTED_CHANNELS, ...SUGGESTED_DISCUSSIONS];

			for (const channel of allChannels) {
				try {
					console.log(`Checking if channel exists: ${channel.name}`);
					
					// Check if channel already exists
					try {
						await getChannelInfo({ roomName: channel.name });
						console.log(`⏭️  Channel already exists: ${channel.name}`);
						// Channel exists, skip
						continue;
					} catch (error) {
						// Channel doesn't exist, proceed to create it
						console.log(`Creating new channel: ${channel.name}`);
					}

					// Create the channel
					const result = await createChannel({
						name: channel.name,
						members: [],
						readOnly: false,
					});

					if (result.success) {
						created.push(channel.name);
						console.log(`✅ Created channel: ${channel.name}`);
					}
				} catch (error: any) {
					console.error(`❌ Error creating ${channel.name}:`, error);
					// Only log error if it's not "already exists"
					const errorMsg = error?.message || error?.error || 'Unknown error';
					if (!errorMsg.includes('already exists') && !errorMsg.includes('duplicate')) {
						errorList.push(`Failed to create ${channel.name}: ${errorMsg}`);
					} else {
						console.log(`⏭️  Channel already exists (from error): ${channel.name}`);
					}
				}
			}

			console.log(`✅ Finished creating channels. Created: ${created.length}, Errors: ${errorList.length}`);
			setCreatedChannels(created);
			setErrors(errorList);
			setIsCreating(false);
		};

		createChannelsAndDiscussions();
	}, [createChannel, getChannelInfo, hasRun]);

	return {
		isCreating,
		createdChannels,
		errors,
	};
};
