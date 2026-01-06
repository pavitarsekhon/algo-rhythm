import API from "./axiosConfig";

export const sendChatMessage = (message, code) =>
    API.post("/chat", { message, code });
