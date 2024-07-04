import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"
import { loginSuccess } from "../redux/slices/authSlice";

const AuthSuccessPage = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get('token');
    const username = queryParams.get('username');

    if(token){
      dispatch(loginSuccess({username, token}))
      navigate('/');
    }

  }, [location, navigate, dispatch])

  return (
    <div>
        Success, Redirecting....
    </div>
  )
}

export default AuthSuccessPage