import axios from "axios";

const fetchUserWithPosts = async ({queryKey}) => {

    const [_, userId] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
    )
    return response.data;
}

export default fetchUserWithPosts;