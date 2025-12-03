# 🔌 API Integration Guide - Onboarding ChatBot

## Overview

The onboarding chatbot now integrates with **Rocket.Chat REST APIs** to perform real actions!

---

## 🚀 Integrated APIs

### 1. **POST /api/v1/login**
**Purpose**: Authenticate users

**Usage in Chatbot**:
- Automatic authentication using existing session
- Stores auth token and user ID
- Used for all subsequent API calls

**Code**:
```typescript
await rocketchatApi.login(username, password);
```

---

### 2. **GET /api/v1/users.info**
**Purpose**: Get user information

**Usage in Chatbot**:
- Personalized greeting with user's name
- Display user profile information
- Check user status

**Example**:
```
Bot: "👋 Hi John Doe! I'm your Rocket.Chat assistant..."
```

**Code**:
```typescript
const userInfo = await getCurrentUser();
// Returns: { user: { name, username, status, avatarUrl } }
```

---

### 3. **GET /api/v1/channels.listJoined**
**Purpose**: Get list of channels user has joined

**Usage in Chatbot**:
- Show real channels instead of dummy data
- Display channel statistics (members, messages)
- Help users discover their channels

**Example**:
```
Bot: "🔍 Here are your joined channels:

• #general - 45 members, 1,234 messages
• #random - 32 members, 567 messages
• #help - 12 members, 89 messages"
```

**Code**:
```typescript
const channels = await getJoinedChannels();
// Returns: { channels: [{ name, usersCount, msgs }] }
```

---

### 4. **POST /api/v1/chat.postMessage**
**Purpose**: Send messages to channels

**Usage in Chatbot**:
- Post welcome message to #general
- Announce user completed onboarding
- Automated team notifications

**Example**:
```
Bot: "Would you like me to post a welcome message in #general?"
User: "Yes, Post Welcome"
Bot: "✅ Welcome message posted to #general!"

[In #general channel]
"👋 Hi everyone! John Doe just completed the onboarding. Say hello! 🎉"
```

**Code**:
```typescript
await sendMessage(roomId, "Welcome message text");
```

---

### 5. **POST /api/v1/commands.run**
**Purpose**: Execute slash commands programmatically

**Usage in Chatbot**:
- Run /help command
- Execute /invite command
- Trigger other slash commands

**Example**:
```
Bot: "Let me run the help command for you..."
[Executes: /help]
```

**Code**:
```typescript
await runCommand('help', roomId, params);
```

---

## 📁 File Structure

```
apps/meteor/client/views/onboarding/
├── OnboardingChatBot.tsx          ← Main chatbot (uses APIs)
├── api/
│   └── rocketchatApi.ts           ← API service layer
├── hooks/
│   └── useRocketChatActions.ts    ← React hook for API calls
└── ...
```

---

## 🔧 API Service Layer

### `rocketchatApi.ts`

**Features**:
- Singleton pattern
- Automatic token management
- localStorage persistence
- Error handling
- TypeScript types

**Methods**:
```typescript
class RocketChatAPI {
  login(username, password)
  postMessage(roomId, text)
  getUserInfo(userId?)
  getJoinedChannels()
  runCommand(command, roomId, params?)
  isAuthenticated()
  getCurrentUserId()
  logout()
}
```

---

## 🎣 React Hook

### `useRocketChatActions.ts`

**Features**:
- React hooks pattern
- Loading states
- Error handling
- Memoized callbacks

**Usage**:
```typescript
const {
  getCurrentUser,
  getJoinedChannels,
  sendMessage,
  runCommand,
  isAuthenticated,
  loading,
  error
} = useRocketChatActions();
```

---

## 🎯 Chatbot Features Using APIs

### 1. **Personalized Greeting**
```typescript
// Fetches user info and greets by name
const userInfo = await getCurrentUser();
addBotMessage(`👋 Hi ${userInfo.user.name}!`);
```

### 2. **Real Channel List**
```typescript
// Shows actual joined channels
const channels = await getJoinedChannels();
const channelList = channels.channels
  .map(ch => `• #${ch.name} - ${ch.usersCount} members`)
  .join('\n');
