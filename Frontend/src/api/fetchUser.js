import axios from "axios";

// Get - send data in params
const fetchUser = async ({queryKey}) => {
    const [_, username] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/no-posts`,
        {
            params: { username }
        }
    )
    return response.data;
}

export default fetchUser;