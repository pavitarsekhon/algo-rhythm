import React from "react";

const buttonStyle = (isSelected) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
    background: isSelected ? "#dbeafe" : "#f8fafc",
    color: "#1e293b",
    fontWeight: "600",
    cursor: "pointer"
});

const TopicQuizModal = ({
    isOpen,
    topic,
    questions,
    answers,
    feedback,
    onAnswer,
    onContinue,
    onClose,
    isContinuing
}) => {
    if (!isOpen) {
        return null;
    }

    const answeredCount = questions.filter((_, index) => answers[index] !== undefined).length;
    const allAnswered = questions.length > 0 && answeredCount === questions.length;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "24px"
        }}>
            <div style={{
                width: "min(760px, 100%)",
                maxHeight: "85vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 60px rgba(2, 6, 23, 0.3)",
                padding: "20px"
            }}>
                <h2 style={{ marginTop: 0, marginBottom: "8px", color: "#0f172a" }}>
                    Quick Topic Check
                </h2>
                <p style={{ marginTop: 0, marginBottom: "18px", color: "#334155" }}>
                    Before moving on, answer these true/false checks for <strong>{topic || "this topic"}</strong>.
                </p>

                {feedback && (
                    <div style={{
                        marginBottom: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: `1px solid ${feedback.passed ? "#10b981" : "#f59e0b"}`,
                        background: feedback.passed ? "#ecfdf5" : "#fffbeb",
                        color: feedback.passed ? "#065f46" : "#92400e",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}>
                        {feedback.message} ({feedback.correctCount}/{feedback.totalCount}, {feedback.score}% score, {feedback.topicProgress}% topicProgress)
                    </div>
                )}

                {questions.map((item, index) => (
                    <div key={item.id} style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "14px",
                        marginBottom: "12px",
                        background: "#f8fafc"
                    }}>
                        <div style={{ color: "#0f172a", fontWeight: "600", marginBottom: "10px" }}>
                            {index + 1}. {item.statement}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => onAnswer(index, true)}
                                style={buttonStyle(answers[index] === true)}
                            >
                                True
                            </button>
                            <button
                                type="button"
                                onClick={() => onAnswer(index, false)}
                                style={buttonStyle(answers[index] === false)}
                            >
                                False
                            </button>
                        </div>
                    </div>
                ))}

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px"
                }}>
                    <span style={{ color: "#475569", fontSize: "14px" }}>
                        {answeredCount}/{questions.length} answered
                    </span>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isContinuing}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                color: "#334155",
                                cursor: isContinuing ? "not-allowed" : "pointer"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={!allAnswered || isContinuing}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "8px",
                                border: "none",
                                background: !allAnswered || isContinuing ? "#94a3b8" : "#0ea5e9",
                                color: "#ffffff",
                                fontWeight: "600",
                                cursor: !allAnswered || isContinuing ? "not-allowed" : "pointer"
                            }}
                        >
                            {isContinuing ? "Loading..." : "Go to next question"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicQuizModal;

