// src/components/RequireAuth.js
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token)

    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireAuth;
