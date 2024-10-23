import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import styles from './Post.module.scss';
import { LikeIcon, LoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '~/components/Icons';
import defaultAvatar from '~/assets/imgs/default-avatar.png';

const PostContent = ({ postInfo }) => {
    const {
        firstName = 'John',
        lastName = 'Doe',
        avatar = defaultAvatar,
        createdAt = '20/09/2024',
        content = 'This is a sample post for testing purposes.',
        pictures = ['https://example.com/sample-image.jpg'],
        numberOfComments = 5,
        shares = 10,
        currentEmotionName = 'Thích',
        emotions = [],
    } = postInfo;

    const emotionComponentMap = {
        Thích: LikeIcon,
        'Yêu thích': LoveIcon,
        Haha: HaHaIcon,
        Wow: WowIcon,
        Buồn: SadIcon,
        'Phẫn nộ': AngryIcon,
    };

    const CurrentEmotion = emotionComponentMap[currentEmotionName];

    return (
        <div className={clsx(styles['post-content-wrapper'])}>
            <div className={clsx(styles['post-header'])}>
                <Link to="/profile">
                    <img className={clsx(styles['avatar-user'])} src={avatar} alt="avatar" />
                </Link>
                <div>
                    <h5 className={clsx(styles['post-username'])}>{`${lastName} ${firstName}`}</h5>
                    <span>{createdAt}</span>
                </div>
            </div>

            <div className={clsx(styles['post-content'])}>
                <p>{content}</p>
            </div>

            <div className={clsx(styles['post-images'])}>
                {pictures.map((img, index) => (
                    <img key={index} src={img} alt={`Post ${index}`} className={clsx(styles['post-image'])} />
                ))}
            </div>

            <div className={clsx(styles['post-footer'])}>
                <div className={clsx(styles['post-reactions'])}>
                    <CurrentEmotion width={20} height={20} />
                    <span> {emotions.length} Thích</span>
                </div>
                <div className={clsx(styles['post-actions'])}>
                    <FontAwesomeIcon icon={faComment} />
                    <span>{numberOfComments} Bình luận</span>
                    <FontAwesomeIcon icon={faShare} />
                    <span>{shares} Chia sẻ</span>
                </div>
            </div>
        </div>
    );
};

export default PostContent;

// import React from 'react';
// import styles from './Post.module.scss'; // file scss
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
// import { Link } from 'react-router-dom';

// const PostContent = ({ postInfo }) => {
//     const { firstName, lastName, content, pictures } = postInfo;

//     return (
//         <div className={styles['post-content-wrapper']}>
//             <div className={styles['post-header']}>
//                 <img
//                     className={styles['avatar-user']}
//                     src={postInfo.avatar || 'https://via.placeholder.com/40'}
//                     alt="Avatar"
//                 />
//                 <div>
//                     <h5 className={styles['post-username']}>{`${lastName} ${firstName}`}</h5>
//                     <span>{postInfo.createdAt || 'Đã đăng vào 20/09/2024'}</span>
//                 </div>
//             </div>

//             <div className={styles['post-content']}>{content}</div>

//             <div className={styles['post-images']}>
//                 {pictures?.map((picture, index) => (
//                     <img key={index} src={picture} className={styles['post-image']} alt={`Hình ảnh ${index + 1}`} />
//                 ))}
//             </div>

//             <div className={styles['post-footer']}>
//                 <div className={styles['post-reactions']}>
//                     <FontAwesomeIcon icon={faThumbsUp} />
//                     <span>{postInfo.emotionsCount || 0}</span>
//                 </div>
//                 <div className={styles['post-actions']}>
//                     <span><FontAwesomeIcon icon={faComment} /> {postInfo.commentsCount || 0} bình luận</span>
//                     <span><FontAwesomeIcon icon={faShare} /> Chia sẻ</span>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PostContent;
