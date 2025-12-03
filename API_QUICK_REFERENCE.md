# 🚀 Rocket.Chat API Quick Reference

## Quick Start

```typescript
import RocketChatAPI from './api/rocketchatApi';
import { chatbotActions } from './api/chatbotActions';

// Initialize API
const api = new RocketChatAPI();

// Or use pre-configured actions
await chatbotActions.setupUserProfile({ name: 'John' });
```

---

## 📋 Common Use Cases

### 1. User Authentication
```typescript
// Login
await api.login('username', 'password');

// Get current user
await api.getMe();

// Logout
await api.logoutApi();
```

### 2. Send Messages
```typescript
// Post a message
await api.postMessage(roomId, 'Hello World!');

// Update a message
await api.updateMessage(roomId, msgId, 'Updated text');

// Delete a message
await api.deleteMessage(roomId, msgId);

// React to a message
await api.reactToMessage(msgId, '👍');
```

### 3. Channel Management
```typescript
// Create channel
await api.createChannel('my-channel', ['user1', 'user2']);

// Join channel
await api.joinChannel(roomId);

// Get joined channels
await api.getJoinedChannels();

// Get channel history
await api.getChannelHistory(roomId, undefined, undefined, 50);

// Leave channel
await api.leaveChannel(roomId);
```

### 4. User Management
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
await api.getUserInfo(userId);

// List users
await api.listUsers();

// Set user status
await api.setUserStatus('online', 'Working on project');

// Set avatar
await api.setUserAvatar('https://example.com/avatar.jpg');
```

### 5. Direct Messages & Groups
```typescript
// Create DM
await api.createDirectMessage('username');

// Create private group
await api.createGroup('team-name', ['user1', 'user2']);
```

### 6. Search & Discovery
```typescript
// Search messages
await api.searchMessages(roomId, 'search query');

// Get message
await api.getMessage(msgId);
```

### 7. File Upload
```typescript
// Upload file
const file = document.querySelector('input[type="file"]').files[0];
await api.uploadFile(roomId, file, 'File description');
```

### 8. Admin Operations
```typescript
// Get public settings
await api.getPublicSettings();

// Get all settings (admin)
await api.getSettings();

// Update setting
await api.updateSetting('settingId', 'newValue');

// Get roles
await api.getRoles();

// Add user to role
await api.addUserToRole('admin', 'username');

// Update permissions
await api.updatePermissions([
  { _id: 'permission-id', roles: ['admin', 'user'] }
]);
```

### 9. Commands
```typescript
// Run slash command
await api.runCommand('help', roomId);
await api.runCommand('invite', roomId, '@username');
```

### 10. Apps Management
```typescript
// List apps
await api.getApps();

// Install app
await api.installApp('app-id', '1.0.0');

// Update app
await api.updateApp('app-id', '1.1.0');

// Uninstall app
await api.uninstallApp('app-id');
```

---

## 🎯 High-Level Actions (Recommended)

### Onboarding Actions
```typescript
// Setup user profile
await chatbotActions.setupUserProfile({
  name: 'John Doe',
  status: 'Developer - New to Rocket.Chat!',
  avatarUrl: 'https://example.com/avatar.jpg'
});

// Create welcome channels
await chatbotActions.createWelcomeChannels([
  'Team Communication',
  'Video Calls',
  'API Development'
]);

// Join recommended channels
await chatbotActions.joinRecommendedChannels('developer');

// Send welcome messages
await chatbotActions.sendWelcomeMessages('John Doe', 'Developer');
```

### Team Collaboration
```typescript
// Create team space
await chatbotActions.createTeamSpace('dev-team', ['user1', 'user2']);

// Setup direct messages
await chatbotActions.setupDirectMessages(['user1', 'user2', 'user3']);

// Discover team members
const result = await chatbotActions.discoverTeamMembers();
```

### Content & Search
```typescript
// Search helpful content
await chatbotActions.searchHelpfulContent('getting started', roomId);

// Get channel context
await chatbotActions.getChannelContext(roomId, 20);
```

### Engagement
```typescript
// Celebrate message
await chatbotActions.celebrateMessage(msgId, '🎉');

// Send achievement
await chatbotActions.sendAchievement(roomId, 'First Message Sent');
```

### Admin Actions
```typescript
// Get server info
await chatbotActions.getServerInfo();

// Get available roles
await chatbotActions.getAvailableRoles();

// Assign user role
await chatbotActions.assignUserRole('username', 'moderator');
```

### Commands
```typescript
// Execute command
await chatbotActions.executeCommand('help', roomId);

// Show available commands
await chatbotActions.showAvailableCommands(roomId);
```

---

## 🔐 Authentication Check

```typescript
// Check if authenticated
if (api.isAuthenticated()) {
  // User is logged in
}

// Get current user ID
const userId = api.getCurrentUserId();

// Get auth token
const token = api.getAuthToken();
```

---

## ⚠️ Error Handling

```typescript
try {
  await api.postMessage(roomId, 'Hello!');
} catch (error) {
  console.error('Failed to send message:', error);
  // Handle error appropriately
}
```

---

## 📊 Response Types

### Login Response
```typescript
{
  status: 'success',
  data: {
    userId: string,
    authToken: string,
    me: {
      _id: string,
      username: string,
      name: string,
      emails: Array<{ address: string, verified: boolean }>
    }
  }
}
```

### Message Response
```typescript
{
  success: boolean,
  message: {
    _id: string,
    rid: string,
    msg: string,
    ts: string,
    u: { _id: string, username: string, name: string }
  }
}
```

### Channel Response
```typescript
{
  channel: {
    _id: string,
    name: string,
    t: string,
    msgs: number,
    usersCount: number
  },
  success: boolean
}
```

---

## 🎨 Chatbot Integration Examples

### Example 1: Complete User Onboarding
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

### Example 2: Interactive Channel Creation
```typescript
// Create channel based on user interests
const interests = ['API Development', 'Team Collaboration'];
const result = await chatbotActions.createWelcomeChannels(interests);

// Join the created channels
for (const channel of result.channels) {
  if (channel.success) {
    await api.joinChannel(channel.id);
  }
}
```

### Example 3: Team Discovery & DM Setup
```typescript
// Find team members
const { users } = await chatbotActions.discoverTeamMembers();

// Setup DMs with first 3 users
const usernames = users.slice(0, 3).map(u => u.username);
await chatbotActions.setupDirectMessages(usernames);
```

---

## 💡 Best Practices

1. **Always check authentication** before making API calls
2. **Handle errors gracefully** with try-catch blocks
3. **Use high-level actions** for common workflows
4. **Provide user feedback** for all API operations
5. **Cache responses** when appropriate
6. **Rate limit** API calls to avoid overwhelming the server
7. **Use async/await** for cleaner code
8. **Validate input** before sending to API

---

## 🔗 Related Files

- `rocketchatApi.ts` - Complete API client
- `chatbotActions.ts` - High-level action helpers
- `InteractiveChatBot.tsx` - Chatbot implementation
- `API_IMPLEMENTATION_COMPLETE.md` - Full documentation

---

**Quick Tip**: Use `chatbotActions` for common workflows and `api` for direct API access!
