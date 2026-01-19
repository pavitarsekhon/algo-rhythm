import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import "./RegisterPage.css";

function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        age: "",
        experienceLevel: "",
        knownLanguages: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post("/api/auth/register", {
                username: form.username,
                password: form.password,
                age: form.age ? parseInt(form.age) : null,
                experienceLevel: form.experienceLevel,
                knownLanguages: form.knownLanguages
            });

            navigate("/");
        } catch (err) {
            setError("Registration failed — username may already exist.");
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">Create Account</h1>
                <p className="register-subtitle">Join AlgoRhythm and start coding smarter</p>

                <form onSubmit={handleRegister}>
                    {/* Username */}
                    <label className="register-form-label">Username</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className="register-input"
                        placeholder="Choose a username"
                    />

                    {/* Password */}
                    <label className="register-form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="register-input"
                        placeholder="Choose a password"
                    />

                    {/* Age */}
                    <label className="register-form-label">Age (optional)</label>
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        className="register-input"
                        placeholder="18"
                    />

                    {/* Experience */}
                    <label className="register-form-label">Experience Level</label>
                    <select
                        name="experienceLevel"
                        value={form.experienceLevel}
                        onChange={handleChange}
                        className="register-select"
                    >
                        <option value="">Select...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    {/* Languages */}
                    <label className="register-form-label">Known Languages</label>
                    <input
                        name="knownLanguages"
                        value={form.knownLanguages}
                        onChange={handleChange}
                        className="register-input"
                        placeholder="e.g. Python, JavaScript"
                    />

                    {error && <p className="register-error">{error}</p>}

                    {/* Submit button */}
                    <button type="submit" className="register-button">
                        Register
                    </button>
                </form>

                <p className="login-link-container">
                    Already have an account?{" "}
                    <RouterLink to="/" className="login-link">
                        Log in
                    </RouterLink>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
