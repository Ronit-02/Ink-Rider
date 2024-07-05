import axios from "axios"

const fetchAllPost = async () => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/`,
    )

    return response.data;
}

export default fetchAllPost;