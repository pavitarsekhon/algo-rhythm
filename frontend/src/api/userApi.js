import API from "./axiosConfig";

// Get current user's profile and stats
export const getUserProfile = async () => {
    const response = await API.get("/user/profile");
    return response.data;
};

