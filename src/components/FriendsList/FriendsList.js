import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './FriendsList.module.scss';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import * as actions from '~/redux/actions';
import { useDispatch } from 'react-redux';

const FriendsList = () => {
    const dispatch = useDispatch();

    const [onlineFriends, setOnlineFriends] = useState([]);

    useEffect(() => {
        setOnlineFriends([
            {
                id: 'a393dd03-c9e5-46db-bc67-25b3c5bbc407',
                firstName: '2',
                lastName: '2',
                avatar: 'https://res.cloudinary.com/du19iyqz9/image/upload/v1728027526/file_1728027522460.jpg',
                isOnline: true,
            },
            {
                id: '084c6450-b036-4c52-bdd1-ea2fca0cd612',
                firstName: '6',
                lastName: '6',
                avatar: 'https://res.cloudinary.com/du19iyqz9/image/upload/v1727970378/file_1727970376041.jpg',
                isOnline: false,
            },
        ]);
        // socket.emit('getFriendsOnline');

        // const handleFriendOnline = (resOnlineFriends) => {
        //     setOnlineFriends(resOnlineFriends);
        // };
        // socket.on('friendsOnline', handleFriendOnline);

        // return () => {
        //     socket.off('friendsOnline', handleFriendOnline);
        // };
    }, []);

    const addToChatList = (friend) => {
        dispatch(actions.openChat(friend));
    };

    return (
        <div>
            <ul className={clsx(styles['friends-list-wrapper'])}>
                <div className={clsx(styles['title'])}>Bạn bè</div>
                {onlineFriends?.map((friend, index) => {
                    return (
                        <li
                            key={`friend-${index}`}
                            className={clsx(styles['friend'])}
                            onClick={() => addToChatList(friend)}
                        >
                            <div
                                className={clsx(styles['friend-avatar'], {
                                    [[styles['is-online']]]: friend?.isOnline,
                                })}
                            >
                                <img src={friend?.avatar || defaultAvatar} />
                            </div>
                            <div
                                className={clsx(styles['friend-name'])}
                            >{`${friend?.lastName} ${friend?.firstName}`}</div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FriendsList;
