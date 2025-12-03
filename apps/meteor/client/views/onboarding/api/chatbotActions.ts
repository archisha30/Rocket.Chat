/**
 * Chatbot Actions - Advanced API Integration
 * Demonstrates usage of all Rocket.Chat APIs in the onboarding chatbot
 */

import RocketChatAPI from './rocketchatApi';

export class ChatbotActions {
	private api: RocketChatAPI;

	constructor() {
		this.api = new RocketChatAPI();
	}

	// ============= User Onboarding Actions =============

	/**
	 * Complete user profile setup
	 */
	async setupUserProfile(profile: {
		name?: string;
		status?: string;
		avatarUrl?: string;
	}): Promise<{ success: boolean; message: string }> {
		try {
			const userId = this.api.getCurrentUserId();
			if (!userId) {
				return { success: false, message: 'User not authenticated' };
			}

			// Update user profile
			if (profile.name) {
				await this.api.updateUser(userId, { name: profile.name });
			}

			// Set user status
			if (profile.status) {
				await this.api.setUserStatus('online', profile.status);
			}

			// Set avatar if provided
			if (profile.avatarUrl) {
				await this.api.setUserAvatar(profile.avatarUrl);
			}

			return { success: true, message: 'Profile updated successfully!' };
		} catch (error) {
			console.error('Setup profile error:', error);
			return { success: false, message: 'Failed to update profile' };
		}
	}

	/**
	 * Create welcome channels based on user interests
	 */
	async createWelcomeChannels(interests: string[]): Promise<{ success: boolean; channels: any[] }> {
		try {
			const channelPromises = interests.map(async (interest) => {
				const channelName = `${interest.toLowerCase().replace(/\s+/g, '-')}-discussion`;
				try {
					const result = await this.api.createChannel(channelName, [], false);
					return { name: channelName, id: result.channel?._id, success: true };
				} catch (error) {
					// Channel might already exist
					return { name: channelName, success: false, error };
				}
			});

			const channels = await Promise.all(channelPromises);
			return { success: true, channels };
		} catch (error) {
			console.error('Create welcome channels error:', error);
			return { success: false, channels: [] };
		}
	}

	/**
	 * Join recommended channels based on user role
	 */
	async joinRecommendedChannels(role: string): Promise<{ success: boolean; joined: string[] }> {
		try {
			const recommendedChannels: Record<string, string[]> = {
				developer: ['general', 'dev-team', 'tech-support'],
				designer: ['general', 'design-team', 'creative'],
				manager: ['general', 'management', 'announcements'],
				support: ['general', 'support-team', 'customer-success'],
			};

			const channels = recommendedChannels[role.toLowerCase()] || ['general'];
			const joined: string[] = [];

			for (const channelName of channels) {
				try {
					// Try to find and join the channel
					const channelsList = await this.api.getJoinedChannels();
					const channel = channelsList.channels?.find((ch) => ch.name === channelName);
					
					if (channel) {
						await this.api.joinChannel(channel._id);
						joined.push(channelName);
					}
				} catch (error) {
					console.error(`Failed to join ${channelName}:`, error);
				}
			}

			return { success: true, joined };
		} catch (error) {
			console.error('Join recommended channels error:', error);
			return { success: false, joined: [] };
		}
	}

	/**
	 * Send welcome messages to channels
	 */
	async sendWelcomeMessages(userName: string, role: string): Promise<{ success: boolean }> {
		try {
			const channels = await this.api.getJoinedChannels();
			
			if (channels.success && channels.channels.length > 0) {
				// Send welcome message to general channel
				const generalChannel = channels.channels.find((ch) => ch.name === 'general');
				
				if (generalChannel) {
					await this.api.postMessage(
						generalChannel._id,
						`👋 Hi everyone! I'm ${userName}, a new ${role} joining the team. Excited to be here!`
					);
				}
			}

			return { success: true };
		} catch (error) {
			console.error('Send welcome messages error:', error);
			return { success: false };
		}
	}

	// ============= Interactive Chat Actions =============

	/**
	 * Create a team collaboration space
	 */
	async createTeamSpace(teamName: string, members: string[]): Promise<{ success: boolean; roomId?: string }> {
		try {
			const result = await this.api.createGroup(teamName, members);
			
			if (result.success && result.group) {
				// Send welcome message to the group
				await this.api.postMessage(
					result.group._id,
					`🎉 Welcome to ${teamName}! This is your team's private collaboration space.`
				);

				return { success: true, roomId: result.group._id };
			}

			return { success: false };
		} catch (error) {
			console.error('Create team space error:', error);
			return { success: false };
		}
	}

	/**
	 * Setup direct messaging with team members
	 */
	async setupDirectMessages(usernames: string[]): Promise<{ success: boolean; dms: any[] }> {
		try {
			const dmPromises = usernames.map(async (username) => {
				try {
					const result = await this.api.createDirectMessage(username);
					return { username, success: true, room: result.room };
				} catch (error) {
					return { username, success: false, error };
				}
			});

			const dms = await Promise.all(dmPromises);
			return { success: true, dms };
		} catch (error) {
			console.error('Setup DMs error:', error);
			return { success: false, dms: [] };
		}
	}

