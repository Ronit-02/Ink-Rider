import { useMutation } from "@tanstack/react-query";
import { useState } from "react"
import useNotification from "../../components/notification/useNotification";
import resetPassword from '../../api/auth/resetPassword'

const ResetPasswordPage = () => {

    const { displayNotification } = useNotification();
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    
    // Get Token from parameters
    const queryParams = new URLSearchParams(window.location.search)
    const token = queryParams.get("token");

    // Updating Password
    const {mutate, isLoading} = useMutation({
        mutationFn: resetPassword,
        onSuccess: (response) => {
            displayNotification(response.message);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        if(pass1 === pass2)
            mutate({password: pass1, token});
        else
            displayNotification('Passwords dont match', 'error');
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
        </form>
    </div>
  )
}

export default ResetPasswordPage