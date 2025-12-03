/**
 * Rocket.Chat REST API Service
 * Comprehensive API client for all Rocket.Chat endpoints
 */

// ============= Type Definitions =============

interface LoginResponse {
	status: string;
	data: {
		userId: string;
		authToken: string;
		me: {
			_id: string;
			username: string;
			name: string;
			emails: Array<{ address: string; verified: boolean }>;
		};
	};
}

interface PostMessageResponse {
	success: boolean;
	message: {
		_id: string;
		rid: string;
		msg: string;
		ts: string;
		u: { _id: string; username: string; name: string };
	};
}

interface UserInfoResponse {
	user: {
		_id: string;
		username: string;
		name: string;
		status: string;
		avatarUrl?: string;
		emails?: Array<{ address: string; verified: boolean }>;
		roles?: string[];
	};
	success: boolean;
}

interface UserCreateResponse {
	user: {
		_id: string;
		username: string;
		name: string;
		emails: Array<{ address: string; verified: boolean }>;
	};
	success: boolean;
}

interface ChannelResponse {
	channel: {
		_id: string;
		name: string;
		t: string;
		msgs: number;
		usersCount: number;
	};
	success: boolean;
}

interface ChannelsListResponse {
	channels: Array<{
		_id: string;
		name: string;
		t: string;
		msgs: number;
		usersCount: number;
	}>;
	success: boolean;
}

interface MessageHistoryResponse {
	messages: Array<{
		_id: string;
		msg: string;
		ts: string;
		u: { _id: string; username: string; name: string };
	}>;
	success: boolean;
}

interface SettingsResponse {
	settings: Array<{
		_id: string;
		value: any;
	}>;
	success: boolean;
}

interface RolesResponse {
	roles: Array<{
		_id: string;
		name: string;
		description?: string;
	}>;
	success: boolean;
}

interface CommandRunResponse {
	success: boolean;
}

class RocketChatAPI {
	private baseUrl: string;
	private authToken: string | null = null;
	private userId: string | null = null;

	constructor() {
		// Use current host for API calls
		this.baseUrl = window.location.origin;
		
		// Try to get existing auth from localStorage
		this.authToken = localStorage.getItem('rc_token');
		this.userId = localStorage.getItem('rc_uid');
	}

	// ============= Authentication APIs =============

