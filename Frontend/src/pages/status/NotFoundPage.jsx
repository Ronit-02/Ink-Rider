import { NavLink } from "react-router-dom";
import NotFoundImage from "../../assets/images/Not-Found.jpg";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <h1 className="flex-none text-4xl h-fit">404 - Page Not Found</h1>
        <h3 className="flex-none text-2xl h-fit">The page you are looking for does not exist.</h3>
        <NavLink className="underline" to="/"> Go to Home </NavLink>
        <div className="flex-1 h-28">
            <img className="object-cover h-full" src={NotFoundImage} alt="coffee-image" />
        </div>
    </div>
  )
}

export default NotFoundPage