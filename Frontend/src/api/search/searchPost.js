import axios from "axios"

// Get - send data in params
const searchPost = async ({queryKey}) => {
    const [_, query, filter] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/search`,
        {
            params: query
        }
    )

    return response.data;
}

export default searchPost;