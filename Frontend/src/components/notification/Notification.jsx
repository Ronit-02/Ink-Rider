import { useDispatch, useSelector } from 'react-redux';
import useNotification from './useNotification';

import './Notification.css';
import { useEffect } from 'react';

const Notification = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(state => state.notif.notifications);
    const { handleRemoveNotification } = useNotification();

    useEffect(() => {
        console.log('Notif - ', notifications)
    }, [notifications])

    // Removing notifications after 5 seconds
    useEffect(() => {
        const removeNotificationAfterTimeout = (id) => {
            setTimeout(() => {
                dispatch(handleRemoveNotification(id));
            }, 5000); 
        };

        if(notifications && notifications.length > 0)
            notifications.forEach(notification => {
                removeNotificationAfterTimeout(notification.id);
            });

    }, [notifications, dispatch, handleRemoveNotification]);

    return (
        <div className="notification-container">
            {notifications && notifications.map(notification => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    <div className="notification-content">
                        <h4>{notification.message}</h4>
                    </div>
                    <button className="close-btn" onClick={() => handleRemoveNotification(notification.id)}>
                        &times;
                    </button>
                </div>
            ))}
        </div>
    )
}

export default Notification;