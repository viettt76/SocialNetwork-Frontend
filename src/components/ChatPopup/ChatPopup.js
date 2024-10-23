import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons';
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

const ChatPopup = ({ friend }) => {
    const { ref: chatPopupRef, isComponentVisible: isFocus, setIsComponentVisible: setIsFocus } = useClickOutside(true);

    const userInfo = useSelector(userInfoSelector);

    const dispatch = useDispatch();

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            symbol: 'like',
        },
    ]);

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
        debugger;
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

    return (
        <div className={clsx(styles['chat-wrapper'])} ref={chatPopupRef} onClick={() => setIsFocus(true)}>
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
                            <div
                                key={`chat-${index}`}
                                className={clsx(styles['message-wrapper'], {
                                    [[styles['message-current-user']]]: message?.sender === userInfo?.id,
                                })}
                            >
                                {messages[index - 1]?.sender !== message?.sender && message?.sender === friend?.id && (
                                    <img
                                        className={clsx(styles['message-avatar'])}
                                        src={friend?.avatar || defaultAvatar}
                                    />
                                )}
                                {message?.message && <div className={clsx(styles['message'])}>{message?.message}</div>}
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
                                        <div className={clsx(styles['process-message'])}>{processingMessage}</div>
                                    )}
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
