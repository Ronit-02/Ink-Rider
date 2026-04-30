import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/auth/login";
import { signupUser } from "@/api/auth/signup";
import { loginStart, loginSuccess } from "@/redux/slices/authSlice";
import { colors, fontSizes } from "@/styles/tokens";
import { LogoIcon } from "@/components/icons";

export default function Login({ signUp = false }) {
  const navigate = useNavigate()  
  const dispatch = useDispatch()
  const [mode, setMode] = useState( signUp ? "signup" : "login");
  const [userCreds, setUserCreds] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
  })

  const loginMutation = useMutation({
      mutationFn: loginUser,
      onSuccess: (data) => {
          dispatch(loginSuccess(data))
          // displayNotification('Login successful', 'success')

          navigate('/')
      }
  })

  const signupMutation = useMutation({
      mutationFn: signupUser,
      onSuccess: (data) => {
          dispatch(loginSuccess(data))
          // displayNotification('Signup successful', 'success')

          navigate('/onboarding')
      }
  })

  const login = (e) => {
      e.preventDefault()
      dispatch(loginStart())
      loginMutation.mutate({email: userCreds.email, password: userCreds.password})
  }

  const signup = (e) => {
      e.preventDefault()
      dispatch(loginStart())
      signupMutation.mutate({username: userCreds.name, email: userCreds.email, password: userCreds.password})
      navigate('/onboarding')
  }

  return (
    <div style={styles.container}>
      
      {/* LEFT IMAGE SECTION */}
      <div style={styles.left}>
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          alt="cover"
          style={styles.image}
        />
      </div>

      {/* RIGHT FORM SECTION */}
      <div style={styles.right}>
        <div style={styles.card}>

          {/* Logo */}
          <Link
            to="/"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: colors.accent,
              margin: '0 auto 20px',
            }}>
              <LogoIcon />
          </Link>
          
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              onClick={() => setMode("login")}
              style={{
                ...styles.tab,
                ...(mode === "login" ? styles.activeTab : {}),
              }}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{
                ...styles.tab,
                ...(mode === "signup" ? styles.activeTab : {}),
              }}
            >
              Sign Up
            </button>
          </div>

          <h2 style={styles.title}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          <p style={styles.subtitle}>
            {mode === "login"
              ? "Login to continue your journey"
              : "Join and start writing today"}
          </p>

          {/* Inputs */}
          {mode === "signup" && (
            <input 
                type="text" 
                placeholder="Full Name"
                style={styles.input} 
                value={userCreds.name} 
                onChange={(e) => setUserCreds({...userCreds, name: e.target.value})} 
            />
          )}

          <input 
            type="email" 
            placeholder="Email" 
            style={styles.input} 
            value={userCreds.email} 
            onChange={(e) => setUserCreds({...userCreds, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={styles.input} 
            value={userCreds.password} 
            onChange={(e) => setUserCreds({...userCreds, password: e.target.value})} 
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              style={styles.input}
              value={userCreds.confirmPassword}
              onChange={(e) => setUserCreds({...userCreds, confirmPassword: e.target.value})}
            />
          )}

          {/* Primary Button */}
          <button style={styles.primaryBtn} onClick={mode === "login" ? login : signup}>
            {mode === "login" ? "Login" : "Sign Up"}
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <span>OR</span>
          </div>

          {/* Google Button */}
          <button style={styles.googleBtn}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
              alt="google"
              style={{ width: 18, marginRight: 10 }}
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },

  left: {
    flex: 1,
    display: "none",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  right: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: 380,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "40px 32px",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  tabs: {
    display: "flex",
    marginBottom: 20,
    background: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },

  tab: {
    flex: 1,
    padding: 10,
    border: "none",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    color: "#555",
  },

  activeTab: {
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    color: "#000",
  },

  title: {
    fontSize: 24,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 24,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    marginTop: 10,
  },

  divider: {
    textAlign: "center",
    margin: "20px 0",
    color: "#aaa",
    fontSize: 12,
  },

  googleBtn: {
    width: "100%",
    padding: 12,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
};