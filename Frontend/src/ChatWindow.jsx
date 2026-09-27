import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat,
        setAllThreads,
        sidebarOpen,
        setSidebarOpen,
        theme,
        setTheme
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const dropdownRef = useRef(null);
    const userButtonRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

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
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };

    const cycleTheme = () => {
        if (theme === "dark") setTheme("light");
        else if (theme === "light") setTheme("fancy");
        else setTheme("dark");
    };

    const getThemeIcon = () => {
        if (theme === "light") return "fa-solid fa-sun";
        if (theme === "fancy") return "fa-solid fa-wand-magic-sparkles";
        return "fa-solid fa-moon";
    };

    return (
        <div className="chatWindow">
            {/* Top Navigation Bar */}
            <header className="navbar">
                <div className="navbarLeft">
                    <button
                        type="button"
                        className={`sidebarToggleBtn ${sidebarOpen ? "sidebarOpen" : "sidebarClosed"}`}
                        onClick={() => setSidebarOpen(prev => !prev)}
                        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>

                    <div className="navbarBrandPill">
                        <span className="navbarBrandTitle">SynapseNEXUS</span>
                        <div className="navbarModelBadge">
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>AI 4.0</span>
                        </div>
                    </div>
                </div>

                <div className="navbarRight">
                    {/* Quick Theme Toggle Button */}
                    <button
                        type="button"
                        className="themeQuickToggleBtn"
                        onClick={cycleTheme}
                        title={`Current Theme: ${theme.toUpperCase()} (Click to cycle)`}
                        aria-label="Toggle theme"
                    >
                        <i className={getThemeIcon()}></i>
                    </button>

                    {/* User Profile Button */}
                    <div 
                        ref={userButtonRef} 
                        className={`userIconDiv ${isOpen ? "active" : ""}`} 
                        onClick={handleProfileClick}
                        title="User menu & settings"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                    >
                        <span className="userIcon">
                            <i className="fa-solid fa-user"></i>
                        </span>
                    </div>
                </div>
            </header>

            {/* Profile & Settings Dropdown Menu */}
            {isOpen && (
                <div ref={dropdownRef} className="dropDown" role="menu">
                    <div className="dropDownHeader">
                        <div className="dropDownUserAvatar">
                            <i className="fa-solid fa-brain"></i>
                        </div>
                        <div className="dropDownUserInfo">
                            <span className="dropDownUserName">Synapse User</span>
                            <span className="dropDownUserStatus">
                                <span className="statusDot"></span> Online
                            </span>
                        </div>
                    </div>

                    <div className="dropDownDivider"></div>

                    {/* Theme Option directly inside the Settings Dropdown */}
                    <div className="themeSection">
                        <div className="themeSectionTitle">
                            <i className="fa-solid fa-palette"></i>
                            <span>Interface Theme</span>
                        </div>
                        <div className="themeOptionList">
                            <button
                                type="button"
                                className={`themeOptionItem ${theme === "light" ? "active" : ""}`}
                                onClick={() => setTheme("light")}
                            >
                                <span className="themeOptionLeft">
                                    <i className="fa-solid fa-sun themeIconLight"></i>
                                    <span>Light</span>
                                </span>
                                {theme === "light" && <i className="fa-solid fa-check themeCheckIcon"></i>}
                            </button>

                            <button
                                type="button"
                                className={`themeOptionItem ${theme === "dark" ? "active" : ""}`}
                                onClick={() => setTheme("dark")}
                            >
                                <span className="themeOptionLeft">
                                    <i className="fa-solid fa-moon themeIconDark"></i>
                                    <span>Dark</span>
                                </span>
                                {theme === "dark" && <i className="fa-solid fa-check themeCheckIcon"></i>}
                            </button>

                            <button
                                type="button"
                                className={`themeOptionItem ${theme === "fancy" ? "active" : ""}`}
                                onClick={() => setTheme("fancy")}
                            >
                                <span className="themeOptionLeft">
                                    <i className="fa-solid fa-wand-magic-sparkles themeIconFancy"></i>
                                    <span>Fancy / AI</span>
                                </span>
                                {theme === "fancy" && <i className="fa-solid fa-check themeCheckIcon"></i>}
                            </button>
                        </div>
                    </div>

                    <div className="dropDownDivider"></div>

                    {/* Settings Modal Trigger */}
                    <div 
                        className="dropDownItem" 
                        onClick={() => {
                            setIsSettingsModalOpen(true);
                            setIsOpen(false);
                        }}
                    >
                        <i className="fa-solid fa-gear"></i>
                        <span>Settings</span>
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upgrade plan</span>
                    </div>

                    <div className="dropDownDivider"></div>

                    <div className="dropDownItem dropDownItemDanger" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Log out</span>
                    </div>
                </div>
            )}

            {/* Comprehensive Settings Modal */}
            {isSettingsModalOpen && (
                <div 
                    className="settingsModalBackdrop" 
                    onClick={() => setIsSettingsModalOpen(false)}
                    aria-modal="true"
                    role="dialog"
                >
                    <div 
                        className="settingsModal" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="settingsModalHeader">
                            <div className="settingsModalTitle">
                                <i className="fa-solid fa-sliders"></i>
                                <span>Settings</span>
                            </div>
                            <button
                                type="button"
                                className="settingsModalCloseBtn"
                                onClick={() => setIsSettingsModalOpen(false)}
                                aria-label="Close settings"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="settingsModalBody">
                            <div className="settingsSection">
                                <h3 className="settingsSectionHeading">Theme Appearance</h3>
                                <p className="settingsSectionDesc">
                                    Customize the look and feel of your SynapseNEXUS interface. Changes update instantly and persist across sessions.
                                </p>

                                <div className="themeCardGrid">
                                    {/* 1. Light Theme */}
                                    <div 
                                        className={`themeCard ${theme === "light" ? "active" : ""}`}
                                        onClick={() => setTheme("light")}
                                    >
                                        <div className="themeCardHeader">
                                            <div className="themeCardIcon iconLight">
                                                <i className="fa-solid fa-sun"></i>
                                            </div>
                                            {theme === "light" && (
                                                <span className="themeActiveBadge">
                                                    <i className="fa-solid fa-check"></i> Active
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="themeCardTitle">Light</h4>
                                        <p className="themeCardText">Clean high-contrast daytime interface</p>
                                        <div className="themeCardPreview previewLight">
                                            <span className="previewDot dotPrimary"></span>
                                            <span className="previewLine"></span>
                                        </div>
                                    </div>

                                    {/* 2. Dark Theme */}
                                    <div 
                                        className={`themeCard ${theme === "dark" ? "active" : ""}`}
                                        onClick={() => setTheme("dark")}
                                    >
                                        <div className="themeCardHeader">
                                            <div className="themeCardIcon iconDark">
                                                <i className="fa-solid fa-moon"></i>
                                            </div>
                                            {theme === "dark" && (
                                                <span className="themeActiveBadge">
                                                    <i className="fa-solid fa-check"></i> Active
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="themeCardTitle">Dark</h4>
                                        <p className="themeCardText">Sleek obsidian night interface (Default)</p>
                                        <div className="themeCardPreview previewDark">
                                            <span className="previewDot dotIndigo"></span>
                                            <span className="previewLine"></span>
                                        </div>
                                    </div>

                                    {/* 3. Fancy / AI Theme */}
                                    <div 
                                        className={`themeCard ${theme === "fancy" ? "active" : ""}`}
                                        onClick={() => setTheme("fancy")}
                                    >
                                        <div className="themeCardHeader">
                                            <div className="themeCardIcon iconFancy">
                                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                            </div>
                                            {theme === "fancy" && (
                                                <span className="themeActiveBadge">
                                                    <i className="fa-solid fa-check"></i> Active
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="themeCardTitle">Fancy / AI</h4>
                                        <p className="themeCardText">Futuristic cyberpunk neon glassmorphism</p>
                                        <div className="themeCardPreview previewFancy">
                                            <span className="previewDot dotNeon"></span>
                                            <span className="previewLine"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settingsModalFooter">
                            <button
                                type="button"
                                className="settingsDoneBtn"
                                onClick={() => setIsSettingsModalOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Chat Stream Container */}
            <Chat isMainLoading={loading} />

            {/* Spinner indicator when loading */}
            {loading && (
                <div className="loadingIndicatorWrapper">
                    <ScaleLoader 
                        color={theme === "light" ? "#6366f1" : (theme === "fancy" ? "#c084fc" : "#818cf8")} 
                        height={18} 
                        width={3} 
                        radius={2} 
                        margin={2} 
                        loading={loading} 
                    />
                </div>
            )}

            {/* Bottom Chat Input Dock */}
            <div className="chatInput">
                <div className="inputBox">
                    <div className="inputLeftAddon">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>

                    <input
                        placeholder="Message SynapseNEXUS... (Press Enter to send)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                getReply();
                            }
                        }}
                        disabled={loading}
                        aria-label="Chat input"
                    />

                    <button
                        type="button"
                        id="submit"
                        className={`submitBtn ${prompt.trim() ? "hasContent" : ""} ${loading ? "isLoading" : ""}`}
                        onClick={getReply}
                        disabled={!prompt.trim() || loading}
                        title="Send message"
                        aria-label="Send message"
                    >
                        {loading ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-arrow-up"></i>
                        )}
                    </button>
                </div>

                <p className="info">
                    SynapseNEXUS can make mistakes. Please verify important information before relying on it.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;