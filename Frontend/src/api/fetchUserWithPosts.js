import axios from "axios";

const fetchUserWithPosts = async ({queryKey}) => {

    const [_, id] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/${id}`,
    )
    return response.data;
}

export default fetchUserWithPosts;