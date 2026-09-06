/* Login / Signup page — full Tailwind, split layout */
import { useEffect, useRef, useState, forwardRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { LogoIcon } from '@/shared/icons'
import { loginUser }  from '../api/login'
import { signupUser } from '../api/signup'
import { resendOtp } from '../api/resendOtp'
import { verifyEmail } from '../api/verifyEmail'
import { loginFailure, loginStart, loginSuccess } from '../store/authSlice'
import { googleLogin } from '../api/googleLogin'
import useToast from '@/shared/hooks/useToast'

export default function Login({ signUp = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { notify } = useToast()
  const AUTH_TABS = ['login', 'signup']
  const [ mode, setMode ] = useState(signUp ? 'signup' : 'login')
  const [ isEmailVerified, setIsEmailVerified ] = useState(true)
  const [ creds, setCreds ] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [ otp, setOtp ] = useState(['', '', '', '', '', ''])
  const boxInputRefs = useRef([])
  const googleButtonRef = useRef(null)
  
  const loginMutation  = useMutation({ 
    mutationFn: loginUser,  
    
    onSuccess: (data) => { 
      dispatch(loginSuccess(data));
      notify('Welcome back.')
      navigate('/') 
    },
    
    onError: (error) => {
      dispatch(loginFailure(error?.response?.data?.message || 'Unable to log in at this time'))
      const code = error?.response?.data?.code;

      if (code === 'EMAIL_NOT_VERIFIED') {
        setIsEmailVerified(false);
      }
    }
  })

  const signupMutation = useMutation({ 
    mutationFn: signupUser,
    
    onSuccess: () => {
      notify('Account created. Check your email to verify it.')
      setIsEmailVerified(false)
    },
    
    onError: (error) => {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;
      // displayNotification(message || 'Signup failed', 'error')
    } 
  })

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    
    onSuccess: (data) => {
      setIsEmailVerified(true)
      dispatch(loginSuccess(data));
      notify('Email verified.')
      navigate('/onboarding') 
    },

    onError: (error) => {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;
      // displayNotification(message || 'Verification failed', 'error')
    }
  })

  const resendOtpMutation = useMutation({
    mutationFn: resendOtp,
    
    onSuccess: () => {
      notify('Verification code sent again.')
    }
  })

  const googleMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: data => {
      dispatch(loginSuccess(data))
      notify('Welcome to Ink Rider.')
      navigate('/')
    },
  })

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !isEmailVerified || !googleButtonRef.current) return undefined
    const renderButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: response => {
          dispatch(loginStart())
          googleMutation.mutate(response.credential)
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' })
    }
    if (window.google?.accounts?.id) {
      renderButton()
      return undefined
    }
    const existingScript = document.querySelector('script[data-google-identity]')
    const script = existingScript || document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    if (!existingScript) document.head.appendChild(script)
    script.addEventListener('load', renderButton)
    return () => script.removeEventListener('load', renderButton)
  }, [dispatch, isEmailVerified, mode])

  const handleSubmit = e => {
    e.preventDefault()
    if (mode === 'signup' && creds.password !== creds.confirmPassword) return
    dispatch(loginStart())
    if (mode === 'login') loginMutation.mutate({ email: creds.email, password: creds.password })
    else signupMutation.mutate({ username: creds.name, email: creds.email, password: creds.password })
  }

  const handleVerifyEmail = e => {
    e.preventDefault()
    verifyEmailMutation.mutate({ email: creds.email, otp: otp.join('') })
  }

  const handleResendOtp = e => {
    e.preventDefault()
    resendOtpMutation.mutate({ email: creds.email })
  }
  const handleAuthTabKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const tabs = Array.from(event.currentTarget.parentElement.querySelectorAll('[role="tab"]'))
    const index = tabs.indexOf(event.currentTarget)
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    event.preventDefault()
    const next = tabs[nextIndex]
    setMode(next.id.replace('auth-tab-', ''))
    next.focus()
  }
  const authError = loginMutation.error?.response?.data?.message || signupMutation.error?.response?.data?.message
  const passwordsDiffer = mode === 'signup' && creds.confirmPassword && creds.password !== creds.confirmPassword

  return (
    <main className="flex h-screen">

      {/* Left image (hidden on mobile) */}
      <div className="hidden md:block flex-1 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          alt="" className="w-full h-full object-cover" />
      </div>

      {/* Right form */}
      {!isEmailVerified 
        ?
        <VerifyEmail 
          otp={otp} 
          setOtp={setOtp} 
          handleVerifyEmail={handleVerifyEmail} 
          handleResendOtp={handleResendOtp}
          boxInputRefs={boxInputRefs}
        />
        :
        <div className="flex-1 flex items-center justify-center px-6 bg-white">
          <form id="auth-form" onSubmit={handleSubmit} className="w-full max-w-95 flex flex-col py-10 px-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">

            {/* Logo */}
            <Link to="/" 
              aria-label="Return to Ink-Rider home"
              className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-(--color-accent) mx-auto mb-5 no-underline">
              <LogoIcon />
            </Link>

            {/* Authentication Tabs */}
            <div role="tablist" aria-label="Authentication mode" className="flex mb-5 bg-[#f0f0f0] rounded-lg p-1">
              {AUTH_TABS.map(m => (
                <button 
                  type="button"
                  role="tab"
                  id={`auth-tab-${m}`}
                  aria-selected={mode === m}
                  aria-controls="auth-form-fields"
                  tabIndex={mode === m ? 0 : -1}
                  onKeyDown={handleAuthTabKeyDown}
                  key={m} 
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-md border-none text-[14px] font-medium cursor-pointer transition-all duration-150
                    ${mode === m ? 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)] text-black' : 'bg-transparent text-[#555]'}`}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div id="auth-form-fields" role="tabpanel" aria-labelledby={`auth-tab-${mode}`}>
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
                name="name"
                autoComplete="name"
                placeholder="Full Name" 
                required
                value={creds.name}    
                onChange={e => setCreds({ ...creds, name: e.target.value })} 
              />
            )}
            <FormField 
              type="email" 
              name="email"
              autoComplete="email"
              placeholder="Email" 
              required
              value={creds.email}    
              onChange={e => setCreds({ ...creds, email: e.target.value })} 
            />
            <FormField 
              type="password" 
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="Password" 
              required
              value={creds.password}    
              onChange={e => setCreds({ ...creds, password: e.target.value })} 
            />
            {mode === 'signup' && (
              <FormField 
                type="password" 
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm Password" 
                required
                value={creds.confirmPassword}    
                onChange={e => setCreds({ ...creds, confirmPassword: e.target.value })} 
              />
            )}

            {(passwordsDiffer || authError) && <p role="alert" className="mb-2 text-[12px] text-red-600">{passwordsDiffer ? 'Passwords do not match.' : authError}</p>}

            {/* Submit */}
            <button type="submit" disabled={loginMutation.isPending || signupMutation.isPending || passwordsDiffer}
              className="w-full py-3 mt-2.5 bg-[#111] text-white border-none rounded-lg text-[15px] font-medium cursor-pointer hover:bg-[#333] transition-colors disabled:opacity-60">
              {loginMutation.isPending || signupMutation.isPending ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && <><div className="my-5 flex items-center gap-3 text-[11px] text-[#999]"><span className="h-px flex-1 bg-[#ddd]" />or<span className="h-px flex-1 bg-[#ddd]" /></div><div ref={googleButtonRef} className="flex min-h-10 justify-center" />{googleMutation.error && <p role="alert" className="mt-2 text-center text-[12px] text-red-600">{googleMutation.error?.response?.data?.message || 'Google sign-in failed.'}</p>}</>}
            </div>
          </form>
        </div>
      }
    </main>
  )
}

