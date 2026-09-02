# 💬 Socialize

Socialize is a real-time social communication platform that allows users to connect with friends through **real-time messaging, group chats, video calls, status updates, and an AI-powered Gemini assistant**.

The project is built using the **MERN stack** with Stream Chat, Stream Video, and Google Gemini AI.

---

## 🚀 Live Demo

🌐 **Frontend:**  
https://socialize-lemon.vercel.app/

🔗 **Backend:**  
https://socialize-app-dzyh.onrender.com/

---

## ✨ Features

### 💬 Real-Time Chat
- One-to-one real-time messaging
- Send and receive messages instantly
- Search for friends and start conversations
- Chat history
- Online communication using Stream Chat

### 👥 Group Chats
- Create and participate in group conversations
- Real-time group messaging
- Dedicated group chat interface

### 📹 Video Calling
- Real-time video calls
- Audio/video communication
- Stream Video SDK integration
- Call controls and call interface

### 📱 Status
- Create and view status updates
- View status groups
- Interactive status experience

### 🔔 Notifications
- Friend request notifications
- Notification count badge
- Dedicated notifications section

### 🤖 Gemini AI Assistant
- AI-powered chat assistant
- Uses Google Gemini API
- Conversational interaction
- Backend API integration
- Chat history stored locally for a better user experience

### 🔐 Authentication
- User authentication
- Protected application routes
- User profiles
- Profile pictures

### ⚙️ Settings
- User profile management
- Application settings
- Profile customization

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Lucide React
- TanStack Query
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST APIs

### Real-Time Communication
- Stream Chat
- Stream Video

### Generative AI
- Google Gemini API
- Gemini 2.5 Flash

### Deployment
- Vercel — Frontend
- Render — Backend

### Development Tools
- Git
- GitHub
- VS Code
- Postman
- Cursor / AI-assisted development tools

---

## 🏗️ Project Structure

```text
Socialize/
│
├── frontend/
│   └── chat/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── main.jsx
│       │
│       ├── public/
│       ├── package.json
│       └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md


```

🤖 Gemini AI Integration

Socialize integrates Google Gemini to provide an AI-powered assistant.

The frontend sends the user's request to the backend:

React Frontend
      │
      ▼
POST /api/ai/ask
      │
      ▼
Node.js / Express Backend
      │
      ▼
Google Gemini API
      │
      ▼
AI Response
      │
      ▼
React AI Chat Interface
The Gemini API key is stored as a backend environment variable instead of exposing it in the frontend.

🔐 Security

Security was considered while integrating third-party APIs and AI services.

API keys are stored using environment variables
Sensitive credentials are not committed to GitHub
Gemini API requests are handled through the backend
Protected application routes are used for authenticated users
Backend validation is used for API requests
AI-generated code is reviewed before being integrated
Production secrets are configured through deployment environment variables

AI coding tools are used as development assistants, but generated code is reviewed and tested before being used in the application.

⚙️ Environment Variables
Backend

Create a .env file inside the backend directory:

PORT=5000
MONGODB_URI=your_mongodb_connection_string

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

GEMINI_API_KEY=your_gemini_api_key
Frontend

Configure the frontend environment variables required by the application.

Never commit real API keys or secrets to GitHub.

💻 Installation
1. Clone the repository
git clone https://github.com/ubothe14/Socialize.git
cd Socialize
2. Install backend dependencies
cd backend
npm install
3. Configure environment variables

Create the .env file and add the required credentials.

4. Start the backend
npm run dev
5. Install frontend dependencies

Open another terminal:

cd frontend/chat
npm install
6. Start the frontend
npm run dev

The application will then be available through the local Vite development server.

📡 API
Authentication
/api/auth

Handles user authentication and account-related operations.

Chat
/api/chat

Handles chat-related backend operations.

Stream Token
/api/chat/token

Generates the Stream token required for real-time communication.

Gemini AI
POST /api/ai/ask

Sends a user prompt to the backend and returns the Gemini AI response.

📸 Key Application Sections
💬 Chats
👥 Groups
📡 Status
🌎 Discover
🤖 Gemini AI
🔔 Notifications
⚙️ Settings

📈 Future Improvements
Message reactions
File and image sharing
Push notifications
AI-powered message summarization
AI conversation memory
Improved moderation and spam detection
Read receipts
Typing indicators
Advanced user discovery
Mobile application

