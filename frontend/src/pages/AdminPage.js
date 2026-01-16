import React, { useState, useEffect } from "react";
import { getAdminStats, getAllUsers, setUserAdminStatus, deleteUser } from "../api/adminApi";

const AdminPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");

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
            // Refresh stats after deletion
            const newStats = await getAdminStats();
            setStats(newStats);
        } catch (err) {
            alert("Failed to delete user");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading admin panel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>Access Denied</h2>
                <p>{error}</p>
                <a href="/" style={styles.backLink}>← Back to Home</a>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Admin Panel</h1>
                <p style={styles.subtitle}>Manage users and monitor platform statistics</p>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    style={activeTab === "dashboard" ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab("dashboard")}
                >
                    📊 Dashboard
                </button>
                <button
                    style={activeTab === "users" ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab("users")}
                >
                    👥 Users
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && stats && (
                <div style={styles.dashboard}>
                    <div style={styles.statsGrid}>
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
                        <StatCard
                            title="Total Attempts"
                            value={stats.totalAttempts}
                            icon="🎯"
                            color="#f59e0b"
                        />
                        <StatCard
                            title="Correct Solutions"
                            value={stats.totalCorrect}
                            icon="✅"
                            color="#22c55e"
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${stats.successRate}%`}
                            icon="📈"
                            color="#ec4899"
                        />
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div style={styles.usersSection}>
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Age</th>
                                    <th style={styles.th}>Experience</th>
                                    <th style={styles.th}>Languages</th>
                                    <th style={styles.th}>Attempts</th>
                                    <th style={styles.th}>Correct</th>
                                    <th style={styles.th}>Admin</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={styles.tr}>
                                        <td style={styles.td}>{user.id}</td>
                                        <td style={styles.td}>
                                            <span style={styles.username}>{user.username}</span>
                                        </td>
                                        <td style={styles.td}>{user.age || "-"}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>
                                                {user.experienceLevel || "N/A"}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{user.knownLanguages || "-"}</td>
                                        <td style={styles.td}>{user.totalAttempts}</td>
                                        <td style={styles.td}>{user.totalCorrect}</td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                                style={user.isAdmin ? styles.adminBadge : styles.userBadge}
                                            >
                                                {user.isAdmin ? "Admin" : "User"}
                                            </button>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                style={styles.deleteBtn}
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

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
    <div style={styles.statCard}>
        <div style={{ ...styles.statIcon, backgroundColor: `${color}15`, color }}>
            {icon}
        </div>
        <div style={styles.statContent}>
            <p style={styles.statTitle}>{title}</p>
            <p style={styles.statValue}>{value}</p>
        </div>
    </div>
);

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    header: {
        marginBottom: "32px",
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: "8px",
    },
    subtitle: {
        fontSize: "16px",
        color: "#6b7280",
    },
    tabs: {
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "16px",
    },
    tab: {
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#6b7280",
        background: "transparent",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    tabActive: {
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    dashboard: {
        animation: "fadeIn 0.3s ease",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
    },
    statCard: {
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
    },
    statIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "4px",
    },
    statValue: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1f2937",
    },
    usersSection: {
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
    },
    tableContainer: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    th: {
        padding: "16px",
        textAlign: "left",
        fontSize: "12px",
        fontWeight: "600",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "1px solid #e5e7eb",
        background: "#f9fafb",
    },
    tr: {
        borderBottom: "1px solid #e5e7eb",
        transition: "background 0.2s",
    },
    td: {
        padding: "16px",
        fontSize: "14px",
        color: "#374151",
    },
    username: {
        fontWeight: "600",
        color: "#1f2937",
    },
    badge: {
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "500",
        background: "#e5e7eb",
        color: "#374151",
    },
    adminBadge: {
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "600",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    userBadge: {
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "500",
        background: "#f3f4f6",
        color: "#6b7280",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
    },
    deleteBtn: {
        padding: "8px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        color: "#6b7280",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #e5e7eb",
        borderTopColor: "#667eea",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "16px",
    },
    errorContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        textAlign: "center",
        color: "#6b7280",
    },
    backLink: {
        marginTop: "16px",
        color: "#667eea",
        textDecoration: "none",
        fontWeight: "500",
    },
};

export default AdminPage;

