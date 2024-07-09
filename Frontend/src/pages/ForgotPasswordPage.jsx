import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import forgotPassword from "../api/forgotPassword";
import useNotification from "../components/notification/useNotification";

const ForgotPasswordPage = () => {
  
    const { displayNotification } = useNotification();
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    // Updating New Password
    const { mutate, isLoading } = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (response) => {
            displayNotification(response.message);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate({email});
        displayNotification('Email sent');
        setMessage('Mail has been sent to reset password')
    }
    
    return (
    <div className="w-full max-w-lg ml-auto mr-auto" >
        Send a reset password mail
        <form 
            className="flex flex-col gap-4 mt-4" 
            onSubmit={handleSubmit}
        >
            <input className="p-2 border" 
                type="email" 
                placeholder="email" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            <button className="rounded-lg w-[100px] p-2 text-white bg-blue-500 border" 
                type="submit" 
                disabled={isLoading}
            >
                Submit
            </button>
            { message &&
                <p className="italic text-gray-400">{message}</p>
            }
        </form>
    </div>
  )
}

export default ForgotPasswordPage;