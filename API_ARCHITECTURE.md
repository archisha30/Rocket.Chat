# 🏗️ API Architecture & Integration Map

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         InteractiveChatBot.tsx                        │  │
│  │  • User interactions                                  │  │
│  │  • Question flow                                      │  │
│  │  • Message display                                    │  │
│  │  • Action buttons                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         chatbotActions.ts                             │  │
│  │  • setupUserProfile()                                 │  │
│  │  • createWelcomeChannels()                            │  │
│  │  • joinRecommendedChannels()                          │  │
│  │  • sendWelcomeMessages()                              │  │
│  │  • discoverTeamMembers()                              │  │
│  │  • createTeamSpace()                                  │  │
│  │  • setupDirectMessages()                              │  │
│  │  • searchHelpfulContent()                             │  │
│  │  • celebrateMessage()                                 │  │
│  │  • executeCommand()                                   │  │
│  │  • ... 10+ more actions                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Client Layer                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         rocketchatApi.ts                              │  │
│  │                                                        │  │
│  │  Authentication APIs (3)                              │  │
│  │  ├─ login()                                           │  │
│  │  ├─ logoutApi()                                       │  │
│  │  └─ getMe()                                           │  │
│  │                                                        │  │
│  │  User Management APIs (8)                             │  │
│  │  ├─ createUser()                                      │  │
│  │  ├─ updateUser()                                      │  │
│  │  ├─ getUserInfo()                                     │  │
│  │  ├─ listUsers()                                       │  │
│  │  ├─ setUserAvatar()                                   │  │
│  │  ├─ deleteUser()                                      │  │
│  │  ├─ setUserStatus()                                   │  │
│  │  └─ createUserToken()                                 │  │
│  │                                                        │  │
│  │  Channel/Room APIs (8)                                │  │
│  │  ├─ createChannel()                                   │  │
│  │  ├─ inviteToChannel()                                 │  │
│  │  ├─ joinChannel()                                     │  │
│  │  ├─ getChannelHistory()                               │  │
│  │  ├─ leaveChannel()                                    │  │
│  │  ├─ getJoinedChannels()                               │  │
│  │  ├─ createGroup()                                     │  │
│  │  └─ createDirectMessage()                             │  │
│  │                                                        │  │
│  │  Messaging APIs (6)                                   │  │
│  │  ├─ postMessage()                                     │  │
│  │  ├─ updateMessage()                                   │  │
│  │  ├─ deleteMessage()                                   │  │
│  │  ├─ getMessage()                                      │  │
│  │  ├─ reactToMessage()                                  │  │
│  │  └─ searchMessages()                                  │  │
│  │                                                        │  │
│  │  File Upload API (1)                                  │  │
│  │  └─ uploadFile()                                      │  │
│  │                                                        │  │
│  │  Livechat APIs (4)                                    │  │
│  │  ├─ createLivechatRoom()                              │  │
│  │  ├─ sendLivechatMessage()                             │  │
│  │  ├─ getLivechatMessages()                             │  │
│  │  └─ registerLivechatVisitor()                         │  │
│  │                                                        │  │
│  │  Apps Engine APIs (4)                                 │  │
│  │  ├─ installApp()                                      │  │
│  │  ├─ updateApp()                                       │  │
│  │  ├─ uninstallApp()                                    │  │
│  │  └─ getApps()                                         │  │
│  │                                                        │  │
│  │  Admin/Server APIs (6)                                │  │
│  │  ├─ getPublicSettings()                               │  │
│  │  ├─ getSettings()                                     │  │
│  │  ├─ updateSetting()                                   │  │
│  │  ├─ getRoles()                                        │  │
│  │  ├─ addUserToRole()                                   │  │
│  │  └─ updatePermissions()                               │  │
│  │                                                        │  │
│  │  Commands API (1)                                     │  │
│  │  └─ runCommand()                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Rocket.Chat REST API                        │
│                                                               │
│  • Authentication endpoints                                  │
│  • User management endpoints                                 │
│  • Channel/Room endpoints                                    │
│  • Messaging endpoints                                       │
│  • File upload endpoints                                     │
│  • Livechat endpoints                                        │
│  • Apps engine endpoints                                     │
│  • Admin/Server endpoints                                    │
│  • Commands endpoints                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Onboarding Flow

