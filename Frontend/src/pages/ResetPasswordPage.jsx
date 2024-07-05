import { useMutation } from "@tanstack/react-query";
import { useState } from "react"
import resetPassword from '../api/resetPassword'

const ResetPasswordPage = () => {

    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [message, setMessage] = useState('')
    
    // Get Token for parameters
    const queryParams = new URLSearchParams(window.location.search)
    const token = queryParams.get("token");

    const {mutate, isLoading} = useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            console.log(data.message)
            setMessage(data.message);
        },
        onError: (error) => {
            console.log(error?.response?.data?.message || error.message);
            setMessage(error?.response?.data?.message || error.message);
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        if(pass1 === pass2){
            mutate({password: pass1, token});
        }
        else{
            setMessage('Passwords dont match, enter again')
        }
    }

  return (
    <div className="w-full max-w-lg">
        Reset Your Password
        <form 
            className="flex flex-col gap-4 mt-4" 
            onSubmit={handleSubmit}
        >
            <input className="p-2 border" 
                type="password" 
                placeholder="password" 
                value={pass1} onChange={(e) => setPass1(e.target.value)} 
            />
            <input className="p-2 border" 
                type="password" 
                placeholder="confirm password" 
                value={pass2} onChange={(e) => setPass2(e.target.value)} 
            />
            <button className="rounded-lg w-[100px] p-2 text-white bg-blue-500 border" 
                type="submit" 
                disabled={isLoading}
            >
                Reset
            </button>
            { message &&
                <p className="italic text-gray-400">{message}</p>
            }
        </form>
    </div>
  )
}

export default ResetPasswordPage