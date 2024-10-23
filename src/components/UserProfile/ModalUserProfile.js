import clsx from 'clsx';
import styles from './Profile.module.scss';
import { Modal } from 'react-bootstrap';


const ModalUserProfile = ({ userInfo, show, handleClose }) => {
    const { name, bio, link, isPrivate } = userInfo;

    return (
        <Modal className={clsx(styles['modal'])} show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Thông tin người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body className={clsx(styles['modal-body'])}>
                <h3>{name}</h3>
                <p>{bio}</p>
                <p>Liên kết: <a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>
                <p>Trang cá nhân: {isPrivate ? 'Riêng tư' : 'Công khai'}</p>
            </Modal.Body>
            <Modal.Footer>
                <button className={clsx(styles['close-btn'])} onClick={handleClose}>
                    Đóng
                </button>
            </Modal.Footer>
        </Modal>

        
    );
};

// export default ModalUserProfile;
// const ModalUserProfile = ({ userInfo, show, handleClose }) => {
//     const { id, name, bio, link, isPrivate, avatar } = userInfo;

//     return (
//         <Modal className={clsx(styles['modal'])} show={show} onHide={handleClose}>
//             <Modal.Body className={clsx(styles['modal-body'])}>
//                 <div className={clsx(styles['modal-user-content-wrapper'])}>
//                     <div className={clsx(styles['user-avatar-wrapper'])}>
//                         <img
//                             className={clsx(styles['user-avatar'])}
//                             src={avatar || defaultAvatar}
//                             alt="User Avatar"
//                         />
//                     </div>
//                     <div className={clsx(styles['user-info-wrapper'])}>
//                         <h3 className={clsx(styles['user-name'])}>{name}</h3>
//                         <p className={clsx(styles['user-bio'])}>{bio || 'Chưa có tiểu sử'}</p>
//                         {link && (
//                             <p className={clsx(styles['user-link'])}>
//                                 <a href={link} target="_blank" rel="noopener noreferrer">
//                                     {link}
//                                 </a>
//                             </p>
//                         )}
//                         <p className={clsx(styles['user-privacy'])}>
//                             Trang cá nhân: {isPrivate ? 'Riêng tư' : 'Công khai'}
//                         </p>
//                     </div>
//                 </div>
//             </Modal.Body>
//             <Modal.Footer>
//                 <button className={clsx(styles['close-btn'])} onClick={handleClose}>
//                     Xong
//                 </button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

export default ModalUserProfile;
