import React, { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import CodeEditor from "../components/CodeEditor";
import FormattedQuestion from "../components/FormattedQuestion";
import { getCurrentQuestion, getNextQuestion } from "../api/questionsApi";
import { useNavigate } from "react-router-dom";
import "./QuestionPage.css";

function QuestionPage() {
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [editorRef, setEditorRef] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Load the user's current question on page load
        getCurrentQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch current question:", err));
    }, [navigate]);

    const loadNextQuestion = () => {
        // Only called when "Next Question" button is clicked
        getNextQuestion()
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error("Failed to fetch next question:", err));
    };

    const getDifficultyClass = (difficulty) => {
        return difficulty?.toLowerCase() || "";
    };

    return (
        <div className="question-page-container">
            {/* LEFT SIDE - Question & Editor */}
            <div className="question-left-panel">
                {/* Question Card */}
                <div className="question-card">
                    <div className="question-card-header">
                        <h1 className="question-card-title">
                            {question?.topics ? question.topics.split('|')[0] : "Loading..."}
                        </h1>
                        {question?.difficulty && (
                            <span className={`difficulty-tag ${getDifficultyClass(question.difficulty)}`}>
                                {question.difficulty}
                            </span>
                        )}
                    </div>
                    <FormattedQuestion content={question?.prompt} />
                </div>

                {/* Code Editor Card */}
                <div className="editor-card">
                    <CodeEditor question={question} onNextQuestion={loadNextQuestion} onEditorRef={setEditorRef}/>
                </div>
            </div>

            {/* RIGHT SIDE - ChatBox */}
            <div className="question-right-panel">
                <ChatBox editorRef={editorRef}/>
            </div>
        </div>
    );
}

export default QuestionPage;

