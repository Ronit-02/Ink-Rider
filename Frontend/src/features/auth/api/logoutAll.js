import axios from 'axios';

const logoutAll = async () => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout-all`,
        {}, 
        { withCredentials: true }  // include cookies for logout
    );
    return response.data;
}

export default logoutAll;