import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        showModal(state, action){
            state.isOpen = true;
            state.title = action.payload.title;
            state.message = action.payload.message;
            state.onConfirm = action.payload.onConfirm;
            state.onCancel = action.payload.onCancel;
        },
        hideModal(state){
        state.isOpen = false;
            state.title = '';
            state.message = '';
            state.onConfirm = null;
            state.onCancel = null;
        }
    }
});

export const {showModal, hideModal} = modalSlice.actions;
export default modalSlice.reducer;