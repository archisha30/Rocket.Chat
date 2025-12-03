# Troubleshooting Guide

## Issue Fixed: Application Crash

### Problem
The application was crashing with "Application Error - The application GUI just crashed" message.

### Root Cause
The OnboardingModal was using the wrong Modal component:
- ❌ Was using: `Modal` from `@rocket.chat/fuselage`
- ✅ Should use: `GenericModal` from `@rocket.chat/ui-client`

### Solution Applied
Updated `OnboardingModal.tsx` to use the correct `GenericModal` component that matches the pattern used throughout the Rocket.Chat codebase.

### Changes Made
```typescript
// Before (incorrect)
import { Modal, Box } from '@rocket.chat/fuselage';
<Modal open>
  <Modal.Header>
    <Modal.Close onClick={onClose} />
  </Modal.Header>
  <Modal.Content>
    ...
  </Modal.Content>
</Modal>

// After (correct)
import { GenericModal } from '@rocket.chat/ui-client';
<GenericModal
  title="Welcome to Rocket.Chat"
  onClose={onClose}
  variant="warning"
  wrapperFunction={(props) => <Box {...props} width='100%' maxWidth='900px' />}
>
  ...
</GenericModal>
```

## How to Access the Onboarding Bot

1. **Clear localStorage** (if you've already seen it):
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Find localStorage
   - Delete the `hasSeenOnboarding` key
   - Refresh the page

2. **Or manually trigger it**:
   - The onboarding will show automatically on first visit
   - It won't show again after you close it

## Current Status

✅ Application is running at http://localhost:3000
✅ Onboarding modal fixed and working
✅ All changes pushed to GitHub

## If You Still See Issues

1. **Hard refresh the browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
2. **Clear browser cache**
3. **Check the browser console** for any errors (F12 → Console tab)
4. **Restart the development server**:
   ```bash
   # Stop the current process
   # Then restart:
   cd Rocket.Chat
   source ~/.nvm/nvm.sh && nvm use 22.16.0 && yarn dev
   ```

## Development Tips

- The app uses **hot reload**, so changes should appear automatically
- If you modify TypeScript files, the app will recompile
- Check the terminal for compilation errors
- MongoDB must be running for Rocket.Chat to work

## Need More Help?

- Check the browser console for errors
- Check the terminal output for server errors
- Review the Rocket.Chat documentation
- The onboarding code is in: `apps/meteor/client/views/onboarding/`
