import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api/userApi";
import "./DashboardPage.css";

function DashboardPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        getUserProfile()
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch profile:", err);
                setLoading(false);
            });
    }, [navigate]);

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: "#10b981",
            medium: "#f59e0b",
            hard: "#ef4444"
        };
        return colors[difficulty?.toLowerCase()] || "#6b7280";
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-text">
                        <h1>Welcome back, <span className="username-highlight">{profile?.username}</span></h1>
                        <p>Ready to sharpen your coding skills today?</p>
                    </div>
                    <div className="quick-actions">
                        <button
                            className="action-btn primary"
                            onClick={() => navigate("/question")}
                        >
                            <span className="btn-icon">⚡</span>
                            Start Practice
                        </button>
                        {profile?.isAdmin && (
                            <button
                                className="action-btn secondary"
                                onClick={() => navigate("/admin")}
                            >
                                <span className="btn-icon">⚙️</span>
                                Admin Panel
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {/* Problems Solved Card */}
                    <div className="stat-card">
                        <div className="stat-icon solved">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{profile?.totalCorrect || 0}</span>
                            <span className="stat-label">Problems Solved</span>
                        </div>
                    </div>

                    {/* Success Rate Card */}
                    <div className="stat-card">
                        <div className="stat-icon rate">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{profile?.successRate || 0}%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                    </div>

                    {/* Current Level Card */}
                    <div className="stat-card">
                        <div className="stat-icon level" style={{ color: getDifficultyColor(profile?.currentDifficulty) }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span
                                className="stat-value difficulty"
                                style={{ color: getDifficultyColor(profile?.currentDifficulty) }}
                            >
                                {profile?.currentDifficulty || "Easy"}
                            </span>
                            <span className="stat-label">Current Level</span>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="progress-section">
                    <h2>Your Progress</h2>
                    <div className="progress-card">
                        <div className="progress-header">
                            <span>Problems Solved</span>
                            <span className="progress-count">{profile?.totalCorrect || 0} / {profile?.totalAttempts || 0}</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${profile?.successRate || 0}%`,
                                    background: `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`
                                }}
                            ></div>
                        </div>
                        <div className="progress-footer">
                            <span className="progress-percentage">{profile?.successRate || 0}% success rate</span>
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="profile-section">
                    <h2>Profile Information</h2>
                    <div className="profile-card">
                        <div className="profile-grid">
                            <div className="profile-item">
                                <span className="profile-label">Username</span>
                                <span className="profile-value">{profile?.username}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Experience Level</span>
                                <span className="profile-value">{profile?.experienceLevel || "Not set"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Age</span>
                                <span className="profile-value">{profile?.age || "Not set"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Known Languages</span>
                                <span className="profile-value">{profile?.knownLanguages || "Not set"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Start Section */}
                <div className="quickstart-section">
                    <h2>Quick Start</h2>
                    <div className="quickstart-grid">
                        <div className="quickstart-card" onClick={() => navigate("/question")}>
                            <div className="quickstart-icon">🎯</div>
                            <h3>Continue Practice</h3>
                            <p>Pick up where you left off with AI-powered questions</p>
                        </div>
                        <div className="quickstart-card" onClick={() => navigate("/question")}>
                            <div className="quickstart-icon">🚀</div>
                            <h3>Challenge Yourself</h3>
                            <p>Test your skills with progressively harder problems</p>
                        </div>
                        <div className="quickstart-card" onClick={() => navigate("/question")}>
                            <div className="quickstart-icon">💡</div>
                            <h3>Get AI Help</h3>
                            <p>Chat with our AI tutor for hints and guidance</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

