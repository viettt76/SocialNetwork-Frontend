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
import signalRClient from '~/components/Post/signalRClient';
import { format } from 'date-fns';
import * as signalR from '@microsoft/signalr';

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
    const [showReplyCommentInput, setShowReplyCommentInput] = useState(false);

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
            <img className={clsx(styles['commentator-avatar'])} src={comment?.avatar || defaultAvatar} />
            <div className={clsx(styles['comment-info-wrapper'])}>
                <div className={clsx(styles['commentator-name-comment-content'])}>
                    <div
                        className={clsx(styles['commentator-name'])}
                    >{`${comment?.lastName} ${comment?.firstName}`}</div>
                    <div className={clsx(styles['comment-content'])}>{comment?.content}</div>
                </div>
                {/* {comment?.attachment} */}
                <div className={clsx(styles['comment-previous-time-action'])}>
                    <span className={clsx(styles['comment-previous-time'])}>
                        {format(new Date(comment?.createdAt), 'dd/MM')}
                    </span>
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
                            placeholder={`Phản hồi ${comment?.lastName} ${comment?.firstName}`}
                            onChange={(e) =>
                                setReplyComment({
                                    content: e.target.value,
                                    parentCommentId: comment?.commentID,
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
    const { id: postId } = postInfo;

    const [writeComment, setWriteComment] = useState('');
    const [comments, setComments] = useState([]);

    const wRef = useRef(null);

    const handleFocusSendComment = () => {
        wRef.current.focus();
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await getCommentsService({ postId });
                setComments(res?.comment);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setComments([]);
            }
        };

        if (postId) {
            fetchComments();

            signalRClient.on('ReceiveComment', fetchComments);

            return () => {
                signalRClient.off('ReceiveComment', fetchComments);
            };
        } else {
            console.error('Post ID không hợp lệ');
        }
    }, [postId]);

    useEffect(() => {
        const handleNewComment = (newComment) => {
            if (postId === newComment?.postID) {
                setComments((prev) => [
                    {
                        commentID: newComment?.commentID,
                        content: newComment?.content,
                        firstName: newComment?.firstName,
                        lastName: newComment?.lastName,
                        avatar: newComment?.avatarUrl,
                        createdAt: newComment?.createdAt,
                        children: newComment?.children,
                    },
                    ...prev,
                ]);
            }
        };
        // console.log('State comments: ', newComment);

        const handleNewChildComment = (newChildComment) => {
            if (postId === newChildComment?.postID) {
                setComments((prev) => {
                    const newComments = _.cloneDeep(prev);

                    const addChildComment = (comments) => {
                        const commentParent = _.find(comments, (comment) => {
                            if (comment?.commentID === newChildComment?.parentCommentID) return true;
                            if (comment?.children?.length > 0) return addChildComment(comment.children);
                            return false;
                        });

                        if (commentParent) {
                            commentParent?.children?.push(newChildComment);
                        }
                    };

                    addChildComment(newComments);
                    return newComments;
                });
            }
        };

        const handleReceiveComment = (newComment) => {
            console.log(newComment);
            if (newComment?.parentCommentID) {
                handleNewChildComment(newComment);
            } else {
                handleNewComment(newComment);
            }
        };

        // signalRClient.invoke('StartPostRoom', postId);

        // signalRClient.on('ReceiveComment', handleReceiveComment);

        // return () => {
        //     signalRClient.off('ReceiveComment', handleReceiveComment);
        // };
    }, [postId]);

    const handleSendComment = async (e) => {
        if (e.key === 'Enter') {
            try {
                await sendCommentService({ postId, content: writeComment });
                setWriteComment('');
            } catch (error) {
                console.log(error);
            }
        }
    };
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
                                        <div key={`comment-${comment?.commentID}`}>
                                            <Comment comment={comment} postId={postId} />
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
