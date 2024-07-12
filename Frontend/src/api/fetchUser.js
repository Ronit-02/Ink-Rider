import axios from "axios";

// Get - send data in params
const fetchUser = async ({queryKey}) => {
    const [_, email] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/`,
        {
            params: { email }
        }
    )
    return response.data;
}

export default fetchUser;