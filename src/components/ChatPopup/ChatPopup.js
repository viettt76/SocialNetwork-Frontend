import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPaperclip, faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import { getAllMessageService, sendMessageWithFriendService } from '~/services/chatServices';
import socket from '~/socket';
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';

import { HubConnectionBuilder } from '@microsoft/signalr';
import { uploadToCloudinary } from '~/utils/commonUtils';
import { AngryIcon, HaHaIcon, LikeIcon, LoveIcon, SadIcon, WowIcon } from '~/components/Icons';

const ChatPopup = ({ friend }) => {
    const { ref: chatPopupRef, isComponentVisible: isFocus, setIsComponentVisible: setIsFocus } = useClickOutside(true);

    const userInfo = useSelector(userInfoSelector);

    const dispatch = useDispatch();

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [sendMessage, setSendMessage] = useState('');
    const [symbol, setSymbol] = useState(0);

    const [processingMessage, setProcessingMessage] = useState('');

    const [conn, setConn] = useState('');

    const [error, setError] = useState('');
    useEffect(() => {
        (async () => {
            try {
                const messages = (await getAllMessageService(friend?.id)).data.map((message) => ({
                    id: message.messageID,
                    sender: message.senderID,
                    receiver: message.receiverID,
                    message: message.content,
                }));

                setMessages(messages);
            } catch (error) {
                console.log(error);
            }
        })();
    }, [friend]);

    useEffect(() => {
        const connection = new HubConnectionBuilder().withUrl('https://localhost:7072/chatPerson').build();
        // Mở kết nối
        const startConnection = async () => {
            try {
                await connection.start();

                setConn(connection);

                connection.on('UserNotConnected', (errorMessage) => {
                    setError(errorMessage);
                    console.error('Error received: ', errorMessage);
                });

                connection.on('ReceiveSpecitificMessage', (messageID, message, sendDate) => {
                    setMessages((prev) => {
                        return [
                            ...prev,
                            {
                                id: messageID,
                                sender: friend?.id,
                                receiver: userInfo?.id,
                                message,
                            },
                        ];
                    });

                    console.log(`${sender} has send ${message}`);
                });
            } catch (error) {
                console.error('Error establishing connection:', error);
            }
        };

        startConnection();

        return () => {
            if (connection) {
                connection.stop();
                console.log('Connection closed');
            }
        };
    }, []);

    const sendMessageToPerson = async () => {
        console.log('Start chat >>>>>>');
        try {
            if (symbol === 0 && !sendMessage.trim()) return;
            const message = sendMessage;

            setSendMessage('');

            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        id: null,
                        sender: userInfo?.id,
                        receiver: friend?.id,
                        message,
                    },
                ];
            });

            setProcessingMessage('Đang xử lý');

            var messageId = await conn.invoke('SendMessageToPerson', friend?.id, message, 0);

            console.log('MessageId: ', messageId);

            setMessages((prev) => {
                const index = _.findIndex(prev, { id: null, message });

                if (index === -1) return prev;

                const updatedMessages = _.cloneDeep(prev);

                updatedMessages[index] = { ...updatedMessages[index], id: messageId };

                return updatedMessages;
            });

            setProcessingMessage('');

            console.log(`Sending message to ${friend?.id}: ${message}`);
        } catch (e) {
            console.log(e.message);
        }
    };

    const handleSendSymbol = async () => {
        try {
            setSymbol(1);
            await sendMessageToPerson();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(friend?.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friend?.id]);

    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            if (newMessage.receiver === userInfo?.id) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: newMessage?.id,
                        sender: newMessage?.sender,
                        message: newMessage?.message,
                    },
                ]);
            }
        };
        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [userInfo?.id]);

    useEffect(() => {
        window.onkeydown = (e) => {
            if (isFocus && e.key === 'Escape') {
                handleCloseChatPopup();
            }
        };
    }, [handleCloseChatPopup, isFocus]);

    const [showSetting, setShowSetting] = useState(false);
    const handleShowSetting = () => setShowSetting(true);
    const handleHideSetting = () => setShowSetting(false);

    const handleChooseFile = async (e) => {
        const files = Array.from(e.target.files);

        try {
            const imagesUrl = [];
            if (files.length > 0) {
                const uploadedUrls = await Promise.all(files.map((fileUpload) => uploadToCloudinary(fileUpload)));
                imagesUrl.push(...uploadedUrls);
            }

            imagesUrl?.map(async (imageUrl) => {
                await sendMessageWithFriendService({ friendId: friend?.id, file: imageUrl });
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleEmotionMessage = async ({ messageId, emotionType }) => {
        try {
            await emotionMessageService({ messageId, emotionType });
        } catch (error) {
            console.log(error);
        }
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
                    messages?.map((message, index) => {
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
                                        {message?.picture && (
                                            <img src={message?.picture} className={clsx(styles['message-picture'])} />
                                        )}
                                        {message.symbol && (
                                            <div>
                                                {message.symbol === 'like' && (
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
                                                            emotionType: 'like',
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
                                                            emotionType: 'love',
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
                                                            emotionType: 'haha',
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
                                                            emotionType: 'wow',
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
                                                            emotionType: 'sad',
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
                                                            emotionType: 'angry',
                                                        })
                                                    }
                                                >
                                                    <AngryIcon width={20} height={20} />
                                                </li>
                                            </ul>
                                        </div>
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
                    })
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
                        onChange={(e) => setSendMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                sendMessageToPerson();
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={sendMessageToPerson}></i>
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
