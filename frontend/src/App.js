import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QuestionPage from "./pages/QuestionPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import Sidebar from "./components/Sidebar";
import { checkAdminStatus } from "./api/adminApi";

function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    const response = await checkAdminStatus();
                    setIsAdmin(response.isAdmin);
                } catch (error) {
                    setIsAdmin(false);
                }
            }
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAdmin(false);
        setIsLoggedIn(false);
        window.location.href = "/";
    };

    return (
        <Router>
            <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                {/* Notion-style Sidebar */}
                <Sidebar
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                />

                {/* Main Content */}
                <div style={{ marginLeft: isLoggedIn ? "48px" : "0" }}>
                    {/* Routes */}
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<HomePage />} />
                        {/* Redirect old register route to home */}
                        <Route path="/register" element={<Navigate to="/" replace />} />
                        {/* Protected */}
                        <Route element={<RequireAuth />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/question" element={<QuestionPage />} />
                        </Route>
                        {/* Admin Only */}
                        <Route element={<RequireAdmin />}>
                            <Route path="/admin" element={<AdminPage />} />
                        </Route>
                    </Routes>
                </div>
            </div>
        </Router>
    );
}


export default App;