```
User Opens Chatbot
        ↓
┌───────────────────┐
│ GET /api/v1/me    │ ← Fetch user info
└───────────────────┘
        ↓
User Answers Questions
        ↓
┌─────────────────────────┐
│ POST /api/v1/users.     │ ← Update profile
│      update             │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ POST /api/v1/users.     │ ← Set status
│      setStatus          │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ POST /api/v1/channels.  │ ← Create channels
│      create             │   (for interests)
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ POST /api/v1/channels.  │ ← Join channels
│      join               │   (recommended)
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ POST /api/v1/chat.      │ ← Post welcome
│      postMessage        │   message
└─────────────────────────┘
        ↓
User Chooses Action
        ↓
    ┌───────┴───────┐
    ↓               ↓
Discover Team   Show Commands
    ↓               ↓
┌─────────────┐ ┌─────────────┐
│ GET /api/v1/│ │ POST /api/  │
│ users.list  │ │ v1/commands │
└─────────────┘ └─────────────┘
```

---

## Component Interaction Map

```
┌──────────────────────────────────────────────────────────┐
│                    InteractiveChatBot                     │
│                                                            │
│  State Management:                                        │
│  • messages[]                                             │
│  • userProfile{}                                          │
│  • currentQuestion                                        │
│  • availableChannels[]                                    │
│                                                            │
│  Event Handlers:                                          │
│  • handleOptionClick() ──────────┐                       │
│  • handleInputSubmit() ──────────┤                       │
│  • handleMultiSelectSubmit() ────┤                       │
│                                   ↓                       │
│  Action Functions:         ┌──────────────┐              │
│  • postWelcomeMessage() ───→ chatbotActions│             │
│  • discoverTeamMembers() ──→               │             │
│  • showAvailableCommands() →               │             │
│  • generateRecommendations()→              │             │
│                              └──────────────┘             │
└──────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────┐
│                    chatbotActions                         │
│                                                            │
│  Onboarding Actions:                                      │
│  • setupUserProfile() ────────────┐                      │
│  • createWelcomeChannels() ───────┤                      │
│  • joinRecommendedChannels() ─────┤                      │
│  • sendWelcomeMessages() ─────────┤                      │
│                                    ↓                      │
│  Team Actions:              ┌──────────────┐             │
│  • createTeamSpace() ───────→ rocketchatApi│             │
│  • setupDirectMessages() ───→               │             │
│  • discoverTeamMembers() ───→               │             │
│                              └──────────────┘             │
│  Engagement Actions:                                      │
│  • celebrateMessage()                                     │
│  • sendAchievement()                                      │
│                                                            │
│  Admin Actions:                                           │
│  • getServerInfo()                                        │
│  • getAvailableRoles()                                    │
│  • assignUserRole()                                       │
└──────────────────────────────────────────────────────────┘
                                   ↓
┌──────────────────────────────────────────────────────────┐
│                    rocketchatApi                          │
│                                                            │
│  Core Functionality:                                      │
│  • Authentication management                              │
│  • Token storage (localStorage)                           │
│  • Request headers (X-Auth-Token, X-User-Id)             │
│  • Error handling                                         │
│  • Type-safe responses                                    │
│                                                            │
│  HTTP Methods:                                            │
│  • GET requests  ────────────┐                           │
│  • POST requests ────────────┤                           │
│  • PUT requests  ────────────┤                           │
│  • DELETE requests ──────────┤                           │
│                               ↓                           │
│                        ┌──────────────┐                  │
│                        │ fetch() API  │                  │
│                        └──────────────┘                  │
└──────────────────────────────────────────────────────────┘
```

