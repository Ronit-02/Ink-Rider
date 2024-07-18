import axios from "axios";

const token = localStorage.getItem('token');

const handleRazorpayResponse = async (response) => {
    try{
        const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/payment/verify`,
            {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }   
        );
        
        return res.data;
    }
    catch(error){
        console.log('Verification error', error?.response?.data?.message);
        throw error;
    }
}

// Post - send data in body
const verifyPayment = async (data) => {

    return new Promise((resolve, reject) => {
        const options = {
            key: import.meta.env.RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            name: "Ink Rider",
            description: "Testing",
            order_id: data.id,
            handler: async (response) => {
                try{
                    const verifyData = await handleRazorpayResponse(response);
                    resolve(verifyData);
                }
                catch(error){
                    reject(error);
                }
            },
            prefill: {
                name: "Ronit",
                email: "ronitkhatri44@gmail.com",
                contact: "9000000000"
            },
            theme: {
                color: "#3399cc"
            }
        }
    
        const rzp = new window.Razorpay(options);
        rzp.open();
    });
}   

export default verifyPayment;