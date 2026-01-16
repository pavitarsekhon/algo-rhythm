import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuestionPage from "./pages/QuestionPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import RegisterPage from "./pages/RegisterPage";
import { checkAdminStatus } from "./api/adminApi";

function App() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await checkAdminStatus();
                    setIsAdmin(response.isAdmin);
                }
            } catch (error) {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAdmin(false);
        window.location.href = "/";
    };

    return (
        <Router>
            <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* Modern Header */}
                <header style={{
                    background: "white",
                    borderBottom: "1px solid #e5e7eb",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 40px",
                        maxWidth: "100%",
                        margin: "0 auto"
                    }}>
                        {/* Logo */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                                fontSize: "22px",
                                fontWeight: "800",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}>
                                AlgoRhythm
                            </span>
                        </div>

                        {/* Navigation */}
                        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                            <a href="/question" style={navLinkStyle}>Practice</a>
                            <a href="/progress" style={navLinkStyle}>Progress</a>
                            <a href="/leaderboard" style={navLinkStyle}>Leaderboard</a>

                            {/* Admin Link - Only shown to admins */}
                            {isAdmin && (
                                <a href="/admin" style={adminLinkStyle}>
                                    🛡️ Admin
                                </a>
                            )}

                            <button
                                onClick={handleLogout}
                                style={logoutButtonStyle}
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </header>

                {/* Routes */}
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Protected */}
                    <Route element={<RequireAuth />}>
                        <Route path="/question" element={<QuestionPage />} />
                        {/* Add more protected pages like /progress here */}
                    </Route>
                    {/* Admin Only */}
                    <Route element={<RequireAdmin />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

const navLinkStyle = {
    fontSize: "15px",
    fontWeight: "500",
    color: "#4b5563",
    textDecoration: "none",
    transition: "color 0.3s",
};

const adminLinkStyle = {
    fontSize: "15px",
    fontWeight: "600",
    color: "#7c3aed",
    textDecoration: "none",
    transition: "color 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "4px",
};

const logoutButtonStyle = {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
};

export default App;
