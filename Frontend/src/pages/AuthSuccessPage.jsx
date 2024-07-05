import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom"
import { loginSuccess } from "../redux/slices/authSlice";

const AuthSuccessPage = () => {

  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get('token');
    const username = queryParams.get('username');

    if(token){
      dispatch(loginSuccess({username, token}))

      // reloading the whole app once to enable local storage 
      window.location.reload();
    }

  }, [location, dispatch])

  return (
    <div>
        Success, Redirecting....
    </div>
  )
}

export default AuthSuccessPage