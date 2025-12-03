/**
 * Example: Complete API Integration Component
 * 
 * This file demonstrates how to connect frontend to backend in Rocket.Chat
 * Place this in: apps/meteor/client/views/example/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

// ============================================================================
// 1. CUSTOM HOOK FOR API CALLS
// ============================================================================

interface UseAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useAPI<T>(
  endpoint: string,
  options?: RequestInit
): UseAPIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await APIClient.get(endpoint, options);
      setData(response as T);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// 2. API SERVICE LAYER
// ============================================================================

export const RocketChatAPI = {
  // User APIs
  async getCurrentUser() {
    return await APIClient.get('/api/v1/me');
  },

  async getUserInfo(userId: string) {
    return await APIClient.get('/api/v1/users.info', { userId });
  },

  async updateUser(userId: string, data: any) {
    return await APIClient.post('/api/v1/users.update', { userId, data });
  },

  // Channel APIs
  async getJoinedChannels() {
    return await APIClient.get('/api/v1/channels.list.joined');
  },

  async createChannel(name: string, members: string[] = []) {
    return await APIClient.post('/api/v1/channels.create', { name, members });
  },

  async joinChannel(roomId: string) {
    return await APIClient.post('/api/v1/channels.join', { roomId });
  },

  // Message APIs
  async sendMessage(roomId: string, text: string) {
    return await APIClient.post('/api/v1/chat.postMessage', { roomId, text });
  },

  async getChannelHistory(roomId: string, count: number = 50) {
    return await APIClient.get('/api/v1/channels.history', { roomId, count });
  },

  async updateMessage(roomId: string, msgId: string, text: string) {
    return await APIClient.post('/api/v1/chat.update', { roomId, msgId, text });
  },

  async deleteMessage(roomId: string, msgId: string) {
    return await APIClient.post('/api/v1/chat.delete', { roomId, msgId });
  },
};

// ============================================================================
// 3. EXAMPLE COMPONENT: USER PROFILE
// ============================================================================

export const UserProfileExample: React.FC = () => {
  const { data: user, loading, error, refetch } = useAPI('/api/v1/me');

  if (loading) {
    return <div className="loading">Loading user profile...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading profile: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.emails?.[0]?.address}</p>
        <p><strong>Status:</strong> {user.status}</p>
      </div>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};

// ============================================================================
// 4. EXAMPLE COMPONENT: CHANNEL LIST
// ============================================================================

export const ChannelListExample: React.FC = () => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await RocketChatAPI.getJoinedChannels();
      setChannels(response.channels || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading channels...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="channel-list">
      <h2>Your Channels</h2>
      <button onClick={loadChannels}>Refresh</button>
      <ul>
        {channels.map((channel) => (
          <li key={channel._id}>
            <strong>#{channel.name}</strong>
            <span> - {channel.usersCount} members</span>
            <span> - {channel.msgs} messages</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================================
// 5. EXAMPLE COMPONENT: SEND MESSAGE
// ============================================================================

export const SendMessageExample: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setStatus('Please enter a message');
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      await RocketChatAPI.sendMessage(roomId, message);
      setMessage('');
      setStatus('Message sent successfully!');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-message">
      <h3>Send Message</h3>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
};

// ============================================================================
// 6. EXAMPLE COMPONENT: COMPLETE CHAT
// ============================================================================

export const CompleteChatExample: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await RocketChatAPI.getChannelHistory(roomId, 50);
      setMessages(response.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await RocketChatAPI.sendMessage(roomId, newMessage);
      setNewMessage('');
      // Reload messages to show the new one
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="complete-chat">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <button onClick={loadMessages} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="messages-container">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="message">
              <div className="message-header">
                <strong>{msg.u?.username || 'Unknown'}</strong>
                <span className="timestamp">
                  {new Date(msg.ts).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-text">{msg.msg}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// 7. MAIN DEMO COMPONENT
// ============================================================================

export const APIIntegrationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'channels' | 'chat'>('profile');
  const [selectedRoomId, setSelectedRoomId] = useState('GENERAL');

  return (
    <div className="api-demo">
      <h1>Rocket.Chat API Integration Demo</h1>
      
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'active' : ''}
        >
          User Profile
        </button>
        <button 
          onClick={() => setActiveTab('channels')}
          className={activeTab === 'channels' ? 'active' : ''}
        >
          Channels
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'active' : ''}
        >
          Chat
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && <UserProfileExample />}
        {activeTab === 'channels' && <ChannelListExample />}
        {activeTab === 'chat' && <CompleteChatExample roomId={selectedRoomId} />}
      </div>
    </div>
  );
};

// ============================================================================
// 8. USAGE INSTRUCTIONS
// ============================================================================

/*
To use this in your Rocket.Chat app:

1. Place this file in: apps/meteor/client/views/example/APIIntegrationDemo.tsx

2. Import and use in your app:
   import { APIIntegrationDemo } from './views/example/APIIntegrationDemo';
   
3. Render the component:
   <APIIntegrationDemo />

4. Or use individual components:
   <UserProfileExample />
   <ChannelListExample />
   <CompleteChatExample roomId="GENERAL" />

5. Or use the API service directly:
   import { RocketChatAPI } from './views/example/APIIntegrationDemo';
   
   const user = await RocketChatAPI.getCurrentUser();
   const channels = await RocketChatAPI.getJoinedChannels();
   await RocketChatAPI.sendMessage('GENERAL', 'Hello!');
*/

export default APIIntegrationDemo;
