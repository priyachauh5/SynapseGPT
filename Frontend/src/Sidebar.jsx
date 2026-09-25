import "./Sidebar.css";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import blackLogo from "./assets/blacklogo.png";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setCurrThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setPrevChats,
        sidebarOpen,
        setSidebarOpen
    } = useContext(MyContext);

    // Search query state
    const [searchQuery, setSearchQuery] = useState("");

    // Persistent pinned thread IDs in localStorage
    const [pinnedIds, setPinnedIds] = useState(() => {
        try {
            const saved = localStorage.getItem("synapse_pinned_threads");
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error("Failed to load pinned threads from localStorage:", err);
            return [];
        }
    });

    // Save pinned threads whenever they change
    useEffect(() => {
        try {
            localStorage.setItem("synapse_pinned_threads", JSON.stringify(pinnedIds));
        } catch (err) {
            console.error("Failed to save pinned threads to localStorage:", err);
        }
    }, [pinnedIds]);

    // Fetch all threads from the server
    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title,
                updatedAt: thread.updatedAt || thread.createdAt,
                messages: thread.messages || []
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, []);

    // Existing New Chat logic
    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setSearchQuery(""); // Clear search query when starting a new chat
        if (window.innerWidth <= 768 && setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    // Load an existing thread
    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        if (window.innerWidth <= 768 && setSidebarOpen) {
            setSidebarOpen(false);
        }

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.error("Error loading chat:", err);
        }
    };

    // Delete a thread
    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, { method: "DELETE" });
            await response.json();

            // Remove from state
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            setPinnedIds(prev => prev.filter(id => id !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
        }
    };

    // Toggle Pin / Unpin
    const togglePin = (threadId, e) => {
        if (e) e.stopPropagation();
        setPinnedIds(prev => {
            if (prev.includes(threadId)) {
                return prev.filter(id => id !== threadId);
            } else {
                return [threadId, ...prev];
            }
        });
    };

    // Filter threads based on search input
    const query = searchQuery.trim().toLowerCase();
    const filteredThreads = (allThreads || []).filter(thread => {
        if (!query) return true;
        const titleMatch = thread.title && thread.title.toLowerCase().includes(query);
        const messageMatch = Array.isArray(thread.messages) && thread.messages.some(
            m => m.content && m.content.toLowerCase().includes(query)
        );
        return Boolean(titleMatch || messageMatch);
    });

    // Pinned threads
    const pinnedThreads = [];
    pinnedIds.forEach(id => {
        const found = filteredThreads.find(t => t.threadId === id);
        if (found) pinnedThreads.push(found);
    });

    // Recent threads (unpinned), explicitly sorted by updatedAt descending
    const recentThreads = filteredThreads
        .filter(t => !pinnedIds.includes(t.threadId))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    // Render individual chat item
    const renderChatItem = (thread, isPinned) => {
        const isSelected = thread.threadId === currThreadId;

        return (
            <li
                key={thread.threadId}
                onClick={() => changeThread(thread.threadId)}
                className={`historyItem ${isSelected ? "highlighted" : ""} ${isPinned ? "isPinned" : ""}`}
                title={thread.title}
            >
                <div className="itemTitleContainer">
                    <i className="fa-regular fa-message itemMessageIcon"></i>
                    <span className="itemTitle">{thread.title || "Untitled Chat"}</span>
                </div>
                <div className="itemActions">
                    <button
                        type="button"
                        className={`itemActionBtn pinBtn ${isPinned ? "activePin" : ""}`}
                        title={isPinned ? "Unpin chat" : "Pin chat"}
                        onClick={(e) => togglePin(thread.threadId, e)}
                        aria-label={isPinned ? "Unpin chat" : "Pin chat"}
                    >
                        <i className="fa-solid fa-thumbtack"></i>
                    </button>
                    <button
                        type="button"
                        className="itemActionBtn deleteBtn"
                        title="Delete chat"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.threadId);
                        }}
                        aria-label="Delete chat"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </li>
        );
    };

    return (
        <>
            {/* Overlay backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebarBackdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
                <div className="sidebarInner">
                    {/* Top Fixed Area */}
                    <div className="sidebarTop">
                        {/* Header with SynapseGPT brand and Collapse button */}
                        <div className="sidebarHeader">
                            <div className="sidebarBrand">
                                <img src={blackLogo} alt="SynapseGPT" className="sidebarBrandLogo" />
                                <span className="sidebarBrandText">SynapseGPT</span>
                            </div>
                            <button
                                type="button"
                                className="sidebarHeaderCloseBtn"
                                onClick={() => setSidebarOpen(false)}
                                title="Close sidebar"
                                aria-label="Close sidebar"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        </div>

                        {/* A. New Chat */}
                        <button
                            type="button"
                            className="newChatBtn"
                            onClick={createNewChat}
                            title="Start a new chat"
                        >
                            <div className="newChatBtnLeft">
                                <i className="fa-solid fa-plus newChatPlusIcon"></i>
                                <span className="newChatBtnText">New chat</span>
                            </div>
                            <i className="fa-regular fa-pen-to-square newChatIcon"></i>
                        </button>

                        {/* B. Search */}
                        <div className="sidebarSearchWrapper">
                            <div className="sidebarSearchBox">
                                <i className="fa-solid fa-magnifying-glass searchIcon"></i>
                                <input
                                    type="text"
                                    className="sidebarSearchInput"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="clearSearchBtn"
                                        onClick={() => setSearchQuery("")}
                                        title="Clear search"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Conversation List Area */}
                    <div className="sidebarScrollArea">
                        {/* C. Pinned Section */}
                        <div className="sidebarSection">
                            <div className="sectionHeader">
                                <i className="fa-solid fa-thumbtack sectionHeaderIcon"></i>
                                <span>Pinned</span>
                            </div>
                            {pinnedThreads.length > 0 ? (
                                <ul className="history">
                                    {pinnedThreads.map((thread) => renderChatItem(thread, true))}
                                </ul>
                            ) : (
                                !searchQuery && (
                                    <p className="emptySectionText">No pinned conversations</p>
                                )
                            )}
                        </div>

                        {/* D. Recents Section */}
                        <div className="sidebarSection">
                            <div className="sectionHeader">
                                <i className="fa-regular fa-clock sectionHeaderIcon"></i>
                                <span>Recents</span>
                            </div>
                            {recentThreads.length > 0 ? (
                                <ul className="history">
                                    {recentThreads.map((thread) => renderChatItem(thread, false))}
                                </ul>
                            ) : (
                                <p className="emptySectionText">
                                    {searchQuery
                                        ? (pinnedThreads.length > 0 ? "No recent conversations found" : "No conversations found")
                                        : "No recent conversations"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="sign">
                        <p>By PriyaChauhan &hearts;</p>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;