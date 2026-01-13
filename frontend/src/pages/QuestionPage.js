import React, { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor";
import FormattedQuestion from "../components/FormattedQuestion";
import { getNextQuestion } from "../api/questionsApi";
import { useNavigate } from "react-router-dom";

function QuestionPage() {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }
    }, []);
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        getNextQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch question:", err));
    }, []);

    const [editorRef, setEditorRef] = useState(null)

    const loadNextQuestion = () => {
        getNextQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch question:", err));
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: "#10b981",
            medium: "#f59e0b",
            hard: "#ef4444"
        };
        return colors[difficulty?.toLowerCase()] || "#6b7280";
    };

    return (
        <div style={{
            display: "flex",
            height: "calc(100vh - 70px)",
            background: "#f8fafc"
        }}>
            {/* LEFT SIDE - Question & Editor */}
            <div style={{
                flex: "2",
                padding: "40px",
                overflowY: "auto",
                background: "#f8fafc"
            }}>
                {/* Question Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    marginBottom: "24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "20px"
                    }}>
                        <h1 style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                            margin: 0
                        }}>
                            {question?.topics ? question.topics.split('|')[0] : "Loading..."}
                        </h1>
                        {question?.difficulty && (
                            <span style={{
                                padding: "6px 16px",
                                borderRadius: "20px",
                                fontSize: "13px",
                                fontWeight: "600",
                                background: getDifficultyColor(question.difficulty) + "15",
                                color: getDifficultyColor(question.difficulty),
                                textTransform: "capitalize"
                            }}>
                                {question.difficulty}
                            </span>
                        )}
                    </div>
                    <FormattedQuestion content={question?.prompt} />
                </div>

                {/* Code Editor Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "32px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e5e7eb"
                }}>
                    <CodeEditor question={question} onNextQuestion={loadNextQuestion} onEditorRef={setEditorRef}/>
                </div>
            </div>

            {/* RIGHT SIDE - ChatBox */}
            <div style={{
                width: "420px",
                borderLeft: "1px solid #e5e7eb",
                background: "white"
            }}>
                <ChatBox editorRef={editorRef}/>
            </div>
        </div>
    );
}

export default QuestionPage;