import API from "./axiosConfig";

export const runSourceCode = (language, sourceCode) =>
    API.post("/questions/run", { language, code: sourceCode });

export const runTestCases = (language, code, question, customTestCases = null) =>
    API.post("/questions/run-tests", {
        language,
        code,
        questionId: question.id,
        customTestCases,
    });

export const submitCode = (language, code, question) =>
    API.post("/questions/submit", {
        language,
        code,
        questionId: question.id,
    });

export const getTopicCheckQuestions = (questionId) =>
    API.post("/questions/topic-check", { questionId });

// Get the user's current question (without advancing to next)
export const getCurrentQuestion = () => API.get("/questions/current");

// Get the next question (advances to a new question)
export const getNextQuestion = () => API.get("/questions/next");