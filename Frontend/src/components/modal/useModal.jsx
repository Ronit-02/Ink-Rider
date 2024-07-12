import { hideModal, showModal } from '../../redux/slices/modalSlice';
import { useDispatch } from "react-redux";

const useModal = () => {
    const dispatch = useDispatch();

    const openModal = ({title, message, onConfirm, confirmText = 'confirm', onCancel, cancelText = 'cancel'}) => {
        dispatch(showModal({title, message, onConfirm, confirmText, onCancel, cancelText}));
    }

    const closeModal = () => {
        dispatch(hideModal());
    }

    return {openModal, closeModal};
}

export default useModal;