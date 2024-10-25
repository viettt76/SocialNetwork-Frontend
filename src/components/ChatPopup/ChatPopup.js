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
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';

import { HubConnectionBuilder } from '@microsoft/signalr';
import { uploadToCloudinary } from '~/utils/commonUtils';

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

    const [isTyping, setIsTyping] = useState(false);

    const [isDisplayTyping, setIsDisPlayTyping] = useState(false);

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
                }));

                setMessages(messages);
            } catch (error) {
                console.log(error);
            }
        })();
    }, [friend]);
    useEffect(() => {
        const connection = new HubConnectionBuilder().withUrl('https://localhost:7072/chatPerson').build();
        const startConnection = async () => {
            try {
                await connection.start();

                setConn(connection);

                connection.on('UserNotConnected', (errorMessage) => {
                    setError(errorMessage);
                    console.error('Error received: ', errorMessage);
                });

                connection.on('ReceiveSpecitificMessage', (messageResponse) => {
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
                                symbol: messageResponse.symbol
                            },
                        ];
                    });
                    connection.on("ReciverTypingNotification", (isTyping) => {
                        setIsDisPlayTyping(isTyping);
                        console.log("User is typing? >>>", isTyping);
                    })
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

        const sendMessageToPerson = async (imagesUrls = []) => {
            try {
                if (symbol === 0 && !sendMessage.trim() && imagesUrls.length === 0) return;
                let message = sendMessage;

                if(imagesUrls.length > 0) {
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
                        },
                    ];
                });

            setProcessingMessage('Đang xử lý');
            
            var messageParameter = {
                reciverID: friend?.id,
                content: message,
                images: imagesUrls,
                symbol: symbol,
            }
            var messageId = await conn.invoke('SendMessageToPerson', messageParameter);

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

    const handlerTyping = async() => {
        if(!isTyping){
            setIsTyping(true);
            await conn.invoke("OnUserTyping", friend?.id);
        }
        else{
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(async() => {
                setIsTyping(false);
                await conn.invoke("StoppedUserTyping", friend?.id);
            }, 3000);
        }
    };

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
    <>
        {messages?.map((message, index) => {
            return (
                <div
                    key={`chat-${index}`}
                    className={clsx(styles['message-wrapper'], {
                        [styles['message-current-user']]: message?.sender === userInfo?.id,
                    })}
                >
                    {messages[index - 1]?.sender !== message?.sender && message?.sender === friend?.id && (
                        <img
                            className={clsx(styles['message-avatar'])}
                            src={friend?.avatar || defaultAvatar}
                        />
                    )}
                    {message?.message && <div className={clsx(styles['message'])}>{message?.message}</div>}
                    {message?.pictures?.length > 0 &&
                        message.pictures.map((picture, picIndex) => (
                            <img
                                key={`pic-${picIndex}`}
                                src={picture}
                                className={clsx(styles['message-picture'])}
                            />
                        ))
                    }
                    {message.symbol > 0 && (
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
                        )
                    }
                </div>
            );
        })}
        {isDisplayTyping && (
            <div className={clsx(styles['typing-wrapper'])}>
                <img
                    className={clsx(styles['message-avatar'])}
                    src={friend?.avatar || defaultAvatar}
                />
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
