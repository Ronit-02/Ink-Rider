import { jwtDecode } from "jwt-decode";

const decodeTags = (tags) => {

    return tags.split(',').map(tag => tag.trim());
}

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

export {decodeTags, isTokenExpiry};