import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    token: null,
    user: null,
    email: null,
    role: null,
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
        },
        logout(state){
            state.token = null;
            state.user = null;
            state.email = null;
            state.role = null;
        },
        setNewAccessToken(state, action){
            state.token = action.payload.token;
        },
        restoreCreds(state, action) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.email = action.payload.email;
            state.role = action.payload.role;
        }
    }
});

// action creators for each reducer function
export const { 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    logout, 
    setNewAccessToken, 
    restoreCreds 
} = authSlice.actions;
export const authReducer = authSlice.reducer;