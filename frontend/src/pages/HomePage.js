import { useState } from "react";
import API from "../api/axiosConfig";
import "./HomePage.css";

function HomePage() {
    const [mode, setMode] = useState("initial"); // "initial", "login", "register"
    const [error, setError] = useState("");

    // Login form state
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register form state
    const [registerForm, setRegisterForm] = useState({
        username: "",
        password: "",
        age: "",
        experienceLevel: "",
        knownLanguages: ""
    });

    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/auth/login", {
                username: loginUsername,
                password: loginPassword
            });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await API.post("/auth/register", {
                username: registerForm.username,
                password: registerForm.password,
                age: registerForm.age ? parseInt(registerForm.age) : null,
                experienceLevel: registerForm.experienceLevel,
                knownLanguages: registerForm.knownLanguages
            });

            // Auto login after registration
            const response = await API.post("/auth/login", {
                username: registerForm.username,
                password: registerForm.password
            });
            localStorage.setItem("token", response.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Registration failed — username may already exist.");
        }
    };

    return (
        <div className="home-container">
            {/* Background blur circles */}
            <div className="bg-circle bg-circle-top" />
            <div className="bg-circle bg-circle-bottom" />

            <div className="home-content">
                <div className={`auth-card ${mode !== "initial" ? "expanded" : ""} ${mode === "register" ? "register-mode" : ""}`}>

                    {/* Header */}
                    <div className="auth-header">
                        <h2 className="auth-title">AlgoRhythm</h2>
                        <p className="auth-subtitle">
                            {mode === "initial" && "Your AI-Powered Coding Tutor"}
                            {mode === "login" && "Welcome back! Sign in to continue"}
                            {mode === "register" && "Create your account"}
                        </p>
                    </div>

                    {/* Initial State - Get Started Button */}
                    {mode === "initial" && (
                        <div className="initial-buttons">
                            <button
                                onClick={() => setMode("login")}
                                className="get-started-button"
                            >
                                <span className="get-started-text">Get Started</span>
                                <span className="get-started-icon">→</span>
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    <div className={`form-container ${mode === "login" ? "visible" : ""}`}>
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="form-input"
                        />

                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="form-input"
                            onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                        />

                        {error && mode === "login" && (
                            <div className="error-message">{error}</div>
                        )}

                        <button onClick={handleLogin} className="submit-button">
                            Sign In
                        </button>

                        <div className="switch-mode-container">
                            Don't have an account?{" "}
                            <button onClick={() => { setMode("register"); setError(""); }} className="switch-mode-link">
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Register Form */}
                    <div className={`form-container ${mode === "register" ? "visible" : ""}`}>
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={registerForm.username}
                            onChange={handleRegisterChange}
                            placeholder="Choose a username"
                            className="form-input"
                        />

                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                            placeholder="Choose a password"
                            className="form-input"
                        />

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Age (optional)</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={registerForm.age}
                                    onChange={handleRegisterChange}
                                    placeholder="18"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Experience</label>
                                <select
                                    name="experienceLevel"
                                    value={registerForm.experienceLevel}
                                    onChange={handleRegisterChange}
                                    className="form-input form-select"
                                >
                                    <option value="">Select...</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <label className="form-label">Known Languages</label>
                        <input
                            type="text"
                            name="knownLanguages"
                            value={registerForm.knownLanguages}
                            onChange={handleRegisterChange}
                            placeholder="e.g. Python, JavaScript"
                            className="form-input"
                        />

                        {error && mode === "register" && (
                            <div className="error-message">{error}</div>
                        )}

                        <button onClick={handleRegister} className="submit-button">
                            Create Account
                        </button>

                        <div className="switch-mode-container">
                            Already have an account?{" "}
                            <button onClick={() => { setMode("login"); setError(""); }} className="switch-mode-link">
                                Sign In
                            </button>
                        </div>
                    </div>

                    {/* Back button when in form mode */}
                    {mode !== "initial" && (
                        <button
                            onClick={() => { setMode("initial"); setError(""); }}
                            className="back-button"
                        >
                            ← Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
