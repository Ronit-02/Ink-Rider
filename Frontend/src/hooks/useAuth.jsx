import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/slices/authSlice"
import { selectUser } from "@/redux/selectors/authSelector"
import { useNavigate } from "react-router-dom"
import logOut from "@/api/auth/logout"
import logoutAll from "@/api/auth/logoutAll"
import { useMutation } from "@tanstack/react-query"

export default function useAuth() {
  const user = useSelector(selectUser)
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
    loggedIn: !!user,
    signIn,
    signUp,
    signOut,
    signOutAllDevices,
    completeOnboarding
  }
}