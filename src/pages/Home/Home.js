import { useEffect, useState } from 'react';
import Post from '~/components/Post';
import WritePost from '~/components/WritePost';
import { getAllPostsService } from '~/services/postServices';
import signalRClient from '~/components/Post/signalRClient';
import clsx from 'clsx';
import styles from './Home.module.scss';

const Home = () => {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const res = await getAllPostsService();
                console.log('vinhbr1', res);
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
                );
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllPosts();

        signalRClient.on('ReceiveRefusePost', fetchAllPosts);

        const startSignalR = () => {
            signalRClient.on('ReceivePost', (newPost) => {
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

                console.log('vinhbr', newPost);
            });
        };

        startSignalR();

        return () => {
            signalRClient.stop();
        };
    }, []);

    return (
        <div className={clsx('d-flex mt-5', styles['home-wrapper'])}>
            <div>
                <WritePost />
                {posts.length === 0 ? (
                    <div className="text-center fz-16">
                        <div>Hãy kết bạn để xem những bài viết thú vị hơn</div>
                    </div>
                ) : (
                    posts.map((post) => <Post key={`post-${post.id}`} postInfo={post} />)
                )}
            </div>
        </div>
    );
};

export default Home;
