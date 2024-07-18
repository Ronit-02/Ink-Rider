import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthFailurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = new URLSearchParams(location.search).get('message');

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <h1 className="text-2xl">Authentication Failed</h1>
      <p className="text-xl">{message}</p>
      <p>Redirecting to login page...</p>
    </div>
  );
}

export default AuthFailurePage;