import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import coffeeImage from "../../assets/images/coffee.png"
import HomepageSkeleton from "../../components/skeletons/HomepageSkeleton";

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

    if (isBackendUp === null) return <HomepageSkeleton />
    
    return(
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4 px-4 pt-16 text-center">
        <h1 className="flex-none text-2xl sm:text-4xl font-primarySemiBold h-fit">We&apos;ll be right back!</h1>
        <h3 className="flex-none text-base sm:text-xl font-primaryLight h-fit">Till then grab a cup of coffee</h3>
        <div className="flex-auto w-full h-14">
            <img className="object-contain w-full h-full" src={coffeeImage} alt="coffee-image" />
        </div>
    </div>
    );
};

export default MaintenancePage;
