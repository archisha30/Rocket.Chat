import { Meteor } from 'meteor/meteor';
import { Rooms } from '@rocket.chat/models';

// Setup default channels on server startup
Meteor.startup(async () => {
	try {
		// Check if default channels already exist
		const existingChannels = await Rooms.find({
			name: { $in: ['teams', 'discussion', 'schedules', 'tech-talk', 'product-ideas', 'random'] },
		}).toArray();

		const channelNames = existingChannels.map((c) => c.name);

		// Create default public channels if they don't exist
		const defaultChannels = [
			{ name: 'teams', description: '👥 Collaborate with your team members', type: 'c' },
			{ name: 'discussion', description: '💬 General discussions and ideas', type: 'c' },
			{ name: 'schedules', description: '📅 Meeting schedules and calendar', type: 'c' },
		];

		// Create default private groups if they don't exist
		const defaultGroups = [
			{ name: 'tech-talk', description: '💻 Technical discussions and solutions', type: 'p' },
			{ name: 'product-ideas', description: '💡 Product features and improvements', type: 'p' },
			{ name: 'random', description: '🎲 Off-topic and casual conversations', type: 'p' },
		];

		for (const channel of defaultChannels) {
			if (!channelNames.includes(channel.name)) {
				try {
					await Rooms.insertOne({
						_id: `${channel.name}-${Date.now()}`,
						name: channel.name,
						fname: channel.name,
						t: channel.type,
						description: channel.description,
						msgs: 0,
						usersCount: 0,
						ts: new Date(),
						ro: false,
						default: true,
						sysMes: true,
						_updatedAt: new Date(),
					} as any);
					console.log(`✅ Created default channel: ${channel.name}`);
				} catch (error) {
					console.log(`Channel ${channel.name} might already exist`);
				}
			}
		}

		for (const group of defaultGroups) {
			if (!channelNames.includes(group.name)) {
				try {
					await Rooms.insertOne({
						_id: `${group.name}-${Date.now()}`,
						name: group.name,
						fname: group.name,
						t: group.type,
						description: group.description,
						msgs: 0,
						usersCount: 0,
						ts: new Date(),
						ro: false,
						default: false,
						sysMes: true,
						_updatedAt: new Date(),
					} as any);
					console.log(`✅ Created default group: ${group.name}`);
				} catch (error) {
					console.log(`Group ${group.name} might already exist`);
				}
			}
		}

		console.log('✅ Default channels and groups setup complete');
	} catch (error) {
		console.error('Error setting up default channels:', error);
	}
});
