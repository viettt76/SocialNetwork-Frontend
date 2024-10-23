import clsx from 'clsx';
import PostContent from './PostContent';
import styles from './Post.module.scss';
import { sendCommentService } from '~/services/postServices';
import { useEffect, useRef, useState } from 'react';
import ModalPost from './ModalPost';

const Post = ({ postInfo }) => {
    const { id } = postInfo;

    const [writeComment, setWriteComment] = useState('');
    const [showWriteComment, setShowWriteComment] = useState(false);

    const writeCommentRef = useRef(null);

    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleSendComment = async (e) => {
        if (e.key === 'Enter') {
            try {
                await sendCommentService({ postId: id, content: writeComment });
                setWriteComment('');
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleShowWriteComment = () => {
        setShowWriteComment(true);
        handleFocusSendComment();
    };

    const handleFocusSendComment = () => {
        writeCommentRef.current.focus();
    };

    useEffect(() => {
        if (showWriteComment) {
            handleFocusSendComment();
        }
    }, [showWriteComment]);

    return (
        <div className={clsx(styles['post-wrapper'])}>
            <div>
                <PostContent
                    postInfo={postInfo}
                    handleShowWriteComment={handleShowWriteComment}
                    showModal={showModal}
                    handleShowModal={handleShowModal}
                />
                <div
                    className={clsx(styles['write-comment-wrapper'], styles['animation'], {
                        [[styles['d-none']]]: !showWriteComment,
                    })}
                >
                    <input
                        ref={writeCommentRef}
                        value={writeComment}
                        className={clsx(styles['write-comment'])}
                        placeholder="Viết bình luận"
                        onChange={(e) => setWriteComment(e.target.value)}
                        onKeyDown={handleSendComment}
                    />
                    <i
                        className={clsx(styles['send-comment-btn'], {
                            [[styles['active']]]: writeComment,
                        })}
                    ></i>
                </div>
            </div>
            {showModal && <ModalPost postInfo={postInfo} show={showModal} handleClose={handleCloseModal} />}
        </div>
    );
};

export default Post;
