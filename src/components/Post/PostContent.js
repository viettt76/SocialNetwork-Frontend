import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faEarthAmerica, faShare } from '@fortawesome/free-solid-svg-icons';
import styles from './Post.module.scss';
import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '~/components/Icons';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import {
    cancelReleasedEmotionPostService,
    getAllEmotionsService,
    getCommentsService,
    releaseEmotionPostService,
} from '~/services/postServices';
import _ from 'lodash';
import socket from '~/socket';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import signalRClient from './signalRClient';
import * as signalR from '@microsoft/signalr';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const PostContent = ({ postInfo, handleShowWriteComment, showModal, handleShowModal, handleFocusSendComment }) => {
    const {
        id,
        posterId,
        firstName,
        lastName,
        avatar,
        groupName,
        createdAt,
        visibility,
        content,
        currentEmotionId,
        currentEmotionName,
        emotions = [],
        pictures = [],
    } = postInfo;

    const userInfo = useSelector(userInfoSelector);

    const [copyEmotions, setCopyEmotions] = useState(emotions);
    const [mostEmotions, setMostEmotions] = useState([]);
    const [currentEmotionNameCustom, setCurrentEmotionNameCustom] = useState(currentEmotionName);

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

        signalRClient.on('ReceiveComment', fetchComments);
    }, [id]);

    useEffect(() => {
        const emoCus = _.groupBy(copyEmotions, 'emotion.name');

        const mostEmo = _.sortBy(emoCus, 'length').reverse();
        if (mostEmo.length > 0) {
            setMostEmotions([mostEmo[0][0]?.emotion?.name]);
            if (mostEmo.length > 1) {
                setMostEmotions((prev) => [...prev, mostEmo[1][0]?.emotion?.name]);
            }
        } else {
            setMostEmotions([]);
        }
    }, [copyEmotions]);

    const maxVisibleImages = 4;
    let visibleImages;
    let remainingImages;
    if (pictures?.length > maxVisibleImages) {
        visibleImages = pictures.slice(0, maxVisibleImages - 1);
        remainingImages = pictures.length - maxVisibleImages + 1;
    } else if (pictures?.length > 0) {
        visibleImages = [...pictures];
    }

    const [emotionsType, setEmotionsType] = useState([]);
    // { name: 'Like' },
    // { name: 'Love' },
    // // { name: 'Thương thương' },
    // { name: 'Haha' },
    // { name: 'Wow' },
    // { name: 'Sad' },
    // { name: 'Angry' },
    useEffect(() => {
        const fetchAllEmotions = async () => {
            try {
                const res = await getAllEmotionsService();
                setEmotionsType(
                    res?.map((item) => ({
                        id: item?.emotionTypeID,
                        name: item?.emotionName,
                    })),
                );
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllEmotions();
    }, []);

    const emotionComponentMap = {
        Like: LikeIcon,
        Love: LoveIcon,
        Haha: HaHaIcon,
        Wow: WowIcon,
        Sad: SadIcon,
        Angry: AngryIcon,
    };

    const emotionClassMap = {
        Like: styles['like-emotion'],
        Love: styles['love-emotion'],
        Haha: styles['haha-emotion'],
        Wow: styles['wow-emotion'],
        Sad: styles['sad-emotion'],
        Angry: styles['angry-emotion'],
    };

    const CurrentEmotion = emotionComponentMap[currentEmotionNameCustom];

    useEffect(() => {
        const handleReleaseEmotion = ({
            postID: postId,
            userID: reactorId,
            firstName: reactorFirstName,
            lastName: reactorLastName,
            avatarUrl: reactorAvatar,
            emotionTypeID: emotionTypeId,
            emotionName: emotionTypeName,
        }) => {
            if (id === postId) {
                setCopyEmotions((prev) => [
                    ...prev,
                    {
                        emotion: {
                            id: emotionTypeId,
                            name: emotionTypeName,
                        },
                        userInfo: {
                            id: reactorId,
                            firstName: reactorFirstName,
                            lastName: reactorLastName,
                            avatar: reactorAvatar,
                        },
                    },
                ]);
            }
        };

        signalRClient.on('ReceiveReaction', handleReleaseEmotion);
        return () => {
            signalRClient.off('ReceiveReaction', handleReleaseEmotion);
        };
    }, [id]);

    useEffect(() => {
        const handleUpdateEmotion = ({
            postID: postId,
            userID: reactorId,
            emotionTypeID: emotionTypeId,
            emotionName: emotionTypeName,
            firstName: reactorFirstName,
            lastName: reactorLastName,
            avatarUrl: reactorAvatar,
        }) => {
            if (id === postId) {
                setCopyEmotions((prev) => {
                    return prev.map((emo) => {
                        if (emo.userInfo.id === reactorId) {
                            return {
                                ...emo,
                                emotion: {
                                    id: emotionTypeId,
                                    name: emotionTypeName,
                                },
                                userInfo: {
                                    id: reactorId,
                                    firstName: reactorFirstName,
                                    lastName: reactorLastName,
                                    avatar: reactorAvatar,
                                },
                            };
                        }
                        return emo;
                    });
                });
            }
        };

        signalRClient.on('updateEmotion', handleUpdateEmotion);

        return () => {
            signalRClient.off('updateEmotion', handleUpdateEmotion);
        };
    }, [id]);

    const [showEmotionList, setShowEmotionList] = useState(false);
    const handleReleaseEmotion = async (emotionId) => {
        try {
            setShowEmotionList(false);
            await releaseEmotionPostService({ postId: id, emotionId });
            setCurrentEmotionNameCustom(emotionsType.find((emo) => emo.id === emotionId).name);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleCancelReleasedEmotion = ({
            // postId, userId: userCancelReleaseEmotionId
            postID: userCancelReleaseEmotionId,
            userID: postId,
        }) => {
            if (userInfo.id === userCancelReleaseEmotionId && id === postId) {
                setCurrentEmotionNameCustom(null);

                setCopyEmotions((prev) => {
                    const clone = _.filter(prev, (e) => e?.userInfo?.id !== userCancelReleaseEmotionId);
                    return clone;
                });
            }
            // console.log('vinh', postId, userCancelReleaseEmotionId);
        };

        signalRClient.on('cancelReleasedEmotion', handleCancelReleasedEmotion);

        return () => {
            signalRClient.off('cancelReleasedEmotion', handleCancelReleasedEmotion);
        };
    }, [id, userInfo.id]);

    const handleCancelReleasedEmotion = async () => {
        try {
            await cancelReleasedEmotionPostService({ postId: id });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['post-content-wrapper'])}>
            <div className={clsx(styles['post-header'])}>
                <Link to={`/profile/${posterId}`}>
                    <img
                        className={clsx(styles['avatar-user'])}
                        src={avatar || defaultAvatar}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </Link>{' '}
                <div>
                    <h5 className={clsx(styles['post-username'])}>{`${lastName} ${firstName}`}</h5>
                    <span className="fz-12">{createdAt}</span>
                </div>
            </div>
            <div className={clsx(styles['post-content'], styles['background'])}>{content && <div>{content}</div>}</div>
            <PhotoProvider>
                <div
                    className={clsx(styles['images-layout'], {
                        [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0 || !remainingImages,
                        [styles[`layout-remaining`]]: remainingImages > 0,
                    })}
                >
                    {visibleImages?.map((img) => {
                        return (
                            <PhotoView key={`picture-${img?.id}`} src={img?.pictureUrl}>
                                <div className={clsx(styles['image-wrapper'])}>
                                    <img src={img?.pictureUrl} alt="" />
                                </div>
                            </PhotoView>
                        );
                    })}
                    {remainingImages > 0 && <Link className={clsx(styles['overlay'])}>+{remainingImages}</Link>}
                </div>
            </PhotoProvider>
            <div className={clsx(styles['emotions-amount-of-comments'])}>
                <div className={clsx(styles['emotions-wrapper'])}>
                    {mostEmotions?.map((emo) => {
                        const Icon = emotionComponentMap[emo];
                        return (
                            <div key={`most-emotion-${emo}`} className={clsx(styles['emotion'])}>
                                <Icon width={18} height={18} />
                            </div>
                        );
                    })}
                    {copyEmotions?.length > 0 && (
                        <div className={clsx(styles['amount-of-emotions'])}>{copyEmotions?.length}</div>
                    )}
                </div>

                <div className={clsx(styles['amount-of-comments-wrapper'])}>
                    <span onClick={handleShowModal}>{numberOfComments || 0} bình luận</span>
                </div>
            </div>
            <div className={clsx(styles['user-actions-wrapper'])}>
                <div
                    className={clsx(styles['user-action'], styles['show-emotion-list'])}
                    onMouseEnter={() => setShowEmotionList(true)}
                >
                    {currentEmotionNameCustom ? (
                        <div className={clsx(styles['user-action-emotion'])} onClick={handleCancelReleasedEmotion}>
                            <CurrentEmotion width={20} height={20} />
                            <span
                                className={clsx(emotionClassMap[currentEmotionNameCustom], styles['released-emotion'])}
                            >
                                {currentEmotionNameCustom}
                            </span>
                        </div>
                    ) : (
                        <div
                            className={clsx(styles['user-action-emotion'])}
                            // onClick={() =>
                            //     handleReleaseEmotion(
                            //         emotionsType?.find((i) => {
                            //             return i.name === 'Like';
                            //         })?.id,
                            //     )
                            // }
                        >
                            <FontAwesomeIcon icon={faThumbsUp} />
                            <span>Thích</span>
                        </div>
                    )}
                    {showEmotionList && (
                        <ul className={clsx(styles['emotion-list'], {})}>
                            {emotionsType?.map((emotion) => {
                                const Icon = emotionComponentMap[emotion?.name];
                                return (
                                    <li
                                        key={`emotion-${emotion?.id}`}
                                        className={clsx(styles['emotion'])}
                                        onClick={() => handleReleaseEmotion(emotion?.id)}
                                    >
                                        <Icon width={39} height={39} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div
                    className={clsx(styles['user-action'])}
                    onClick={showModal ? handleFocusSendComment : handleShowWriteComment}
                >
                    <FontAwesomeIcon icon={faComment} />
                    <span>Bình luận</span>
                </div>
            </div>
        </div>
    );
};

export default PostContent;
