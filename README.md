# 🤖 SynapseGPT

A full-stack AI-powered chatbot application inspired by ChatGPT, built with modern web technologies and integrated with the **OpenRouter API** for AI-powered conversations.

SynapseGPT demonstrates the development of an AI-enabled web application with a **React frontend, Node.js/Express backend, MongoDB database integration, REST APIs, authentication workflows, and secure environment configuration**.

---

## 🚀 Features

- 💬 Interactive AI-powered chat interface
- 🤖 OpenRouter API integration for AI conversations
- ⚡ Real-time AI response handling
- 🔌 RESTful API communication between frontend and backend
- 🗄️ MongoDB database integration
- 🔐 Environment variable management using `.env`
- 🛡️ Secure API key handling with `.gitignore`
- ⚠️ API error and rate-limit handling
- 👤 Authentication workflow
- 🔄 Backend API routing and request handling
- 🚀 Deployment configuration and optimization

---

## Project Structure
    SynapseGPT/
    ├── Backend/
    │   ├── models/
    │   │   ├── Thread.js      # Mongoose schema for conversations & messages
    │   │   └── User.js        # Mongoose schema for user credentials
    │   ├── routes/
    │   │   ├── auth.js        # Express routes for /signup and /login
    │   │   └── chat.js        # Chat routes & OpenRouter API client
    │   ├── utils/
    │   │   └── openrouter.js  # OpenRouter completion helper
    │   ├── .env                  # Secrets (MONGODB_URI, OPENROUTER_API_KEY, JWT_SECRET)
    │   ├── package.json  # Node.js dependencies (Express, Mongoose, etc.)
    │   └── server.js        # Express server entry point & DB connection
    │
    └── Frontend/
        ├── src/
        │   ├── assets/              # Static images (logos)
        │   ├── pages/
        │   │   ├── Home.jsx      # Landing page
        │   │   ├── Login.jsx    # User login form
        │   │   └── Signup.jsx  # User registration form
        │   ├── api.js              # Client-side API fetch wrappers
        │   ├── App.jsx            # Router, PrivateRoute & Chat layout state
        │   ├── Chat.jsx          # Message bubbles & animated typewriter
        │   ├── ChatWindow.jsx  # Top navbar, input box & submit logic
        │   ├── MyContext.jsx    # React Context for cross-component state
        │   ├── Sidebar.jsx        # Chat history list, thread selection & delete
        │   ├── main.jsx          # React DOM entry point
        │   ├── App.css, Chat.css, ChatWindow.css, Sidebar.css
        ├── index.html        # HTML shell loading FontAwesome
        ├── package.json  # React 19, Vite, React Router v7
        └── vite.config.js
  ──────

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React.js** | Frontend user interface |
| **JavaScript** | Application logic |
| **Node.js** | Backend runtime |
| **Express.js** | Backend server and REST APIs |
| **MongoDB** | Database |
| **OpenRouter API** | AI model integration |
| **REST APIs** | Frontend-backend communication |
| **Git & GitHub** | Version control |

##  End-to-End Data Flow

    ┌────────────────┐       ┌────────────────────────┐                ┌─────────┐       ┌────────────────┐ ┌──────┐
    │ React Frontend │       │ Express Server (:8080) │                │ MongoDB │       │ OpenRouter API │ │ User │
    └────────────────┘       └────────────────────────┘                └─────────┘       └────────────────┘ └──────┘
             │                            │                                 │                     │             │
             ◄───────────────────────────Types prompt & clicks Send / presses Enter─────────────────────────────│
             │                            │                                 │                     │             │
             │ Sets loading = true, clears input ─┐                         │                     │             │
             │◄─┘                         │                                 │                     │             │
             │                            │                                 │                     │             │
             │POST /api/chat { threadId, m►ssage }                          │                     │             │
             │                            │                                 │                     │             │
             │                            │──Thread.findOne({ threadId })───►                     │             │┤ alt Thread does not exist ├
             │                            │                                 │                     │             │
             │                            │new Thread({ threadId, title: mes►age, messages: [userMsg] })        │
             │                            │                                 │                     │             │
             │                            │─thread.messages.push(userMsg)───►                     │             │
             │                            │                                 │                     │             │
             │                            │─────────POST /chat/completions (OpenRouter)───────────►             │
             │                            │                                 │                     │             │
             │                            ◄JSON { choices: [ { message: { content: "..." } } ] }┈┈│             │
             │                            │                                 │                     │             │
             │                            │thread.messages.push(assistantMsg►, save()             │             │
             │                            │                                 │                     │             │
             ◄┈┈┈JSON { reply: "..." }┈┈┈┈│                                 │                     │             │
             │                            │                                 │                     │             │
             │ setReply(reply), loading = false ─┐                          │                     │             │
             │◄─┘                         │                                 │                     │             │
             │                            │                                 │                     │             │
             │ Typewriter interval runs (word by word) ─┐                   │                     │             │
             │◄─┘                         │                                 │                     │             │
             │                            │                                 │                     │             │
             │ Markdown rendered via rehype-highlight ─┐                    │                     │             │
             │◄─┘                         │                                 │                     │             │
             │                            │                                 │                     │             │
             │GET /api/thread (Sidebar ref►esh)                             │                     │             │
             │                            │                                 │                     │             │
             │                            │Thread.find().sort({ updatedAt: -► })                  │             │
             │                            │                                 │                     │             │
             │                            ◄┈┈┈┈┈┈┈┈┈┈┈┈threads┈┈┈┈┈┈┈┈┈┈┈┈┈┈│                     │             │
             │                            │                                 │                     │             │
             ◄┈┈┈┈Updated thread list┈┈┈┈┈│                                 │                     │             │
             │                            │                                 │                     │             │
  ──────

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │                     │
                    │  Chat Interface     │
                    │  User Interaction   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Node.js + Express │
                    │                     │
                    │  API Routes         │
                    │  Business Logic     │
                    │  Error Handling     │
                    └───────┬───────┬─────┘
                            │       │
                            │       │ AI Request
                            ▼       ▼
                    ┌──────────┐  ┌────────────────┐
                    │ MongoDB  │  │ OpenRouter API │
                    │          │  │                │
                    │ User &   │  │ AI Model       │
                    │ Chat Data│  │ Responses      │
                    └──────────┘  └────────────────┘



🔄 Chat Flow

User enters a message
        ↓
React Chat Interface
        ↓
Frontend REST API Request
        ↓
Express.js Backend
        ↓
OpenRouter API
        ↓
AI Model
        ↓
AI Response
        ↓
Backend
        ↓
React Frontend
        ↓
Response displayed to user

