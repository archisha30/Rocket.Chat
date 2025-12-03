import { useState, useCallback } from 'react';
import { rocketchatApi } from '../api/rocketchatApi';
import type { UserInfoResponse, ChannelsListResponse } from '../api/rocketchatApi';

export const useRocketChatActions = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Get current user information
	 */
	const getCurrentUser = useCallback(async (): Promise<UserInfoResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const userInfo = await rocketchatApi.getUserInfo();
			return userInfo;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to get user info');
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Get list of joined channels
	 */
	const getJoinedChannels = useCallback(async (): Promise<ChannelsListResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const channels = await rocketchatApi.getJoinedChannels();
			return channels;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to get channels');
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Send a message to a channel
	 */
	const sendMessage = useCallback(async (roomId: string, text: string): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			const result = await rocketchatApi.postMessage(roomId, text);
			return result.success;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send message');
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Run a slash command
	 */
	const runCommand = useCallback(async (command: string, roomId: string, params?: string): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			const result = await rocketchatApi.runCommand(command, roomId, params);
			return result.success;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to run command');
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Check if user is authenticated
	 */
	const isAuthenticated = useCallback((): boolean => {
		return rocketchatApi.isAuthenticated();
	}, []);

	return {
		getCurrentUser,
		getJoinedChannels,
		sendMessage,
		runCommand,
		isAuthenticated,
		loading,
		error,
	};
};
