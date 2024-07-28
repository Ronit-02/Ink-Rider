import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { isTokenExpiry } from "./utils/helper";
import { logout } from "./redux/slices/authSlice";

import AppRoutes from "./routes/AppRoutes";
import Notification from "./components/notification/Notification";
import Modal from "./components/modal/Modal";

function App() {
  
  // Remove expiry token
  const dispatch = useDispatch();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpiry(token))
      dispatch(logout());
  }, [dispatch]);

  return (
    <div className="relative h-screen max-w-screen font-primaryRegular">
      <Modal />
      <Notification />
      <AppRoutes />
    </div>
  ) 
}

export default App;