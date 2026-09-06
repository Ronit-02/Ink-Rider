import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { logout } from "../store/authSlice"
import { selectUser } from "../store/authSelector"
import logOut from "../api/logout"
import logoutAll from "../api/logoutAll"

export default function useAuth() {
  const user = useSelector(selectUser)
  const avatarUrl = useSelector(state => state.auth.avatarUrl)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const logoutMutation = useMutation({
    mutationFn: logOut,
    
    onSuccess: () => {
      dispatch(logout())
      navigate('/login')
    },
    
    onError: (error) => {
      console.error('Logout failed:', error)
    }
  })

  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
    
    onSuccess: () => {
      dispatch(logout())
      navigate('/login')
    },
    
    onError: (error) => {
      console.error('Logout All failed:', error)
    }
  })

  const signIn = () => {
    navigate('/login')
  }

  const signUp = () => {
    navigate('/signup')
  }

  const signOut = async () => {
    logoutMutation.mutate();
  }

  const signOutAllDevices = async () => {
    logoutAllMutation.mutate();
  }

  const completeOnboarding = () => {
    navigate('/')
  }

  return {
    user,
    avatarUrl,
    loggedIn: !!user,
    signIn,
    signUp,
    signOut,
    signOutAllDevices,
    completeOnboarding
  }
}
