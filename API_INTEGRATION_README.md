# 🚀 Rocket.Chat API Integration - Getting Started

## Welcome!

This guide will help you understand and use the complete Rocket.Chat REST API integration in the onboarding chatbot.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [File Structure](#file-structure)
3. [Basic Usage](#basic-usage)
4. [Available APIs](#available-apis)
5. [Chatbot Features](#chatbot-features)
6. [Examples](#examples)
7. [Documentation](#documentation)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Import the API Client

```typescript
import RocketChatAPI from './api/rocketchatApi';

const api = new RocketChatAPI();
```

### 2. Use High-Level Actions

```typescript
import { chatbotActions } from './api/chatbotActions';

// Setup user profile
await chatbotActions.setupUserProfile({
  name: 'John Doe',
  status: 'Developer'
});

// Join channels
await chatbotActions.joinRecommendedChannels('developer');
```

### 3. Direct API Calls

```typescript
// Send a message
await api.postMessage(roomId, 'Hello World!');

// Create a channel
await api.createChannel('my-channel', ['user1', 'user2']);

// Get user info
const user = await api.getUserInfo(userId);
```

---

## 📁 File Structure

```
Rocket.Chat/apps/meteor/client/views/onboarding/api/
│
├── rocketchatApi.ts          # Complete API client (41 endpoints)
├── chatbotActions.ts         # High-level action helpers (18 actions)
└── (InteractiveChatBot.tsx)  # Chatbot with API integration
```

---

## 💻 Basic Usage

### Authentication

```typescript
// Login
await api.login('username', 'password');

// Check if authenticated
if (api.isAuthenticated()) {
  // User is logged in
}

// Get current user
const me = await api.getMe();

// Logout
await api.logoutApi();
```

### User Management

```typescript
// Create user
await api.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  username: 'johndoe'
});

// Update user
await api.updateUser(userId, { name: 'Jane Doe' });

// Get user info
const user = await api.getUserInfo(userId);

// List users
const users = await api.listUsers();

// Set status
await api.setUserStatus('online', 'Working on project');
```

### Channel Management

```typescript
// Create channel
await api.createChannel('my-channel', ['user1', 'user2']);

// Join channel
await api.joinChannel(roomId);

// Get joined channels
const channels = await api.getJoinedChannels();

// Get channel history
const history = await api.getChannelHistory(roomId, undefined, undefined, 50);

// Leave channel
await api.leaveChannel(roomId);
```

### Messaging

```typescript
// Post message
await api.postMessage(roomId, 'Hello World!');

// Update message
await api.updateMessage(roomId, msgId, 'Updated text');

// Delete message
await api.deleteMessage(roomId, msgId);

// React to message
await api.reactToMessage(msgId, '👍');

// Search messages
await api.searchMessages(roomId, 'search query');
```

---

## 🔌 Available APIs

### Authentication (3)
- `login(username, password)`
- `logoutApi()`
- `getMe()`

### User Management (8)
- `createUser(userData)`
- `updateUser(userId, data)`
- `getUserInfo(userId)`
- `listUsers(query)`
- `setUserAvatar(avatarUrl)`
- `deleteUser(userId)`
- `setUserStatus(status, message)`
- `createUserToken(userId)`

### Channels/Rooms (8)
- `createChannel(name, members, readOnly)`
- `inviteToChannel(roomId, userId)`
- `joinChannel(roomId)`
- `getChannelHistory(roomId, latest, oldest, count)`
- `leaveChannel(roomId)`
- `getJoinedChannels()`
- `createGroup(name, members)`
- `createDirectMessage(username)`

### Messaging (6)
- `postMessage(roomId, text)`
- `updateMessage(roomId, msgId, text)`
- `deleteMessage(roomId, msgId)`
- `getMessage(msgId)`
- `reactToMessage(messageId, emoji)`
- `searchMessages(roomId, searchText)`

### File Upload (1)
- `uploadFile(roomId, file, description)`

### Livechat (4)
- `createLivechatRoom(token, rid)`
- `sendLivechatMessage(token, rid, msg)`
- `getLivechatMessages(token, rid)`
- `registerLivechatVisitor(visitor)`

### Apps Engine (4)
- `installApp(appId, version, permissions)`
- `updateApp(appId, version, permissions)`
- `uninstallApp(appId)`
- `getApps()`

### Admin/Server (6)
- `getPublicSettings()`
- `getSettings()`
- `updateSetting(settingId, value)`
- `getRoles()`
- `addUserToRole(roleName, username, roomId)`
- `updatePermissions(permissions)`

### Commands (1)
- `runCommand(command, roomId, params)`

---

## 🎨 Chatbot Features

The chatbot automatically uses these APIs to provide:

### 1. Profile Setup
- Updates user name
- Sets user status
- Configures avatar

### 2. Channel Management
- Creates interest-based channels
- Auto-joins recommended channels
- Discovers available channels

### 3. Welcome Messages
- Posts introduction to #general
- Notifies team of new member

### 4. Team Discovery
- Lists all team members
- Shows user profiles
- Enables team connection

### 5. Command Help
- Shows available slash commands
- Executes commands
- Provides quick actions

### 6. Interactive Options
- 🚀 Start Chatting
- 📢 Post Welcome Message
- 👥 Discover Team
- 📋 Show Commands
- ⚙️ Customize Settings
- 🔄 Start Over

---

## 📝 Examples

### Example 1: Complete Onboarding

```typescript
// Step 1: Get user info
const userInfo = await api.getMe();

// Step 2: Update profile
await chatbotActions.setupUserProfile({
  name: userInfo.name,
  status: 'New team member!'
});

// Step 3: Join channels
await chatbotActions.joinRecommendedChannels('developer');

// Step 4: Send welcome
await chatbotActions.sendWelcomeMessages(userInfo.name, 'Developer');

// Step 5: Discover team
const team = await chatbotActions.discoverTeamMembers();
```

### Example 2: Create Team Space

```typescript
// Create a private group for the team
const result = await chatbotActions.createTeamSpace(
  'dev-team',
  ['user1', 'user2', 'user3']
);

if (result.success) {
  console.log('Team space created:', result.roomId);
}
```

### Example 3: Search and Share

```typescript
// Search for helpful content
const results = await chatbotActions.searchHelpfulContent(
  'getting started',
  roomId
);

// Share results with team
for (const message of results.results) {
  await api.postMessage(roomId, `Found: ${message.msg}`);
}
```

---

## 📚 Documentation

### Complete Guides

1. **API_IMPLEMENTATION_COMPLETE.md**
   - Detailed API documentation
   - Integration examples
   - Flow diagrams

2. **API_QUICK_REFERENCE.md**
   - Quick start guide
   - Common use cases
   - Code snippets

3. **CHATBOT_API_SUMMARY.md**
   - High-level overview
   - Feature summary
   - Statistics

4. **API_ARCHITECTURE.md**
   - System architecture
   - Data flow diagrams
   - Component interaction

5. **IMPLEMENTATION_CHECKLIST.md**
   - Complete verification
   - Status tracking

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Error
```typescript
// Check if authenticated
if (!api.isAuthenticated()) {
  await api.login('username', 'password');
}
```

#### 2. API Call Fails
```typescript
try {
  await api.postMessage(roomId, 'Hello!');
} catch (error) {
  console.error('Failed to send message:', error);
  // Handle error appropriately
}
```

#### 3. Token Expired
```typescript
// Tokens are automatically managed
// If expired, re-login:
await api.login('username', 'password');
```

### Debug Tips

1. **Check Console**: Look for error messages
2. **Verify Auth**: Ensure user is logged in
3. **Check Network**: Use DevTools to inspect requests
4. **Review Docs**: Check API documentation for details

---

## 💡 Best Practices

### 1. Always Check Authentication
```typescript
if (!api.isAuthenticated()) {
  throw new Error('User not authenticated');
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  await api.postMessage(roomId, text);
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
}
```

### 3. Use High-Level Actions
```typescript
// Instead of multiple API calls:
await chatbotActions.setupUserProfile(profile);

// Rather than:
await api.updateUser(userId, data);
await api.setUserStatus(status);
await api.setUserAvatar(avatar);
```

### 4. Provide User Feedback
```typescript
addBotMessage('Setting up your profile...');
await chatbotActions.setupUserProfile(profile);
addBotMessage('✅ Profile updated!');
```

---

## 🎯 Next Steps

### For Users
1. Open the chatbot
2. Answer the questions
3. Let the chatbot set up your profile
4. Explore the features

### For Developers
1. Review the documentation
2. Explore the API client
3. Try the examples
4. Extend the functionality

### For Admins
1. Configure server settings
2. Set up roles and permissions
3. Monitor user onboarding
4. Customize the experience

---

## 📞 Support

### Need Help?

1. **Check Documentation**: Review the complete guides
2. **Read Examples**: Look at code examples
3. **Inspect Code**: Review source files
4. **Debug**: Use console and DevTools

### Resources

- `rocketchatApi.ts` - API client source
- `chatbotActions.ts` - Action helpers source
- `InteractiveChatBot.tsx` - Chatbot implementation
- Documentation files in root directory

---

## ✨ Features Summary

```
✅ 41 REST APIs implemented
✅ 18 high-level actions
✅ Complete chatbot integration
✅ Type-safe TypeScript
✅ Error handling throughout
✅ Comprehensive documentation
✅ Production ready
```

---

## 🎉 Conclusion

You now have access to all 41 Rocket.Chat REST APIs through:
- **Direct API calls** via `rocketchatApi`
- **High-level actions** via `chatbotActions`
- **Integrated chatbot** with automatic workflows

**Happy coding!** 🚀

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 3, 2025
