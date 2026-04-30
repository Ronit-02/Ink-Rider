import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/slices/authSlice"
import { selectUser } from "@/redux/selectors/authSelector"
import { useNavigate } from "react-router-dom"

export default function useAuth() {
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const signIn = () => {
    navigate('/login')
  }

  const signUp = () => {
    navigate('/signup')
  }

  const signOut = () => {
    dispatch(logout())
    navigate('/login')
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
    completeOnboarding
  }
}