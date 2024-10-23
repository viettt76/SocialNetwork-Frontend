import { forwardRef, useEffect, useRef, useState } from 'react';
import { Dropdown, Modal } from 'react-bootstrap';
import clsx from 'clsx';
import styles from './Post.module.scss';
import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '~/components/Icons';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { getCommentsService, sendCommentService } from '~/services/postServices';
import PostContent from './PostContent';
import socket from '~/socket';
import _ from 'lodash';

// eslint-disable-next-line react/display-name
const CustomToggle = forwardRef(({ children, onClick }, ref) => (
    <div
        className={clsx(styles['custom-toggle'])}
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {children} <div className={clsx(styles['arrow-down'])}>&#x25bc;</div>
    </div>
));

const Comment = ({ comment, postId }) => {
    const [showChildComments, setShowChildComments] = useState(false);
    // const [showReplyCommentInput, setShowReplyCommentInput] = useState(false);

    const [replyComment, setReplyComment] = useState({
        content: '',
        parentCommentId: null,
    });

    const handleReplyComment = async (e) => {
        if (e.key === 'Enter') {
            try {
                await sendCommentService({
                    postId,
                    parentCommentId: replyComment.parentCommentId,
                    content: replyComment.content,
                });
                setReplyComment({
                    content: '',
                    parentCommentId: null,
                });
                // setShowReplyCommentInput(false);
                setShowChildComments(true);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (isAnimating) {
            setIsAnimating(false);
            setTimeout(() => setIsVisible(false), 400);
        } else {
            setIsVisible(true);
            setIsAnimating(true);
        }
    };

    return (
        <div className={clsx(styles['comment'])}>
            <img
                className={clsx(styles['commentator-avatar'])}
                src={comment?.commentatorInfo?.avatar || defaultAvatar}
            />
            <div className={clsx(styles['comment-info-wrapper'])}>
                <div className={clsx(styles['commentator-name-comment-content'])}>
                    <div
                        className={clsx(styles['commentator-name'])}
                    >{`${comment?.commentatorInfo?.lastName} ${comment?.commentatorInfo?.firstName}`}</div>
                    <div className={clsx(styles['comment-content'])}>{comment?.content}</div>
                </div>
                {/* {comment?.attachment} */}
                <div className={clsx(styles['comment-previous-time-action'])}>
                    <span className={clsx(styles['comment-previous-time'])}>{comment?.createdAt}</span>
                    <div className={clsx(styles['comment-action'])}>
                        <span className={clsx(styles['comment-action-item'], styles['comment-action-item-emo'])}>
                            Thích
                            <ul className={clsx(styles['emotion-list'])}>
                                <li className={clsx(styles['emotion'])}>
                                    <LikeIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <LoveIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <LoveLoveIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <HaHaIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <WowIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <SadIcon width={39} height={39} />
                                </li>
                                <li className={clsx(styles['emotion'])}>
                                    <AngryIcon width={39} height={39} />
                                </li>
                            </ul>
                        </span>
                        <span className={clsx(styles['comment-action-item'])} onClick={toggleVisibility}>
                            Phản hồi
                        </span>
                    </div>
                </div>
                {isVisible && (
                    <div
                        className={clsx(styles['reply-comment-wrapper'], {
                            [styles['show']]: isAnimating,
                            [styles['hide']]: !isAnimating,
                        })}
                    >
                        <input
                            value={replyComment.content}
                            className={clsx(styles['reply-comment-input'])}
                            placeholder={`Phản hồi ${comment?.commentatorInfo?.lastName} ${comment?.commentatorInfo?.firstName}`}
                            onChange={(e) =>
                                setReplyComment({
                                    content: e.target.value,
                                    parentCommentId: comment?.id,
                                })
                            }
                            onKeyDown={handleReplyComment}
                        />
                    </div>
                )}
                <div>
                    {comment?.children?.length > 0 &&
                        (showChildComments ? (
                            <span className={clsx(styles['fz-14'])} onClick={() => setShowChildComments(false)}>
                                Ẩn bớt
                            </span>
                        ) : (
                            <span className={clsx(styles['fz-14'])} onClick={() => setShowChildComments(true)}>
                                Xem {comment?.children?.length} phản hồi
                            </span>
                        ))}
                    {showChildComments && (
                        <div className={clsx(styles['children-comment'])}>
                            {comment?.children?.length > 0 && (
                                <div>
                                    {comment?.children?.map((childComment) => {
                                        return (
                                            <div key={`comment-${childComment?.id}`}>
                                                <Comment comment={childComment} postId={postId} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ModalPost = ({ postInfo, show, handleClose }) => {
    const { id } = postInfo;

    const [writeComment, setWriteComment] = useState('');

    const wRef = useRef(null);

    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await getCommentsService(id);
                setComments(res?.comments);
            } catch (error) {
                console.log(error);
            }
        };
        fetchComments();
    }, [id]);

    const handleFocusSendComment = () => {
        wRef.current.focus();
    };

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

    useEffect(() => {
        socket.emit('joinPost', id);
    }, [id]);

    useEffect(() => {
        const handleNewComment = (newComment) => {
            if (id === newComment?.postId) {
                setComments((prev) => [
                    {
                        id: newComment?.id,
                        content: newComment?.content,
                        commentatorInfo: newComment?.commentatorInfo,
                        createdAt: newComment?.createdAt,
                        children: newComment?.children,
                    },
                    ...prev,
                ]);
            }
        };
        const handleNewChildComment = (newChildComment) => {
            if (id === newChildComment?.postId) {
                setComments((prev) => {
                    const newComments = _.cloneDeep(prev);

                    const addChildComment = (comments) => {
                        const commentParent = _.find(comments, (comment) => {
                            if (comment?.id === newChildComment?.parentCommentId) return true;
                            if (comment?.children?.length > 0) return addChildComment(comment.children);
                            return false;
                        });

                        if (commentParent) {
                            commentParent?.children?.push({
                                id: newChildComment?.id,
                                content: newChildComment?.content,
                                commentatorInfo: newChildComment?.commentatorInfo,
                                createdAt: newChildComment?.createdAt,
                                children: newChildComment?.children,
                            });
                        }

                        return false;
                    };

                    addChildComment(newComments);

                    return newComments;
                });
            }
        };

        socket.on('newComment', handleNewComment);
        socket.on('newChildComment', handleNewChildComment);

        return () => {
            socket.off('newComment', handleNewComment);
            socket.off('newChildComment', handleNewChildComment);
        };
    }, [id]);

    return (
        <Modal className={clsx(styles['modal'])} show={show} onHide={handleClose}>
            <Modal.Body className={clsx(styles['modal-body'])}>
                <div className={clsx(styles['modal-post-content-wrapper'])}>
                    <PostContent postInfo={postInfo} showModal={true} handleFocusSendComment={handleFocusSendComment} />
                    {comments?.length > 0 ? (
                        <div className={clsx(styles['comment-list-wrapper'])}>
                            <Dropdown>
                                <Dropdown.Toggle as={CustomToggle}>Tất cả bình luận</Dropdown.Toggle>

                                <Dropdown.Menu className={clsx(styles['comment-sorting-style'])}>
                                    <div className={clsx(styles['comment-sorting-style-item'])}>Bình luận mới nhất</div>
                                    <div className={clsx(styles['comment-sorting-style-item'])}>Bình luận cũ nhất</div>
                                    <div className={clsx(styles['comment-sorting-style-item'])}>
                                        Bình luận nhiều cảm xúc nhất
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                            <div className={clsx(styles['comment-list'])}>
                                {comments?.map((comment) => {
                                    return (
                                        <div key={`comment-${comment?.id}`}>
                                            <Comment comment={comment} postId={id} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 mb-5 fz-16 text-center">Chưa có bình luận nào</div>
                    )}
                </div>
                <div className={clsx(styles['write-comment-wrapper'], styles['position-fixed'])}>
                    <input
                        ref={wRef}
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
            </Modal.Body>
        </Modal>
    );
};

export default ModalPost;
