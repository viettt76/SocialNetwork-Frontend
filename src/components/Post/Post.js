import clsx from 'clsx';
import PostContent from './PostContent';
import styles from './Post.module.scss';
import { getCommentsService, sendCommentService } from '~/services/postServices';
import { useEffect, useRef, useState } from 'react';
import ModalPost from './ModalPost';
import signalRClient from './signalRClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const Post = ({ postInfo, className }) => {
    const { id } = postInfo;

    const [numberOfComments, setNumberOfComments] = useState(0);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await getCommentsService({ postId: id });
                setNumberOfComments(res?.numberOfComment);
            } catch (error) {
                console.log(error);
            }
        };

        fetchComments();
        // signalRClient.invoke('StartPostRoom', id);

        // signalRClient.on('ReceiveComment', fetchComments);
    }, [id]);

    const [writeComment, setWriteComment] = useState('');
    const [showWriteComment, setShowWriteComment] = useState(false);

    const writeCommentRef = useRef(null);

    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleSendComment = async () => {
        try {
            if (writeComment.trim() === '') return;
            await sendCommentService({ postId: id, content: writeComment });
            setWriteComment('');
            setNumberOfComments((prev) => prev + 1);
        } catch (error) {
            console.log(error);
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
        <div className={clsx(styles['post-wrapper'], className)}>
            <div>
                <PostContent
                    postInfo={postInfo}
                    handleShowWriteComment={handleShowWriteComment}
                    showModal={showModal}
                    numberOfComments={numberOfComments}
                    setNumberOfComments={setNumberOfComments}
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment();
                        }}
                    />
                    <FontAwesomeIcon
                        icon={faPaperPlane}
                        className={clsx(styles['send-comment-btn'], {
                            [[styles['active']]]: writeComment,
                        })}
                        onClick={handleSendComment}
                    />
                </div>
            </div>
            {showModal && (
                <ModalPost
                    postInfo={postInfo}
                    show={showModal}
                    numberOfComments={numberOfComments}
                    setNumberOfComments={setNumberOfComments}
                    handleClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Post;
