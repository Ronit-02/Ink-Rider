import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types'

const PublicRoute = ({children}) => {

    const token = useSelector(state => state.auth.token)

    if(token)
        return <Navigate to="/" />

    else 
        return children;
}

PublicRoute.propTypes = ({
    children: PropTypes.any
})

export default PublicRoute;