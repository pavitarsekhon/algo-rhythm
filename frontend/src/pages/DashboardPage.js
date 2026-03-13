import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api/userApi";
import "./DashboardPage.css";

function DashboardPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredSegment, setHoveredSegment] = useState(null);

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

    // Colors for pie chart
    const pieColors = [
        "#667eea", "#764ba2", "#10b981", "#f59e0b", "#ef4444",
        "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6", "#f97316",
        "#6366f1", "#84cc16", "#22d3d8", "#a855f7", "#eab308",
        "#3b82f6", "#22c55e", "#d946ef", "#0ea5e9", "#fb923c",
        "#8b5cf6", "#34d399", "#f472b6", "#2dd4bf", "#fbbf24"
    ];

    // Get total problems completed from progress
    const getTotalCompleted = () => {
        if (!profile?.progress) return 0;
        return profile.progress.easyCompleted + profile.progress.mediumCompleted + profile.progress.hardCompleted;
    };

    // Get topics with counts > 0, sorted by count
    const getActiveTopics = () => {
        if (!profile?.progress?.topicCounts) return [];
        return Object.entries(profile.progress.topicCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
    };

    // Calculate total topic completions for pie chart
    const getTotalTopicCompletions = () => {
        return getActiveTopics().reduce((sum, [_, count]) => sum + count, 0);
    };

    // Generate pie chart segments
    const getPieChartSegments = () => {
        const topics = getActiveTopics();
        const total = getTotalTopicCompletions();
        if (total === 0) return [];

        let currentAngle = 0;
        return topics.map(([topic, count], index) => {
            const percentage = (count / total) * 100;
            const angle = (count / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            return {
                topic,
                count,
                percentage,
                startAngle,
                endAngle: currentAngle,
                color: pieColors[index % pieColors.length]
            };
        });
    };

    // SVG arc path generator
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        if (endAngle - startAngle >= 360) {
            // Full circle
            return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 1 ${x + radius} ${y} A ${radius} ${radius} 0 1 1 ${x - radius} ${y}`;
        }
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", x, y,
            "L", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
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
                            <span className="stat-value">{getTotalCompleted()}</span>
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

                {/* Difficulty Breakdown */}
                {profile?.progress && (
                    <div className="difficulty-section">
                        <h2>Difficulty Breakdown</h2>
                        <div className="difficulty-cards">
                            <div className="difficulty-card easy">
                                <div className="difficulty-count">{profile.progress.easyCompleted}</div>
                                <div className="difficulty-label">Easy</div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-fill"
                                        style={{
                                            width: getTotalCompleted() > 0
                                                ? `${(profile.progress.easyCompleted / getTotalCompleted()) * 100}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="difficulty-card medium">
                                <div className="difficulty-count">{profile.progress.mediumCompleted}</div>
                                <div className="difficulty-label">Medium</div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-fill"
                                        style={{
                                            width: getTotalCompleted() > 0
                                                ? `${(profile.progress.mediumCompleted / getTotalCompleted()) * 100}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="difficulty-card hard">
                                <div className="difficulty-count">{profile.progress.hardCompleted}</div>
                                <div className="difficulty-label">Hard</div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-fill"
                                        style={{
                                            width: getTotalCompleted() > 0
                                                ? `${(profile.progress.hardCompleted / getTotalCompleted()) * 100}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Topic Progress - Pie Chart */}
                {profile?.progress && (
                    <div className="topics-section">
                        <h2>Topics Mastered</h2>
                        {getActiveTopics().length > 0 ? (
                            <div className="topics-chart-container">
                                {/* Pie Chart */}
                                <div className="pie-chart-wrapper">
                                    <svg viewBox="0 0 200 200" className="pie-chart">
                                        {getPieChartSegments().map((segment, index) => (
                                            <path
                                                key={segment.topic}
                                                d={describeArc(100, 100, 85, segment.startAngle, segment.endAngle)}
                                                fill={segment.color}
                                                className={`pie-segment ${hoveredSegment === segment.topic ? 'hovered' : ''}`}
                                                style={{
                                                    animationDelay: `${index * 0.05}s`,
                                                    opacity: hoveredSegment && hoveredSegment !== segment.topic ? 0.5 : 1
                                                }}
                                                onMouseEnter={() => setHoveredSegment(segment.topic)}
                                                onMouseLeave={() => setHoveredSegment(null)}
                                            >
                                                <title>{segment.topic}: {segment.count} ({segment.percentage.toFixed(1)}%)</title>
                                            </path>
                                        ))}
                                        {/* Center circle for donut effect */}
                                        <circle cx="100" cy="100" r="55" fill="white" />
                                        <text x="100" y="92" textAnchor="middle" className="pie-center-number">
                                            {getTotalTopicCompletions()}
                                        </text>
                                        <text x="100" y="112" textAnchor="middle" className="pie-center-label">
                                            Total
                                        </text>
                                    </svg>
                                </div>

                                {/* Legend */}
                                <div className="pie-legend">
                                    {getPieChartSegments().map((segment) => (
                                        <div
                                            key={segment.topic}
                                            className={`legend-item ${hoveredSegment === segment.topic ? 'hovered' : ''}`}
                                            onMouseEnter={() => setHoveredSegment(segment.topic)}
                                            onMouseLeave={() => setHoveredSegment(null)}
                                        >
                                            <span
                                                className="legend-color"
                                                style={{ backgroundColor: segment.color }}
                                            />
                                            <span className="legend-topic">{segment.topic}</span>
                                            <span className="legend-count">{segment.count}</span>
                                            <span className="legend-percentage">
                                                {segment.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-topics">
                                <div className="no-topics-icon">📊</div>
                                <p>Complete problems to see your topic progress!</p>
                            </div>
                        )}
                    </div>
                )}

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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

