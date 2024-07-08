import { jwtDecode } from "jwt-decode";

const isTokenExpiry = (token) => {
    try{
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }
    catch (error) {
        return true;
    }
}

export {isTokenExpiry};