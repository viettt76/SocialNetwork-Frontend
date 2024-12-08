import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import styles from './FriendsList.module.scss';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import * as actions from '~/redux/actions';
import { useDispatch } from 'react-redux';
import { getFriendsOnlineService } from '~/services/relationshipServices';
import { getGroupChatsService } from '~/services/chatServices';

const FriendsList = () => {
    const dispatch = useDispatch();

    const [onlineFriends, setOnlineFriends] = useState([]);
    const [myChatGroups, setMyChatGroups] = useState([]);
    const [pageIndexValue, setpageIndexValue] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const groupChatsRef = useRef(null);
    const [searchGroupChatValue, setSearchGroupChatValue] = useState('');
    useEffect(() => {
        const getFriendsOnlineServiceHandler = async () => {
            const friends = (await getFriendsOnlineService()).data;
            setOnlineFriends(friends);
        };

        const getGroupChats = async () => {
            const groupChats = (await getGroupChatsService()).data;
            setMyChatGroups(groupChats);
        };

        getFriendsOnlineServiceHandler();

        fetchGroupChats('');
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

    useEffect(() => {
        if (!groupChatsRef.current) return;

        const scrollElement = groupChatsRef.current;

        const handleScroll = debounce(async () => {
            const currentPageIndex = pageIndexValue;
            if (currentPageIndex < totalPage) {
                const { scrollTop, scrollHeight, clientHeight } = scrollElement;
                if (scrollHeight - (scrollTop + clientHeight) <= 50) {
                    const param = {
                        textSearch: searchGroupChatValue.trim(),
                        pageIndex: currentPageIndex + 1,
                    };

                    try {
                        const res = await getGroupChatsService(param);
                        setMyChatGroups((prev) => [...prev, ...res.data.groups]);
                        setpageIndexValue((prev) => prev + 1);
                    } catch (error) {
                        console.log('Error fetching conversations:', error);
                    }
                }
            } else {
                setTotalPage(0);
                setpageIndexValue(0);
            }
        }, 500);

        scrollElement.addEventListener('scroll', handleScroll);

        // Cleanup function
        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();
        };
    }, [groupChatsRef, searchGroupChatValue, pageIndexValue, totalPage]);

    const fetchGroupChats = async (textSearch) => {
        try {
            const param = {
                textSearch: textSearch,
                pageIndex: pageIndexValue,
            };
            const param2 = {
                textSearch: textSearch,
                pageIndex: pageIndexValue,
                isTotalCount: true,
            };

            const res = await getGroupChatsService(param);
            const totalRecord = await getGroupChatsService(param2);
            setTotalPage(totalRecord.data.totalPage);
            setMyChatGroups(res.data.groups);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['contact-wrapper'])}>
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
                                <img src={friend?.avatarUrl || defaultAvatar} />
                            </div>
                            <div
                                className={clsx(styles['friend-name'])}
                            >{`${friend?.lastName} ${friend?.firstName}`}</div>
                        </li>
                    );
                })}
            </ul>
            <ul
                ref={groupChatsRef}
                className={clsx(styles['group-list-wrapper'], {
                    [['scroll']]: myChatGroups?.length > 0,
                })}
            >
                <div className={clsx(styles['title'])}>Nhóm chat</div>
                {myChatGroups?.map((group, index) => {
                    return (
                        <li
                            key={`friend-${index}`}
                            className={clsx(styles['friend'])}
                            onClick={() => addToChatList({ ...group, isGroupChat: true })}
                        >
                            <div className={clsx(styles['friend-avatar'])}>
                                <img src={group?.avatarUrl || defaultAvatar} />
                            </div>
                            <div className={clsx(styles['friend-name'])}>{group?.name}</div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FriendsList;
