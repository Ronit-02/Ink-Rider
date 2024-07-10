import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import modalReducer from './slices/modalSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        notif: notificationReducer,
        modal: modalReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(thunk),
});

export default store;