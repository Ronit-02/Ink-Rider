import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem('user'),
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,

    reducers: {
        loginStart(state){
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess(state, action){
            state.user = action.payload.username;
            state.token = action.payload.token;
            state.isLoading = false;
            localStorage.setItem('user', action.payload.username);
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure(state, action){
            state.isLoading = false;
            state.error = action.payload;
        },
        logout(state){
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
});

// action creators for each reducer function
export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;