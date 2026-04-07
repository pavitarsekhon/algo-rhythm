import API from "./axiosConfig";

const PYTHON_LANGUAGE = "python";

export const runTestCases = (code, question, customTestCases = null) =>
    API.post("/questions/run-tests", {
        language: PYTHON_LANGUAGE,
        code,
        questionId: question.id,
        customTestCases,
    });

export const submitCode = (code, question) =>
    API.post("/questions/submit", {
        language: PYTHON_LANGUAGE,
        code,
        questionId: question.id,
    });

export const getTopicCheckQuestions = (questionId) =>
    API.post("/questions/topic-check", { questionId });

export const submitTopicCheckAnswers = (questionId, answers) =>
    API.post("/questions/topic-check/submit", { questionId, answers });

export const getTopicCheckStatus = () => API.get("/questions/topic-check/status");

// Get the user's current question (without advancing to next)
export const getCurrentQuestion = () => API.get("/questions/current");

// Get the next question (advances to a new question)
export const getNextQuestion = () => API.get("/questions/next");