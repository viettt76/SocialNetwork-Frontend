import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMagnifyingGlass, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef } from 'react';
import socket from '~/socket';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '~/redux/actions';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { notificationsMessengerSelector, userInfoSelector } from '~/redux/selectors';
import { debounce } from 'lodash';

import styles from './Messenger.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { createGroupChatService, getGroupChatsService, getLatestConversationsService } from '~/services/chatServices';
import { getFriendsOnlineService } from '~/services/relationshipServices';

const Messenger = ({ messengerRef, showMessenger, setShowMessenger }) => {
    const userInfo = useSelector(userInfoSelector);
    const notificationsMessenger = useSelector(notificationsMessengerSelector);
    const dispatch = useDispatch();

    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const handleShowCreateNewGroup = () => setShowCreateNewGroup(true);
    const handleHideCreateNewGroup = () => setShowCreateNewGroup(false);

    const [infoNewGroupChat, setInfoNewGroupChat] = useState({
        groupName: '',
        avatar: null,
        members: [],
    });

    const [onlineFriends, setOnlineFriends] = useState([]);

    const [latestConversations, setLatestConversations] = useState([]);

    const [searchConversationValue, setSearchConversationValue] = useState('');

    const [pageIndexValue, setpageIndexValue] = useState(0);

    const [totalPage, setTotalPage] = useState(0);

    const scrollRef = useRef(null);
    // useEffect(() => {
    //     socket.emit('getFriendsOnline');

    //     const handleFriendOnline = (resOnlineFriends) => {
    //         setOnlineFriends(resOnlineFriends);
    //     };
    //     socket.on('friendsOnline', handleFriendOnline);

    //     return () => {
    //         socket.off('friendsOnline', handleFriendOnline);
    //     };
    // }, []);

    useEffect(() => {
        const getFriendsOnlineServiceHandler = async () => {
            const response = await getFriendsOnlineService();
            setOnlineFriends(response.data);
        };

        getFriendsOnlineServiceHandler();
    }, []);

    const [isInValidNameGroup, setIsInvalidNameGroup] = useState(false);

    const timeoutRef = useRef(null);

    const handleCreateGroupChat = async () => {
        try {
            if (!infoNewGroupChat.groupName) {
                setIsInvalidNameGroup(true);
                return;
            }
            await createGroupChatService({
                groupName: infoNewGroupChat.groupName,
                avatar: infoNewGroupChat.avatar,
                members: [...infoNewGroupChat.members, userInfo?.id],
            });
        } catch (error) {
            console.log(error);
        }
    };

    const addToOpenChatList = (chat) => {
        dispatch(actions.openChat(chat));
        setShowMessenger(false);
    };

    useEffect(() => {
        const fetchLatestConversations = async () => {
            try {
                const param = {
                    textSearch: searchConversationValue.trim(),
                    pageIndex: pageIndexValue,
                };
                const param2 = {
                    textSearch: searchConversationValue.trim(),
                    pageIndex: pageIndexValue,
                    isTotalCount: true,
                };

                const res = await getLatestConversationsService(param);
                const totalRecord = await getLatestConversationsService(param2);
                setTotalPage(totalRecord.data.totalPage);
                setLatestConversations(res.data.conversations);
            } catch (error) {
                console.log(error);
            }
        };
        if (showMessenger) {
            fetchLatestConversations();
        }

        return () => {
            if (messengerRef.current) {
                // Reset scroll về đầu trang
                messengerRef.current.scrollTop = 0;
            }
            setTotalPage(0);
            setpageIndexValue(0); // Đặt totalPage về 0 khi component unmount
        };
    }, [showMessenger]);

    console.log('total Page', totalPage);
    const handlSearchConversationKeyUp = async (e) => {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            setSearchConversationValue(e.target.value);
            const res = await getLatestConversationsService({ textSearch: e.target.value.trim() });
            setLatestConversations(res.data.conversations);
        }, 500);
    };

    const handlSearchConversationKeyDown = async () => {};

    // const Update

    useEffect(() => {
        if (!messengerRef.current) return;

        const scrollElement = messengerRef.current;

        const handleScroll = debounce(async () => {
            const currentPageIndex = pageIndexValue;
            if (currentPageIndex < totalPage) {
                const { scrollTop, scrollHeight, clientHeight } = scrollElement;
                if (scrollHeight - (scrollTop + clientHeight) <= 50) {
                    const param = {
                        textSearch: searchConversationValue.trim(),
                        pageIndex: currentPageIndex + 1,
                    };

                    try {
                        const res = await getLatestConversationsService(param);
                        setLatestConversations((prev) => [...prev, ...res.data.conversations]);
                        setpageIndexValue((prev) => prev + 1);
                    } catch (error) {
                        console.log('Error fetching conversations:', error);
                    }
                }
            }
        }, 500);

        scrollElement.addEventListener('scroll', handleScroll);

        // Cleanup function
        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
            handleScroll.cancel(); // Hủy debounce để tránh rò rỉ bộ nhớ
        };
    }, [messengerRef, searchConversationValue, pageIndexValue, totalPage]);
    return (
        <div
            ref={messengerRef}
            className={clsx(styles['messenger-wrapper'], {
                [styles['showMessenger']]: showMessenger,
            })}
        >
            {!showCreateNewGroup ? (
                <div>
                    <div className={clsx('d-flex align-items-center', styles['messenger-header'])}>
                        <div className={clsx(styles['search-wrapper'])}>
                            <FontAwesomeIcon className={clsx(styles['search-icon'])} icon={faMagnifyingGlass} />
                            <input
                                onKeyUp={handlSearchConversationKeyUp}
                                onKeyDown={handlSearchConversationKeyDown}
                                className={clsx(styles['search-input'])}
                                placeholder="Tìm kiếm"
                            />
                        </div>
                        <div
                            className={clsx('fz-15', styles['create-group-chat-btn-wrapper'])}
                            data-tooltip-id="tool-tip-create-group-chat"
                        >
                            <FontAwesomeIcon
                                className={clsx(styles['create-group-chat-btn'])}
                                icon={faUsers}
                                onClick={handleShowCreateNewGroup}
                            />
                            <ReactTooltip id="tool-tip-create-group-chat" place="bottom" content="Tạo nhóm" />
                        </div>
                    </div>

                    {latestConversations?.map((conversation, index) => {
                        return (
                            <div
                                key={`group-chat-${index}`}
                                className={clsx(styles['conversation-wrapper'], {
                                    [[styles['unread']]]: notificationsMessenger?.some(
                                        (noti) => noti?.senderId === conversation?.friendId && !noti?.isRead,
                                    ),
                                })}
                                onClick={() =>
                                    addToOpenChatList(
                                        conversation?.groupId
                                            ? {
                                                  id: conversation?.groupId,
                                                  name: conversation?.groupName,
                                                  avatar: conversation?.avatar,
                                                  administratorId: conversation?.administratorId,
                                                  isGroupChat: true,
                                              }
                                            : {
                                                  id: conversation?.friendId,
                                                  firstName: conversation?.firstName,
                                                  lastName: conversation?.lastName,
                                                  avatar: conversation?.avatar,
                                              },
                                    )
                                }
                            >
                                <div className={clsx(styles['conversation'])}>
                                    <img
                                        className={clsx(styles['avatar'])}
                                        src={
                                            (conversation?.groupId ? conversation?.avatar : conversation?.avatar) ||
                                            defaultAvatar
                                        }
                                    />
                                    <div>
                                        <h6 className={clsx(styles['name'])}>
                                            {conversation?.groupId
                                                ? conversation?.groupName
                                                : `${conversation?.lastName} ${conversation?.firstName}`}
                                        </h6>
                                        <div className={clsx(styles['last-message'])}>
                                            {conversation?.senderId === userInfo?.id
                                                ? 'Bạn: '
                                                : conversation?.groupId &&
                                                  `${conversation?.senderLastName} ${conversation?.senderFirstName}: `}

                                            {conversation?.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <div className={clsx(styles['create-group-header'])}>
                        <div className={clsx(styles['create-group-header-left'])}>
                            <FontAwesomeIcon
                                className={clsx(styles['create-group-header-back'])}
                                icon={faArrowLeft}
                                onClick={handleHideCreateNewGroup}
                            />
                            <span className={clsx(styles['create-group-header-title'])}>Nhóm mới</span>
                        </div>
                        <div
                            className={clsx(styles['create-group-header-btn'], {
                                [[styles['inactive']]]:
                                    !infoNewGroupChat.groupName || infoNewGroupChat.members?.length < 2,
                            })}
                            onClick={() =>
                                infoNewGroupChat.groupName &&
                                infoNewGroupChat.members?.length >= 2 &&
                                handleCreateGroupChat()
                            }
                        >
                            Tạo
                        </div>
                    </div>
                    <input
                        className={clsx('form-control', styles['create-group-name'], {
                            [[styles['invalid']]]: isInValidNameGroup,
                        })}
                        placeholder="Tên nhóm"
                        onChange={(e) => {
                            setInfoNewGroupChat((prev) => ({
                                ...prev,
                                groupName: e.target.value,
                            }));
                        }}
                        onFocus={() => setIsInvalidNameGroup(false)}
                    />

                    <div className={clsx(styles['create-group-search'])}>
                        <FontAwesomeIcon
                            className={clsx(styles['create-group-search-icon'])}
                            icon={faMagnifyingGlass}
                        />
                        <input className={clsx(styles['create-group-search-input'])} placeholder="Tìm kiếm" />
                    </div>
                    <div className={clsx(styles['create-group-suggestion-title'])}>Gợi ý</div>
                    <div className={clsx(styles['create-group-suggestion-members'])}>
                        {onlineFriends?.map((friend) => {
                            return (
                                <label
                                    key={`friend-${friend?.id}`}
                                    htmlFor={`create-group-suggestion-member-checkbox-${friend?.id}`}
                                    className={clsx(styles['create-group-suggestion-member'])}
                                >
                                    <div className={clsx(styles['create-group-suggestion-member-info'])}>
                                        <img
                                            className={clsx(styles['create-group-suggestion-member-avatar'])}
                                            src={friend?.avatarUrl || defaultAvatar}
                                        />
                                        <div className={clsx(styles['create-group-suggestion-member-name'])}>
                                            {friend?.lastName} {friend?.firstName}
                                        </div>
                                    </div>
                                    <div className={clsx(styles['create-group-suggestion-member-checkbox'])}>
                                        <input
                                            id={`create-group-suggestion-member-checkbox-${friend?.id}`}
                                            value={friend?.id}
                                            type="checkbox"
                                            onChange={(e) => {
                                                const { value, checked } = e.target;
                                                if (checked) {
                                                    setInfoNewGroupChat((prev) => ({
                                                        ...prev,
                                                        members: [...prev.members, value],
                                                    }));
                                                } else {
                                                    setInfoNewGroupChat((prev) => ({
                                                        ...prev,
                                                        members: prev.members.filter((item) => item !== value),
                                                    }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`create-group-suggestion-member-checkbox-${friend?.id}`}
                                        ></label>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messenger;
