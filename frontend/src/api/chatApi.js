import API from "./axiosConfig";

export const sendChatMessage = (message) =>
    API.post("/chat", { message });
