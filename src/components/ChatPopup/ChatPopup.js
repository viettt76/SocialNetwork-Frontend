import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPaperclip, faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import { getAllMessageService, sendMessageWithFriendService } from '~/services/chatServices';
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';

import { HubConnectionBuilder } from '@microsoft/signalr';
import { calculateTime, uploadToCloudinary } from '~/utils/commonUtils';
import { AngryIcon, HaHaIcon, LikeIcon, LoveIcon, SadIcon, WowIcon } from '~/components/Icons';

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

    const [currentEmotionType, setCurrentEmotionType] = useState('');

    let typingTimeout = null;

    useEffect(() => {
        (async () => {
            try {
                const messages = (await getAllMessageService(friend?.id)).data.map((message) => ({
                    id: message.messageID,
                    sender: message.senderID,
                    receiver: message.reciverID,
                    message: message.content,
                    pictures: message.images || [],
                    symbol: message.symbol,
                    emotionType: message.emotionType === null ? null : message.emotionType.map((item) => Number(item)),
                }));
                console.log(messages);
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
                    debugger;
                    setMessages((prev) => {
                        return [
                            ...prev,
                            {
                                id: messageResponse.messageID,
                                sender: friend?.id,
                                receiver: userInfo?.id,
                                message: messageResponse.content,
                                pictures: messageResponse.images,
                                sendDate: messageResponse.sendDate,
                                symbol: messageResponse.symbol,
                                emotionType: Number(messageResponse.emotionType),
                            },
                        ];
                    });

                    connection.on('ReciverTypingNotification', (isTyping) => {
                        setIsDisPlayTyping(isTyping);
                        console.log('User is typing? >>>', isTyping);
                    });
                    console.log(`${sender} has send ${message}`);
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
                console.log('Recviver ReactionMessage', reactionMessageResponse);
                setMessages((prev) => {
                    return prev.map((message) =>
                        message.id === reactionMessageResponse.messageId
                            ? {
                                  ...message,
                                  emotionType: message.emotionType
                                      ? [...message.emotionType, Number(reactionMessageResponse.emotionType)]
                                      : [Number(reactionMessageResponse.emotionType)],
                              }
                            : message,
                    );
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
            var messageId = await conn.invoke('SendMessageToPerson', messageParameter);

            setSymbol(0);
            console.log('MessageId: ', messageId);

            setMessages((prev) => {
                const index = _.findIndex(prev, { id: null, message });

                if (index === -1) return prev;

                const updatedMessages = _.cloneDeep(prev);

                updatedMessages[index] = { ...updatedMessages[index], id: messageId };

                return updatedMessages;
            });

            setProcessingMessage('');
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
        await connectionChathub.invoke('AddOrUpdateReactionToMessage', param);
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
        console.log(files);
        try {
            const imagesUrls = [];
            if (files.length > 0) {
                const uploadedUrls = await Promise.all(files.map((fileUpload) => uploadToCloudinary(fileUpload)));
                imagesUrls.push(...uploadedUrls);
                console.log(imagesUrls);
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
        try {
            // setCurrentEmotionType(emotionType);
            setMessages((prev) => {
                return prev.map((message) =>
                    message.id === messageId
                        ? {
                              ...message,
                              emotionType:
                                  message.senderID === userInfo.id && message.emotionType
                                      ? [...message.emotionType, emotionType]
                                      : [emotionType],
                          }
                        : message,
                );
            });
            await sendReactionMessage({ messageId, emotionType });
        } catch (error) {
            console.log(error);
        }
    };

    console.log(messages);
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
                        <img src={friend?.avatar || defaultAvatar} />
                    </div>
                    {friend?.lastName && friend?.firstName && (
                        <div className={clsx(styles['name'])}>{`${friend?.lastName} ${friend?.firstName}`}</div>
                    )}
                    <FontAwesomeIcon
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
                                            {message.emotionType !== null &&
                                                message.emotionType.map((emotion, index) => (
                                                    <Fragment key={index}>
                                                        {emotion === 0 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <LikeIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion === 1 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <LoveIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion === 2 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <HaHaIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion === 3 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <WowIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion === 4 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <SadIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                        {emotion === 5 && (
                                                            <div className={clsx(styles['reaction-message'])}>
                                                                <AngryIcon width={16} height={16} />
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                ))}

                                            {message.emotionType === 0 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <LikeIcon width={16} height={16} />
                                                </div>
                                            )}

                                            {message.emotionType === 1 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <LoveIcon width={16} height={16} />
                                                </div>
                                            )}

                                            {message.emotionType === 2 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <HaHaIcon width={16} height={16} />
                                                </div>
                                            )}

                                            {message.emotionType === 3 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <WowIcon width={16} height={16} />
                                                </div>
                                            )}

                                            {message.emotionType === 4 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <SadIcon width={16} height={16} />
                                                </div>
                                            )}

                                            {message.emotionType === 5 && (
                                                <div className={clsx(styles['reaction-message'])}>
                                                    <AngryIcon width={16} height={16} />
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
                        placeholder="Aa"
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
        </div>
    );
};

export default ChatPopup;
