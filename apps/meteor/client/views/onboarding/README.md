# Onboarding Bot UI

A comprehensive onboarding experience for new Rocket.Chat users.

## Overview

The Onboarding Bot provides a step-by-step guided tour to help new users get started with Rocket.Chat. It covers essential features and helps users set up their profile, join channels, invite team members, and customize their settings.

## Features

- **Progressive Steps**: 6 guided steps covering all essential features
- **Visual Progress**: Progress bar and step indicators
- **Interactive Components**: Each step includes actionable items
- **Responsive Design**: Works on all screen sizes
- **Internationalization**: Fully translatable using i18next
- **Skip Option**: Users can skip the tour and access it later

## Steps

1. **Welcome**: Introduction to Rocket.Chat features
2. **Profile**: Complete user profile with photo and information
3. **Channels**: Discover and join relevant channels
4. **Team**: Invite team members to the workspace
5. **Settings**: Customize notification preferences
6. **Complete**: Final tips and completion

## Usage

### As a Modal

```tsx
import { OnboardingModal } from './views/onboarding';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
```

### As a Standalone Component

```tsx
import { OnboardingBot } from './views/onboarding';

function OnboardingPage() {
  return <OnboardingBot />;
}
```

## Components

### OnboardingBot
Main component that orchestrates the onboarding flow.

### OnboardingModal
Wrapper component that displays the onboarding in a modal.

### Step Components
- `WelcomeStep`: Welcome screen with feature highlights
- `ProfileStep`: Profile completion interface
- `ChannelsStep`: Channel discovery and joining
- `TeamStep`: Team invitation interface
- `SettingsStep`: Notification settings customization
- `CompleteStep`: Completion screen with tips

## Customization

### Adding New Steps

1. Create a new step component in `steps/` directory
2. Add it to the `steps` array in `OnboardingBot.tsx`
3. Export it from `steps/index.ts`

### Styling

The components use Rocket.Chat's Fuselage design system. Customize by modifying the Box component props or extending the theme.

## Integration Points

- **User Context**: Access user data for personalization
- **Toast Messages**: Display feedback messages
- **Translation**: Uses i18next for internationalization
- **Navigation**: Can trigger navigation to different sections

## Future Enhancements

- [ ] Add analytics tracking for step completion
- [ ] Implement step-specific actions (e.g., actual profile upload)
- [ ] Add video tutorials for each step
- [ ] Create admin dashboard to customize onboarding flow
- [ ] Add A/B testing capabilities
- [ ] Implement user progress persistence
- [ ] Add interactive tooltips for UI elements
- [ ] Create mobile-optimized version

## Dependencies

- `@rocket.chat/fuselage`: UI components
- `@rocket.chat/ui-contexts`: Context providers
- `react-i18next`: Internationalization
- `react`: Core framework

## License

MIT
