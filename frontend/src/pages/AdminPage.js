import React, { useState, useEffect, useRef } from "react";
import { getAdminStats, getAllUsers, setUserAdminStatus, deleteUser, generateQuestions } from "../api/adminApi";
import "./AdminPage.css";

// Helper function for difficulty colors
const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toUpperCase()) {
        case "EASY": return "difficulty-easy";
        case "MEDIUM": return "difficulty-medium";
        case "HARD": return "difficulty-hard";
        default: return "";
    }
};

// Expandable Question Card Component
const ExpandableQuestionCard = ({ question, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [question, isExpanded]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`expandable-card ${isExpanded ? 'expanded' : ''}`}>
            {/* Clickable Header */}
            <div onClick={toggleExpand} className="card-header">
                <div className="header-left">
                    <span className="question-name">
                        {question.functionName || `Question ${index + 1}`}
                    </span>
                    <div className="question-meta">
                        <span>📁 {question.topics}</span>
                        <span>🧪 {question.testCaseCount} test cases</span>
                    </div>
                </div>
                <div className="header-right">
                    <span className={`difficulty-badge ${getDifficultyClass(question.difficulty)}`}>
                        {question.difficulty}
                    </span>
                    <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
                        ▼
                    </span>
                </div>
            </div>

            {/* Expandable Content */}
            <div
                className="content-wrapper"
                style={{
                    maxHeight: isExpanded ? `${contentHeight}px` : '0px',
                    opacity: isExpanded ? 1 : 0,
                }}
            >
                <div ref={contentRef} className="card-content">
                    {/* Question Prompt */}
                    <div className="prompt-section">
                        <div className="prompt-content">
                            {question.prompt || "No question prompt available."}
                        </div>
                    </div>

                    {/* Test Cases - LeetCode Style */}
                    {question.testCases && question.testCases.length > 0 && (
                        <div className="test-cases-section">
                            <h4 className="test-cases-title">Examples</h4>
                            <div className="examples-list">
                                {question.testCases.slice(0, 5).map((tc, tcIndex) => (
                                    <div key={tcIndex} className="example">
                                        <div className="example-header">
                                            Example {tcIndex + 1}:
                                        </div>
                                        <div className="example-body">
                                            <div className="example-line">
                                                <span className="example-label">Input:</span>
                                                <code className="example-code">{tc.input}</code>
                                            </div>
                                            <div className="example-line">
                                                <span className="example-label">Output:</span>
                                                <code className="example-code">{tc.expectedOutput}</code>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {question.testCases.length > 5 && (
                                    <div className="more-test-cases">
                                        + {question.testCases.length - 5} more test cases
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="footer-info">
                        <span className="footer-item">
                            <span className="footer-label">ID:</span> {question.id}
                        </span>
                        <span className="footer-item">
                            <span className="footer-label">Topics:</span> {question.topics?.split('|').join(', ')}
                        </span>
                        <span className="footer-item">
                            <span className="footer-label">Total Tests:</span> {question.testCaseCount || question.testCases?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
        <div
            className="stat-icon"
            style={{ backgroundColor: `${color}15`, color }}
        >
            {icon}
        </div>
        <div className="stat-content">
            <p className="stat-title">{title}</p>
            <p className="stat-value">{value}</p>
        </div>
    </div>
);

const AdminPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");

    // Question generation state
    const [generating, setGenerating] = useState(false);
    const [genCount, setGenCount] = useState(5);
    const [genDifficulty, setGenDifficulty] = useState("EASY");
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [genMessage, setGenMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, usersData] = await Promise.all([
                getAdminStats(),
                getAllUsers()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setError(null);
        } catch (err) {
            setError("Failed to load admin data. Make sure you have admin privileges.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            await setUserAdminStatus(userId, !currentStatus);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isAdmin: !currentStatus } : user
            ));
        } catch (err) {
            alert("Failed to update user admin status");
            console.error(err);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
            const newStats = await getAdminStats();
            setStats(newStats);
        } catch (err) {
            alert("Failed to delete user");
            console.error(err);
        }
    };

    const handleGenerateQuestions = async () => {
        setGenerating(true);
        setGenMessage(null);
        setGeneratedQuestions([]);

        try {
            const result = await generateQuestions(genCount, genDifficulty);
            setGeneratedQuestions(result.questions || []);
            setGenMessage({
                type: result.success ? "success" : "error",
                text: result.message
            });

            if (result.success) {
                const newStats = await getAdminStats();
                setStats(newStats);
            }
        } catch (err) {
            setGenMessage({
                type: "error",
                text: `Failed to generate questions: ${err.message}`
            });
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading admin panel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Access Denied</h2>
                <p>{error}</p>
                <a href="/" className="back-link">← Back to Home</a>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <h1 className="admin-title">Admin Panel</h1>
                <p className="admin-subtitle">Manage users and monitor platform statistics</p>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={activeTab === "dashboard" ? "admin-tab-active" : "admin-tab"}
                    onClick={() => setActiveTab("dashboard")}
                >
                    📊 Dashboard
                </button>
                <button
                    className={activeTab === "users" ? "admin-tab-active" : "admin-tab"}
                    onClick={() => setActiveTab("users")}
                >
                    👥 Users
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && stats && (
                <div className="admin-dashboard">
                    <div className="stats-grid">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon="👥"
                            color="#3b82f6"
                        />
                        <StatCard
                            title="Total Questions"
                            value={stats.totalQuestions}
                            icon="❓"
                            color="#10b981"
                        />
                        <StatCard
                            title="Admins"
                            value={stats.totalAdmins}
                            icon="🛡️"
                            color="#8b5cf6"
                        />
                    </div>

                    {/* Question Generation Section */}
                    <div className="generation-section">
                        <h2 className="section-title">AI Question Generator</h2>
                        <p className="section-subtitle">
                            Generate new coding problems with test cases using AI
                        </p>

                        <div className="generation-form">
                            <div className="form-group">
                                <label className="form-label">Number of Questions</label>
                                <select
                                    value={genCount}
                                    onChange={(e) => setGenCount(parseInt(e.target.value))}
                                    className="form-select"
                                    disabled={generating}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Difficulty</label>
                                <select
                                    value={genDifficulty}
                                    onChange={(e) => setGenDifficulty(e.target.value)}
                                    className="form-select"
                                    disabled={generating}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGenerateQuestions}
                                disabled={generating}
                                className="generate-btn"
                            >
                                {generating ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>✨ Generate Questions</>
                                )}
                            </button>
                        </div>

                        {/* Generation Message */}
                        {genMessage && (
                            <div className={`message ${genMessage.type === "success" ? "message-success" : "message-error"}`}>
                                {genMessage.type === "success" ? "✅" : "❌"} {genMessage.text}
                            </div>
                        )}

                        {/* Generated Questions List */}
                        {generatedQuestions.length > 0 && (
                            <div className="generated-list">
                                <h3 className="list-title">Generated Questions:</h3>
                                <p className="list-subtitle">Click on a question to expand and view details</p>
                                <div className="question-cards">
                                    {generatedQuestions.map((q, index) => (
                                        <ExpandableQuestionCard
                                            key={q.id || index}
                                            question={q}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="users-section">
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Age</th>
                                    <th>Experience</th>
                                    <th>Languages</th>
                                    <th>Attempts</th>
                                    <th>Correct</th>
                                    <th>Admin</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>
                                            <span className="username">{user.username}</span>
                                        </td>
                                        <td>{user.age || "-"}</td>
                                        <td>
                                            <span className="badge">
                                                {user.experienceLevel || "N/A"}
                                            </span>
                                        </td>
                                        <td>{user.knownLanguages || "-"}</td>
                                        <td>{user.totalAttempts}</td>
                                        <td>{user.totalCorrect}</td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                                className={user.isAdmin ? "admin-badge" : "user-badge"}
                                            >
                                                {user.isAdmin ? "Admin" : "User"}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                className="delete-btn"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminPage;