---

## API Call Sequence

### Example: Complete Onboarding

```
Time  │ Component          │ Action                    │ API Call
──────┼────────────────────┼───────────────────────────┼─────────────────────
0ms   │ InteractiveChatBot │ Start conversation        │ GET /api/v1/me
      │                    │                           │
500ms │ InteractiveChatBot │ Show greeting             │ (none)
      │                    │                           │
1s    │ InteractiveChatBot │ Ask first question        │ (none)
      │                    │                           │
...   │ User               │ Answers questions         │ (none)
      │                    │                           │
30s   │ InteractiveChatBot │ Generate recommendations  │ (multiple calls)
      │                    │                           │
30.5s │ chatbotActions     │ Setup profile             │ POST /api/v1/users.update
      │                    │                           │ POST /api/v1/users.setStatus
      │                    │                           │
31s   │ chatbotActions     │ Join channels             │ GET /api/v1/channels.list.joined
      │                    │                           │ POST /api/v1/channels.join (x3)
      │                    │                           │
32s   │ chatbotActions     │ Create channels           │ POST /api/v1/channels.create (x2)
      │                    │                           │
33s   │ chatbotActions     │ Send welcome              │ POST /api/v1/chat.postMessage
      │                    │                           │
34s   │ InteractiveChatBot │ Show next options         │ (none)
      │                    │                           │
35s   │ User               │ Click "Discover Team"     │ (none)
      │                    │                           │
35.5s │ chatbotActions     │ Discover team             │ GET /api/v1/users.list
      │                    │                           │
36s   │ InteractiveChatBot │ Display team members      │ (none)
      │                    │                           │
37s   │ User               │ Click "Start Chatting"    │ (none)
      │                    │                           │
37.5s │ InteractiveChatBot │ Onboarding complete! 🎉   │ (none)
```

---

## Error Handling Flow

```
API Call Initiated
        ↓
┌───────────────────┐
│ try {             │
│   await api.xxx() │
│ }                 │
└───────────────────┘
        ↓
    ┌───┴───┐
    ↓       ↓
Success   Error
    ↓       ↓
Return    catch (error)
Data          ↓
          Log Error
              ↓
          Return User-Friendly
          Message
              ↓
          Display in Chatbot
```

---

## Authentication Flow

```
User Logs In
        ↓
POST /api/v1/login
        ↓
Receive authToken & userId
        ↓
Store in localStorage
        ↓
Set in API instance
        ↓
All Subsequent Requests Include:
• X-Auth-Token: <token>
• X-User-Id: <userId>
        ↓
    ┌───┴───┐
    ↓       ↓
Valid    Invalid
Token    Token
    ↓       ↓
Process  Return 401
Request  Unauthorized
    ↓       ↓
Return   Clear Storage
Data         ↓
         Redirect to Login
```

---

## State Management

```
┌─────────────────────────────────────────┐
│         Component State                  │
│                                          │
│  messages: Message[]                     │
│  ├─ id: string                          │
│  ├─ text: string                        │
│  ├─ sender: 'bot' | 'user'              │
│  ├─ timestamp: Date                     │
│  └─ type: 'text' | 'options' | ...      │
│                                          │
│  userProfile: UserProfile                │
│  ├─ name?: string                       │
│  ├─ role?: string                       │
│  ├─ interests?: string[]                │
│  ├─ teamSize?: string                   │
│  ├─ experience?: string                 │
│  └─ workStyle?: string                  │
│                                          │
│  availableChannels: ChannelInfo[]       │
│  ├─ _id: string                         │
│  ├─ name: string                        │
│  ├─ msgs: number                        │
│  └─ usersCount: number                  │
│                                          │
│  currentQuestion: number                 │
│  waitingForInput: boolean                │
│  isTyping: boolean                       │
│  selectedOptions: string[]               │
└─────────────────────────────────────────┘
```

