import { useEffect, useState } from 'react';
import Post from '~/components/Post';
import WritePost from '~/components/WritePost';
import { getAllPostsService } from '~/services/postServices';
import signalRClient from '~/components/Post/signalRClient';

const Home = () => {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const res = await getAllPostsService();
                setPosts(
                    res.map((post) => {
                        return {
                            id: post.postID,
                            posterId: post.userID,
                            firstName: post.firstName,
                            lastName: post.lastName,
                            avatar: post.avatarUser,
                            content: post.content,
                            createdAt: post.createdAt,
                            pictures:
                                post.images?.length > 0 &&
                                post.images.map((image) => {
                                    return {
                                        pictureUrl: image?.imgUrl,
                                    };
                                }),
                            currentEmotionId: post?.emotionTypeID,
                            currentEmotionName: post?.emotionName,
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

        fetchAllPosts();
        const startSignalR = () => {
            signalRClient.on('ReceivePost', (newPost) => {
                console.log('vinhbr6666 kết nối', newPost);
                setPosts((prevPosts) => [newPost, ...prevPosts]);
                console.log('vinhbr6666 kết nối 9999', prevPosts);
            });
            // console.log('vinhbr', newPost);
        };

        startSignalR();

        return () => {
            signalRClient.stop();
        };
    }, []);

    return (
        <div className="d-flex justify-content-center mt-5">
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
