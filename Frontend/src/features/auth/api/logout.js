import axios from 'axios';

const logOut = async () => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {}, 
        { withCredentials: true }  // include cookies for logout
    );
    return response.data;
}

export default logOut;