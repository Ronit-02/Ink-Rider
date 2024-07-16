import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const NavbarLink = ({linkTo, title}) => {
  return (
    <NavLink
        className={({ isActive }) =>
            isActive ? "text-gray-900" : "text-gray-400"
        }
        to={linkTo}
    >
      {title}
    </NavLink>
  );
};

NavbarLink.propTypes = {
    linkTo: PropTypes.string,
    title: PropTypes.string,
}

export default NavbarLink;