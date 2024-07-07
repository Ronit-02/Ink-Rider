import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { isTokenExpiry } from "./utils/helper";
import { logout } from "./redux/slices/authSlice";

import AppRoutes from "./routes/AppRoutes";

function App() {
  
  // Remove expiry token
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpiry(token)) {
      dispatch(logout());
    }
  }, [dispatch]);

  return (
    <div className="h-0 min-h-screen px-12 py-12 min-w-screen">
      <AppRoutes />
    </div>
  ) 
}

export default App;