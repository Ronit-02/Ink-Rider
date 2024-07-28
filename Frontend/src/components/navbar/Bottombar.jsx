
// icons
import { LiaHomeSolid } from "react-icons/lia";
import { LiaCompass } from "react-icons/lia";
import { LiaSearchSolid } from "react-icons/lia";
import { LiaPencilAltSolid } from "react-icons/lia";
import { LiaBookmarkSolid } from "react-icons/lia";
import { NavLink } from "react-router-dom";

const Bottombar = () => {
  return (
    <div className="sm:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 h-[70px] border-[1px] border-gray-200 bg-white">
        <NavLink to="/">
            <LiaHomeSolid className="text-3xl text-gray-600" />
        </NavLink>
        <NavLink to="/explore">
            <LiaCompass className="text-3xl text-gray-600" />
        </NavLink>
        <NavLink to="/search">
            <LiaSearchSolid className="text-3xl text-gray-600" />
        </NavLink>
        <NavLink to="/write">
            <LiaPencilAltSolid className="text-3xl text-gray-600" />
        </NavLink>
        <NavLink to="/profile">
            <LiaBookmarkSolid className="text-3xl text-gray-600" />
        </NavLink>
    </div>
  )
}

export default Bottombar;