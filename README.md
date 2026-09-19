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


📂 Project Structure

SynapseGPT/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .env
├── .gitignore
└── README.md

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

