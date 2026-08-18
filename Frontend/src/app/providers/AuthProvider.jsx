import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import refreshToken from "@/features/auth/api/refreshToken";
import { authReady, logout, restoreCreds } from "@/features/auth/store/authSlice";
import store from "@/app/store";

function AuthProvider({children}) {

    const dispatch = useDispatch();
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {

            try{
                const data = await refreshToken();

                // A login can complete while the initial refresh request is in
                // flight. Never let an older refresh response replace the
                // newer authenticated state.
                if (!cancelled && !store.getState().auth.token) {
                    dispatch(restoreCreds({
                        token: data.accessToken,
                        user: data.user,
                        avatarUrl: data.avatarUrl,
                        email: data.email,
                        role: data.role
                    }));
                }
            }
            catch(err){
                // An expired or absent refresh cookie is an ordinary signed-out state.
                const authState = store.getState().auth;
                // A refresh 401 may arrive while an explicit login or signup
                // request is still completing. Do not clear that in-flight
                // mutation; its success or failure owns the next auth state.
                if (!cancelled && !authState.token && !authState.isLoading) dispatch(logout());
            }
            finally{
                if (!cancelled) {
                    dispatch(authReady());
                    setLoading(false);
                }
            }
        }
        
        restoreSession();

        return () => {
            cancelled = true;
        }
    }, [])

    if(loading){        
        // The full-screen app loader is intentionally disabled for now.
        // Route-level skeletons keep the app useful while the session restores.
        return children
    }
        
    return children;
}

export default AuthProvider;
