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
import { googleLogin as requestGoogleLogin } from '../api/googleLogin'
import useToast from '@/shared/hooks/useToast'
import { useTheme } from '@/shared/hooks/useTheme'

export default function Login({ signUp = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { notify } = useToast()
  const { dark } = useTheme()
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
    
    onError: error => notify(error?.response?.data?.message || 'Account creation failed.', { tone: 'error' }),
  })

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    
    onSuccess: (data) => {
      setIsEmailVerified(true)
      dispatch(loginSuccess(data));
      notify('Email verified.')
      navigate('/onboarding') 
    },

    onError: error => notify(error?.response?.data?.message || 'Email verification failed.', { tone: 'error' }),
  })

  const resendOtpMutation = useMutation({
    mutationFn: resendOtp,
    
    onSuccess: () => {
      notify('Verification code sent again.')
    }
  })

  const googleMutation = useMutation({
    mutationFn: requestGoogleLogin,
    onSuccess: data => {
      dispatch(loginSuccess(data))
      notify('Welcome to Ink Rider.')
      navigate('/')
    },
  })

  const triggerGoogleLogin = googleMutation.mutate

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
          triggerGoogleLogin(response.credential)
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: dark ? 'filled_black' : 'outline', size: 'large', width: 320, text: 'continue_with' })
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
  }, [dark, dispatch, triggerGoogleLogin, isEmailVerified, mode])

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
    <main className="flex h-[100dvh] overflow-y-auto bg-[var(--color-bg)] text-[var(--color-text)]">

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
        <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--color-bg)] px-6 py-6">
          <form id="auth-form" onSubmit={handleSubmit} className="w-full max-w-95 flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 shadow-[0_14px_36px_rgba(0,0,0,0.12)]">

            {/* Logo */}
            <Link to="/" 
              aria-label="Return to Ink-Rider home"
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-[10px] no-underline text-[var(--color-text)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-accent)]"><LogoIcon /></span>
              <span className="text-[17px] font-bold">Ink Rider</span>
            </Link>

            {/* Authentication Tabs */}
            <div role="tablist" aria-label="Authentication mode" className="mb-5 flex rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg)] p-1">
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
                    ${mode === m ? 'border border-[var(--color-border)] bg-[var(--color-surface-hover)] shadow-[0_2px_6px_rgba(0,0,0,0.12)] text-[var(--color-text)]' : 'border border-transparent bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div id="auth-form-fields" role="tabpanel" aria-labelledby={`auth-tab-${mode}`}>
            {/* Greetings */}
            <h2 className="mb-1.5 text-[24px] font-bold text-[var(--color-text)]">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mb-6 text-[14px] text-[var(--color-text-secondary)]">
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

            {(passwordsDiffer || authError) && <p role="alert" className="mb-2 text-[12px] text-[var(--color-danger)]">{passwordsDiffer ? 'Passwords do not match.' : authError}</p>}

            {/* Submit */}
            <button type="submit" disabled={loginMutation.isPending || signupMutation.isPending || passwordsDiffer}
              className="mt-2.5 w-full rounded-lg border-none bg-[var(--color-accent)] py-3 text-[15px] font-medium text-[var(--color-text-inverted)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-60">
              {loginMutation.isPending || signupMutation.isPending ? 'Please wait…' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && <><div className="my-5 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]"><span className="h-px flex-1 bg-[var(--color-border)]" />or<span className="h-px flex-1 bg-[var(--color-border)]" /></div><div ref={googleButtonRef} className="flex min-h-10 justify-center" />{googleMutation.error && <p role="alert" className="mt-2 text-center text-[12px] text-[var(--color-danger)]">{googleMutation.error?.response?.data?.message || 'Google sign-in failed.'}</p>}</>}
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
    <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--color-bg)] px-6 py-6">
      <div className="w-full max-w-95 flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 shadow-[0_14px_36px_rgba(0,0,0,0.12)]">

        {/* Logo */}
        <Link to="/" 
          aria-label="Return to Ink-Rider home"
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-[10px] no-underline text-[var(--color-text)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-accent)]"><LogoIcon /></span>
          <span className="text-[17px] font-bold">Ink Rider</span>
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
          className="mt-2.5 w-full rounded-lg border-none bg-[var(--color-accent)] py-3 text-[15px] font-medium text-[var(--color-text-inverted)] transition-colors hover:bg-[var(--color-accent-hover)]">
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
      className="mb-3.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 py-3 text-[14px] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
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
        className="h-12 w-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-center text-[var(--color-text)] transition-colors focus:border-[var(--color-accent)]"
        value={value}
        onChange={onChange}
        ref={ref}
        onKeyDown={onKeyDown}
      />
    )
  }
);
