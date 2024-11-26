import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
// import { getProfileService, getUserPostsService } from '~/services/userServices';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import PostContent from '~/components/UserProfile/PostContent';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import ModalUserProfile from './ModalUserProfile';

const UserProfile = (userInfo) => {
    const { userId } = userInfo;

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
                    <p>{userInfo.bio || 'Người dùng này chưa có tiểu sử.'}</p>
                    <div className={styles.userStats}>
                        <span>{userInfo.friendsCount || 0} Bạn bè</span>
                    </div>
                </div>
            </div>
            <br></br>
            {/* Phần bài viết của người dùng */}
            <button className={styles.xemtt} onClick={handleShowModal}>
                Xem thêm thông tin
            </button>
            <br></br>
            <br></br>
            <div>
                <h2>Dòng Thời Gian</h2>
            </div>
            <div className={styles.postsContainer}>
                {userPosts.length > 0 ? (
                    userPosts.map((post) => <PostContent key={post.id} postInfo={post} />)
                ) : (
                    <p>Người dùng này chưa có bài viết nào.</p>
                )}
            </div>
            {showModal && <ModalUserProfile userInfo={userInfo} show={showModal} handleClose={handleCloseModal} />}
        </div>
    );
};

export default UserProfile;
