import { NavLink, redirect } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {logout} from '../redux/slices/authSlice';

const HomePage = () => {
  
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token)
  const user = useSelector(state => state.auth.user)

  const handleLogout = () => {
    dispatch(logout());
    redirect('/login');
  }

  return (
    <div className="mt-12 ml-12 w-[400px] flex flex-col gap-8">
        <nav className="flex justify-between">
          <div>
            Ink Rider
          </div>
          <div className="flex gap-6 text-blue-700">
            <NavLink to="/write">Write</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            {token ?  
              <button onClick={handleLogout}>Logout</button> : 
              <NavLink to="/login">Login</NavLink>
            }
          </div>
        </nav>
        {token && <p>Hi, Welcome user {user}</p>}
        This is home page
    </div>
  )
}

export default HomePage