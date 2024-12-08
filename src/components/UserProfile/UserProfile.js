import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
// import { getProfileService, getUserPostsService } from '~/services/userServices';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import Post from '~/components/Post';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import ModalUserProfile from './ModalUserProfile';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import { getCroppedImg, uploadToCloudinary } from '~/utils/commonUtils';
import * as actions from '~/redux/actions';
import { updateMyInfoService } from '~/services/userServices';
import signalRClient from '../Post/signalRClient';
import { getAllUserPostsService } from '~/services/postServices';

const UserProfile = () => {
    const userInfo = useSelector(userInfoSelector);
    const dispatch = useDispatch();

    const [userPosts, setUserPosts] = useState([1, 2]);

    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         try {
    //             const res = await getProfileService(userId);
    //             setUserInfo(res);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     };

    //     const fetchUserPosts = async () => {
    //         try {
    //             const posts = await getUserPostsService(userId);
    //             // console.log(posts)
    //             setUserPosts(posts);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     };

    //     fetchProfile();
    //     fetchUserPosts();
    // }, [userId]);

    // if (!userInfo) return <div>Loading...</div>;

    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                if (userInfo.id === null) {
                    return;
                }
                const res = await getAllUserPostsService({ userId: userInfo.id });
                // console.log('vinhbr1', res);
                setPosts(
                    res.map((post) => {
                        return {
                            id: post.postID,
                            posterId: post.userID,
                            firstName: post.firstName,
                            lastName: post.lastName,
                            avatar: post.avatarUrl,
                            content: post.content,
                            createdAt: post.createdAt,
                            pictures:
                                post.images?.length > 0 &&
                                post.images.map((image) => {
                                    return {
                                        pictureUrl: image?.imgUrl,
                                    };
                                }),
                            currentEmotionId: post.userReaction?.emotionTypeID || null, // Emotion của user hiện tại
                            currentEmotionName: post.userReaction?.emotionName || null,
                            // currentEmotionId: post.reactions?.emotionTypeID || null, // Emotion của user hiện tại
                            // currentEmotionName: post.reactions?.emotionName || null,
                            emotions: post?.reactions?.map((emo) => {
                                return {
                                    id: emo?.reactionID,
                                    emotion: {
                                        id: emo?.emotionTypeID,
                                        name: emo?.emotionName,
                                    },
                                    userInfo: {
                                        id: emo?.userID,
                                    },
                                };
                            }),
                        };
                    }),
                    // console.log(post),
                );
            } catch (error) {
                console.error(error);
            }
        };

        // signalRClient.on('ReceivePost', fetchAllPosts());
        fetchAllPosts();
        const startSignalR = () => {
            signalRClient.on('ReceivePost', (newPost) => {
                // setPosts((prevPosts) => [newPost, ...prevPosts]);
                setPosts((prevPosts) => [
                    {
                        id: newPost.postID,
                        posterId: newPost.userID,
                        firstName: newPost.firstName,
                        lastName: newPost.lastName,
                        avatar: newPost.avatarUser,
                        content: newPost.content,
                        createdAt: newPost.createdAt,
                        pictures:
                            newPost.images?.length > 0
                                ? newPost.images.map((image) => ({ pictureUrl: image.imgUrl }))
                                : [],
                        currentEmotionId: newPost.userReaction?.emotionTypeID || null,
                        currentEmotionName: newPost.userReaction?.emotionName || null,
                        emotions: newPost.reactions?.map((emo) => ({
                            id: emo.reactionID,
                            emotion: {
                                id: emo.emotionTypeID,
                                name: emo.emotionName,
                            },
                            userInfo: { id: emo.userID },
                        })),
                    },
                    ...prevPosts,
                ]);

                // console.log('vinhbr', newPost);
            });
        };

        startSignalR();

        return () => {
            signalRClient.stop();
        };
    }, [userInfo]);

    const [updateAvatar, setUpdateAvatar] = useState(null);
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const handleChooseFile = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (s) => {
                setUpdateAvatar(s.target.result);
                setShowModalUpdateAvatar(true);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleHideModalUpdateAvatar = () => setShowModalUpdateAvatar(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSave = async () => {
        try {
            dispatch(actions.startLoading('updateAvatar'));
            const croppedImage = await getCroppedImg(updateAvatar, croppedAreaPixels);
            const file = await fetch(croppedImage)
                .then((res) => res.blob())
                .then((blob) => new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            const imageUrl = await uploadToCloudinary(file);
            await updateMyInfoService({ avatar: imageUrl });

            dispatch(actions.saveUserInfo({ avatar: imageUrl }));
            handleHideModalUpdateAvatar();
        } catch (error) {
            console.error('Failed to crop image', error);
        } finally {
            dispatch(actions.stopLoading('updateAvatar'));
        }
    };

    return (
        <div className={styles.profileContainer}>
            {/* Phần header hồ sơ */}
            <div className={styles.profileHeader}>
                <img
                    src={userInfo.avatar || defaultAvatar}
                    alt={`${userInfo.firstName} ${userInfo.lastName}`}
                    className={styles.avatar}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                    }}
                />
                <div className={styles.userInfo}>
                    <h2>{`${userInfo.firstName} ${userInfo.lastName}`}</h2>
                    <div className={styles.userStats}>
                        <span className="fz-13">{userInfo.friendsCount || 0} Bạn bè</span>
                    </div>
                </div>
            </div>
            <br></br>
            <div className="d-flex">
                <label htmlFor="change-avatar-input" className={clsx(styles['edit-profile-btn'])}>
                    <FontAwesomeIcon icon={faPencil} />
                    <span>Đổi ảnh đại diện</span>
                </label>
                <input type="file" id="change-avatar-input" hidden onChange={handleChooseFile} />
                <Modal
                    className={clsx(styles['modal'])}
                    show={showModalUpdateAvatar}
                    onHide={handleHideModalUpdateAvatar}
                >
                    <Modal.Header>
                        <Modal.Title>Chọn ảnh đại diện</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={clsx(styles['modal-body'])}>
                        <div className={clsx(styles['crop-container'])}>
                            <Cropper
                                image={updateAvatar}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                        <div className={clsx(styles['controls'])}>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => {
                                    setZoom(e.target.value);
                                }}
                                className={clsx(styles['zoom-range'])}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="d-flex align-items-revert">
                            <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalUpdateAvatar}>
                                Huỷ
                            </div>
                            <Button variant="primary" className="fz-16" onClick={handleSave}>
                                Xác nhận
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
                {/* Phần bài viết của người dùng */}
                <button className={styles.xemtt} onClick={handleShowModal}>
                    Xem thêm thông tin
                </button>
            </div>
            <br></br>
            <br></br>
            <div>
                <h2>Dòng Thời Gian</h2>
            </div>
            <div className={styles.postsContainer}>
                {posts.length > 0 ? (
                    posts.map((post) => <Post key={post.id} postInfo={post} />)
                ) : (
                    <p>Người dùng này chưa có bài viết nào.</p>
                )}
            </div>
            {showModal && <ModalUserProfile userInfo={userInfo} show={showModal} handleClose={handleCloseModal} />}
        </div>
    );
};

export default UserProfile;
