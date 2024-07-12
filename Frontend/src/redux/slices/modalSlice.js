import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
    onCancel: null,
    cancelText: '',
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
            state.confirmText = action.payload.confirmText;
            state.onCancel = action.payload.onCancel;
            state.cancelText = action.payload.cancelText;
        },
        hideModal(state){
        state.isOpen = false;
            state.title = '';
            state.message = '';
            state.onConfirm = null;
            state.confirmText = '';
            state.onCancel = null;
            state.cancelText = '';
        }
    }
});

export const {showModal, hideModal} = modalSlice.actions;
export default modalSlice.reducer;