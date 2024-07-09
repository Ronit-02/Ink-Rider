import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: []
};

const notificationSlice = createSlice({
    name: 'notif',
    initialState,
    reducers: {
        addNotification(state, action){
            state.notifications.push(action.payload)
        },
        removeNotification(state, action){
            state.notifications = state.notifications.filter(notif => notif.id !== action.payload);
        }
    }
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;