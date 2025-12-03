# Quick Start: Connect Frontend to Backend

## 🚀 5-Minute Integration

### Step 1: Import the API Client

```typescript
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';
```

### Step 2: Make Your First API Call

```typescript
// Get current user
const user = await APIClient.get('/api/v1/me');
console.log('Current user:', user);

// Get channels
const channels = await APIClient.get('/api/v1/channels.list.joined');
console.log('Channels:', channels);

// Send a message
const result = await APIClient.post('/api/v1/chat.postMessage', {
  roomId: 'GENERAL',
  text: 'Hello from the frontend!'
});
console.log('Message sent:', result);
```

### Step 3: Use in a React Component

```typescript
import React, { useEffect, useState } from 'react';
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

export const MyComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    APIClient.get('/api/v1/me')
      .then(setUser)
      .catch(console.error);
  }, []);

  return <div>Hello, {user?.name}!</div>;
};
```

## 📋 Common API Endpoints

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| Get current user | GET | `/api/v1/me` | - |
| Get user info | GET | `/api/v1/users.info` | `{ userId }` |
| Get channels | GET | `/api/v1/channels.list.joined` | - |
| Send message | POST | `/api/v1/chat.postMessage` | `{ roomId, text }` |
| Create channel | POST | `/api/v1/channels.create` | `{ name, members }` |
| Join channel | POST | `/api/v1/channels.join` | `{ roomId }` |

## 🔧 Testing in Browser Console

Open your browser console and try:

```javascript
// Import the API client
const { APIClient } = await import('./app/utils/client/lib/RestApiClient');

// Test getting user info
const user = await APIClient.get('/api/v1/me');
console.log('User:', user);

// Test getting channels
const channels = await APIClient.get('/api/v1/channels.list.joined');
console.log('Channels:', channels);

// Test sending a message
const result = await APIClient.post('/api/v1/chat.postMessage', {
  roomId: 'GENERAL',
  text: 'Test message from console!'
});
console.log('Result:', result);
```

## 🎯 Complete Working Example

```typescript
import React, { useState } from 'react';
import { APIClient } from '../../../app/utils/client/lib/RestApiClient';

export const QuickStartExample = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      // Get user info
      const user = await APIClient.get('/api/v1/me');
      setResult(`Hello, ${user.name}! Your username is ${user.username}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Loading...' : 'Test API Connection'}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};
```

## ✅ That's It!

You're now connected! The `APIClient` handles:
- ✅ Authentication (automatic)
- ✅ Headers (automatic)
- ✅ Error handling
- ✅ Type safety (with TypeScript)

## 📚 Next Steps

1. Check `FRONTEND_BACKEND_CONNECTION_GUIDE.md` for detailed documentation
2. See `EXAMPLE_API_INTEGRATION.tsx` for complete examples
3. Explore the REST API documentation at `/api/info`

## 🐛 Troubleshooting

**Problem:** "Not authenticated"
- **Solution:** Make sure you're logged in. The API client uses Meteor's session.

**Problem:** "Endpoint not found"
- **Solution:** Check the endpoint URL. All endpoints start with `/api/v1/`

**Problem:** "CORS error"
- **Solution:** You're already on the same domain, so this shouldn't happen. Check your baseURL.

## 💡 Pro Tips

1. **Use async/await** for cleaner code
2. **Handle errors** with try/catch
3. **Show loading states** for better UX
4. **Cache responses** to reduce API calls
5. **Use TypeScript** for type safety

## 🎉 Success!

Your frontend is now connected to the backend. Start building amazing features!
