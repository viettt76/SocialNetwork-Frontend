import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './ManagePost.module.scss';
import { postsNotApprovedService } from '~/services/postServices';
import Post from './Post';
import signalRClient from '~/components/Post/signalRClient';

const ManagePost = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const getAllPostAwait = async () => {
            try {
                const res = await postsNotApprovedService();
                setPosts(res);
            } catch (error) {
                console.log(error);
            }
        };

        getAllPostAwait();

        signalRClient.on('ReceiveRefusePost', getAllPostAwait);

        signalRClient.on('ReceivePost', getAllPostAwait);

        // startSignalR();

        return () => {
            signalRClient.stop();
        };
    }, []);

    return (
        <div className={clsx(styles['manage-post-wrapper'])}>
            {posts?.length > 0 &&
                posts.map((post) => {
                    const pictures =
                        post.images.length > 0
                            ? post.images.map((image) => ({
                                  pictureUrl: image.imgUrl,
                              }))
                            : [];

                    return (
                        <Post
                            key={`post-${post?.id}`}
                            id={post?.postID}
                            posterId={post?.userID}
                            firstName={post?.firstName}
                            lastName={post?.lastName}
                            avatar={post?.avatarUrl}
                            content={post?.content}
                            createdAt={post?.createdAt}
                            pictures={pictures}
                        />
                    );
                })}
        </div>
    );
};

export default ManagePost;
