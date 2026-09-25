import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, setAllThreads, sidebarOpen, setSidebarOpen} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.clear();
        sessionStorage.clear();
        setIsOpen(false);
        navigate("/");
    };

    const getReply = async () => {
        if (!prompt.trim() || loading) return;

        const currentPrompt = prompt.trim();
        setLoading(true);
        setNewChat(false);
        setPrompt("");

        console.log("message ", currentPrompt, " threadId ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: currentPrompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            console.log(res);

            if (res.reply) {
                const now = new Date().toISOString();
                const newMessages = [
                    {
                        role: "user",
                        content: currentPrompt,
                        timestamp: res.userMessage?.timestamp || now,
                        _id: res.userMessage?._id
                    },
                    {
                        role: "assistant",
                        content: res.reply,
                        timestamp: res.assistantMessage?.timestamp || now,
                        _id: res.assistantMessage?._id
                    }
                ];

                // Update threads list in sidebar: update timestamp, append new messages, and move to top
                if (setAllThreads) {
                    setAllThreads(prev => {
                        const existing = prev.find(t => t.threadId === currThreadId);
                        if (!existing) {
                            return [{
                                threadId: currThreadId,
                                title: currentPrompt,
                                updatedAt: now,
                                messages: newMessages
                            }, ...prev];
                        }
                        const updated = {
                            ...existing,
                            updatedAt: now,
                            messages: [...(existing.messages || []), ...newMessages]
                        };
                        return [updated, ...prev.filter(t => t.threadId !== currThreadId)];
                    });
                }

                setPrevChats(prevChats => [
                    ...prevChats,
                    {
                        role: "user",
                        content: currentPrompt,
                        timestamp: res.userMessage?.timestamp || now,
                        _id: res.userMessage?._id
                    },
                    {
                        role: "assistant",
                        content: res.reply,
                        timestamp: res.assistantMessage?.timestamp || now,
                        _id: res.assistantMessage?._id
                    }
                ]);

                setReply(res.reply);
            }
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbarLeft">
                    <button
                        type="button"
                        className={`sidebarToggleBtn ${sidebarOpen ? "sidebarOpen" : "sidebarClosed"}`}
                        onClick={() => setSidebarOpen(prev => !prev)}
                        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span className="navbarTitle">SynapseGPT <i className="fa-solid fa-chevron-down"></i></span>
                </div>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            }
            <Chat isMainLoading={loading} />

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    >
                           
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SynapseGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;