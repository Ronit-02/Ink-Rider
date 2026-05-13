import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import refreshToken from "@/api/auth/refreshToken";
import { logout, restoreCreds } from "@/redux/slices/authSlice";
import { LightLoader, DarkLoader } from "@/components/layout/Loader";

function AuthProvider({children}) {

    const dispatch = useDispatch();
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {

        const restoreSession = async () => {

            try{
                const data = await refreshToken();
                
                dispatch(restoreCreds({
                    token: data.token,
                    user: data.user,
                    email: data.email,
                    role: data.role
                }));
            }
            catch(err){
                console.log('Session restoration failed - ', err);
                dispatch(logout());
            }
            finally{
                setLoading(false);
            }
        }
        
        restoreSession();
    }, [])

    if(loading){
        console.log('Checking authentication status ...')
        
        return (
            <LightLoader />
        )
    }
        
    return children;
}

export default AuthProvider;