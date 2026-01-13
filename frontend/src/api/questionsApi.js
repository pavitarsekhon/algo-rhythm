import API from "./axiosConfig";

export const runSourceCode = (language, sourceCode) =>
    API.post("/questions/run", { language, code: sourceCode });

export const submitCode = (language, code, question) =>
    API.post("/questions/submit", {
        language,
        code,
        questionId: question.id,
    });

export const getNextQuestion = () => API.get("/questions/next");