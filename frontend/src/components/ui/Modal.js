import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    // Ngăn cuộn trang khi modal đang mở
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup khi component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Thoát khỏi modal khi nhấn Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Không render gì nếu modal không mở
  if (!isOpen) return null;

  // Hàm ngăn chặn việc đóng modal khi click vào nội dung
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Sử dụng Portal để render trực tiếp vào body
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 