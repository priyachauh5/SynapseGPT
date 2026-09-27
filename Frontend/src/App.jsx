import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

//  Protected Route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// Chat Layout (your existing UI)
function ChatLayout() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 768;
    }
    return true;
  });

  // Persistent theme state: 'dark' (default), 'light', or 'fancy' (AI theme)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("synapse_theme");
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "fancy") {
        return savedTheme;
      }
    } catch (e) {
      console.error("Failed to load theme from localStorage:", e);
    }
    return "dark";
  });

  useEffect(() => {
    try {
      localStorage.setItem("synapse_theme", theme);
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e);
    }
  }, [theme]);

  // Handle dynamic responsive transitions across mobile and desktop breakpoints
  useEffect(() => {
    let prevIsDesktop = window.innerWidth > 768;

    const handleResize = () => {
      const isDesktop = window.innerWidth > 768;
      if (isDesktop !== prevIsDesktop) {
        prevIsDesktop = isDesktop;
        setSidebarOpen(isDesktop);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    sidebarOpen, setSidebarOpen,
    theme, setTheme
  };

  return (
    <div className={`app theme-${theme}`} data-theme={theme}>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/*  Home Page */}
        <Route path="/" element={<Home />} />

        {/*  Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/*  Protected Chat */}
        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <ChatLayout />
            </PrivateRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;