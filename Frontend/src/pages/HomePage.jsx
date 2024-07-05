import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import AllPostSection from "../components/AllPostSection";

const HomePage = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());

    // reloading the whole app once to enable local storage
    window.location.reload();
  };

  return (
    <div className="flex flex-col w-full gap-8">
      <nav className="flex justify-between">
        <div>Ink Rider</div>
        <div className="flex gap-6 text-blue-700">
          <NavLink to="/write">Write</NavLink>
          {token ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </nav>
      {token && <p>Hi, Welcome user {user}</p>}
      <AllPostSection />
    </div>
  );
};

export default HomePage;