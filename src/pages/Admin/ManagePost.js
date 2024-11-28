import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './ManagePost.module.scss';
import { postsNotApprovedService } from '~/services/postServices';
import Post from './Post';

const ManagePost = () => {
    // const [posts, setPosts] = useState([]);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const res = await postsNotApprovedService();
    //             setPosts(res);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })();
    // }, []);

    const posts = [
        {
            id: 'e01cea21-9476-44bc-a5a4-9b215105c74d',
            posterId: 'b71abebf-fe7b-40e8-9720-56749ee5e5fb',
            visibility: 1,
            content: 'chào việt',
            createdAt: '2024-11-14T06:10:13.153Z',
            pictures: [],
            posterInfo: {
                firstName: 'Việt',
                lastName: 'Hoàng',
                avatar: null,
            },
        },
    ];

    return (
        <div className={clsx(styles['manage-post-wrapper'])}>
            {posts?.length > 0 &&
                posts.map((post) => {
                    return (
                        <Post
                            key={`post-${post?.id}`}
                            id={post?.id}
                            posterId={post?.posterId}
                            firstName={post?.posterInfo?.firstName}
                            lastName={post?.posterInfo?.lastName}
                            avatar={post?.posterInfo?.avatar}
                            content={post?.content}
                            createdAt={post?.createdAt}
                            pictures={post?.pictures}
                        />
                    );
                })}
        </div>
    );
};

export default ManagePost;
