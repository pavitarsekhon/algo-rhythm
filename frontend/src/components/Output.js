import { useEffect, useState } from "react";
import { getTopicCheckQuestions, submitCode, runTestCases } from "../api/questionsApi";
import TopicQuizModal from "./TopicQuizModal";

const Output = ({ editorRef, language, question, onNextQuestion}) => {
    const [submitResult, setSubmitResult] = useState(null);
    const [runResult, setRunResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [useCustomTestCases, setUseCustomTestCases] = useState(false);
    const [customTestCases, setCustomTestCases] = useState([{ input: "", expectedOutput: "" }]);
    const [isTopicQuizOpen, setIsTopicQuizOpen] = useState(false);
    const [topicQuizQuestions, setTopicQuizQuestions] = useState([]);
    const [topicQuizAnswers, setTopicQuizAnswers] = useState({});
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [isLoadingTopicQuiz, setIsLoadingTopicQuiz] = useState(false);
    const [topicQuizError, setTopicQuizError] = useState(null);

    useEffect(() => {
        setSubmitResult(null);
        setRunResult(null);
        setUseCustomTestCases(false);
        setCustomTestCases([{ input: "", expectedOutput: "" }]);
        setIsTopicQuizOpen(false);
        setTopicQuizQuestions([]);
        setTopicQuizAnswers({});
        setIsAdvancing(false);
        setIsLoadingTopicQuiz(false);
        setTopicQuizError(null);
    }, [question?.id]);

    const handleContinueToNextQuestion = async () => {
        const allAnswered = topicQuizQuestions.length > 0
            && topicQuizQuestions.every((_, index) => topicQuizAnswers[index] !== undefined);

        if (!allAnswered) {
            return;
        }

        setIsAdvancing(true);
        setSubmitResult(null);
        setRunResult(null);
        setIsTopicQuizOpen(false);
        try {
            await Promise.resolve(onNextQuestion?.());
        } finally {
            setIsAdvancing(false);
        }
    };

    const openTopicQuiz = () => {
        if (!question?.id) {
            return;
        }

        setTopicQuizError(null);
        setIsLoadingTopicQuiz(true);
        getTopicCheckQuestions(question.id)
            .then((res) => {
                const questions = Array.isArray(res.data) ? res.data : [];
                if (!questions.length) {
                    setTopicQuizError("Could not generate topic-check questions. Please try again.");
                    return;
                }

                setTopicQuizQuestions(questions);
                setTopicQuizAnswers({});
                setIsTopicQuizOpen(true);
            })
            .catch(() => {
                setTopicQuizError("Could not generate topic-check questions. Please try again.");
            })
            .finally(() => {
                setIsLoadingTopicQuiz(false);
            });
    };

    const handleTopicAnswer = (index, value) => {
        setTopicQuizAnswers((prev) => ({ ...prev, [index]: value }));
    };

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
            let testCasesToSend = null;
            if (useCustomTestCases) {
                testCasesToSend = customTestCases
                    .filter(tc => tc.input.trim() !== "")
                    .map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput || ""
                    }));
            }
            const result = await runTestCases(language, sourceCode, question, testCasesToSend);
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
                        onClick={openTopicQuiz}
                        disabled={isAdvancing || isLoadingTopicQuiz}
                        style={{
                            padding: "10px 24px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "white",
                            background: isAdvancing || isLoadingTopicQuiz
                                ? "#9ca3af"
                                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            borderRadius: "8px",
                            cursor: isAdvancing || isLoadingTopicQuiz ? "not-allowed" : "pointer",
                            transition: "all 0.3s"
                        }}
                        onMouseOver={(e) => {
                            if (!isAdvancing && !isLoadingTopicQuiz) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        {isAdvancing || isLoadingTopicQuiz ? "Loading..." : "Next ->"}
                    </button>
                )}
            </div>

            {topicQuizError && (
                <div style={{ color: "#dc2626", marginBottom: "12px", fontWeight: "600" }}>
                    {topicQuizError}
                </div>
            )}

            <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "#1e293b", cursor: "pointer", marginBottom: "8px" }}>
                    <input
                        type="checkbox"
                        checked={useCustomTestCases}
                        onChange={(e) => setUseCustomTestCases(e.target.checked)}
                        style={{ width: "16px", height: "16px" }}
                    />
                    Use Custom Test Cases
                </label>

                {useCustomTestCases && (
                    <div style={{ background: "#1e293b", padding: "16px", borderRadius: "8px", border: "1px solid #334155" }}>
                        {customTestCases.map((tc, index) => (
                            <div key={index} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: index < customTestCases.length - 1 ? "1px solid #334155" : "none" }}>
                                <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Input</div>
                                        <textarea
                                            value={tc.input}
                                            onChange={(e) => {
                                                const newCases = [...customTestCases];
                                                newCases[index].input = e.target.value;
                                                setCustomTestCases(newCases);
                                            }}
                                            style={{
                                                width: "100%", height: "60px", background: "#0f172a", color: "#e2e8f0",
                                                border: "1px solid #334155", borderRadius: "4px", padding: "8px", fontFamily: "monospace", resize: "vertical"
                                            }}
                                            placeholder="Input"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "4px" }}>Expected Output (Optional)</div>
                                        <textarea
                                            value={tc.expectedOutput}
                                            onChange={(e) => {
                                                const newCases = [...customTestCases];
                                                newCases[index].expectedOutput = e.target.value;
                                                setCustomTestCases(newCases);
                                            }}
                                            style={{
                                                width: "100%", height: "60px", background: "#0f172a", color: "#e2e8f0",
                                                border: "1px solid #334155", borderRadius: "4px", padding: "8px", fontFamily: "monospace", resize: "vertical"
                                            }}
                                            placeholder="Expected output"
                                        />
                                    </div>
                                    {customTestCases.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const newCases = customTestCases.filter((_, i) => i !== index);
                                                setCustomTestCases(newCases);
                                            }}
                                            style={{ height: "24px", alignSelf: "center", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setCustomTestCases([...customTestCases, { input: "", expectedOutput: "" }])}
                            style={{
                                padding: "6px 12px", fontSize: "12px", color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid #3b82f6", borderRadius: "4px", cursor: "pointer"
                            }}
                        >
                            + Add Test Case
                        </button>
                    </div>
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

            <TopicQuizModal
                isOpen={isTopicQuizOpen}
                topic={question?.topics?.split("|")[0]?.trim()}
                questions={topicQuizQuestions}
                answers={topicQuizAnswers}
                onAnswer={handleTopicAnswer}
                onContinue={handleContinueToNextQuestion}
                onClose={() => setIsTopicQuizOpen(false)}
                isContinuing={isAdvancing}
            />
        </div>
    );
};

export default Output;