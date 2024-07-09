import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import coffeeImage from "../assets/images/coffee.jpg"

const MaintenancePage = () => {
  const navigate = useNavigate();
  const [isBackendUp, setIsBackendUp] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/status`);
        if (!response.ok) {
          throw new Error("Network is still down");
        }
        setIsBackendUp(true);
        navigate("/");
      } 
      catch (error) {
        setIsBackendUp(false);
      }
    };

    checkBackend();
  }, [navigate]);

  if (isBackendUp === null) return <div>Loading...</div>;
  else return(
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <h1 className="flex-none text-4xl h-fit">We&apos;ll be right back!</h1>
      <h3 className="flex-none text-2xl h-fit">Till then grab a cup of coffee</h3>
      <div className="flex-1 h-28">
        <img className="object-cover h-full" src={coffeeImage} alt="coffee-image" />
      </div>
    </div>
  );
};

export default MaintenancePage;
