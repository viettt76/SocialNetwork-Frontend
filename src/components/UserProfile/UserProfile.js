// // import { useState, useRef, useEffect } from 'react';
// // import clsx from 'clsx';
// // import UserProfileContent from './UserProfileContent';
// // import styles from './Profile.module.scss';
// // import ModalUserProfile from './ModalUserProfile';



// // const UserProfile = ({ userInfo }) => {
// //     const { id } = userInfo;

// //     const [editBio, setEditBio] = useState('');
// //     const [showEditBio, setShowEditBio] = useState(false);

// //     const editBioRef = useRef(null);

// //     const [showModal, setShowModal] = useState(false);

// //     const handleShowModal = () => setShowModal(true);
// //     const handleCloseModal = () => setShowModal(false);

// //     const handleEditBio = async (e) => {
// //         if (e.key === 'Enter') {
// //             try {
// //                 // Logic xử lý khi người dùng gửi tiểu sử mới
// //                 await sendEditService({ editId: id, content: editBio });
// //                 setEditBio('');
                
                
// //             } catch (error) {
// //                 console.log(error);
// //             }
// //         }
// //     };

// //     const handleShowEditBio = () => {
// //         setShowEditBio(true);
// //         handleFocusEditBio();
// //     };

// //     const handleFocusEditBio = () => {
// //         editBioRef.current.focus();
// //     };

// //     useEffect(() => {
// //         if (showEditBio) {
// //             handleFocusEditBio();
// //         }
// //     }, [showEditBio]);

// //     return (
// //         <div className={clsx(styles['user-profile-wrapper'])}>
// //             <div>
// //                 <UserProfileContent
// //                     userInfo={userInfo}
// //                     handleShowEditBio={handleShowEditBio}
// //                     showModal={showModal}
// //                     handleShowModal={handleShowModal}
// //                 />
// //                 <div
// //                     className={clsx(styles['edit-bio-wrapper'], styles['animation'], {
// //                         [[styles['d-none']]]: !showEditBio,
// //                     })}
// //                 >
// //                     <input
// //                         ref={editBioRef}
// //                         value={editBio}
// //                         className={clsx(styles['edit-bio'])}
// //                         placeholder="Chỉnh sửa tiểu sử"
// //                         onChange={(e) => setEditBio(e.target.value)}
// //                         onKeyDown={handleEditBio}
// //                     />
// //                     <i
// //                         className={clsx(styles['save-bio-btn'], {
// //                             [[styles['active']]]: editBio,
// //                         })}
// //                     ></i>
// //                 </div>
// //             </div>
// //             {showModal && <ModalUserProfile userInfo={userInfo} show={showModal} handleClose={handleCloseModal} />}
// //         </div>
// //     );
// // };

// // export default UserProfile;


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
    const { userId } = userInfo;  // Lấy ID của người dùng từ URL
    // const userInfo = useSelector(userInfoSelector); // lấy thông tin người dùng từ Redux store
    
    const [userPosts, setUserPosts] = useState([1, 2, 3, 4, 5, 6]);
    // const currentUserInfo = useSelector(userInfoSelector);  // Lấy thông tin người dùng hiện tại từ Redux

    // const [userProfile, setUserProfile] = useState({
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     avatar: 'https://example.com/avatar.jpg', // Đặt link ảnh cụ thể để kiểm tra
    //     bio: 'This is a default bio for testing purposes.',
    //     posts: [
    //         {
    //             id: 1,
    //             content: 'This is a test post.',
    //             createdAt: '20/09/2024',
    //             pictures: ['https://example.com/pic1.jpg'],
    //             comments: 5,
    //             shares: 2,
    //         },
    //     ],
    //     // Các giá trị khác nếu cần
    // });
    // Lấy thông tin hồ sơ người dùng từ API
    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleShowEditBio = () => setShowModal(true);
    
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
                        <span>{userInfo.followersCount || 0} Người theo dõi</span>
                    </div>
                </div>
            </div>

            {/* Phần bài viết của người dùng */}
            <button onClick={handleShowModal}>
                Xem thêm thông tin
            </button>
            <button onClick={handleShowEditBio}>
                Chinh sua
            </button>
            <div className={styles.postsContainer}>
                {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                        <PostContent key={post.id} postInfo={post} />
                    ))
                ) : (
                    <p>Người dùng này chưa có bài viết nào.</p>
                    
                )}
                
            </div>
            {showModal && <ModalUserProfile userInfo={userInfo} show={showModal} handleClose={handleCloseModal} />}

        </div>
    );
};

export default UserProfile;

// import React, { useEffect, useState } from 'react';
// import ProfilePage from './ProfilePage';
// import { useSelector } from 'react-redux';
// import { userInfoSelector } from '~/redux/selectors';
// import { getUserPostsService } from '~/services/profileServices';
// import { useParams } from 'react-router-dom';

// const UserProfile = () => {
//     const { userId } = useParams(); // lấy id của người dùng từ route params
//     const userInfo = useSelector(userInfoSelector); // lấy thông tin người dùng từ Redux store

//     const [posts, setPosts] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const fetchUserPosts = async () => {
//             try {
//                 const res = await getUserPostsService(userId);
//                 setPosts(res.data);
//             } catch (error) {
//                 console.log(error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchUserPosts();
//     }, [userId]);

//     return (
//         <div>
//             <ProfilePage
//                 avatar={userInfo.avatar || 'https://via.placeholder.com/120'} // URL mặc định nếu không có avatar
//                 firstName={userInfo.firstName || 'John'}
//                 lastName={userInfo.lastName || 'Doe'}
//                 bio={userInfo.bio || 'Đây là phần giới thiệu của bạn.'}
//                 posts={isLoading ? [] : posts}
//             />
//         </div>
//     );
// };

// export default UserProfile;
