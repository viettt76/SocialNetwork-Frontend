import { useState } from 'react';
import clsx from 'clsx';
import React from 'react';
import PostContent from './PostContent';
import styles from './Post.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        avatar: defaultAvatar,
        bio: 'This is a default bio for testing purposes.',
        posts: [
            {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                avatar: defaultAvatar,
                createdAt: '20/09/2024',
                content: 'This is a sample post content.',
                pictures: ['https://example.com/sample-image.jpg'],
                numberOfComments: 10,
                shares: 5,
                currentEmotionName: 'Thích',
                emotions: [],
            },
        ],
    });

    return (
        <div className={clsx(styles['profile-page-wrapper'])}>
            <div className={clsx(styles['profile-header'])}>
                <img src={userProfile.avatar} alt="avatar" className={clsx(styles['profile-avatar'])} />
                <h1>{`${userProfile.lastName} ${userProfile.firstName}`}</h1>
                <p>{userProfile.bio}</p>
            </div>

            <div className={clsx(styles['profile-posts'])}>
                {userProfile.posts.map((post) => (
                    <PostContent key={post.id} postInfo={post} />
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;

// import React from 'react';
// import styles from './ProfilePage.module.scss';
// import PostContent from './PostContent';

// const ProfilePage = ({ avatar, firstName, lastName, bio, posts }) => {
//     return (
//         <div className={styles['profile-page-wrapper']}>
//             {/* Phần header của trang cá nhân */}
//             <div className={styles['profile-header']}>
//                 <img src={avatar} alt="Avatar" className={styles['profile-avatar']} />
//                 <h1>{`${lastName} ${firstName}`}</h1>
//                 <p>{bio}</p>
//             </div>

//             {/* Danh sách các bài viết của người dùng */}
//             <div className={styles['profile-posts']}>
//                 {posts.length > 0 ? (
//                     posts.map((post, index) => <PostContent key={index} postInfo={post} />)
//                 ) : (
//                     <p>Không có bài viết nào</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProfilePage;
