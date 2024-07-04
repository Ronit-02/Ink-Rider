import axios from "axios";

const loginUser = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials
    )
    return response.data;
};

// const loginUser2 = async (credentials) => {

//     const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(credentials)
//     })

//     if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || 'Login failed');
//     }

//     return response.json();
// }

export {loginUser};