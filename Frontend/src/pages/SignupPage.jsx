import { useState } from "react"
import { NavLink } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import signup from "../api/signup";
import useNotification from "../components/notification/useNotification";

const SignupPage = () => {

    const { displayNotification } = useNotification();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Creating User
    const {mutate, isLoading} = useMutation({
        mutationFn: signup,
        onSuccess: (response) => {
            displayNotification(response.message);
            setUsername('');
            setEmail('');
            setPassword('');
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate({username, email, password});
    }

    const handleGoogleLogin = () => {
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`;
        window.location.href = googleAuthUrl;
    }

  return (
    <div className="flex flex-col w-full max-w-lg ml-auto mr-auto gap-7">
        <div className="flex justify-center w-full">
            <NavLink to="/" className="text-2xl text-center">Ink Rider</NavLink>
        </div>
        <div>
            <h1>Signup Now</h1>
            <form 
                className="flex flex-col gap-4 mt-4" 
                onSubmit={handleSubmit}
            >
                <input className="p-2 border" 
                    type="text" 
                    placeholder="username" 
                    value={username} onChange={(e) => setUsername(e.target.value)} 
                />
                <input className="p-2 border" 
                    type="email" 
                    placeholder="email" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                <input className="p-2 border" 
                    type="password" 
                    placeholder="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button className="rounded-lg w-[100px] p-2 text-white bg-blue-500 border" 
                    type="submit" 
                    disabled={isLoading}
                >
                    Submit
                </button>
            </form>
        </div>
        <div>
            <div className="mt-4">
                Continue with <a className="text-red-600 cursor-pointer" onClick={handleGoogleLogin}>Google</a>
            </div>
            <div className="flex gap-2 mt-4">
                <p>Already have an account,</p> 
                <NavLink className="text-blue-600 cursor-pointer" 
                    to="/login" >
                        Login
                </NavLink>
            </div>
        </div>
    </div>
  )
}

export default SignupPage