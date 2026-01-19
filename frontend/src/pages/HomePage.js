import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "./HomePage.css";

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
        <div className="home-container">
            {/* Background blur circles */}
            <div className="bg-circle bg-circle-top" />
            <div className="bg-circle bg-circle-bottom" />

            <div className="home-content">
                {/* LEFT SIDE — HERO */}
                <div className="hero-section">
                    <div className="hero-title">AlgoRhythm</div>
                    <div className="hero-subtitle">Your AI-Powered Coding Tutor</div>
                    <p className="hero-description">
                        Master algorithms and data structures with personalized AI guidance.
                        Get instant feedback, hints when you need them, and accelerate your coding journey.
                    </p>
                </div>

                {/* RIGHT SIDE — Login Card */}
                <div className="login-card">
                    <div className="login-header">
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Continue your learning journey</p>
                    </div>

                    {/* Username */}
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="form-input"
                    />

                    {/* Password */}
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="form-input"
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                    />

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {/* Login button */}
                    <button onClick={handleSubmit} className="login-button">
                        Sign In
                    </button>

                    {/* Register link */}
                    <div className="register-link-container">
                        Don't have an account?{" "}
                        <button onClick={() => navigate("/register")} className="register-link">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
