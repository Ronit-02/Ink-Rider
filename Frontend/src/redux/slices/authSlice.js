import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: localStorage.getItem('token'),  // needed everywhere
    user: localStorage.getItem('user'),    // needed for display
    email: localStorage.getItem('email'),  // needed for comments, display
    role: localStorage.getItem('role'),    // needed everywhere
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
        loginFailure(state, action){
            state.isLoading = false;
            state.error = action.payload;
        },
        loginSuccess(state, action){
            state.token = action.payload.token;
            state.user = action.payload.username;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.isLoading = false;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', action.payload.username);
            localStorage.setItem('email', action.payload.email);
            localStorage.setItem('role', action.payload.role);
        },
        logout(state){
            state.token = null;
            state.user = null;
            state.email = null;
            state.role = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('email');
            localStorage.removeItem('role');
        }
    }
});

// action creators for each reducer function
export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;