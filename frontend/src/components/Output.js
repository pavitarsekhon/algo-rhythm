import { useState } from "react";
import { runSourceCode, submitCode } from "../api/questionsApi";

const Output = ({ editorRef, language, question, onNextQuestion}) => {
    const [output, setOutput] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const submitSourceCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsLoading(true);
        try {
            const result = await submitCode(language, sourceCode, question);
            setSubmitResult(result.data);
        } catch (error) {
            setSubmitResult({ error: "Submission failed" });
        } finally {
            setIsLoading(false);
        }
    };

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsLoading(true);
        try {
            const result = await runSourceCode(language, sourceCode);
            const stdout = result.data.stdout || "";
            const stderr = result.data.stderr || "";

            if (stderr) {
                setIsError(true);
                setOutput(stderr.split("\n"));
            } else {
                setIsError(false);
                setOutput(stdout.split("\n"));
            }
        } catch (error) {
            console.error("Run error:", error);
            setIsError(true);
            setOutput(["Error: Unable to run code"]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: "100%" }}>
            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button
                    onClick={submitSourceCode}
                    disabled={isLoading}
                    style={{
                        padding: "10px 24px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "white",
                        background: isLoading
                            ? "#9ca3af"
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        transition: "all 0.3s"
                    }}
                    onMouseOver={(e) => {
                        if (!isLoading) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                        }
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                    }}
                >
                    {isLoading ? "Submitting..." : "Submit"}
                </button>

                {/* NEXT BUTTON (only visible when passed) */}
                {submitResult?.allPassed && (
                    <button
                        onClick={onNextQuestion}
                        style={{
                            padding: "10px 24px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "white",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        Next →
                    </button>
                )}
            </div>

            {/* Submit Results */}
            {submitResult && (
                <div style={{
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    background: submitResult.error || !submitResult.allPassed
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                    border: `2px solid ${submitResult.error || !submitResult.allPassed ? "#ef4444" : "#10b981"}`
                }}>
                    {submitResult.error ? (
                        <p style={{
                            color: "#ef4444",
                            fontWeight: "600",
                            margin: 0
                        }}>
                            {submitResult.error}
                        </p>
                    ) : submitResult.allPassed ? (
                        <div>
                            <p style={{
                                color: "#10b981",
                                fontWeight: "700",
                                fontSize: "16px",
                                margin: 0
                            }}>
                                ✅ All test cases passed! Great job!
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p style={{
                                color: "#ef4444",
                                fontWeight: "700",
                                marginBottom: "12px",
                                marginTop: 0
                            }}>
                                ❌ Some test cases failed:
                            </p>
                            {submitResult.results.map((r, i) => (
                                <div key={i} style={{
                                    padding: "12px",
                                    background: "rgba(255, 255, 255, 0.5)",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    fontSize: "13px"
                                }}>
                                    <div style={{ marginBottom: "4px" }}>
                                        <strong style={{ color: "#1f2937" }}>Input:</strong>
                                        <span style={{ color: "#4b5563", marginLeft: "8px" }}>{r.input}</span>
                                    </div>
                                    <div style={{ marginBottom: "4px" }}>
                                        <strong style={{ color: "#1f2937" }}>Expected:</strong>
                                        <span style={{ color: "#4b5563", marginLeft: "8px" }}>{r.expected}</span>
                                    </div>
                                    <div style={{ marginBottom: "4px" }}>
                                        <strong style={{ color: "#1f2937" }}>Your Output:</strong>
                                        <span style={{ color: "#4b5563", marginLeft: "8px" }}>{r.actual}</span>
                                    </div>
                                    <div style={{
                                        color: r.correct ? "#10b981" : "#ef4444",
                                        fontWeight: "600"
                                    }}>
                                        {r.correct ? "✅ Correct" : "❌ Incorrect"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Output Console */}
            <div style={{
                minHeight: "250px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "16px",
                background: "#1e293b",
                borderRadius: "12px",
                fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                fontSize: "13px",
                color: isError ? "#fca5a5" : "#e2e8f0",
                border: `2px solid ${isError ? "#ef4444" : "#334155"}`
            }}>
                {output ? (
                    output.map((line, i) => (
                        <div key={i} style={{ lineHeight: "1.6" }}>
                            {line || "\u00A0"}
                        </div>
                    ))
                ) : (
                    <div style={{ color: "#94a3b8" }}>
                        Click "Run Code" to see the output here
                    </div>
                )}
            </div>
        </div>
    );
};

export default Output;