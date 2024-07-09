import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/slices/authSlice";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {loginUser} from "../api/login";
import { NavLink } from "react-router-dom";
import useNotification from "../components/notification/useNotification";

const LoginPage = () => {
    const { displayNotification } = useNotification();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Getting User
    const { mutate, isLoading } = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            dispatch(loginSuccess(data));
            displayNotification('Login Successful');
            
            // reloading the whole app once to enable local storage 
            window.location.reload();
        },
        onError: (error) => {
            dispatch(loginFailure(error.response?.data?.message || error.message));
            displayNotification(error.response?.data?.message || error.message, 'error');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginStart());
        mutate({email, password});
    }

    const handleGoogleLogin = () => {
        const googleAuthUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`;
        window.location.href = googleAuthUrl;
    }

  return (
    <div className="w-full max-w-lg ml-auto mr-auto">
        <h1>Login with your account</h1>
        <form 
            className="flex flex-col gap-4 mt-4" 
            onSubmit={handleSubmit}
        >
            <input className="p-2 border" 
                type="email" 
                placeholder="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input className="p-2 border" 
                type="password" 
                placeholder="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <NavLink to={"/forgot-password"} className="ml-auto text-blue-400 cursor-pointer">forgot password ?</NavLink>
            <button className="rounded-lg w-[100px] p-2 text-white bg-blue-500 border" 
                type="submit" 
                disabled={isLoading}
            >   
                Submit
            </button>
        </form>
        <div className="mt-4">
            Continue with <a className="text-red-600 cursor-pointer" onClick={handleGoogleLogin}>Google</a>
        </div>
        <div className="flex gap-2 mt-4">
            <p>Dont have an account,</p> 
            <NavLink className="text-blue-600 cursor-pointer" 
                to="/signup" >
                    Sign Up
            </NavLink>
        </div>
    </div>
  )
}

export default LoginPage;