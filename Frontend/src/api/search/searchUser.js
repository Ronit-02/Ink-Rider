import axios from "axios"

// Get - send data in params
const searchUser = async ({queryKey}) => {
    const [_, query, filter] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/search`,
        {
            params: query
        }
    )

    return response.data;
}

export default searchUser;