	/**
	 * POST /api/v1/login
	 * Authenticate user with username/password
	 */
	async login(username: string, password: string): Promise<LoginResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ user: username, password }),
			});

			const data = await response.json();

			if (data.status === 'success') {
				this.authToken = data.data.authToken;
				this.userId = data.data.userId;
				
				// Store for future use
				localStorage.setItem('rc_token', this.authToken);
				localStorage.setItem('rc_uid', this.userId);
			}

			return data;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/logout
	 * Logout current user
	 */
	async logoutApi(): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/logout`, {
				method: 'POST',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			const data = await response.json();
			this.logout();
			return data;
		} catch (error) {
			console.error('Logout error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/me
	 * Get current user information
	 */
	async getMe(): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/me`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get me error:', error);
			throw error;
		}
	}

	// ============= User Management APIs =============

	/**
	 * POST /api/v1/users.create
	 * Create a new user
	 */
	async createUser(userData: {
		name: string;
		email: string;
		password: string;
		username: string;
		roles?: string[];
	}): Promise<UserCreateResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify(userData),
			});

			return await response.json();
		} catch (error) {
			console.error('Create user error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/users.update
	 * Update user information
	 */
	async updateUser(userId: string, data: any): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ userId, data }),
			});

			return await response.json();
		} catch (error) {
			console.error('Update user error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/users.info
	 * Get user information
	 */
	async getUserInfo(userId?: string): Promise<UserInfoResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		const targetUserId = userId || this.userId;

		try {
			const response = await fetch(
				`${this.baseUrl}/api/v1/users.info?userId=${targetUserId}`,
				{
					method: 'GET',
					headers: {
						'X-Auth-Token': this.authToken,
						'X-User-Id': this.userId,
					},
				}
			);

			return await response.json();
		} catch (error) {
			console.error('Get user info error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/users.list
	 * Get list of users
	 */
	async listUsers(query?: any): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const queryString = query ? `?query=${JSON.stringify(query)}` : '';
			const response = await fetch(`${this.baseUrl}/api/v1/users.list${queryString}`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('List users error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/users.setAvatar
	 * Set user avatar
	 */
	async setUserAvatar(avatarUrl: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.setAvatar`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ avatarUrl }),
			});

			return await response.json();
		} catch (error) {
			console.error('Set avatar error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/users.delete
	 * Delete a user
	 */
	async deleteUser(userId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.delete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ userId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Delete user error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/users.setStatus
	 * Set user status
	 */
	async setUserStatus(status: string, message?: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.setStatus`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ status, message }),
			});

			return await response.json();
		} catch (error) {
			console.error('Set status error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/users.createToken
	 * Create authentication token for a user
	 */
	async createUserToken(userId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/users.createToken`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ userId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Create token error:', error);
			throw error;
		}
	}

	// ============= Messaging APIs =============

	/**
	 * POST /api/v1/chat.postMessage
	 * Send a message to a channel
	 */
	async postMessage(roomId: string, text: string): Promise<PostMessageResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/chat.postMessage`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId, text }),
			});

			return await response.json();
		} catch (error) {
			console.error('Post message error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/chat.update
	 * Update a message
	 */
	async updateMessage(roomId: string, msgId: string, text: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/chat.update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId, msgId, text }),
			});

			return await response.json();
		} catch (error) {
			console.error('Update message error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/chat.delete
	 * Delete a message
	 */
	async deleteMessage(roomId: string, msgId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/chat.delete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId, msgId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Delete message error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/chat.getMessage
	 * Get a specific message
	 */
	async getMessage(msgId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/chat.getMessage?msgId=${msgId}`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get message error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/chat.react
	 * Add reaction to a message
	 */
	async reactToMessage(messageId: string, emoji: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/chat.react`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ messageId, emoji }),
			});

			return await response.json();
		} catch (error) {
			console.error('React to message error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/chat.search
	 * Search messages
	 */
	async searchMessages(roomId: string, searchText: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/api/v1/chat.search?roomId=${roomId}&searchText=${encodeURIComponent(searchText)}`,
				{
					method: 'GET',
					headers: {
						'X-Auth-Token': this.authToken,
						'X-User-Id': this.userId,
					},
				}
			);

			return await response.json();
		} catch (error) {
			console.error('Search messages error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/users.info
	 * Get user information
	 */
	async getUserInfo(userId?: string): Promise<UserInfoResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		const targetUserId = userId || this.userId;

		try {
			const response = await fetch(
				`${this.baseUrl}/api/v1/users.info?userId=${targetUserId}`,
				{
					method: 'GET',
					headers: {
						'X-Auth-Token': this.authToken,
						'X-User-Id': this.userId,
					},
				}
			);

			return await response.json();
		} catch (error) {
			console.error('Get user info error:', error);
			throw error;
		}
	}

	// ============= Channel / Room APIs =============

	/**
	 * POST /api/v1/channels.create
	 * Create a new channel
	 */
	async createChannel(name: string, members?: string[], readOnly?: boolean): Promise<ChannelResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ name, members, readOnly }),
			});

			return await response.json();
		} catch (error) {
			console.error('Create channel error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/channels.invite
	 * Invite user to a channel
	 */
	async inviteToChannel(roomId: string, userId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.invite`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId, userId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Invite to channel error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/channels.join
	 * Join a channel
	 */
	async joinChannel(roomId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Join channel error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/channels.history
	 * Get channel message history
	 */
	async getChannelHistory(roomId: string, latest?: string, oldest?: string, count?: number): Promise<MessageHistoryResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			let url = `${this.baseUrl}/api/v1/channels.history?roomId=${roomId}`;
			if (latest) url += `&latest=${latest}`;
			if (oldest) url += `&oldest=${oldest}`;
			if (count) url += `&count=${count}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get channel history error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/channels.leave
	 * Leave a channel
	 */
	async leaveChannel(roomId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.leave`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roomId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Leave channel error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/channels.list.joined
	 * Get list of channels the user has joined
	 */
	async getJoinedChannels(): Promise<ChannelsListResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.list.joined`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get joined channels error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/groups.create
	 * Create a private group
	 */
	async createGroup(name: string, members?: string[]): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/groups.create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ name, members }),
			});

			return await response.json();
		} catch (error) {
			console.error('Create group error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/im.create
	 * Create a direct message
	 */
	async createDirectMessage(username: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/im.create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ username }),
			});

			return await response.json();
		} catch (error) {
			console.error('Create DM error:', error);
			throw error;
		}
	}

	// ============= File Upload API =============

	/**
	 * POST /api/v1/rooms.upload/:roomId
	 * Upload a file to a room
	 */
	async uploadFile(roomId: string, file: File, description?: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const formData = new FormData();
			formData.append('file', file);
			if (description) {
				formData.append('description', description);
			}

			const response = await fetch(`${this.baseUrl}/api/v1/rooms.upload/${roomId}`, {
				method: 'POST',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: formData,
			});

			return await response.json();
		} catch (error) {
			console.error('Upload file error:', error);
			throw error;
		}
	}

	// ============= Livechat APIs =============

	/**
	 * POST /api/v1/livechat/room
	 * Create a livechat room
	 */
	async createLivechatRoom(token: string, rid?: string): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/livechat/room`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, rid }),
			});

			return await response.json();
		} catch (error) {
			console.error('Create livechat room error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/livechat/message
	 * Send a livechat message
	 */
	async sendLivechatMessage(token: string, rid: string, msg: string): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/livechat/message`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, rid, msg }),
			});

			return await response.json();
		} catch (error) {
			console.error('Send livechat message error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/livechat/messages
	 * Get livechat messages
	 */
	async getLivechatMessages(token: string, rid: string): Promise<any> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/v1/livechat/messages?token=${token}&rid=${rid}`,
				{
					method: 'GET',
				}
			);

			return await response.json();
		} catch (error) {
			console.error('Get livechat messages error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/livechat/visitor
	 * Register a livechat visitor
	 */
	async registerLivechatVisitor(visitor: { token: string; name: string; email?: string; phone?: string }): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/livechat/visitor`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ visitor }),
			});

			return await response.json();
		} catch (error) {
			console.error('Register livechat visitor error:', error);
			throw error;
		}
	}

	// ============= Apps Engine APIs =============

	/**
	 * POST /api/v1/apps/install
	 * Install an app
	 */
	async installApp(appId: string, version: string, permissionsGranted?: any): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/apps/install`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ appId, version, permissionsGranted }),
			});

			return await response.json();
		} catch (error) {
			console.error('Install app error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/apps/update
	 * Update an app
	 */
	async updateApp(appId: string, version: string, permissionsGranted?: any): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/apps/update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ appId, version, permissionsGranted }),
			});

			return await response.json();
		} catch (error) {
			console.error('Update app error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/apps/uninstall
	 * Uninstall an app
	 */
	async uninstallApp(appId: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/apps/uninstall`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ appId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Uninstall app error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/apps
	 * Get list of installed apps
	 */
	async getApps(): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/apps`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get apps error:', error);
			throw error;
		}
	}

	// ============= Admin / Server APIs =============

	/**
	 * GET /api/v1/settings.public
	 * Get public settings
	 */
	async getPublicSettings(): Promise<SettingsResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/v1/settings.public`, {
				method: 'GET',
			});

			return await response.json();
		} catch (error) {
			console.error('Get public settings error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/settings
	 * Get all settings (requires admin)
	 */
	async getSettings(): Promise<SettingsResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/settings`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get settings error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/settings/:_id
	 * Update a setting
	 */
	async updateSetting(settingId: string, value: any): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/settings/${settingId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ value }),
			});

			return await response.json();
		} catch (error) {
			console.error('Update setting error:', error);
			throw error;
		}
	}

	/**
	 * GET /api/v1/roles.list
	 * Get list of roles
	 */
	async getRoles(): Promise<RolesResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/roles.list`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
			});

			return await response.json();
		} catch (error) {
			console.error('Get roles error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/roles.addUserToRole
	 * Add user to a role
	 */
	async addUserToRole(roleName: string, username: string, roomId?: string): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/roles.addUserToRole`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ roleName, username, roomId }),
			});

			return await response.json();
		} catch (error) {
			console.error('Add user to role error:', error);
			throw error;
		}
	}

	/**
	 * POST /api/v1/permissions.update
	 * Update permissions
	 */
	async updatePermissions(permissions: Array<{ _id: string; roles: string[] }>): Promise<any> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/permissions.update`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ permissions }),
			});

			return await response.json();
		} catch (error) {
			console.error('Update permissions error:', error);
			throw error;
		}
	}

	// ============= Commands API =============

	/**
	 * POST /api/v1/commands.run
	 * Run a slash command
	 */
	async runCommand(command: string, roomId: string, params?: string): Promise<CommandRunResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/commands.run`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': this.authToken,
					'X-User-Id': this.userId,
				},
				body: JSON.stringify({ command, roomId, params }),
			});

			return await response.json();
		} catch (error) {
			console.error('Run command error:', error);
			throw error;
		}
	}

	// ============= Utility Methods =============

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return !!(this.authToken && this.userId);
	}

	/**
	 * Get current user ID
	 */
	getCurrentUserId(): string | null {
		return this.userId;
	}

	/**
	 * Get current auth token
	 */
	getAuthToken(): string | null {
		return this.authToken;
	}

	/**
	 * Logout and clear credentials
	 */
	logout(): void {
		this.authToken = null;
		this.userId = null;
		localStorage.removeItem('rc_token');
		localStorage.removeItem('rc_uid');
	}
}

// Export singleton instance
export const rocketchatApi = new RocketChatAPI();

// Also export the class for custom instances
export default RocketChatAPI;

// Export types
export type {
	LoginResponse,
	PostMessageResponse,
	UserInfoResponse,
	UserCreateResponse,
	ChannelResponse,
	ChannelsListResponse,
	MessageHistoryResponse,
	SettingsResponse,
	RolesResponse,
	CommandRunResponse,
};