```

### 3. **Welcome Message Posting**
```typescript
// Posts to #general when onboarding completes
const generalChannel = channels.find(ch => ch.name === 'general');
await sendMessage(generalChannel._id, "Welcome message!");
```

### 4. **Command Execution**
```typescript
// Can run any slash command
await runCommand('help', roomId);
await runCommand('invite', roomId, 'user@example.com');
```

---

## 🔐 Authentication

### Automatic Auth
The chatbot uses existing Rocket.Chat session:
- Reads auth token from localStorage
- Uses current user's credentials
- No additional login required

### Token Storage
```typescript
localStorage.setItem('rc_token', authToken);
localStorage.setItem('rc_uid', userId);
```

---

## 🎨 User Experience

### Before (Static)
```
Bot: "Here are some popular channels..."
[Shows dummy data]
```

### After (Dynamic)
```
Bot: "Here are YOUR joined channels..."
[Shows real data from API]

Bot: "Would you like me to post a welcome message?"
[Actually posts to #general]
```

---

## 🔄 API Call Flow

### Example: Posting Welcome Message

```
1. User clicks "Yes, Post Welcome"
   ↓
2. Chatbot calls getJoinedChannels()
   ↓
3. API: GET /api/v1/channels.listJoined
   ↓
4. Find #general channel
   ↓
5. Chatbot calls sendMessage(generalId, text)
   ↓
6. API: POST /api/v1/chat.postMessage
   ↓
7. Message appears in #general
   ↓
8. Bot confirms: "✅ Message posted!"
```

---

## 🛠️ Error Handling

### API Errors
```typescript
try {
  const result = await sendMessage(roomId, text);
  if (result.success) {
    // Success message
  }
} catch (error) {
  // Fallback message
  addBotMessage("Couldn't complete action, but you're all set!");
}
```

### Authentication Errors
```typescript
if (!isAuthenticated()) {
  addBotMessage("Please login to use this feature");
  return;
}
```

---

## 📊 API Response Examples

### User Info Response
```json
{
  "user": {
    "_id": "abc123",
    "username": "john.doe",
    "name": "John Doe",
    "status": "online",
    "avatarUrl": "/avatar/john.doe"
  },
  "success": true
}
```

### Channels List Response
```json
{
  "channels": [
    {
      "_id": "GENERAL",
      "name": "general",
      "t": "c",
      "msgs": 1234,
      "usersCount": 45
    }
  ],
  "success": true
}
```

### Post Message Response
```json
{
  "success": true,
  "message": {
    "_id": "msg123",
    "rid": "GENERAL",
    "msg": "Welcome message!",
    "ts": "2024-11-27T..."
  }
}
```

---

## 🚀 Future Enhancements

- [ ] Upload profile photo via API
- [ ] Create channels programmatically
- [ ] Send invitations via API
- [ ] Update user preferences
- [ ] Join/leave channels
- [ ] Search users and channels
- [ ] File uploads
- [ ] Emoji reactions

---

## 🧪 Testing

### Test API Integration

1. **Open chatbot**
2. **Check greeting**: Should show your name
3. **Ask about channels**: Should show real channels
4. **Complete onboarding**: Option to post welcome message
5. **Check #general**: Welcome message should appear

### Manual API Testing

```typescript
// In browser console
import { rocketchatApi } from './api/rocketchatApi';

// Test user info
const user = await rocketchatApi.getUserInfo();
console.log(user);

// Test channels
const channels = await rocketchatApi.getJoinedChannels();
console.log(channels);
```

---

## 📝 Notes

- APIs use existing user session (no separate login)
- All API calls are authenticated automatically
- Errors are handled gracefully with fallbacks
- Loading states prevent duplicate calls
- TypeScript provides type safety

---

**The chatbot now performs real actions using Rocket.Chat APIs!** 🎉

Try it out:
1. Open http://localhost:3000
2. Complete the onboarding
3. Let it post a welcome message
4. Check #general channel!
