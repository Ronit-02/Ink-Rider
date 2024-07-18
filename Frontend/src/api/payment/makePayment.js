import axios from "axios";

// Post - send data in body
const makePayment = async ({amount}) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/order`,
        {amount},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

export default makePayment;