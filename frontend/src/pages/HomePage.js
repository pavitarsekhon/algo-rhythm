import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";

function HomePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/auth/login", { username, password });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/question";
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background blur circles */}
            <div style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                top: "-100px",
                right: "-100px",
                filter: "blur(60px)"
            }} />
            <div style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                bottom: "-80px",
                left: "-80px",
                filter: "blur(60px)"
            }} />

            <div style={{
                maxWidth: "1200px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "80px",
                position: "relative",
                zIndex: 1
            }}>
                {/* LEFT SIDE — HERO */}
                <div style={{ flex: 1, maxWidth: "550px" }}>
                    <div style={{
                        fontSize: "64px",
                        fontWeight: "800",
                        color: "white",
                        marginBottom: "20px"
                    }}>
                        AlgoRhythm
                    </div>

                    <div style={{
                        fontSize: "24px",
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: "30px",
                        fontWeight: "500"
                    }}>
                        Your AI-Powered Coding Tutor
                    </div>

                    <p style={{
                        fontSize: "18px",
                        color: "rgba(255, 255, 255, 0.8)",
                        lineHeight: "1.8",
                        marginBottom: "40px"
                    }}>
                        Master algorithms and data structures with personalized AI guidance.
                        Get instant feedback, hints when you need them, and accelerate your coding journey.
                    </p>
                </div>

                {/* RIGHT SIDE — Login Card */}
                <div style={{
                    width: "450px",
                    background: "white",
                    borderRadius: "20px",
                    padding: "50px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h2 style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                            marginBottom: "8px"
                        }}>
                            Welcome Back
                        </h2>
                        <p style={{ color: "#666", fontSize: "15px" }}>
                            Continue your learning journey
                        </p>
                    </div>

                    {/* Username */}
                    <label style={labelStyle}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        style={inputStyle}
                    />

                    {/* Password */}
                    <label style={labelStyle}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={inputStyle}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                    />

                    {error && (
                        <div style={{
                            padding: "12px",
                            background: "#fee",
                            color: "#c33",
                            borderRadius: "8px",
                            fontSize: "14px",
                            marginBottom: "20px",
                            fontWeight: "500"
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Login button */}
                    <button
                        onClick={handleSubmit}
                        style={buttonStyle}
                    >
                        Sign In
                    </button>

                    {/* Register link */}
                    <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
                        Don't have an account?
                        {" "}
                        <button
                            onClick={() => navigate("/register")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#667eea",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
};

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s",
    marginBottom: "24px",
    boxSizing: "border-box"
};

const buttonStyle = {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "20px"
};

export default HomePage;
