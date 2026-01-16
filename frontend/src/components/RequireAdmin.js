import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { checkAdminStatus } from "../api/adminApi";

const RequireAdmin = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const response = await checkAdminStatus();
                setIsAdmin(response.isAdmin);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
                color: "#6b7280"
            }}>
                Loading...
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RequireAdmin;

