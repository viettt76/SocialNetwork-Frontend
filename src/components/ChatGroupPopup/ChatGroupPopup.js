import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperclip,
    faArrowRightFromBracket,
    faChevronDown,
    faThumbsUp,
    faUserGroup,
    faUserPlus,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ChatGroupPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import {
    getGroupMembersService,
    getMessagesOfGroupChatService,
    leaveGroupChatService,
    sendGroupChatMessageService,
    updateGroupAvatarService,
    updateGroupMembersService,
} from '~/services/chatServices';
import socket from '~/socket';
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';
import Menu from '~/components/Menu';
import { Link } from 'react-router-dom';
import { ArrowIcon, AngryIcon, HaHaIcon, LikeIcon, LoveIcon, SadIcon, WowIcon } from '~/components/Icons';
import { Button, Modal } from 'react-bootstrap';
import { HubConnectionBuilder } from '@microsoft/signalr';

import Cropper from 'react-easy-crop';
import { getAllMessageChatGroupService } from '~/services/chatServices';
import { calculateTime, getCroppedImg, uploadToCloudinary } from '~/utils/commonUtils';

const GroupMembersLayout = ({ groupId }) => {
    const [groupMembers, setGroupMembers] = useState([]);
    const [pageIndexValue, setpageIndexValue] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchGroupMembers = async (textSearch, isMounted) => {
            try {
                const param = {
                    textSearch: textSearch,
                    pageIndex: pageIndexValue,
                    groupId,
                };
                const param2 = {
                    textSearch: textSearch,
                    pageIndex: pageIndexValue,
                    groupId,
                    isTotalCount: true,
                };

                const res = await getGroupMembersService(param);
                const totalRecord = await getGroupMembersService(param2);
                if (isMounted) {
                    setTotalPage(totalRecord.data.totalPage);
                    setGroupMembers(res.data.groupMembers);
                }
            } catch (error) {
                if (isMounted) {
                    console.log(error);
                }
            }
        };
        fetchGroupMembers('', isMounted);

        return () => {
            isMounted = false;
        };
    }, [groupId]);

    return (
        <div className={clsx(styles['group-member-wrapper'])}>
            <h1 className="text-center">Thành viên</h1>
            <div>
                {groupMembers?.map((member) => {
                    return (
                        <Link
                            to={`/profile/${member?.id}`}
                            className={clsx(styles['group-member-item-wrapper'])}
                            key={`member-${member?.id}`}
                        >
                            <img
                                className={clsx(styles['group-member-item-avatar'])}
                                src={member?.avatarUrl || defaultAvatar}
                                alt={`${member?.lastName} ${member?.firstName}`}
                            />
                            <div className={clsx(styles['group-member-item-name'])}>
                                {member?.lastName} {member?.firstName}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

const AddGroupMembersLayout = ({ groupId, handleSetActiveMenu }) => {
    const [onlineFriends, setOnlineFriends] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [friendsCanAddToGroup, setFriendsCanAddToGroup] = useState([]);
    const [addGroupMembers, setAddGroupMembers] = useState([]);
    const [pageIndexValue, setpageIndexValue] = useState(0);
    const [totalPage, setTotalPage] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchGroupMembers = async (textSearch, isMounted) => {
            try {
                const param = {
                    textSearch: textSearch,
                    pageIndex: pageIndexValue,
                    groupId,
                };
                const param2 = {
                    textSearch: textSearch,
                    pageIndex: pageIndexValue,
                    groupId,
                    isTotalCount: true,
                };

                const res = await getGroupMembersService(param);
                const totalRecord = await getGroupMembersService(param2);
                if (isMounted) {
                    setTotalPage(totalRecord.data.totalPage);
                    setGroupMembers(res.data.groupMembers);
                }
            } catch (error) {
                if (isMounted) {
                    console.log(error);
                }
            }
        };
        fetchGroupMembers('', isMounted);

        return () => {
            isMounted = false;
        };
    }, [groupId]);

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

    useEffect(() => {
        const filterOnlineFriends = onlineFriends.filter(
            (friend) => !groupMembers.some((member) => member?.memberId === group?.id),
        );
        setFriendsCanAddToGroup(filterOnlineFriends);
    }, [groupMembers, onlineFriends]);

    const handleAddGroupMembers = async () => {
        try {
            await updateGroupMembersService({ groupChatId: groupId, members: addGroupMembers });
            handleSetActiveMenu('main');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['group-member-wrapper'])}>
            <div className={clsx(styles['btn-add'])} onClick={handleAddGroupMembers}>
                Thêm
            </div>
            <h1 className="text-center">Bạn bè</h1>
            <div>
                {friendsCanAddToGroup?.map((friend) => {
                    return (
                        <label
                            htmlFor={`group-member-item-checkbox-${group?.id}`}
                            className={clsx(styles['group-member-item-wrapper'])}
                            key={`member-${group?.id}`}
                        >
                            <div className="d-flex align-items-center">
                                <img
                                    className={clsx(styles['group-member-item-avatar'])}
                                    src={friend?.avatar || defaultAvatar}
                                    alt={`${friend?.lastName} ${friend?.firstName}`}
                                />
                                <div className={clsx(styles['group-member-item-name'])}>
                                    {friend?.lastName} {friend?.firstName}
                                </div>
                            </div>
                            <div className={clsx(styles['group-member-item-checkbox'])}>
                                <input
                                    id={`group-member-item-checkbox-${group?.id}`}
                                    value={group?.id}
                                    type="checkbox"
                                    onChange={(e) => {
                                        setAddGroupMembers((prev) => [...prev, e.target.value]);
                                    }}
                                />
                                <label htmlFor={`group-member-item-checkbox-${group?.id}`}></label>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

const ChatGroupPopup = ({ index, group }) => {
    const modalUpdateAvatarRef = useRef(null);

    const {
        ref: chatPopupRef,
        isComponentVisible: isFocus,
        setIsComponentVisible: setIsFocus,
    } = useClickOutside(true, modalUpdateAvatarRef);
    const userInfo = useSelector(userInfoSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            try {
                const messages = (await getAllMessageChatGroupService(group?.id)).data.map((message) => ({
                    id: message.groupChatMessageID,
                    sender: message.userID,
                    group: message.groupChatID,
                    message: message.content,
                    pictures: message.images || [],
                    symbol: message.symbol,
                    senderAvatar: message?.senderAvatar,
                    reactionByUser:
                        message.reactionByUser === null
                            ? null
                            : message.reactionByUser.map((item) => {
                                  return {
                                      userId: item.userId,
                                      reactionId: item.reactionId,
                                      emotionType: Number(item.emotionType),
                                  };
                              }),
                    createdAt: message.createdAt,
                }));
                setMessages(messages);
            } catch (error) {
                console.log(error);
            }
        })();
    }, [group]);

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const [sendMessage, setSendMessage] = useState('');
    const [processingMessage, setProcessingMessage] = useState('');
    const [currentMessageSelect, setcurrentMessageSelect] = useState({});
    const [symbol, setSymbol] = useState(0);
    const [conn, setConn] = useState('');
    const [connectionChathub, setConnectionChathub] = useState('');

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(group?.id));
    }, [group?.id]);

    useEffect(() => {
        window.onkeydown = (e) => {
            if (isFocus && e.key === 'Escape') {
                handleCloseChatPopup();
            }
        };
    }, [handleCloseChatPopup, isFocus]);

    const settingMenuRef = useRef(null);

    const {
        ref: btnSettingRef,
        isComponentVisible: showSetting,
        setIsComponentVisible: setShowSetting,
    } = useClickOutside(false, settingMenuRef);

    const handleShowSetting = () => setShowSetting(true);

    const handleSetActiveMenu = (menu) => {
        menuRef.current.setActiveMenu(menu);
    };

    const [updateAvatar, setUpdateAvatar] = useState(null);
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const handleChooseFile = async (e, isUpdateAavatarGroup = false) => {
        const files = Array.from(e.target.files);
        try {
            const imagesUrls = [];
            if (files.length > 0) {
                const uploadedUrls = await Promise.all(files.map((fileUpload) => uploadToCloudinary(fileUpload)));
                imagesUrls.push(...uploadedUrls);
            }
            if (isUpdateAavatarGroup) {
                var param = {
                    groupChatId: group?.id,
                    avatar: imagesUrls[0],
                };
                var url = await conn.invoke('UpdateGroupChatAvatar', param);
            } else {
                await handleSendMessage(imagesUrls);
            }
            e.target.value = null;
        } catch (error) {
            console.log(error);
        }
    };

    const handleHideModalUpdateAvatar = () => setShowModalUpdateAvatar(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(updateAvatar, croppedAreaPixels);
            const file = await fetch(croppedImage)
                .then((res) => res.blob())
                .then((blob) => new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            const imageUrl = await uploadToCloudinary(file);
            await updateGroupAvatarService({ groupChatId: group?.id, avatar: imageUrl });

            dispatch(actions.updateGroupChatAvatar({ groupId: group?.id, avatar: imageUrl }));
            handleHideModalUpdateAvatar();
        } catch (error) {
            console.error('Failed to crop image', error);
        }
    };

    const [isShowModalLeaveGroup, setIsShowModalLeaveGroup] = useState(false);

    const handleShowModalLeaveGroup = () => setIsShowModalLeaveGroup(true);
    const handleHideModalLeaveGroup = () => setIsShowModalLeaveGroup(false);

    const handleLeaveGroup = async () => {
        try {
            await leaveGroupChatService(group?.id);
        } catch (error) {
            console.log(error);
        } finally {
            handleHideModalLeaveGroup();
        }
    };

    const menuItems = [
        {
            id: 'main',
            depthLevel: 1,
            menu: [
                [
                    {
                        label: (
                            <div>
                                <label
                                    htmlFor="change-group-chat-avatar-input"
                                    className={clsx(styles['edit-profile-btn'])}
                                >
                                    <img src={group?.avatarUrl} className={clsx(styles['menu-item-avatar'])} />
                                    <span>Ảnh đại diện nhóm</span>
                                </label>
                                <input
                                    type="file"
                                    id="change-group-chat-avatar-input"
                                    hidden
                                    onChange={(e) => handleChooseFile(e, true)}
                                />
                            </div>
                        ),
                    },
                ],
                [
                    {
                        leftIcon: <FontAwesomeIcon icon={faUserGroup} />,
                        label: 'Thành viên nhóm',
                        goToMenu: 'groupMembers',
                    },
                    ...(userInfo?.id === group?.administratorId
                        ? [
                              {
                                  leftIcon: <FontAwesomeIcon icon={faUserPlus} />,
                                  label: 'Thêm thành viên',
                                  goToMenu: 'addGroupMembers',
                              },
                          ]
                        : []),
                ],
                [
                    {
                        leftIcon: (
                            <FontAwesomeIcon
                                className={clsx(styles['menu-item-leave-group-icon'])}
                                icon={faArrowRightFromBracket}
                            />
                        ),
                        label: (
                            <div className={clsx(styles['menu-item-leave-group'])} onClick={handleShowModalLeaveGroup}>
                                Rời nhóm
                            </div>
                        ),
                    },
                ],
            ],
        },
        {
            id: 'groupMembers',
            back: 'main',
            leftIcon: <ArrowIcon />,
            depthLevel: 2,
            menu: [
                {
                    label: <GroupMembersLayout groupId={group?.id} />,
                    className: clsx(styles['hover-not-background']),
                },
            ],
        },
        {
            id: 'addGroupMembers',
            back: 'main',
            leftIcon: <ArrowIcon />,
            depthLevel: 2,
            menu: [
                {
                    label: <AddGroupMembersLayout groupId={group?.id} handleSetActiveMenu={handleSetActiveMenu} />,
                    className: clsx(styles['hover-not-background']),
                },
            ],
        },
    ];

    const menuRef = useRef(null);
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7072/groupChatHub?groupId=${group?.id}`)
            .build();

        const reactionHub = new HubConnectionBuilder()
            .withUrl(`https://localhost:7072/reactionGroupChatMessage?groupId=${group?.id}`)
            .build();

        const startConnection = async () => {
            try {
                await connection.start();

                setConn(connection);

                connection.on('UserDisconnectedFromGroup', (errorMessage) => {
                    setError(errorMessage);
                    console.error('Error received: ', errorMessage);
                });

                connection.on('ReceiveSpecitificGroupChatMessage', (messageResponse) => {
                    if (messageResponse.senderID !== userInfo?.id) {
                        if (messageResponse.isDelete) {
                            setMessages((prev) => {
                                return prev.filter((message) => message.id !== messageResponse.messageID);
                            });
                        } else {
                            setMessages((prev) => {
                                var x = prev.find((message) => message.id === messageResponse.messageID);
                                return [
                                    ...(prev.find((message) => message.id === messageResponse.messageID)
                                        ? prev.filter((message) => message.id !== messageResponse.messageID)
                                        : prev),
                                    {
                                        id: messageResponse.groupChatMessageID,
                                        sender: messageResponse.userID,
                                        group: messageResponse.groupChatID,
                                        message: messageResponse.content,
                                        pictures: messageResponse.images || [],
                                        symbol: messageResponse.symbol,
                                        senderAvatar: messageResponse?.senderAvatar,
                                        reactionByUser: messageResponse.reactionByUser
                                            ? messageResponse.reactionByUser.map((reaction) => {
                                                  return {
                                                      userId: reaction.userId,
                                                      reactionId: reaction.reactionId,
                                                      emotionType: Number(reaction.emotionType.toString()),
                                                  };
                                              })
                                            : [],
                                        createdAt: messageResponse.createdAt,
                                    },
                                ];
                            });
                        }

                        connection.on('ReciverTypingNotification', (isTyping) => {
                            setIsDisPlayTyping(isTyping);
                        });
                    }
                });
            } catch (error) {
                console.error('Error establishing connection:', error);
            }
        };

        startConnection();

        const startReactionConnection = async () => {
            await reactionHub.start();

            setConnectionChathub(reactionHub);

            reactionHub.on('UserNotConnected', (errorMessage) => {
                setError(errorMessage);
                console.error('Error received: ', errorMessage);
            });
            reactionHub.on('ReceiveReactionMessage', (reactionMessageResponse) => {
                setMessages((prevMessages) => {
                    if (reactionMessageResponse.isRemove === true) {
                        const updatedMessages = prevMessages.map((message) => {
                            if (message.id === reactionMessageResponse.messageId) {
                                const updatedReactions = message.reactionByUser.filter(
                                    (reaction) =>
                                        reaction.reactionId.toLowerCase() !==
                                        reactionMessageResponse.reactionID.toLowerCase(),
                                );
                                return { ...message, reactionByUser: updatedReactions };
                            }
                            return message;
                        });
                        return updatedMessages;
                    } else {
                        const updatedMessages = prevMessages.map((message, index) => {
                            if (message.id === reactionMessageResponse.messageId) {
                                let updatedReactions = [...(message.reactionByUser || [])];
                                const existingReactionIndex = updatedReactions.findIndex(
                                    (reaction) => reaction.userId === reactionMessageResponse.senderId,
                                );

                                if (existingReactionIndex >= 0) {
                                    updatedReactions[existingReactionIndex] = {
                                        ...updatedReactions[existingReactionIndex],
                                        emotionType: Number(reactionMessageResponse.emotionType),
                                    };
                                } else {
                                    updatedReactions.push({
                                        userId: reactionMessageResponse.senderId,
                                        reactionId: reactionMessageResponse.reactionID,
                                        emotionType: Number(reactionMessageResponse.emotionType),
                                    });
                                }

                                return { ...message, reactionByUser: updatedReactions };
                            }
                            return message;
                        });
                        return updatedMessages;
                    }
                });
            });
        };
        startReactionConnection();

        return () => {
            if (connection) {
                connection.stop();
                console.log('Connection closed');
            }
        };
    }, []);
    const handleSendSymbol = async () => {
        try {
            setSymbol(1);
        } catch (error) {
            console.log(error);
        }
    };

    const handleEmotionMessage = async ({ messageId, emotionType }) => {
        var param = {
            messageId,
            emotionType,
            groupId: group?.id,
            senderid: userInfo?.id,
        };
        var currentReactionId = await connectionChathub.invoke('AddOrUpdateReactionToMessage', param);
        try {
            if (!messageId || emotionType === undefined || !userInfo?.id) {
                throw new Error('Missing required parameters');
            }

            const messageIndex = messages.findIndex((message) => message.id === messageId);
            if (messageIndex === -1) {
                throw new Error('Message not found');
            }

            const newReaction = {
                userId: userInfo.id,
                reactionId: currentReactionId,
                emotionType: Number(emotionType),
            };

            setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const message = { ...newMessages[messageIndex] };
                const reactions = [...(message.reactionByUser || [])];

                const existingReactionIndex = reactions.findIndex((reaction) => reaction.userId === userInfo.id);

                if (existingReactionIndex !== -1) {
                    reactions[existingReactionIndex] = {
                        ...reactions[existingReactionIndex],
                        emotionType: Number(emotionType),
                    };
                } else if (reactions.length < 2) {
                    reactions.push(newReaction);
                }

                message.reactionByUser = reactions;
                newMessages[messageIndex] = message;
                return newMessages;
            });
        } catch (error) {
            console.error('Error handling emotion message:', error);
        }
    };

    const handleReamoveReactionMessage = async ({ messageId, senderReactionId, reactionId }) => {
        if (!messageId || !senderReactionId || !reactionId) {
            throw new Error('Missing required parameters');
        }

        if (senderReactionId === userInfo.id) {
            try {
                setMessages((prevMessages) => {
                    return prevMessages.map((message) => {
                        if (message.id === messageId) {
                            const updatedReactions = message.reactionByUser.filter(
                                (reaction) => reaction.reactionId !== reactionId,
                            );
                            return { ...message, reactionByUser: updatedReactions };
                        }
                        return message;
                    });
                });
                await connectionChathub.invoke(
                    'RemoveReactionToMessage',
                    {
                        reciverId: friend?.id,
                        messageId,
                    },
                    reactionId,
                );
            } catch (error) {
                console.error('Error removing reaction message:', error);
            }
        } else {
            console.log('You can not remove reaction message');
        }
    };
    useEffect(() => {
        if (symbol === 1) {
            handleSendMessage([]);
        }
    }, [symbol]);

    const handleUpdateMessage = async (messageId, senderId, reactionByUser) => {
        try {
            if (messageId.trim() && userInfo?.id == senderId) {
                var currentMessage = messages.find((mesage) => mesage.id === messageId);

                setSendMessage(currentMessage.message);

                setMessages((prev) => {
                    return prev.filter((message) => message.id !== messageId);
                });

                setcurrentMessageSelect({ messageId, reactionByUser });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleReamoveMessage = async (messageId, senderId) => {
        try {
            if (messageId.trim() && userInfo?.id == senderId) {
                setMessages((prev) => {
                    return prev.filter((message) => message.id !== messageId);
                });

                await conn.invoke('RemoveMessage', messageId, group?.id);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleSendMessage = async (imagesUrls = []) => {
        try {
            if (Object.keys(currentMessageSelect).length > 0) {
                console.log('currentMessageSelect', currentMessageSelect);
                var messageUpdateParameter = {
                    messageId: currentMessageSelect.messageId,
                    reactionByUser: currentMessageSelect.reactionByUser.map((reaction) => {
                        return {
                            userId: reaction.userId,
                            reactionId: reaction.reactionId,
                            emotionType: reaction.emotionType.toString(),
                        };
                    }),
                    content: sendMessage,
                    reciverId: group?.id,
                };
                setSendMessage('');

                setMessages((prev) => {
                    return [
                        ...prev,
                        {
                            id: currentMessageSelect.messageId,
                            sender: userInfo?.id,
                            receiver: group?.id,
                            message: sendMessage,
                            pictures: imagesUrls || [],
                            symbol: symbol,
                            reactionByUser: currentMessageSelect.reactionByUser,
                        },
                    ];
                });

                setProcessingMessage('Đang xử lý');

                var messageId = await conn.invoke('UpdateMessage', messageUpdateParameter);

                setSymbol(0);

                setMessages((prev) => {
                    const index = _.findIndex(prev, { id: null, sendMessage });

                    if (index === -1) return prev;

                    const updatedMessages = _.cloneDeep(prev);

                    updatedMessages[index] = { ...updatedMessages[index], id: messageId };

                    return updatedMessages;
                });

                setProcessingMessage('');
                setcurrentMessageSelect({});
            } else {
                if (symbol === 0 && !sendMessage.trim() && imagesUrls.length === 0) return;
                let message = sendMessage;

                if (imagesUrls.length > 0) {
                    message = '';
                }

                setSendMessage('');

                setMessages((prev) => {
                    return [
                        ...prev,
                        {
                            id: null,
                            sender: userInfo?.id,
                            group: group?.id,
                            message,
                            pictures: imagesUrls || [],
                            symbol: symbol,
                            reactionByUser: [],
                        },
                    ];
                });

                setProcessingMessage('Đang xử lý');

                var messageParameter = {
                    groupChatId: group?.id,
                    content: message,
                    images: imagesUrls,
                    symbol: symbol,
                };
                var messageResult = await conn.invoke('SendMessageToGroup', messageParameter);

                setSymbol(0);

                setMessages((prev) => {
                    const index = _.findIndex(prev, { id: null, message });

                    if (index === -1) return prev;

                    const updatedMessages = _.cloneDeep(prev);

                    updatedMessages[index] = {
                        ...updatedMessages[index],
                        id: messageResult.groupChatMessageID,
                        createdAt: messageResult.createdAt,
                    };

                    return updatedMessages;
                });

                setProcessingMessage('');
            }
        } catch (e) {
            console.log(e.message);
        }
    };

    return (
        <div
            style={{ right: index === 0 ? '3rem' : '38rem', zIndex: 2 - index }}
            className={clsx(styles['chat-wrapper'])}
            ref={chatPopupRef}
            onClick={() => setIsFocus(true)}
        >
            <Modal
                ref={modalUpdateAvatarRef}
                className={clsx(styles['modal'])}
                show={showModalUpdateAvatar}
                onHide={handleHideModalUpdateAvatar}
            >
                <Modal.Header>
                    <Modal.Title>Chọn ảnh đại diện</Modal.Title>
                </Modal.Header>
                <Modal.Body className={clsx(styles['modal-body'])}>
                    <div className={clsx(styles['crop-container'])}>
                        <Cropper
                            image={updateAvatar}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>
                    <div className={clsx(styles['controls'])}>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => {
                                setZoom(e.target.value);
                            }}
                            className={clsx(styles['zoom-range'])}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex align-items-revert">
                        <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalUpdateAvatar}>
                            Huỷ
                        </div>
                        <Button variant="primary" className="fz-16" onClick={handleSave}>
                            Xác nhận
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal show={isShowModalLeaveGroup} onHide={handleHideModalLeaveGroup}>
                <Modal.Header>
                    <Modal.Title>
                        <div className="fw-bold">Rời nhóm</div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="fz-16">Bạn có chắc chắn muốn rời nhóm</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="fz-16" variant="warning" onClick={handleHideModalLeaveGroup}>
                        Huỷ
                    </Button>
                    <Button className="fz-16" variant="danger" onClick={handleLeaveGroup}>
                        Rời nhóm
                    </Button>
                </Modal.Footer>
            </Modal>
            <div
                className={clsx(styles['chat-header'], {
                    [[styles['is-focus']]]: isFocus,
                })}
            >
                <div className={clsx(styles['chat-receiver'])}>
                    <div className={clsx(styles['avatar'])}>
                        <img src={group?.avatarUrl || defaultAvatar} />
                    </div>
                    {group?.name && <div className={clsx(styles['name'])}>{`${group?.name}`}</div>}
                    <FontAwesomeIcon
                        ref={btnSettingRef}
                        className={clsx(styles['chat-setting'])}
                        icon={faChevronDown}
                        onClick={handleShowSetting}
                    />
                </div>
                <FontAwesomeIcon
                    icon={faXmark}
                    className={clsx(styles['chat-close'])}
                    onClick={() => handleCloseChatPopup(false)}
                />
                {showSetting && (
                    <div ref={settingMenuRef} className={clsx(styles['setting-wrapper'])}>
                        <Menu ref={menuRef} top={0} left={0} menu={menuItems} />
                    </div>
                )}
            </div>
            <div ref={endOfMessagesRef} className={clsx(styles['chat-container'])}>
                {messages?.length > 0 ? (
                    messages?.map((message, index) => {
                        let minDiff = 0;
                        let isSameDay = true;
                        const latestTime = calculateTime(message?.createdAt);
                        const beforeTime = calculateTime(new Date().toISOString());
                        if (
                            latestTime?.year !== beforeTime?.year ||
                            latestTime?.month !== beforeTime?.month ||
                            latestTime?.day !== beforeTime?.day
                        ) {
                            isSameDay = false;
                        }

                        if (index >= 1) {
                            const date1 = new Date(message?.createdAt);
                            const date2 = new Date(messages[index - 1]?.createdAt);

                            const diff = date1 - date2;
                            minDiff = diff / (1000 * 60);
                        }
                        return (
                            <div className={clsx(styles['chat-item'])} key={`chat-${index}`}>
                                {(index === 0 || minDiff >= 10) && (
                                    <div className="fz-14 text-center mt-4 mb-2">
                                        {latestTime?.hours}:{latestTime?.minutes}{' '}
                                        {!isSameDay && `${latestTime?.day}/${latestTime?.month}`}
                                    </div>
                                )}
                                {message?.senderId !== userInfo?.id &&
                                    messages[index - 1]?.sender !== messages[index]?.sender && (
                                        <div
                                            className={clsx(styles['message-sender-name'], {
                                                ['mt-3']: messages[index - 1]?.sender !== messages[index]?.sender,
                                            })}
                                        >
                                            {message?.senderLastName} {message?.senderFirstName}
                                        </div>
                                    )}
                                <div
                                    className={clsx(styles['message-wrapper'], {
                                        [[styles['message-current-user']]]: message?.sender === userInfo?.id,
                                    })}
                                >
                                    {(messages[index - 1]?.sender !== messages[index]?.sender || minDiff >= 10) &&
                                        message.sender !== userInfo?.id && (
                                            <img
                                                className={clsx(styles['message-avatar'])}
                                                src={message?.senderAvatar || defaultAvatar}
                                            />
                                        )}

                                    {message?.message && (
                                        <div className={clsx(styles['message'])}>{message?.message}</div>
                                    )}
                                    {message?.pictures?.length > 0 &&
                                        message.pictures.map((picture, picIndex) => (
                                            <img
                                                key={`pic-${picIndex}`}
                                                src={picture}
                                                className={clsx(styles['message-picture'])}
                                            />
                                        ))}
                                    {message.symbol > 0 && (
                                        <div>
                                            {message.symbol === 1 && (
                                                <FontAwesomeIcon
                                                    className={clsx(styles['message-symbol'])}
                                                    icon={faThumbsUp}
                                                />
                                            )}
                                        </div>
                                    )}
                                    {processingMessage &&
                                        _.findLast(messages, { sender: userInfo?.id }) &&
                                        _.isEqual(_.findLast(messages, { sender: userInfo?.id }), message) && (
                                            <div className={clsx(styles['process-message'])}>{processingMessage}</div>
                                        )}
                                    <div
                                        className={clsx(styles['expand'], {
                                            [styles['display-my-expand']]: message?.sender === userInfo?.id,
                                        })}
                                    >
                                        <div className={clsx(styles['message-expand'])}>
                                            <svg
                                                viewBox="0 0 20 20"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="xfx01vb x1lliihq x1tzjh5l x1k90msu x2h7rmj x1qfuztq"
                                                style={{ color: '#65676b' }}
                                            >
                                                <path
                                                    d="M6.062 11.548c.596 1.376 2.234 2.453 3.955 2.452 1.694 0 3.327-1.08 3.921-2.452a.75.75 0 1 0-1.376-.596c-.357.825-1.451 1.548-2.545 1.548-1.123 0-2.22-.72-2.579-1.548a.75.75 0 1 0-1.376.596z"
                                                    fillRule="nonzero"
                                                ></path>
                                                <ellipse cx="13.6" cy="6.8" rx="1.2" ry="1.2"></ellipse>
                                                <ellipse cx="6.4" cy="6.8" rx="1.2" ry="1.2"></ellipse>
                                                <ellipse
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    fill="none"
                                                    cx="10"
                                                    cy="10"
                                                    rx="9"
                                                    ry="9"
                                                ></ellipse>
                                            </svg>
                                            <ul
                                                className={clsx(styles['emotion-list'], {
                                                    [[styles['left--9']]]: message?.message?.length < 4,
                                                })}
                                            >
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '0',
                                                        })
                                                    }
                                                >
                                                    <LikeIcon width={20} height={20} />
                                                </li>
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '1',
                                                        })
                                                    }
                                                >
                                                    <LoveIcon width={20} height={20} />
                                                </li>
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '2',
                                                        })
                                                    }
                                                >
                                                    <HaHaIcon width={20} height={20} />
                                                </li>
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '3',
                                                        })
                                                    }
                                                >
                                                    <WowIcon width={20} height={20} />
                                                </li>
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '4',
                                                        })
                                                    }
                                                >
                                                    <SadIcon width={20} height={20} />
                                                </li>
                                                <li
                                                    className={clsx(styles['emotion'])}
                                                    onClick={() =>
                                                        handleEmotionMessage({
                                                            messageId: message?.id,
                                                            emotionType: '5',
                                                        })
                                                    }
                                                >
                                                    <AngryIcon width={20} height={20} />
                                                </li>
                                            </ul>
                                        </div>
                                        <div className={clsx(styles['more-popup'])}>
                                            <svg
                                                viewBox="6 6 24 24"
                                                fill="currentColor"
                                                width="16"
                                                height="16"
                                                className="xfx01vb x1lliihq x1tzjh5l x1k90msu x2h7rmj x1qfuztq"
                                                overflow="visible"
                                                style={{ color: '#65676b' }}
                                            >
                                                <path d="M18 12.5A2.25 2.25 0 1 1 18 8a2.25 2.25 0 0 1 0 4.5zM18 20.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zM15.75 25.75a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0z"></path>
                                            </svg>

                                            <ul
                                                className={clsx(styles['more-popup-list'], {
                                                    [styles['display-my-expand']]: message?.sender === userInfo?.id,
                                                })}
                                            >
                                                <li className={clsx(styles['more-popup-item'])}>Phản hồi</li>
                                                {message?.sender === userInfo?.id && (
                                                    <li
                                                        className={clsx(styles['more-popup-item'])}
                                                        onClick={() => {
                                                            handleUpdateMessage(
                                                                message.id,
                                                                message.sender,
                                                                message.reactionByUser,
                                                            );
                                                        }}
                                                    >
                                                        Chỉnh sửa
                                                    </li>
                                                )}
                                                {message?.sender === userInfo?.id && (
                                                    <li
                                                        className={clsx(styles['more-popup-item'])}
                                                        onClick={() => handleReamoveMessage(message.id, message.sender)}
                                                    >
                                                        Gỡ
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    {message.reactionByUser.length > 0 && (
                                        <div className={clsx(styles['reaction-wrapper'])}>
                                            {message.reactionByUser !== null &&
                                                message.reactionByUser.map((emotion, index) => (
                                                    <Fragment key={index}>
                                                        {emotion.emotionType === 0 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <LikeIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion.emotionType === 1 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <LoveIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion.emotionType === 2 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <HaHaIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion.emotionType === 3 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <WowIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion.emotionType === 4 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <SadIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion.emotionType === 5 && (
                                                            <div
                                                                className={clsx(styles['reaction-message'])}
                                                                onClick={() => {
                                                                    handleReamoveReactionMessage({
                                                                        messageId: message.id,
                                                                        senderReactionId: emotion.userId,
                                                                        reactionId: emotion.reactionId,
                                                                    });
                                                                }}
                                                            >
                                                                <AngryIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {index === messages?.length - 1 && (
                                    <div
                                        className={clsx(styles['time-of-last-message'], {
                                            [[styles['message-of-friend']]]: message?.sender !== userInfo?.id,
                                        })}
                                    >
                                        {latestTime?.hours}:{latestTime?.minutes}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="mt-5 text-center fz-16">Hãy bắt đầu cuộc trò chuyện trong {group?.name}</div>
                )}
                <div></div>
            </div>
            <div className={clsx(styles['chat-footer'])}>
                <div className={clsx(styles['send-message-wrapper'])}>
                    <label htmlFor="chatpopup-attachment">
                        <FontAwesomeIcon className={clsx(styles['send-message-attachment'])} icon={faPaperclip} />
                    </label>
                    <input type="file" id="chatpopup-attachment" multiple hidden onChange={handleChooseFile} />
                    <input
                        value={sendMessage}
                        className={clsx(styles['send-message'])}
                        placeholder="Aa"
                        onChange={(e) => setSendMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage([]);
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={() => handleSendMessage([])}></i>
                    ) : (
                        <FontAwesomeIcon
                            className={clsx(styles['link-icon'])}
                            icon={faThumbsUp}
                            onClick={handleSendSymbol}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatGroupPopup;
