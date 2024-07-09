import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice'
import { thunk } from "redux-thunk";

const store = configureStore({
    reducer: {
        auth: authReducer,
        notif: notificationReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;