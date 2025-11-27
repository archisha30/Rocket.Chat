/**
 * Rocket.Chat REST API Service
 * Handles authentication and API calls for the onboarding chatbot
 */

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
	};
}

interface UserInfoResponse {
	user: {
		_id: string;
		username: string;
		name: string;
		status: string;
		avatarUrl?: string;
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
	 * GET /api/v1/channels.listJoined
	 * Get list of channels the user has joined
	 */
	async getJoinedChannels(): Promise<ChannelsListResponse> {
		if (!this.authToken || !this.userId) {
			throw new Error('Not authenticated. Please login first.');
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/v1/channels.listJoined`, {
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

// Export types
export type {
	LoginResponse,
	PostMessageResponse,
	UserInfoResponse,
	ChannelsListResponse,
	CommandRunResponse,
};
