# 🤖 /onboarding Slash Command

## Overview

A slash command that allows users to trigger the onboarding chatbot from **any channel** in Rocket.Chat!

## Usage

Simply type in any channel:

```
/onboarding
```

## What Happens

When you type `/onboarding`:

1. **Instant Response** - You get an ephemeral message (only you can see it) with:
   - Welcome message from the bot
   - Instructions on how to access the full chatbot
   - Quick tips and common questions
   - Link to help resources

2. **Modal Trigger** - The onboarding chatbot modal automatically opens

3. **Interactive Chat** - Start conversing with the bot immediately

## Example Usage

### In #general Channel
```
User: /onboarding
Bot: 🤖 Onboarding Assistant

Welcome! I'm here to help you get started with Rocket.Chat.

To launch the interactive onboarding chatbot:
1. Click on your profile picture (top right)
2. Select "Preferences"
3. Or simply refresh your home page

You can also ask me questions here! Try:
• "How do I set up my profile?"
• "What are channels?"
• "How do I invite team members?"
• "Show me keyboard shortcuts"

Type `/help` for more commands!
```

### In Any Private Channel
```
User: /onboarding
[Chatbot modal opens automatically]
```

### In Direct Messages
```
User: /onboarding
[Works the same way!]
```

## Features

### ✅ Works Everywhere
- Public channels (#general, #random, etc.)
- Private channels
- Direct messages
- Group chats

### ✅ Ephemeral Messages
- Only you see the bot's response
- Doesn't clutter the channel
- Private and non-intrusive

### ✅ Instant Access
- No need to navigate menus
- Quick keyboard shortcut
- Available anytime, anywhere

### ✅ Context-Aware
- Remembers your progress
- Picks up where you left off
- Personalized experience

## Command Details

### Command Name
```
/onboarding
```

### Parameters
None required - just type the command!

### Permissions
Available to all users (no special permissions needed)

### Response Type
- Ephemeral message (private to you)
- Modal trigger (opens chatbot)

## Technical Implementation

### Server-Side
Located in: `apps/meteor/app/slashcommands-onboarding/server/`

```typescript
slashCommands.add({
  command: 'onboarding',
  callback: async function Onboarding({ message, userId }) {
    // Send ephemeral message
    void api.broadcast('notify.ephemeralMessage', userId, message.rid, {
      msg: '...'
    });
    
    // Trigger modal
    void api.broadcast('notify.userAction', userId, {
      action: 'openOnboardingModal',
      data: {}
    });
  },
  options: {
    description: 'Launch_the_onboarding_assistant',
    params: '',
  },
});
```

### Client-Side
Hook: `useOnboardingModalTrigger` in `DefaultHomePage.tsx`

```typescript
useOnboardingModalTrigger(handleOpenOnboarding);
```

## Integration Points

### 1. Server Command Registration
File: `server/importPackages.ts`
```typescript
import '../app/slashcommands-onboarding/server';
```

### 2. Client Modal Trigger
File: `client/views/home/DefaultHomePage.tsx`
```typescript
const handleOpenOnboarding = useCallback(() => {
  setShowOnboarding(true);
}, []);

useOnboardingModalTrigger(handleOpenOnboarding);
```

### 3. Stream Listener
File: `client/views/onboarding/useOnboardingModal.ts`
```typescript
const subscribeToNotifyUser = useStream('notify-user');
subscribeToNotifyUser('action', (data) => {
  if (data.action === 'openOnboardingModal') {
    onOpen();
  }
});
```

## Other Slash Commands

You can combine with other commands:

```
/help          - Show keyboard shortcuts
/onboarding    - Launch onboarding bot
/join          - Join a channel
/invite        - Invite users
/create        - Create a channel
```

## Customization

### Change the Response Message

Edit: `apps/meteor/app/slashcommands-onboarding/server/server.ts`

```typescript
msg: `Your custom message here...`
```

### Add Parameters

```typescript
slashCommands.add({
  command: 'onboarding',
  callback: async function Onboarding({ params, message, userId }) {
    // params[0] would be the first parameter
    // e.g., /onboarding profile
  },
  options: {
    description: 'Launch_the_onboarding_assistant',
    params: 'optional_parameter',
  },
});
```

### Restrict to Certain Users

```typescript
import { hasPermission } from '../../authorization/server';

if (!hasPermission(userId, 'view-onboarding')) {
  return;
}
```

## Troubleshooting

### Command Not Working?

1. **Check server logs** for errors
2. **Verify import** in `server/importPackages.ts`
3. **Restart server** to register new command
4. **Check permissions** (should work for all users)

### Modal Not Opening?

1. **Check browser console** for errors
2. **Verify hook** is imported in DefaultHomePage
3. **Check stream connection** (WebSocket)
4. **Try refreshing** the page

### Message Not Showing?

1. **Verify ephemeral message** API call
2. **Check user ID** is correct
3. **Verify room ID** (message.rid)

## Future Enhancements

- [ ] Add parameters for specific topics (`/onboarding profile`)
- [ ] Track command usage analytics
- [ ] Add command aliases (`/help-me`, `/guide`)
- [ ] Integrate with AI for smarter responses
- [ ] Add command autocomplete
- [ ] Support for multiple languages
- [ ] Command history and favorites

## Files Created

```
apps/meteor/app/slashcommands-onboarding/
├── server/
│   ├── index.ts
│   └── server.ts

apps/meteor/client/views/onboarding/
└── useOnboardingModal.ts

apps/meteor/server/
└── importPackages.ts (modified)

apps/meteor/client/views/home/
└── DefaultHomePage.tsx (modified)
```

## Testing

### Manual Test
1. Open Rocket.Chat at http://localhost:3000
2. Go to any channel (e.g., #general)
3. Type: `/onboarding`
4. Press Enter
5. Verify:
   - ✅ Ephemeral message appears
   - ✅ Modal opens automatically
   - ✅ Chatbot is functional

### Test in Different Contexts
- [ ] Public channel
- [ ] Private channel
- [ ] Direct message
- [ ] Group chat

---

**Now you can launch the onboarding bot from anywhere! 🚀**

Just type `/onboarding` in any channel!
