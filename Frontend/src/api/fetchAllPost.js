import axios from "axios"

// Get - send data in params
const fetchAllPost = async ({queryKey}) => {
    const [_, sort, sortType] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/`,
        {
            params: {sort, sortType}
        }
    )

    return response.data;
}

export default fetchAllPost;