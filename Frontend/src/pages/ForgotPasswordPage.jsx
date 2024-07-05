import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import forgotPassword from "../api/forgotPassword";

const ForgotPasswordPage = () => {
  
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const {mutate, isLoading, isError, error} = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            console.log('Success - ', data);
        },
        onError: (error) => {
            console.log('Failure - ', error?.response?.data?.message || error.message);
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate({email});
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
            {isError && <p className="italic text-gray-400">{error?.response?.data?.message || error.message}</p>}
        </form>
    </div>
  )
}

export default ForgotPasswordPage;