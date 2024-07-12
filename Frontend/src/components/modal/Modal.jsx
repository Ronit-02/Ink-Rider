import { useSelector } from "react-redux";
import useModal from "./useModal";
import './Modal.css';

const Modal = () => {

    const { closeModal } = useModal();
    const { isOpen, title, message, onConfirm, confirmText, onCancel, cancelText } = useSelector(state => state.modal);

    const handleConfirm = () => {
        if(onConfirm) onConfirm();
        closeModal();
    }

    const handleCancel = () => {
        if(onCancel) onCancel();
        closeModal();
    }

    if(!isOpen) return null;
    else
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button onClick={handleCancel}>{cancelText}</button>
                    <button onClick={handleConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    )
}

export default Modal;