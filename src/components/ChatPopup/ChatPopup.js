import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faPaperclip,
    faPhone,
    faThumbsUp,
    faVideoCamera,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ChatPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import { getAllMessageService, sendMessageWithFriendService } from '~/services/chatServices';
import _, { set } from 'lodash';
import useClickOutside from '~/hook/useClickOutside';

import { HubConnectionBuilder } from '@microsoft/signalr';
import { calculateTime, uploadToCloudinary } from '~/utils/commonUtils';
import { AngryIcon, HaHaIcon, LikeIcon, LoveIcon, SadIcon, WowIcon } from '~/components/Icons';
import Call from '../Call';

const ChatPopup = ({ friend, index }) => {
    const { ref: chatPopupRef, isComponentVisible: isFocus, setIsComponentVisible: setIsFocus } = useClickOutside(true);

    const userInfo = useSelector(userInfoSelector);

    const dispatch = useDispatch();

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [sendMessage, setSendMessage] = useState('');

    const [symbol, setSymbol] = useState(0);

    const [processingMessage, setProcessingMessage] = useState('');

    const [conn, setConn] = useState('');

    const [connectionChathub, setConnectionChathub] = useState('');

    const [error, setError] = useState('');

    const [isTyping, setIsTyping] = useState(false);

    const [isDisplayTyping, setIsDisPlayTyping] = useState(false);

    const [currentMessageSelect, setcurrentMessageSelect] = useState({});

    const [isCalling, setIsCalling] = useState(false);

    const [isVideoCall, setIsVideoCall] = useState(false);

    let typingTimeout = null;

    useEffect(() => {
        (async () => {
            try {
                var x = (await getAllMessageService(friend?.id)).data;
                const messages = (await getAllMessageService(friend?.id)).data.map((message) => ({
                    id: message.messageID,
                    sender: message.senderID,
                    receiver: message.reciverID,
                    message: message.content,
                    pictures: message.images || [],
                    symbol: message.symbol,
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
    }, [friend]);

    useEffect(() => {
        const connection = new HubConnectionBuilder().withUrl('https://localhost:7072/chatPerson').build();

        const reactionHub = new HubConnectionBuilder().withUrl('https://localhost:7072/reactionMessage').build();

        const startConnection = async () => {
            try {
                await connection.start();

                setConn(connection);

                connection.on('UserNotConnected', (errorMessage) => {
                    setError(errorMessage);
                    console.error('Error received: ', errorMessage);
                });

                connection.on('ReceiveSpecitificMessage', (messageResponse) => {
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
                                    id: messageResponse.messageID,
                                    sender: friend?.id,
                                    receiver: userInfo?.id,
                                    message: messageResponse.content,
                                    pictures: messageResponse.images,
                                    symbol: messageResponse.symbol,
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

    const sendMessageToPerson = async (imagesUrls = []) => {
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
                    reciverId: friend?.id,
                };
                setSendMessage('');

                setMessages((prev) => {
                    return [
                        ...prev,
                        {
                            id: currentMessageSelect.messageId,
                            sender: userInfo?.id,
                            receiver: friend?.id,
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
                            receiver: friend?.id,
                            message,
                            pictures: imagesUrls || [],
                            symbol: symbol,
                            reactionByUser: [],
                        },
                    ];
                });

                setProcessingMessage('Đang xử lý');

                var messageParameter = {
                    reciverID: friend?.id,
                    content: message,
                    images: imagesUrls,
                    symbol: symbol,
                };
                var messageResult = await conn.invoke('SendMessageToPerson', messageParameter);

                setSymbol(0);

                setMessages((prev) => {
                    const index = _.findIndex(prev, { id: null, message });

                    if (index === -1) return prev;

                    const updatedMessages = _.cloneDeep(prev);

                    updatedMessages[index] = {
                        ...updatedMessages[index],
                        id: messageResult.messageID,
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

    const sendReactionMessage = async ({ messageId, emotionType }) => {
        var param = {
            messageId,
            emotionType,
            reciverId: friend?.id,
            senderid: userInfo?.id,
        };
        return await connectionChathub.invoke('AddOrUpdateReactionToMessage', param);
    };

    const handleSendSymbol = async () => {
        try {
            setSymbol(1);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (symbol === 1) {
            sendMessageToPerson([]);
        }
    }, [symbol]);

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(friend?.id));
    }, [friend?.id]);

    useEffect(() => {
        window.onkeydown = (e) => {
            if (isFocus && e.key === 'Escape') {
                handleCloseChatPopup();
            }
        };
    }, [handleCloseChatPopup, isFocus]);

    // useEffect(() => {
    //     () => {return conn.on("ReciverTypingNotification", (isTyping) => {
    //         setIsDisPlayTyping(isTyping);
    //         console.log("User is typing? >>>", isTyping);
    //     })};
    // }, [isTyping]);

    const [showSetting, setShowSetting] = useState(false);
    const handleShowSetting = () => setShowSetting(true);
    const handleHideSetting = () => setShowSetting(false);

    const handleChooseFile = async (e) => {
        const files = Array.from(e.target.files);
        try {
            const imagesUrls = [];
            if (files.length > 0) {
                const uploadedUrls = await Promise.all(files.map((fileUpload) => uploadToCloudinary(fileUpload)));
                imagesUrls.push(...uploadedUrls);
            }
            await sendMessageToPerson(imagesUrls);
            e.target.value = null;
        } catch (error) {
            console.log(error);
        }
    };

    const handlerTyping = async () => {
        if (!isTyping) {
            setIsTyping(true);
            await conn.invoke('OnUserTyping', friend?.id);
        } else {
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(async () => {
                setIsTyping(false);
                await conn.invoke('StoppedUserTyping', friend?.id);
            }, 3000);
        }
    };
    const handleEmotionMessage = async ({ messageId, emotionType }) => {
        var param = {
            messageId,
            emotionType,
            reciverId: friend?.id,
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

    const handleReamoveMessage = async (messageId, senderId) => {
        try {
            if (messageId.trim() && userInfo?.id == senderId) {
                setMessages((prev) => {
                    return prev.filter((message) => message.id !== messageId);
                });

                await conn.invoke('RemoveMessage', messageId, friend?.id);
            }
        } catch (error) {
            console.log(error);
        }
    };

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

    const handCall = async (isVideoCall) => {
        if (!isCalling) {
            setIsVideoCall(isVideoCall);
            setIsCalling(true);
        }
    };

    const endCall = () => {
        setIsCalling(false);
        setIsVideoCall(false);
    };
    return (
        <div
            style={{ right: index === 0 ? '3rem' : '38rem', zIndex: 2 - index }}
            className={clsx(styles['chat-wrapper'])}
            ref={chatPopupRef}
            onClick={() => setIsFocus(true)}
        >
            <div
                className={clsx(styles['chat-header'], {
                    [[styles['is-focus']]]: isFocus,
                })}
            >
                <div className={clsx(styles['chat-receiver'])}>
                    <div
                        className={clsx(styles['avatar'], {
                            [[styles['is-online']]]: friend?.isOnline,
                        })}
                    >
                        <img src={friend?.avatarUrl || defaultAvatar} />
                    </div>
                    {friend?.lastName && friend?.firstName && (
                        <div className={clsx(styles['name'])}>{`${friend?.lastName} ${friend?.firstName}`}</div>
                    )}
                    <FontAwesomeIcon
                        className={clsx(styles['chat-setting'])}
                        icon={faChevronDown}
                        onClick={handleShowSetting}
                    />

                    <div className={clsx(styles['call-wrapper'])}>
                        <FontAwesomeIcon
                            className={clsx(styles['call'])}
                            icon={faPhone}
                            onClick={() => {
                                handCall(false);
                            }}
                        ></FontAwesomeIcon>

                        <FontAwesomeIcon
                            className={clsx(styles['call-video'])}
                            icon={faVideoCamera}
                            onClick={() => {
                                handCall(true);
                            }}
                        ></FontAwesomeIcon>
                    </div>
                </div>
                <FontAwesomeIcon
                    icon={faXmark}
                    className={clsx(styles['chat-close'])}
                    onClick={() => handleCloseChatPopup(false)}
                />
            </div>
            <div ref={endOfMessagesRef} className={clsx(styles['chat-container'])}>
                {messages?.length > 0 ? (
                    <>
                        {messages?.map((message, index) => {
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
                                <div className={clsx(styles['chat-item-wrapper'])} key={`chat-${index}`}>
                                    {(index === 0 || minDiff >= 10) && (
                                        <div className="fz-14 text-center mt-4 mb-2">
                                            {latestTime?.hours}:{latestTime?.minutes}{' '}
                                            {!isSameDay && `${latestTime?.day}/${latestTime?.month}`}
                                        </div>
                                    )}
                                    <div className={clsx(styles['chat-item'])}>
                                        <div
                                            className={clsx(styles['message-wrapper'], {
                                                [[styles['message-current-user']]]: message?.sender === userInfo?.id,
                                            })}
                                        >
                                            {(index === 0 ||
                                                minDiff >= 10 ||
                                                messages[index - 1]?.sender !== message?.sender) &&
                                                message?.sender === friend?.id && (
                                                    <img
                                                        className={clsx(styles['message-avatar'])}
                                                        src={friend?.avatar || defaultAvatar}
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
                                                    <div className={clsx(styles['process-message'])}>
                                                        {processingMessage}
                                                    </div>
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
                                                            [styles['display-my-expand']]:
                                                                message?.sender === userInfo?.id,
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
                                                                onClick={() =>
                                                                    handleReamoveMessage(message.id, message.sender)
                                                                }
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
                                                    [[styles['message-of-friend']]]: message?.sender === friend?.id,
                                                })}
                                            >
                                                {latestTime?.hours}:{latestTime?.minutes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isDisplayTyping && (
                            <div className={clsx(styles['typing-wrapper'])}>
                                <img className={clsx(styles['message-avatar'])} src={friend?.avatar || defaultAvatar} />
                                <div className={clsx(styles['typing-indicator'])}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-5 text-center fz-16">
                        Hãy bắt đầu cuộc trò chuyện với {`${friend?.lastName} ${friend?.firstName}`}
                    </div>
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
                        placeholder="Dien dep trai"
                        onChange={(e) => {
                            setSendMessage(e.target.value);
                            handlerTyping();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendMessageToPerson([]);
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={() => sendMessageToPerson([])}></i>
                    ) : (
                        <FontAwesomeIcon
                            className={clsx(styles['link-icon'])}
                            icon={faThumbsUp}
                            onClick={handleSendSymbol}
                        />
                    )}
                </div>
            </div>
            {isCalling && (
                <Call isCalling={isCalling} endCall={endCall} isVideoCall={isVideoCall} friendId={friend?.id} />
            )}
        </div>
    );
};

export default ChatPopup;
