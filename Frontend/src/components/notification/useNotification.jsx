import { useDispatch } from "react-redux";
import { addNotification, removeNotification } from '../../redux/slices/notificationSlice';

const useNotification = () => {
    const dispatch = useDispatch();

    const displayNotification = (message, type = 'info') => {
        const newNotification = {
            // id: Math.random().toString(36).substring(2, 9),
            id: Date.now(),
            message: message,
            type: type,
        };
        dispatch(addNotification(newNotification));
    }

    const handleRemoveNotification = (id) => {
        dispatch(removeNotification(id));
    }

    return { displayNotification, handleRemoveNotification };
}

export default useNotification;