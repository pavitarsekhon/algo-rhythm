import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";

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
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f8fafc",
            padding: "20px"
        }}>
            <div style={{
                width: "380px",
                background: "white",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #e5e7eb"
            }}>
                <h1 style={{
                    textAlign: "center",
                    fontSize: "28px",
                    fontWeight: "800",
                    marginBottom: "6px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                }}>
                    Create Account
                </h1>

                <p style={{
                    textAlign: "center",
                    marginBottom: "24px",
                    color: "#6b7280"
                }}>
                    Join AlgoRhythm and start coding smarter
                </p>

                <form onSubmit={handleRegister}>
                    {/* Username */}
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Username</label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="Choose a username"
                    />

                    {/* Password */}
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="Choose a password"
                    />

                    {/* Age */}
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Age (optional)</label>
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="18"
                    />

                    {/* Experience */}
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Experience Level</label>
                    <select
                        name="experienceLevel"
                        value={form.experienceLevel}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            cursor: "pointer"
                        }}
                    >
                        <option value="">Select...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    {/* Languages */}
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Known Languages</label>
                    <input
                        name="knownLanguages"
                        value={form.knownLanguages}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="e.g. Python, JavaScript"
                    />

                    {error && (
                        <p style={{ color: "#ef4444", fontWeight: "500", marginTop: "8px" }}>{error}</p>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            marginTop: "20px",
                            padding: "12px 16px",
                            border: "none",
                            borderRadius: "10px",
                            color: "white",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "0.25s"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        Register
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }}>
                    Already have an account?{" "}
                    <RouterLink to="/" style={{ color: "#667eea", fontWeight: "600" }}>
                        Log in
                    </RouterLink>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    marginBottom: "16px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.3s"
};

export default RegisterPage;
