import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import "./HomePage.css";

function HomePage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

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

    const handleGetStarted = () => {
        setShowForm(true);
    };

    return (
        <div className="home-container">
            {/* Background blur circles */}
            <div className="bg-circle bg-circle-top" />
            <div className="bg-circle bg-circle-bottom" />

            <div className="home-content">
                {/* Centered Login Card */}
                <div className={`login-card ${showForm ? 'expanded' : ''}`}>
                    <div className="login-header">
                        <h2 className="login-title">AlgoRhythm</h2>
                        <p className="login-subtitle">Your AI-Powered Coding Tutor</p>
                    </div>

                    {/* Get Started Button - shown when form is hidden */}
                    {!showForm && (
                        <button onClick={handleGetStarted} className="get-started-button">
                            <span className="get-started-text">Get Started</span>
                            <span className="get-started-icon">→</span>
                        </button>
                    )}

                    {/* Login Form - animated in when showForm is true */}
                    <div className={`login-form-container ${showForm ? 'visible' : ''}`}>
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
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
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
        </div>
    );
}

export default HomePage;
