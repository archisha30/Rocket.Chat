# Frontend to Backend Connection Guide

## Overview

This guide shows you how to connect the Rocket.Chat frontend to the backend using the existing API infrastructure.

## Architecture

```
Frontend (React/Meteor Client)
    ↓
APIClient (RestApiClient)
    ↓
HTTP REST API
    ↓
Backend Server (Meteor Server)
    ↓
Database (MongoDB)
```

## 1. Using the Existing API Client

Rocket.Chat already has a configured API client at:
`apps/meteor/app/utils/client/lib/RestApiClient.ts`

### Import and Use

```typescript
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

// Example: Get current user info
const getUserInfo = async () => {
  try {
    const response = await APIClient.get('/api/v1/me');
    return response;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Example: Send a message
const sendMessage = async (roomId: string, text: string) => {
  try {
    const response = await APIClient.post('/api/v1/chat.postMessage', {
      roomId,
      text,
    });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Example: Get channels
const getChannels = async () => {
  try {
    const response = await APIClient.get('/api/v1/channels.list.joined');
    return response;
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};
```

## 2. Creating a React Hook for API Calls

Create a custom hook to manage API calls with loading and error states:

```typescript
// hooks/useRocketChatAPI.ts
import { useState, useCallback } from 'react';
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

export const useRocketChatAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callAPI = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (method) {
        case 'get':
          response = await APIClient.get(endpoint);
          break;
        case 'post':
          response = await APIClient.post(endpoint, data);
          break;
        case 'put':
          response = await APIClient.put(endpoint, data);
          break;
        case 'delete':
          response = await APIClient.delete(endpoint);
          break;
      }
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callAPI, loading, error };
};
```

## 3. Using the Hook in a Component

```typescript
// Example Component
import React, { useEffect, useState } from 'react';
import { useRocketChatAPI } from './hooks/useRocketChatAPI';

export const UserProfile = () => {
  const { callAPI, loading, error } = useRocketChatAPI();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await callAPI('get', '/api/v1/me');
        setUser(response);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, [callAPI]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Username: {user.username}</p>
      <p>Email: {user.emails?.[0]?.address}</p>
    </div>
  );
};
```

## 4. Common API Endpoints

### User Management
- `GET /api/v1/me` - Get current user
- `GET /api/v1/users.info` - Get user info
- `POST /api/v1/users.update` - Update user
- `POST /api/v1/users.setAvatar` - Set avatar

### Channels
- `GET /api/v1/channels.list.joined` - Get joined channels
- `POST /api/v1/channels.create` - Create channel
- `POST /api/v1/channels.join` - Join channel
- `POST /api/v1/channels.invite` - Invite to channel

### Messaging
- `POST /api/v1/chat.postMessage` - Send message
- `GET /api/v1/chat.getMessage` - Get message
- `POST /api/v1/chat.update` - Update message
- `POST /api/v1/chat.delete` - Delete message

### Rooms
- `GET /api/v1/rooms.get` - Get room info
- `GET /api/v1/rooms.info` - Get room details

## 5. Authentication

The APIClient automatically handles authentication using Meteor's account system:

```typescript
// Authentication is handled automatically
// The client reads credentials from:
// - Accounts.storageLocation.getItem(Accounts.USER_ID_KEY)
// - Accounts.storageLocation.getItem(Accounts.LOGIN_TOKEN_KEY)

// These are set when user logs in via Meteor.loginWithPassword()
```

## 6. Error Handling

```typescript
const handleAPICall = async () => {
  try {
    const response = await APIClient.get('/api/v1/me');
    return response;
  } catch (error) {
    // Error is already parsed from Response.json()
    if (error.error) {
      console.error('API Error:', error.error);
      console.error('Message:', error.message);
    }
    throw error;
  }
};
```

## 7. Complete Example: Chat Component

```typescript
import React, { useState, useEffect } from 'react';
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

export const ChatComponent = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await APIClient.get(`/api/v1/channels.history`, {
          roomId,
          count: 50,
        });
        setMessages(response.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [roomId]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await APIClient.post('/api/v1/chat.postMessage', {
        roomId,
        text: newMessage,
      });
      setNewMessage('');
      // Refresh messages
      const response = await APIClient.get(`/api/v1/channels.history`, {
        roomId,
        count: 50,
      });
      setMessages(response.messages);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.u.username}:</strong> {msg.msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
```

## 8. TypeScript Types

The API client uses types from `@rocket.chat/rest-typings`:

```typescript
import type { Serialized } from '@rocket.chat/core-typings';
import type { IUser, IRoom, IMessage } from '@rocket.chat/core-typings';

// Example typed API call
const getUser = async (userId: string): Promise<Serialized<IUser>> => {
  const response = await APIClient.get('/api/v1/users.info', { userId });
  return response.user;
};
```

## 9. Real-time Updates

For real-time updates, use Meteor's DDP (Distributed Data Protocol):

```typescript
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

// Subscribe to room messages
Meteor.subscribe('stream-room-messages', roomId);

// React to changes
Tracker.autorun(() => {
  const messages = Messages.find({ rid: roomId }).fetch();
  // Update your component state
});
```

## 10. Best Practices

1. **Always handle errors** - API calls can fail
2. **Show loading states** - Improve UX
3. **Use TypeScript** - Get type safety
4. **Cache responses** - Reduce API calls
5. **Debounce requests** - Avoid rate limiting
6. **Use React Query** - For advanced data fetching

## 11. Testing API Calls

```typescript
// In browser console
import { APIClient } from './app/utils/client/lib/RestApiClient';

// Test getting user info
APIClient.get('/api/v1/me').then(console.log);

// Test sending message
APIClient.post('/api/v1/chat.postMessage', {
  roomId: 'GENERAL',
  text: 'Hello from API!'
}).then(console.log);
```

## Summary

The frontend connects to the backend through:
1. **APIClient** - Pre-configured REST client
2. **Meteor DDP** - Real-time subscriptions
3. **REST API** - HTTP endpoints at `/api/v1/*`

All authentication is handled automatically via Meteor's account system. Just import `APIClient` and start making calls!
