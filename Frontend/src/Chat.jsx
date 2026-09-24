import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { ScaleLoader } from "react-spinners";

// Helper to strip markdown syntax to plain text for copy
const stripMarkdown = (text) => {
    if (!text || typeof text !== "string") return "";
    let clean = text;
    // Replace fenced code blocks with just their code content
    clean = clean.replace(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/g, "$1");
    clean = clean.replace(/```([\s\S]*?)```/g, "$1");
    // Replace inline code
    clean = clean.replace(/`([^`]+)`/g, "$1");
    // Remove images
    clean = clean.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
    // Links [text](url) -> text
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Remove HTML tags
    clean = clean.replace(/<[^>]*>/g, "");
    // Headers (# Title)
    clean = clean.replace(/^#{1,6}\s+(.*)$/gm, "$1");
    // Bold / Italic
    clean = clean.replace(/\*\*\*(.*?)\*\*\*/g, "$1");
    clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
    clean = clean.replace(/\*(.*?)\*/g, "$1");
    clean = clean.replace(/___(.*?)___/g, "$1");
    clean = clean.replace(/__(.*?)__/g, "$1");
    clean = clean.replace(/_(.*?)_/g, "$1");
    // Strikethrough
    clean = clean.replace(/~~(.*?)~~/g, "$1");
    // Blockquotes
    clean = clean.replace(/^\s*>\s+/gm, "");
    // Horizontal rules
    clean = clean.replace(/^[-*_]{3,}\s*$/gm, "");
    return clean.trim();
};

// Clipboard fallback helper
const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((resolve, reject) => {
            document.execCommand("copy") ? resolve() : reject(new Error("Copy command failed"));
            textArea.remove();
        });
    }
};

// Format timestamps in a user-friendly, subtle way
const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

    if (isToday) {
        return timeStr;
    } else if (isYesterday) {
        return `Yesterday, ${timeStr}`;
    } else if (date.getFullYear() === now.getFullYear()) {
        const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
        return `${dateStr}, ${timeStr}`;
    } else {
        const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
        return `${dateStr}, ${timeStr}`;
    }
};

function Chat({ isMainLoading = false }) {
    const { newChat, prevChats, setPrevChats, reply, currThreadId, setAllThreads } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    // Edit message state
    const [editingIdx, setEditingIdx] = useState(null);
    const [editText, setEditText] = useState("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [regeneratingIdx, setRegeneratingIdx] = useState(null);

    // Action feedback state
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [sharedIdx, setSharedIdx] = useState(null);

    const editTextareaRef = useRef(null);
    const chatsEndRef = useRef(null);

    // Typing effect for the latest response
    useEffect(() => {
        if (reply === null) {
            setLatestReply(null); // prevchat load
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(" "); // individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));

            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    // Auto-focus and resize textarea when entering edit mode
    useEffect(() => {
        if (editingIdx !== null && editTextareaRef.current) {
            editTextareaRef.current.style.height = "auto";
            editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 250)}px`;
            editTextareaRef.current.focus();
        }
    }, [editingIdx]);

    // Auto scroll when messages change or typing
    useEffect(() => {
        chatsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply, regeneratingIdx]);

    // Start editing user message
    const startEditing = (idx, text) => {
        if (isMainLoading || isSubmittingEdit || regeneratingIdx !== null) return;
        setEditingIdx(idx);
        setEditText(text);
    };

    // Cancel edit
    const cancelEditing = () => {
        setEditingIdx(null);
        setEditText("");
    };

    // Handle key press inside edit textarea (Enter = Submit, Esc = Cancel)
    const handleEditKeyDown = (e, idx) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitEdit(idx);
        } else if (e.key === "Escape") {
            cancelEditing();
        }
    };

    // Submit edited message and trigger regeneration
    const submitEdit = async (idx) => {
        const trimmed = editText.trim();
        if (!trimmed || isSubmittingEdit) return;

        // If content didn't change, just close edit
        if (trimmed === prevChats[idx]?.content) {
            cancelEditing();
            return;
        }

        const targetMessageId = prevChats[idx]?._id;
        setIsSubmittingEdit(true);
        setEditingIdx(null);

        // Optimistically update the user message
        const now = new Date().toISOString();
        setPrevChats((prev) => {
            const updated = [...prev];
            if (updated[idx]) {
                updated[idx] = {
                    ...updated[idx],
                    content: trimmed,
                    timestamp: now,
                };
            }
            return updated;
        });

        // Set the corresponding AI response (idx + 1) as regenerating
        setRegeneratingIdx(idx + 1);

        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    threadId: currThreadId,
                    message: trimmed,
                    editIndex: idx,
                    messageId: targetMessageId,
                }),
            };

            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();

            if (res.reply) {
                // Update conversation at that exact point
                setPrevChats((prev) => {
                    const updated = [...prev];
                    if (updated[idx]) {
                        updated[idx] = {
                            ...updated[idx],
                            content: trimmed,
                            timestamp: res.userMessage?.timestamp || now,
                            _id: res.userMessage?._id || updated[idx]._id,
                        };
                    }
                    if (updated[idx + 1]) {
                        updated[idx + 1] = {
                            ...updated[idx + 1],
                            role: "assistant",
                            content: res.reply,
                            timestamp: res.assistantMessage?.timestamp || now,
                            _id: res.assistantMessage?._id || updated[idx + 1]._id,
                        };
                    } else {
                        updated.push({
                            role: "assistant",
                            content: res.reply,
                            timestamp: res.assistantMessage?.timestamp || now,
                            _id: res.assistantMessage?._id,
                        });
                    }
                    return updated;
                });

                // If editing the very first user message, update thread title in sidebar
                if (idx === 0 && setAllThreads) {
                    setAllThreads((prev) =>
                        prev.map((t) => (t.threadId === currThreadId ? { ...t, title: trimmed } : t))
                    );
                }
            } else {
                alert("Failed to regenerate response. Please try again.");
            }
        } catch (err) {
            console.error("Error editing message:", err);
            alert("Error communicating with server. Please try again.");
        } finally {
            setIsSubmittingEdit(false);
            setRegeneratingIdx(null);
            setEditText("");
        }
    };

    // Share prompt using native Web Share API with clipboard fallback
    const handleShare = async (content, idx) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "SynapseGPT Prompt",
                    text: content,
                });
                return;
            } catch (err) {
                if (err.name === "AbortError") {
                    // User canceled native share dialog
                    return;
                }
                // Fallback to clipboard if share failed
            }
        }

        try {
            await copyToClipboard(content);
            setSharedIdx(idx);
            setTimeout(() => setSharedIdx(null), 2000);
        } catch (err) {
            console.error("Failed to copy prompt:", err);
        }
    };

    // Copy AI response to clipboard (without markdown syntax)
    const handleCopy = async (content, idx) => {
        try {
            const cleanText = stripMarkdown(content);
            await copyToClipboard(cleanText);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 2000);
        } catch (err) {
            console.error("Failed to copy AI response:", err);
        }
    };

    const isBusy = isMainLoading || isSubmittingEdit || regeneratingIdx !== null;

    return (
        <>
            {newChat && <h1>Start a New Chat!</h1>}
            <div className="chats">
                {prevChats?.map((chat, idx) => {
                    const isUser = chat.role === "user";
                    const isAssistant = chat.role === "assistant";
                    const isLastAssistant = idx === prevChats.length - 1 && isAssistant;
                    const isRegenerating = regeneratingIdx === idx;

                    // Check if AI response has been generated for this user message
                    const hasAiResponse =
                        isUser &&
                        prevChats[idx + 1] &&
                        prevChats[idx + 1].role === "assistant";

                    const canEdit = hasAiResponse && !isBusy;

                    // What content to display for assistant
                    const displayContent =
                        isLastAssistant && latestReply !== null ? latestReply : chat.content;

                    if (isUser) {
                        return (
                            <div className="userDiv" key={chat._id || idx}>
                                <div className="userMessageWrapper">
                                    {editingIdx === idx ? (
                                        <div className="editContainer">
                                            <textarea
                                                ref={editTextareaRef}
                                                className="editTextarea"
                                                value={editText}
                                                onChange={(e) => {
                                                    setEditText(e.target.value);
                                                    e.target.style.height = "auto";
                                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 250)}px`;
                                                }}
                                                onKeyDown={(e) => handleEditKeyDown(e, idx)}
                                                placeholder="Edit your message..."
                                            />
                                            <div className="editBtnGroup">
                                                <button
                                                    type="button"
                                                    className="cancelEditBtn"
                                                    onClick={cancelEditing}
                                                    disabled={isSubmittingEdit}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="saveEditBtn"
                                                    onClick={() => submitEdit(idx)}
                                                    disabled={isSubmittingEdit || !editText.trim()}
                                                >
                                                    {isSubmittingEdit ? "Saving..." : "Save & Submit"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="userMessage">{chat.content}</p>
                                            <div className="messageActions userActions">
                                                {chat.timestamp && (
                                                    <span className="messageTime">
                                                        {formatTimestamp(chat.timestamp)}
                                                    </span>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        className="actionBtn"
                                                        title="Edit message"
                                                        onClick={() => startEditing(idx, chat.content)}
                                                        disabled={isBusy}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="actionBtn"
                                                    title="Share prompt"
                                                    onClick={() => handleShare(chat.content, idx)}
                                                >
                                                    {sharedIdx === idx ? (
                                                        <>
                                                            <i className="fa-solid fa-check" style={{ color: "#10a37f" }}></i>
                                                            <span className="actionFeedback">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <i className="fa-solid fa-share-nodes"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Assistant message
                    return (
                        <div className="gptDiv" key={chat._id || idx}>
                            {isRegenerating ? (
                                <div className="regeneratingBox">
                                    <ScaleLoader color="#339cff" height={15} width={3} radius={2} margin={2} loading={true} />
                                    <span className="regeneratingText">Regenerating response...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="gptContent">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                            {displayContent}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="messageActions gptActions">
                                        {chat.timestamp && (
                                            <span className="messageTime">
                                                {formatTimestamp(chat.timestamp)}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className="actionBtn copyBtn"
                                            title="Copy response"
                                            onClick={() => handleCopy(chat.content, idx)}
                                        >
                                            {copiedIdx === idx ? (
                                                <>
                                                    <i className="fa-solid fa-check" style={{ color: "#10a37f" }}></i>
                                                    <span className="actionFeedback">Copied</span>
                                                </>
                                            ) : (
                                                <i className="fa-regular fa-copy"></i>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                <div ref={chatsEndRef} />
            </div>
        </>
    );
}

export default Chat;