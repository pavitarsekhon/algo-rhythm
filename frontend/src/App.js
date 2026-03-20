import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import QuestionPage from "./pages/QuestionPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import Sidebar from "./components/Sidebar";
import { checkAdminStatus } from "./api/adminApi";

function Layout({ children, isAdmin, isLoggedIn, onLogout }) {
    const location = useLocation();
    const isLoginPage = location.pathname === "/";
    const showSidebar = isLoggedIn && !isLoginPage;

    return (
        <div style={{ minHeight: "100vh", background: "#0b1220" }}>
            {/* Notion-style Sidebar */}
            <Sidebar
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <div style={{ marginLeft: showSidebar ? "48px" : "0" }}>
                {children}
            </div>
        </div>
    );
}

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
            <Layout isAdmin={isAdmin} isLoggedIn={isLoggedIn} onLogout={handleLogout}>
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
            </Layout>
        </Router>
    );
}


export default App;
