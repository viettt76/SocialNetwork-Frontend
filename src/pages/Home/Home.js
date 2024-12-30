import { useEffect, useRef, useState } from 'react';
import Post from '~/components/Post';
import WritePost from '~/components/WritePost';
import { getAllPostsService } from '~/services/postServices';
import signalRClient from '~/components/Post/signalRClient';
import clsx from 'clsx';
import styles from './Home.module.scss';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const observer = useRef();

    // const fetchAllPosts = async () => {
    //     try {
    //         const res = await getAllPostsService(page, 10);

    //         setPosts((prevPosts) => [
    //             ...prevPosts,
    //             ...res.data.map((post) => ({
    //                 id: post.postID,
    //                 posterId: post.userID,
    //                 firstName: post.firstName,
    //                 lastName: post.lastName,
    //                 avatar: post.avatarUrl,
    //                 content: post.content,
    //                 createdAt: post.createdAt,
    //                 pictures:
    //                     post.images?.length > 0
    //                         ? post.images.map((image) => ({
    //                               pictureUrl: image?.imgUrl,
    //                           }))
    //                         : [],
    //                 currentEmotionId: post.userReaction?.emotionTypeID || null,
    //                 currentEmotionName: post.userReaction?.emotionName || null,
    //                 emotions: post?.reactions?.map((emo) => ({
    //                     id: emo?.reactionID,
    //                     emotion: {
    //                         id: emo?.emotionTypeID,
    //                         name: emo?.emotionName,
    //                     },
    //                     userInfo: {
    //                         id: emo?.userID,
    //                     },
    //                 })),
    //             })),
    //         ]);

    //         setHasMore(res.data.length > 0);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
<<<<<<< HEAD
                const res = await getAllPostsService(page, 10);

                setPosts((prevPosts) => [
                    ...prevPosts,
                    ...res.data.map((post) => ({
                        id: post.postID,
                        posterId: post.userID,
                        firstName: post.firstName,
                        lastName: post.lastName,
                        avatar: post.avatarUrl,
                        content: post.content,
                        createdAt: post.createdAt,
                        pictures:
                            post.images?.length > 0
                                ? post.images.map((image) => ({
                                      pictureUrl: image?.imgUrl,
                                  }))
                                : [],
                        currentEmotionId: post.userReaction?.emotionTypeID || null,
                        currentEmotionName: post.userReaction?.emotionName || null,
                        emotions: post?.reactions?.map((emo) => ({
                            id: emo?.reactionID,
                            emotion: {
                                id: emo?.emotionTypeID,
                                name: emo?.emotionName,
                            },
                            userInfo: {
                                id: emo?.userID,
                            },
                        })),
                    })),
                ]);

                setHasMore(res.data.length > 0);
=======
                const res = await getAllPostsService();
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
>>>>>>> 2bc6835a1ffa989310518d41b04259e6b4f1ee0f
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllPosts();
    }, [page]);

    useEffect(() => {
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
            });
        };

        startSignalR();

        return () => {
            signalRClient.off('ReceivePost');
        };
    }, []);

    const lastPostRef = (node) => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    };

    return (
        <div className={clsx('d-flex mt-5', styles['home-wrapper'])}>
            <div>
                <WritePost />
                {posts.length === 0 ? (
                    <div className="text-center fz-16">
                        <div>Hãy kết bạn để xem những bài viết thú vị hơn</div>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <div key={`post-${post.id}`} ref={index === posts.length - 1 ? lastPostRef : null}>
                            <Post postInfo={post} />
                        </div>
                    ))
                )}
            </div>
        </div>
        // <div style={{ position: 'relative', backgroundColor: 'blue' }}>
        //     <div style={{ backgroundColor: 'red', width: '300px', height: '300px' }}>
        //         <div
        //             style={{
        //                 position: 'absolute',
        //                 backgroundColor: 'green',
        //                 width: '30px',
        //                 height: '30px',
        //                 top: '-20px',
        //                 left: '-20px',
        //             }}
        //         ></div>
        //     </div>
        // </div>
    );
};

export default Home;
