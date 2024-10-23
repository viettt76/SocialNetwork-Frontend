import clsx from 'clsx';
import styles from './Messenger.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMagnifyingGlass, faUsers } from '@fortawesome/free-solid-svg-icons';
import { createGroupChatService, getGroupChatsService, getLatestConversationsService } from '~/services/chatServices';
import { useEffect, useState } from 'react';
import socket from '~/socket';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '~/redux/actions';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { notificationsMessengerSelector, userInfoSelector } from '~/redux/selectors';

const Messenger = ({ messengerRef, showMessenger, setShowMessenger }) => {
    const userInfo = useSelector(userInfoSelector);
    const notificationsMessenger = useSelector(notificationsMessengerSelector);
    const dispatch = useDispatch();

    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const handleShowCreateNewGroup = () => setShowCreateNewGroup(true);
    const handleHideCreateNewGroup = () => setShowCreateNewGroup(false);

    const [infoNewGroupChat, setInfoNewGroupChat] = useState({
        name: '',
        avatar: null,
        members: [],
    });

    const [onlineFriends, setOnlineFriends] = useState([]);

    const [latestConversations, setLatestConversations] = useState([]);

    useEffect(() => {
        socket.emit('getFriendsOnline');

        const handleFriendOnline = (resOnlineFriends) => {
            setOnlineFriends(resOnlineFriends);
        };
        socket.on('friendsOnline', handleFriendOnline);

        return () => {
            socket.off('friendsOnline', handleFriendOnline);
        };
    }, []);

    const [isInValidNameGroup, setIsInvalidNameGroup] = useState(false);

    const handleCreateGroupChat = async () => {
        try {
            if (!infoNewGroupChat.name) {
                setIsInvalidNameGroup(true);
                return;
            }
            await createGroupChatService({
                name: infoNewGroupChat.name,
                avatar: infoNewGroupChat.avatar,
                members: infoNewGroupChat.members,
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
                const res = await getLatestConversationsService();
                setLatestConversations(res);
            } catch (error) {
                console.log(error);
            }
        };
        if (showMessenger) {
            fetchLatestConversations();
        }
    }, [showMessenger]);

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
                            <input className={clsx(styles['search-input'])} placeholder="Tìm kiếm" />
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

                    {latestConversations?.map((conversation) => {
                        return (
                            <div
                                key={`group-chat-${conversation?.id}`}
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
                                                  avatar: conversation?.groupAvatar,
                                                  administratorId: conversation?.administratorId,
                                                  isGroupChat: true,
                                              }
                                            : {
                                                  id: conversation?.friendId,
                                                  firstName: conversation?.friendFirstName,
                                                  lastName: conversation?.friendLastName,
                                                  avatar: conversation?.friendAvatar,
                                              },
                                    )
                                }
                            >
                                <div className={clsx(styles['conversation'])}>
                                    <img
                                        className={clsx(styles['avatar'])}
                                        src={
                                            (conversation?.groupId
                                                ? conversation?.groupAvatar
                                                : conversation?.friendAvatar) || defaultAvatar
                                        }
                                    />
                                    <div>
                                        <h6 className={clsx(styles['name'])}>
                                            {conversation?.groupId
                                                ? conversation?.groupName
                                                : `${conversation?.friendLastName} ${conversation?.friendFirstName}`}
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
                                [[styles['inactive']]]: !infoNewGroupChat.name || infoNewGroupChat.members?.length < 2,
                            })}
                            onClick={() =>
                                infoNewGroupChat.name &&
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
                                name: e.target.value,
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
                                            src={friend?.avatar || defaultAvatar}
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
