import { useState } from "react";
import { submitCode, runTestCases } from "../api/questionsApi";

const Output = ({ editorRef, language, question, onNextQuestion}) => {
    const [submitResult, setSubmitResult] = useState(null);
    const [runResult, setRunResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const submitSourceCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsLoading(true);
        setRunResult(null);
        try {
            const result = await submitCode(language, sourceCode, question);
            setSubmitResult(result.data);
        } catch (error) {
            setSubmitResult({ error: "Submission failed" });
        } finally {
            setIsLoading(false);
        }
    };

    const runTests = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        setIsRunning(true);
        setSubmitResult(null);
        try {
            const result = await runTestCases(language, sourceCode, question);
            setRunResult(result.data);
        } catch (error) {
            setRunResult({ error: "Run failed" });
        } finally {
            setIsRunning(false);
        }
    };

    // Get current test result (either run or submit)
    const currentResult = runResult || submitResult;
    const isRunResultActive = runResult !== null;

    return (
        <div style={{ width: "100%" }}>
            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button
                    onClick={runTests}
                    disabled={isRunning || isLoading}
                    style={{
                        padding: "10px 24px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "white",
                        background: isRunning
                            ? "#9ca3af"
                            : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isRunning || isLoading ? "not-allowed" : "pointer",
                        transition: "all 0.3s"
                    }}
                    onMouseOver={(e) => {
                        if (!isRunning && !isLoading) {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                        }
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                    }}
                >
                    {isRunning ? "Running..." : "Run"}
                </button>

                <button
                    onClick={submitSourceCode}
                    disabled={isLoading || isRunning}
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
                        cursor: isLoading || isRunning ? "not-allowed" : "pointer",
                        transition: "all 0.3s"
                    }}
                    onMouseOver={(e) => {
                        if (!isLoading && !isRunning) {
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

            {/* Main content area - Output on left, Test Cases on right */}
            <div style={{ display: "flex", gap: "16px", width: "100%" }}>
                {/* Output Console - Always on left */}
                <div style={{
                    flex: "1 1 50%",
                    minWidth: "0",
                    height: "350px",
                    overflowY: "auto",
                    padding: "16px",
                    background: "#1e293b",
                    borderRadius: "12px",
                    fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
                    fontSize: "13px",
                    color: "#e2e8f0",
                    border: "2px solid #334155",
                    boxSizing: "border-box"
                }}>
                    {currentResult ? (
                        <div>
                            <div style={{ color: "#94a3b8", marginBottom: "12px", fontWeight: "600" }}>
                                Console Output:
                            </div>
                            {currentResult.results?.map((r, i) => (
                                <div key={i} style={{ marginBottom: "16px", borderBottom: "1px solid #334155", paddingBottom: "12px" }}>
                                    <div style={{ color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>
                                        Test {i + 1}:
                                    </div>
                                    {r.stderr ? (
                                        <div style={{ color: "#fca5a5", whiteSpace: "pre-wrap" }}>
                                            {r.stderr}
                                        </div>
                                    ) : (
                                        <div style={{ color: r.correct ? "#10b981" : "#e2e8f0", whiteSpace: "pre-wrap" }}>
                                            {r.actual || "(no output)"}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: "#94a3b8" }}>
                            Click "Run" to see test results
                        </div>
                    )}
                </div>

                {/* Test Cases - On right when visible */}
                {currentResult && (
                    <div style={{
                        flex: "1 1 50%",
                        minWidth: "0",
                        height: "350px",
                        overflowY: "auto",
                        padding: "16px",
                        borderRadius: "12px",
                        boxSizing: "border-box",
                        background: currentResult.error || !currentResult.allPassed
                            ? isRunResultActive ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 68, 68, 0.1)"
                            : "rgba(16, 185, 129, 0.1)",
                        border: `2px solid ${
                            currentResult.error || !currentResult.allPassed
                                ? isRunResultActive ? "#3b82f6" : "#ef4444"
                                : "#10b981"
                        }`
                    }}>
                        {currentResult.error ? (
                            <p style={{
                                color: isRunResultActive ? "#3b82f6" : "#ef4444",
                                fontWeight: "600",
                                margin: 0
                            }}>
                                {currentResult.error}
                            </p>
                        ) : currentResult.allPassed ? (
                            <div>
                                <p style={{
                                    color: "#10b981",
                                    fontWeight: "700",
                                    fontSize: "16px",
                                    margin: 0
                                }}>
                                    {isRunResultActive
                                        ? "✅ All visible test cases passed! Try submitting to check against all tests."
                                        : "✅ All test cases passed! Great job!"}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{
                                    color: isRunResultActive ? "#3b82f6" : "#ef4444",
                                    fontWeight: "700",
                                    marginBottom: "12px",
                                    marginTop: 0
                                }}>
                                    {isRunResultActive
                                        ? "🔍 Test Results (visible cases):"
                                        : "❌ Some test cases failed:"}
                                </p>
                                {currentResult.results.map((r, i) => (
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
            </div>
        </div>
    );
};

export default Output;