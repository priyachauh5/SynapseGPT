// import './App.css';
// import Sidebar from "./Sidebar.jsx";
// import ChatWindow from "./ChatWindow.jsx";
// import {MyContext} from "./MyContext.jsx";
// import { useState } from 'react';
// import {v1 as uuidv1} from "uuid";

// function App() {
//   const [prompt, setPrompt] = useState("");
//   const [reply, setReply] = useState(null);
//   const [currThreadId, setCurrThreadId] = useState(uuidv1());
//   const [prevChats, setPrevChats] = useState([]); //stores all chats of curr threads
//   const [newChat, setNewChat] = useState(true);
//   const [allThreads, setAllThreads] = useState([]);

//   const providerValues = {
//     prompt, setPrompt,
//     reply, setReply,
//     currThreadId, setCurrThreadId,
//     newChat, setNewChat,
//     prevChats, setPrevChats,
//     allThreads, setAllThreads
//   }; 

//   return (
//     <div className='app'>
//       <MyContext.Provider value={providerValues}>
//           <Sidebar></Sidebar>
//           <ChatWindow></ChatWindow>
//         </MyContext.Provider>
//     </div>
//   )
// }

// export default App


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

// 🔐 Protected Route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// 💬 Chat Layout (your existing UI)
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
    sidebarOpen, setSidebarOpen
  };

  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

// 🚀 Main App with Routing
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 💬 Protected Chat */}
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