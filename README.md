# 🚀 Project Overview: Rocket.Chat Onboarding Bot

## 1.1 Problem Statement
New members often feel lost when joining our Rocket.Chat workspace. To save time and make onboarding smoother, we aim to create a friendly bot that guides users through the initial steps automatically.

## 1.2 Why This Problem Exists or Matters
New members often feel lost when joining a Rocket.Chat workspace because there's no guided onboarding process. This matters because it:
- Slows down collaboration
- Increases admin workload  
- Reduces engagement

**Who benefits:**
- **New users** → get clear guidance and feel comfortable faster
- **Admins/developers** → save time by automating repetitive onboarding
- **Teams/community** → improved communication and productivity

## 1.3 Stretch Goals (If Time Permits)
1. Multi-language or customizable welcome messages
2. AI-based FAQ responses
3. Role-based personalized onboarding paths

## 2.3 Tech Stack & Tools

**Languages:** HTML, CSS, JavaScript

**Runtime & Development Tools:**
- Node.js
- VS Code
- Git
- Browser
- Rocket.Chat Dev Workspace

**APIs & Services:**
- Rocket.Chat REST & WebSocket APIs

**Required API Endpoints (Minimum):**
- `POST /api/v1/login` - User authentication
- `POST /api/v1/chat.postMessage` - Send messages
- `GET /api/v1/users.info` - Get user information
- `GET /api/v1/channels.listJoined` - List user channels
- `POST /api/v1/commands.run` - Execute commands
