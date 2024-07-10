import { useSelector } from "react-redux";
import useModal from "./useModal";
import './Modal.css';

const Modal = () => {

    const { closeModal } = useModal();
    const { isOpen, title, message, onConfirm, onCancel } = useSelector(state => state.modal);

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
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

export default Modal;