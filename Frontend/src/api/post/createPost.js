import api from "../api.js";

// Post - send data in body
const createPost = async (formData) => {
    const response = await api.post(
        "/api/post/",
        formData
    )

    return response.data;
}

export default createPost;