import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { API } from '../api';

// Register API endpoint for onboarding completion
API.v1.addRoute(
	'onboarding.complete',
	{ authRequired: false },
	{
		async post() {
			check(this.bodyParams, {
				organization: String,
				role: String,
				channels: String,
			});

			const { organization, role, channels } = this.bodyParams;

			// In a real implementation, you would:
			// 1. Create user account if needed
			// 2. Create/join channels based on preferences
			// 3. Set up teams
			// 4. Configure user profile

			// For now, we'll return success with channel recommendations
			const recommendedChannels = [
				{
					name: 'teams',
					type: 'channel',
					description: 'Collaborate with your team members',
					icon: '👥',
				},
				{
					name: 'discussion',
					type: 'channel',
					description: 'General discussions and ideas',
					icon: '💬',
				},
				{
					name: 'schedules',
					type: 'channel',
					description: 'Meeting schedules and calendar',
					icon: '📅',
				},
			];

			const recommendedGroups = [
				{
					name: 'tech-talk',
					type: 'group',
					description: 'Technical discussions and solutions',
					icon: '💻',
				},
				{
					name: 'product-ideas',
					type: 'group',
					description: 'Product features and improvements',
					icon: '💡',
				},
				{
					name: 'random',
					type: 'group',
					description: 'Off-topic and casual conversations',
					icon: '🎲',
				},
			];

			const recommendedTeams = [
				{
					name: 'project-alpha',
					type: 'team',
					description: 'Main project development team',
					icon: '🚀',
				},
				{
					name: 'debugging-squad',
					type: 'team',
					description: 'Bug fixes and quality assurance',
					icon: '🐛',
				},
			];

			return API.v1.success({
				message: 'Onboarding completed successfully',
				profile: {
					organization,
					role,
					channels,
				},
				recommendations: {
					channels: recommendedChannels,
					groups: recommendedGroups,
					teams: recommendedTeams,
				},
			});
		},
	},
);