	/**
	 * Search for helpful messages or documentation
	 */
	async searchHelpfulContent(query: string, roomId: string): Promise<{ success: boolean; results: any[] }> {
		try {
			const result = await this.api.searchMessages(roomId, query);
			return { success: true, results: result.messages || [] };
		} catch (error) {
			console.error('Search content error:', error);
			return { success: false, results: [] };
		}
	}

	/**
	 * Get channel history for context
	 */
	async getChannelContext(roomId: string, messageCount: number = 10): Promise<{ success: boolean; messages: any[] }> {
		try {
			const result = await this.api.getChannelHistory(roomId, undefined, undefined, messageCount);
			return { success: true, messages: result.messages || [] };
		} catch (error) {
			console.error('Get channel context error:', error);
			return { success: false, messages: [] };
		}
	}

	// ============= Gamification & Engagement =============

	/**
	 * React to messages with emojis
	 */
	async celebrateMessage(messageId: string, emoji: string = '🎉'): Promise<{ success: boolean }> {
		try {
			await this.api.reactToMessage(messageId, emoji);
			return { success: true };
		} catch (error) {
			console.error('Celebrate message error:', error);
			return { success: false };
		}
	}

	/**
	 * Send achievement notification
	 */
	async sendAchievement(roomId: string, achievement: string): Promise<{ success: boolean }> {
		try {
			await this.api.postMessage(
				roomId,
				`🏆 Achievement Unlocked: ${achievement}!`
			);
			return { success: true };
		} catch (error) {
			console.error('Send achievement error:', error);
			return { success: false };
		}
	}

	// ============= Admin & Setup Actions =============

	/**
	 * Get server settings for customization
	 */
	async getServerInfo(): Promise<{ success: boolean; settings: any }> {
		try {
			const settings = await this.api.getPublicSettings();
			return { success: true, settings };
		} catch (error) {
			console.error('Get server info error:', error);
			return { success: false, settings: null };
		}
	}

	/**
	 * Get available roles for user assignment
	 */
	async getAvailableRoles(): Promise<{ success: boolean; roles: any[] }> {
		try {
			const result = await this.api.getRoles();
			return { success: true, roles: result.roles || [] };
		} catch (error) {
			console.error('Get roles error:', error);
			return { success: false, roles: [] };
		}
	}

	/**
	 * Assign role to user (for admin actions)
	 */
	async assignUserRole(username: string, roleName: string): Promise<{ success: boolean }> {
		try {
			await this.api.addUserToRole(roleName, username);
			return { success: true };
		} catch (error) {
			console.error('Assign role error:', error);
			return { success: false };
		}
	}

	// ============= File & Media Actions =============

	/**
	 * Upload welcome document or guide
	 */
	async uploadWelcomeGuide(roomId: string, file: File): Promise<{ success: boolean }> {
		try {
			await this.api.uploadFile(roomId, file, 'Welcome Guide - Getting Started');
			return { success: true };
		} catch (error) {
			console.error('Upload guide error:', error);
			return { success: false };
		}
	}

	// ============= Command Execution =============

	/**
	 * Execute slash commands for quick actions
	 */
	async executeCommand(command: string, roomId: string, params?: string): Promise<{ success: boolean }> {
		try {
			await this.api.runCommand(command, roomId, params);
			return { success: true };
		} catch (error) {
			console.error('Execute command error:', error);
			return { success: false };
		}
	}

	/**
	 * Show available commands to user
	 */
	async showAvailableCommands(roomId: string): Promise<{ success: boolean }> {
		try {
			await this.api.postMessage(
				roomId,
				`📋 **Available Commands:**\n` +
				`• \`/help\` - Show help information\n` +
				`• \`/invite @username\` - Invite user to channel\n` +
				`• \`/join #channel\` - Join a channel\n` +
				`• \`/leave\` - Leave current channel\n` +
				`• \`/me message\` - Send action message\n` +
				`• \`/mute @username\` - Mute user\n` +
				`• \`/topic new topic\` - Set channel topic`
			);
			return { success: true };
		} catch (error) {
			console.error('Show commands error:', error);
			return { success: false };
		}
	}

	// ============= User List & Discovery =============

	/**
	 * Get list of users for team discovery
	 */
	async discoverTeamMembers(): Promise<{ success: boolean; users: any[] }> {
		try {
			const result = await this.api.listUsers();
			return { success: true, users: result.users || [] };
		} catch (error) {
			console.error('Discover team error:', error);
			return { success: false, users: [] };
		}
	}

	/**
	 * Get user info for profile display
	 */
	async getUserProfile(userId: string): Promise<{ success: boolean; user: any }> {
		try {
			const result = await this.api.getUserInfo(userId);
			return { success: true, user: result.user };
		} catch (error) {
			console.error('Get user profile error:', error);
			return { success: false, user: null };
		}
	}

	// ============= Utility Methods =============

	/**
	 * Check authentication status
	 */
	isAuthenticated(): boolean {
		return this.api.isAuthenticated();
	}

	/**
	 * Get current user ID
	 */
	getCurrentUserId(): string | null {
		return this.api.getCurrentUserId();
	}

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		try {
			await this.api.logoutApi();
		} catch (error) {
			console.error('Logout error:', error);
		}
	}
}

// Export singleton instance
export const chatbotActions = new ChatbotActions();
