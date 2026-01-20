import API from "./axiosConfig";

// Check if current user is admin
export const checkAdminStatus = async () => {
    const response = await API.get("/admin/check");
    return response.data;
};

// Get admin dashboard stats
export const getAdminStats = async () => {
    const response = await API.get("/admin/stats");
    return response.data;
};

// Get all users
export const getAllUsers = async () => {
    const response = await API.get("/admin/users");
    return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
    const response = await API.get(`/admin/users/${userId}`);
    return response.data;
};

// Set user admin status
export const setUserAdminStatus = async (userId, isAdmin) => {
    const response = await API.put(`/admin/users/${userId}/admin`, { isAdmin });
    return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
};

// Generate questions using AI
export const generateQuestions = async (count = 5, difficulty = "EASY") => {
    const response = await API.post("/admin/questions/generate", { count, difficulty });
    return response.data;
};

