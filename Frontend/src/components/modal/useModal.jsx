import { hideModal, showModal } from '../../redux/slices/modalSlice';
import { useDispatch } from "react-redux";

const useModal = () => {
    const dispatch = useDispatch();

    const openModal = ({title, message, onConfirm, onCancel}) => {
        dispatch(showModal({title, message, onConfirm, onCancel}));
    }

    const closeModal = () => {
        dispatch(hideModal());
    }

    return {openModal, closeModal};
}

export default useModal;