function VerifyEmail({otp, setOtp, boxInputRefs, handleVerifyEmail, handleResendOtp}) {

  const handleChange = (value, index) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Ensure only one digit
    setOtp(newOtp)

    // Move to next box if a digit is entered
    if (value && index < otp.length - 1) {
      boxInputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    // Move back to previous box on Backspace if current box is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      boxInputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-95 flex flex-col gap-4 items-center py-10 px-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">

        {/* Logo */}
        <Link to="/" 
          aria-label="Return to Ink-Rider home"
          className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-(--color-accent) mx-auto mb-5 no-underline">
          <LogoIcon />
        </Link>

        <h2 className="text-[24px] font-bold mb-1.5 text-(--color-text-primary)">
          Enter Verification Code
        </h2>

        <p className="text-[14px] text-(--color-text-muted) mb-6 text-center">
          Enter the 6-digit code we sent to your email to verify your account!
        </p>

        {/* Boxes */}
        <div className="flex gap-3 mb-6">
          {otp.map((digit, index) => (
            <BoxField
              key={index}
              placeholder=" "
              ref={(el) => boxInputRefs.current[index] = el}
              value={digit}
              onChange={el => handleChange(el.target.value, index)}
              onKeyDown={el => handleKeyDown(el, index)}
              label={`Verification digit ${index + 1}`}
            />
          ))}
        </div>

        <button type="button" onClick={handleResendOtp}
          className='text-[12px] text-(--color-text-muted) hover:text-(--color-accent) transition-colors mr-auto'
        >
          Resend OTP
        </button>

          {/* Submit */}
        <button type="button" onClick={handleVerifyEmail}
          className="w-full py-3 mt-2.5 bg-[#111] text-white border-none rounded-lg text-[15px] font-medium cursor-pointer hover:bg-[#333] transition-colors">
          Verify Email
        </button>
      </div>
    </div>
  )
}

function FormField({type, name, autoComplete, placeholder, value, onChange, required = false}){
  return (
    <input 
      type={type} 
      name={name}
      autoComplete={autoComplete}
      required={required}
      aria-label={placeholder}
      placeholder={placeholder}
      className={`w-full px-3 py-3 mb-3.5 rounded-lg border border-[#ddd] text-[14px] outline-none focus:border-(--color-accent) transition-colors bg-white text-[#111]`}
      value={value}
      onChange={onChange} />
  )
}

const BoxField = forwardRef(
  function BoxField(
    { placeholder, value, onChange, onKeyDown, label },
    ref
  ) {
    return (
      <input 
        type="text" 
        maxLength="1"
        inputMode="numeric"
        aria-label={label}
        placeholder={placeholder}
        className="w-12 h-12 text-center border border-[#ddd] rounded-lg focus:border-(--color-accent) transition-colors"
        value={value}
        onChange={onChange}
        ref={ref}
        onKeyDown={onKeyDown}
      />
    )
  }
);
