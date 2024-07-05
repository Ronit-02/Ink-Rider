import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types'

const ProtectedRoute = ({children}) => {

    const token = useSelector(state => state.auth.token)

    if(!token)
        return <Navigate to="/login" />

    else 
        return children;
}

ProtectedRoute.propTypes = ({
    children: PropTypes.any
})

export default ProtectedRoute;