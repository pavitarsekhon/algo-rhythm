import axios from "axios";

const API = axios.create({
    baseURL: "/api"
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log("Axios interceptor - Token:", token ? "present" : "missing", "URL:", config.url);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
