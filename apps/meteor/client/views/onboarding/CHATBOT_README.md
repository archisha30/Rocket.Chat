# Onboarding ChatBot 🤖

An **interactive conversational chatbot** that guides new users through Rocket.Chat onboarding with natural language interactions.

## Features

### 💬 Conversational Interface
- Real-time chat-like experience
- Bot typing indicators
- Message timestamps
- Smooth scrolling

### 🎯 Interactive Options
- Quick-reply buttons for common actions
- Natural language understanding
- Context-aware responses
- Multi-step conversation flow

### 🚀 Onboarding Topics Covered
1. **Profile Setup** - Upload photo, update info
2. **Channels** - Discover and join channels
3. **Team Invitations** - Invite colleagues
4. **Notifications** - Customize preferences
5. **Quick Tips** - Keyboard shortcuts and features

### 🎨 User Experience
- Clean chat interface
- Bot avatar and branding
- Responsive design
- Mobile-friendly

## How It Works

### Conversation Flow

```
1. Welcome Message
   ↓
2. Profile Setup
   ↓
3. Channel Discovery
   ↓
4. Team Invitations
   ↓
5. Notification Settings
   ↓
6. Completion & Tips
```

### User Interactions

**Option Buttons**: Users can click suggested options
```typescript
['Get Started', 'Skip Tour']
```

**Text Input**: Users can type natural responses
```
"yes", "help", "show me channels", etc.
```

**Context Awareness**: Bot remembers conversation state
```typescript
currentStep: 0-6 // Tracks progress
```

## Chatbot Capabilities

### Understands:
- ✅ Affirmative responses: "yes", "sure", "okay"
- ✅ Questions: "what are channels?", "help"
- ✅ Commands: "skip", "restart", "start over"
- ✅ Topic requests: "profile", "notifications", "channels"

### Provides:
- 📝 Step-by-step guidance
- 💡 Helpful tips and shortcuts
- 🔗 Quick action buttons
- ❓ Help on demand

## Usage

### In Modal (Default)
```tsx
import { OnboardingModal } from './views/onboarding';

<OnboardingModal onClose={() => setShowOnboarding(false)} />
```

### Standalone Chatbot
```tsx
import { OnboardingChatBot } from './views/onboarding';

<OnboardingChatBot />
```

## Customization

### Add New Conversation Paths

```typescript
const handleBotResponse = (userInput: string) => {
  if (input.includes('your-keyword')) {
    addBotMessage(
      "Your custom response",
      ['Option 1', 'Option 2']
    );
  }
};
```

### Modify Bot Personality

```typescript
// Change greeting
addBotMessage(
  "👋 Hey! I'm your friendly guide...",
  ['Let\'s Go!', 'Not Now']
);
```

### Add More Steps

```typescript
setCurrentStep(7); // Add new step
addBotMessage(
  "New feature explanation...",
  ['Continue', 'Learn More']
);
```

## Technical Details

### State Management
- `messages`: Array of chat messages
- `currentStep`: Conversation progress (0-6)
- `isTyping`: Bot typing indicator
- `inputValue`: User text input

### Message Structure
```typescript
interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  options?: string[]; // Quick reply buttons
}
```

### Animations
- Typing indicator with pulse animation
- Smooth scroll to latest message
- Delayed bot responses for natural feel

## Future Enhancements

- [ ] AI/ML integration for smarter responses
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Rich media messages (images, videos)
- [ ] Progress persistence
- [ ] Analytics tracking
- [ ] Sentiment analysis
- [ ] Personalized recommendations
- [ ] Integration with actual Rocket.Chat actions

## Styling

Uses Rocket.Chat's Fuselage design system:
- Primary colors for user messages
- Surface colors for bot messages
- Consistent spacing and typography
- Responsive layout

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast text
- Clear visual hierarchy

---

**Built with ❤️ for Rocket.Chat users**
