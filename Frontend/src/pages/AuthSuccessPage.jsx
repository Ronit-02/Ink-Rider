import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"
import { loginSuccess } from "../redux/slices/authSlice";

const AuthSuccessPage = () => {

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get('token');
    const username = queryParams.get('username');
    const email = queryParams.get('email');

    if(token){
      dispatch(loginSuccess({username, email, token}))

      // reloading the whole app once to enable local storage 
      window.location.reload();
    }
    else {
      navigate('/auth/google/failure');
    }

  }, [location, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-full">
        Success, Redirecting....
    </div>
  )
}

export default AuthSuccessPage;