---

## API Response Types

```
┌─────────────────────────────────────────┐
│         Type Definitions                 │
│                                          │
│  LoginResponse                           │
│  ├─ status: string                      │
│  └─ data                                │
│      ├─ userId: string                  │
│      ├─ authToken: string               │
│      └─ me: UserObject                  │
│                                          │
│  PostMessageResponse                     │
│  ├─ success: boolean                    │
│  └─ message                             │
│      ├─ _id: string                     │
│      ├─ rid: string                     │
│      ├─ msg: string                     │
│      ├─ ts: string                      │
│      └─ u: UserObject                   │
│                                          │
│  ChannelResponse                         │
│  ├─ success: boolean                    │
│  └─ channel                             │
│      ├─ _id: string                     │
│      ├─ name: string                    │
│      ├─ t: string                       │
│      ├─ msgs: number                    │
│      └─ usersCount: number              │
│                                          │
│  UserInfoResponse                        │
│  ├─ success: boolean                    │
│  └─ user                                │
│      ├─ _id: string                     │
│      ├─ username: string                │
│      ├─ name: string                    │
│      ├─ status: string                  │
│      └─ avatarUrl?: string              │
└─────────────────────────────────────────┘
```

---

## File Dependencies

```
InteractiveChatBot.tsx
    │
    ├─ imports React, useState, useEffect
    ├─ imports @rocket.chat/fuselage components
    ├─ imports useRocketChatActions hook
    └─ imports chatbotActions
            │
            └─ chatbotActions.ts
                    │
                    ├─ imports RocketChatAPI
                    └─ rocketchatApi.ts
                            │
                            └─ Uses native fetch() API
```

---

## Performance Considerations

```
┌─────────────────────────────────────────┐
│         Optimization Strategies          │
│                                          │
│  1. Lazy Loading                         │
│     • Load API client on demand         │
│     • Initialize only when needed       │
│                                          │
│  2. Caching                              │
│     • Store auth tokens in localStorage │
│     • Cache user info                   │
│     • Cache channel list                │
│                                          │
│  3. Batch Requests                       │
│     • Group related API calls           │
│     • Use Promise.all() for parallel    │
│                                          │
│  4. Error Recovery                       │
│     • Retry failed requests             │
│     • Graceful degradation              │
│     • User-friendly error messages      │
│                                          │
│  5. Rate Limiting                        │
│     • Throttle API calls                │
│     • Debounce user input               │
│     • Queue requests                    │
└─────────────────────────────────────────┘
```

---

## Security Measures

```
┌─────────────────────────────────────────┐
│         Security Features                │
│                                          │
│  1. Authentication                       │
│     • Token-based auth                  │
│     • Secure token storage              │
│     • Auto-logout on expiry             │
│                                          │
│  2. Authorization                        │
│     • Role-based access                 │
│     • Permission checks                 │
│     • Admin-only endpoints              │
│                                          │
│  3. Data Validation                      │
│     • Input sanitization                │
│     • Type checking                     │
│     • Error handling                    │
│                                          │
│  4. HTTPS                                │
│     • Encrypted communication           │
│     • Secure headers                    │
│     • CORS handling                     │
└─────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Production Environment           │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │     Frontend (React/Meteor)       │  │
│  │  • InteractiveChatBot.tsx         │  │
│  │  • chatbotActions.ts              │  │
│  │  • rocketchatApi.ts               │  │
│  └───────────────────────────────────┘  │
│                  ↓                       │
│         HTTPS (Port 443)                 │
│                  ↓                       │
│  ┌───────────────────────────────────┐  │
│  │     Backend (Rocket.Chat)         │  │
│  │  • REST API Endpoints             │  │
│  │  • Authentication Service         │  │
│  │  • Database (MongoDB)             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

**This architecture provides a scalable, maintainable, and secure foundation for the chatbot system with complete API integration.**
