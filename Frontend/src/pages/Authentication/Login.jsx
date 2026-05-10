/* Login / Signup page — full Tailwind, split layout */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { loginUser }  from '@/api/auth/login'
import { signupUser } from '@/api/auth/signup'
import { loginStart, loginSuccess } from '@/redux/slices/authSlice'
import { LogoIcon } from '@/components/icons'

export default function Login({ signUp = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [mode, setMode] = useState(signUp ? 'signup' : 'login')
  const [creds, setCreds] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  
  const AUTH_TABS = ['login', 'signup']
  const loginMutation  = useMutation({ 
    mutationFn: loginUser,  
    onSuccess: (data) => { 
      dispatch(loginSuccess(data));
      // displayNotification('Login successful', 'success') 
      navigate('/') 
    } 
  })
  const signupMutation = useMutation({ 
    mutationFn: signupUser, 
    onSuccess: (data) => { 
      dispatch(loginSuccess(data));
      // displayNotification('Signup successful', 'success')
      navigate('/onboarding') 
    } 
  })

  const handleSubmit = e => {
    e.preventDefault()
    dispatch(loginStart())
    if (mode === 'login') loginMutation.mutate({ email: creds.email, password: creds.password })
    else signupMutation.mutate({ username: creds.name, email: creds.email, password: creds.password })
  }

  return (
    <div className="flex h-screen">

      {/* Left image (hidden on mobile) */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          alt="cover" className="w-full h-full object-cover" />
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-95 flex flex-col py-10 px-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">

          {/* Logo */}
          <Link to="/" 
            className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-(--color-accent) mx-auto mb-5 no-underline">
            <LogoIcon />
          </Link>

          {/* Authentication Tabs */}
          <div className="flex mb-5 bg-[#f0f0f0] rounded-lg p-1">
            {AUTH_TABS.map(m => (
              <button 
                key={m} 
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-md border-none text-[14px] font-medium cursor-pointer transition-all duration-150
                  ${mode === m ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)] text-black' : 'bg-transparent text-[#555]'}`}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Greetings */}
          <h2 className="text-[24px] font-bold mb-1.5 text-[#111]">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[14px] text-[#777] mb-6">
            {mode === 'login' ? 'Login to continue your journey' : 'Join and start writing today'}
          </p>

          {/* Fields */}
          {mode === 'signup' && (
            <FormField 
              type="text" 
              placeholder="Full Name" 
              value={creds.name}    
              onChange={e => setCreds({ ...creds, name: e.target.value })} 
            />
          )}
          <FormField 
            type="email" 
            placeholder="Email" 
            value={creds.email}    
            onChange={e => setCreds({ ...creds, email: e.target.value })} 
          />
          <FormField 
            type="password" 
            placeholder="Password" 
            value={creds.password}    
            onChange={e => setCreds({ ...creds, password: e.target.value })} 
          />
          {mode === 'signup' && (
            <FormField 
              type="password" 
              placeholder="Confirm Password" 
              value={creds.confirmPassword}    
              onChange={e => setCreds({ ...creds, confirmPassword: e.target.value })} 
            />
          )}

          {/* Submit */}
          <button onClick={handleSubmit}
            className="w-full py-3 mt-2.5 bg-[#111] text-white border-none rounded-lg text-[15px] font-medium cursor-pointer hover:bg-[#333] transition-colors">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          {/* Divider */}
          <div className="text-center my-5 text-[12px] text-[#aaa]">OR</div>

          {/* Google */}
          <button className="w-full py-3 bg-white border border-[#ddd] rounded-lg flex items-center justify-center gap-2.5 text-[14px] cursor-pointer hover:bg-[#fafafa] transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="google" className="w-4.5" />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({type, placeholder, value, onChange}){
  return (
    <input 
      type={type} 
      placeholder={placeholder}
      className={`w-full px-3 py-3 mb-3.5 rounded-lg border border-[#ddd] text-[14px] outline-none focus:border-(--color-accent) transition-colors bg-white text-[#111]`}
      value={value}
      onChange={onChange} />
  )
}