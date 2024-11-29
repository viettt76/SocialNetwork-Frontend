import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
import { ArrowIcon } from '../Icons';
import { Button, Modal } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import { calculateTime, getCroppedImg, uploadToCloudinary } from '~/utils/commonUtils';

const GroupMembersLayout = ({ groupId }) => {
    const [groupMembers, setGroupMembers] = useState([]);
    const [pageIndexValue, setpageIndexValue] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
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
    useEffect(() => {
        let isMounted = true;

        // const fetchGroupMembers = async () => {
        //     try {
        //         const res = await getGroupMembersService(groupId);
        //         if (isMounted) {
        //             setGroupMembers(res);
        //         }
        //     } catch (error) {
        //         if (isMounted) {
        //             console.log(error);
        //         }
        //     }
        // };

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
                            to={`/profile/${member?.memberId}`}
                            className={clsx(styles['group-member-item-wrapper'])}
                            key={`member-${member?.memberId}`}
                        >
                            <img
                                className={clsx(styles['group-member-item-avatar'])}
                                src={member?.user?.avatar || defaultAvatar}
                                alt={`${member?.user?.lastName} ${member?.user?.firstName}`}
                            />
                            <div className={clsx(styles['group-member-item-name'])}>
                                {member?.user?.lastName} {member?.user?.firstName}
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

    useEffect(() => {
        let isMounted = true;

        // const fetchGroupMembers = async () => {
        //     try {
        //         const res = await getGroupMembersService(groupId);
        //         if (isMounted) {
        //             setGroupMembers(res);
        //         }
        //     } catch (error) {
        //         if (isMounted) {
        //             console.log(error);
        //         }
        //     }
        // };

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
            (friend) => !groupMembers.some((member) => member?.memberId === friend?.id),
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
                            htmlFor={`group-member-item-checkbox-${friend?.id}`}
                            className={clsx(styles['group-member-item-wrapper'])}
                            key={`member-${friend?.id}`}
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
                                    id={`group-member-item-checkbox-${friend?.id}`}
                                    value={friend?.id}
                                    type="checkbox"
                                    onChange={(e) => {
                                        setAddGroupMembers((prev) => [...prev, e.target.value]);
                                    }}
                                />
                                <label htmlFor={`group-member-item-checkbox-${friend?.id}`}></label>
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
        socket.emit('joinGroupChat', group?.id);
    }, [group?.id]);

    useEffect(() => {
        const handleNewGroupChatMessage = (newGroupChatMessage) => {
            setMessages((prev) => [...prev, newGroupChatMessage]);
        };
        socket.on('newGroupChatMessage', handleNewGroupChatMessage);

        return () => {
            socket.off('newGroupChatMessage', handleNewGroupChatMessage);
        };
    }, [userInfo?.id]);

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [sendMessage, setSendMessage] = useState('');
    const [processingMessage, setProcessingMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (group?.id) {
                    const res = await getMessagesOfGroupChatService(group?.id);
                    setMessages(res);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [group]);

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(group?.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group?.id]);

    const handleSendMessage = async () => {
        try {
            if (sendMessage.trim() === '') return;

            const clone = sendMessage.trim();
            setMessages((prev) => [
                ...prev,
                {
                    id: null,
                    sender: userInfo?.id,
                    message: clone,
                    createdAt: new Date().toISOString(),
                },
            ]);
            setSendMessage('');
            setProcessingMessage('Đang xử lý');

            const res = await sendGroupChatMessageService({ groupChatId: group?.id, message: clone });
            setMessages((prev) => {
                const index = _.findIndex(prev, { id: null, message: clone });

                if (index === -1) return prev;

                const updatedMessages = _.cloneDeep(prev);
                updatedMessages[index] = { ...updatedMessages[index], id: res?.id };

                return updatedMessages;
            });

            setProcessingMessage('');
        } catch (error) {
            console.log(error);
            setProcessingMessage('Lỗi');
        }
    };

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

    const handleChooseFile = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (s) => {
                setUpdateAvatar(s.target.result);
                setShowModalUpdateAvatar(true);
            };

            reader.readAsDataURL(file);
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
                                    onChange={handleChooseFile}
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
        // {
        //     id: 'addGroupMembers',
        //     back: 'main',
        //     leftIcon: <ArrowIcon />,
        //     depthLevel: 2,
        //     menu: [
        //         {
        //             label: <AddGroupMembersLayout groupId={group?.id} handleSetActiveMenu={handleSetActiveMenu} />,
        //             className: clsx(styles['hover-not-background']),
        //         },
        //     ],
        // },
    ];

    const menuRef = useRef(null);

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

                                    <div className={clsx(styles['message'])}>{message?.message}</div>
                                    {processingMessage &&
                                        _.findLast(messages, { sender: userInfo?.id }) &&
                                        _.isEqual(_.findLast(messages, { sender: userInfo?.id }), message) && (
                                            <div className={clsx(styles['process-message'])}>{processingMessage}</div>
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
                    <input
                        value={sendMessage}
                        className={clsx(styles['send-message'])}
                        placeholder="Aa"
                        onChange={(e) => setSendMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={handleSendMessage}></i>
                    ) : (
                        <FontAwesomeIcon className={clsx(styles['link-icon'])} icon={faThumbsUp} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatGroupPopup;
