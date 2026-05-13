import api from "../api.js";

// Get - send data in params
const searchPost = async ({queryKey}) => {
    const [_, query, filter] = queryKey;

    const response = await api.get(
        "/api/post/search",
        {
            params: query
        }
    )

    return response.data;
}

export {
    searchPost
};