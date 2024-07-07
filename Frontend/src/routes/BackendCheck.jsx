import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from 'prop-types';

const BackendCheck = ({children}) => {

    const navigate = useNavigate();
    const [isBackendUp, setIsBackendUp] = useState(null);

    useEffect(() => {

        const checkBackend = async () => {
            try{
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/status`
                )
                if(!response.ok){
                    throw new Error('Network is down')
                }
                setIsBackendUp(true);
            }
            catch(error){
                // console.log('Error - ', error.message);
                setIsBackendUp(false);
                navigate('/maintenance')
            }
        }

        checkBackend();
    }, [navigate])

    if(isBackendUp === null)
        return <div>Loading...</div>

    return isBackendUp ? children : null;
}

BackendCheck.propTypes = ({
    children: PropTypes.any,
})

export default BackendCheck