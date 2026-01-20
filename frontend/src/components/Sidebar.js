import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isLoggedIn, isAdmin, onLogout }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    if (!isLoggedIn) return null;

    return (
        <>
            {/* Hover trigger area - always visible */}
            <div
                className="sidebar-trigger"
                onMouseEnter={() => !isPinned && setIsExpanded(true)}
            >
                <div className="trigger-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </div>
            </div>

            {/* Sidebar */}
            <div
                className={`sidebar ${isExpanded || isPinned ? 'expanded' : ''}`}
                onMouseEnter={() => !isPinned && setIsExpanded(true)}
                onMouseLeave={() => !isPinned && setIsExpanded(false)}
            >
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">AlgoRhythm</span>
                    </div>
                    <button
                        className={`pin-button ${isPinned ? 'pinned' : ''}`}
                        onClick={() => setIsPinned(!isPinned)}
                        title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isPinned ? (
                                <path d="M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5M8 4h8" />
                            ) : (
                                <path d="M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5M8 4h8" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-label">Menu</div>

                        <a
                            href="/dashboard"
                            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                        >
                            <span className="nav-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    <path d="M9 22V12h6v10" />
                                </svg>
                            </span>
                            <span className="nav-label">Dashboard</span>
                        </a>

                        <a
                            href="/question"
                            className={`nav-item ${isActive('/question') ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); navigate('/question'); }}
                        >
                            <span className="nav-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                                </svg>
                            </span>
                            <span className="nav-label">Practice</span>
                        </a>

                        {isAdmin && (
                            <a
                                href="/admin"
                                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
                            >
                                <span className="nav-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                    </svg>
                                </span>
                                <span className="nav-label">Admin Panel</span>
                            </a>
                        )}
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-label">Quick Links</div>

                        <a
                            href="/question"
                            className="nav-item"
                            onClick={(e) => { e.preventDefault(); navigate('/question'); }}
                        >
                            <span className="nav-icon">⚡</span>
                            <span className="nav-label">Quick Practice</span>
                        </a>
                    </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <button className="logout-button" onClick={onLogout}>
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                        </span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {(isExpanded || isPinned) && (
                <div
                    className="sidebar-overlay"
                    onClick={() => { setIsExpanded(false); setIsPinned(false); }}
                />
            )}
        </>
    );
}

export default Sidebar;

