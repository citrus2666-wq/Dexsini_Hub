import api from "../api/axios";

export const login = async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/login/access-token", formData);
    return response.data;
};
