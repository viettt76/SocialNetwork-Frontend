import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import clsx from 'clsx';
import styles from './Header.module.scss';
import useClickOutside from '~/hook/useClickOutside';
import Messenger from '~/components/Messenger';
import { BellIcon, MessengerIcon } from '~/components/Icons';
import {
    getNotificationsService,
    readMenuNotificationMessengerService,
    readMenuNotificationOtherService,
} from '~/services/userServices';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '~/redux/actions';
import { notificationsMessengerSelector, notificationsOtherSelector } from '~/redux/selectors';
import Notification from '~/components/Notification';

const Header = ({ notificationConnection }) => {
    const dispatch = useDispatch();
    const notificationsMessenger = useSelector(notificationsMessengerSelector);
    const notificationsOther = useSelector(notificationsOtherSelector);
    const [notifications, setNotifications] = useState(0);

    const messengerIconRef = useRef(null);
    const {
        ref: messengerRef,
        isComponentVisible: showMessenger,
        setIsComponentVisible: setShowMessenger,
    } = useClickOutside(false, messengerIconRef);

    const notificationIconRef = useRef(null);
    const {
        ref: notificationRef,
        isComponentVisible: showNotification,
        setIsComponentVisible: setShowNotification,
    } = useClickOutside(false, notificationIconRef);

    useEffect(() => {
        const initialNotificationMessage = async () => {
            var totalNotification = (await getNotificationsService()).data;
            totalNotification.map((noti) => {
                dispatch(
                    actions.addNotificationMessenger({
                        id: noti.id,
                        senderId: noti.senderId,
                        type: noti.type,
                        isRead: noti.isRead,
                    }),
                );
            });
        };

        initialNotificationMessage();
    }, []);

    useEffect(() => {
        if (!notificationConnection) return;
        notificationConnection.on('ReceiveNotification', (notification) => {
            dispatch(
                actions.addNotificationMessenger({
                    id: notification.id,
                    senderId: notification.senderId,
                    type: notification.type,
                    isRead: false,
                }),
            );
        });

        notificationConnection.on('ReadMessageNotificationEvent', (notification) => {
            dispatch(actions.readMessage(notification.id));
        });

        return () => {
            if (notificationConnection) {
                notificationConnection.off('ReceiveNotification');
            }
        };
    }, [notificationConnection]);
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const res = await getNotificationsService();
    //             if (res?.messenger?.length > 0) {
    //                 res.messenger.map((noti) => {
    //                     dispatch(actions.addNotificationMessenger(noti));
    //                 });
    //             }
    //             if (res?.other?.length > 0) {
    //                 res.other.map((noti) => {
    //                     dispatch(actions.addNotificationOther(noti));
    //                 });
    //             }
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })();

    //     const handleNewNotificationMessenger = ({ notification: newNotificationMessenger }) => {
    //         dispatch(actions.addNotificationMessenger(newNotificationMessenger));
    //     };

    //     const handleNotificationNewFriendRequest = (notificationFriendRequest) => {
    //         dispatch(actions.addNotificationOther(notificationFriendRequest));
    //     };

    //     // socket.on('newMessage', handleNewNotificationMessenger);
    //     // socket.on('notificationNewFriendRequest', handleNotificationNewFriendRequest);

    //     return () => {
    //         // socket.off('newMessage', handleNewNotificationMessenger);
    //         // socket.off('notificationNewFriendRequest', handleNotificationNewFriendRequest);
    //     };
    // }, []);

    const handleShowMessenger = async () => {
        try {
            // await readMenuNotificationMessengerService();
            // dispatch(actions.readNotificationMessenger());
            setShowMessenger(!showMessenger);
        } catch (error) {
            console.log(error);
        }
    };

    const handleShowNotification = async () => {
        try {
            // await readMenuNotificationOtherService();
            setShowNotification(!showNotification);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx('d-flex justify-content-end', styles['header'])}>
            <div className="d-flex">
                <div>
                    <div
                        ref={messengerIconRef}
                        className={clsx(
                            'd-flex justify-content-center align-items-center fz-16',
                            styles['action-user'],
                        )}
                        data-tooltip-id="tool-tip-message"
                        onClick={handleShowMessenger}
                    >
                        <MessengerIcon className={clsx(styles['action-user-icon'])} />
                        {notificationsMessenger?.reduce((acc, noti) => acc + (noti?.isRead ? 0 : 1), 0) > 0 && (
                            <div className={clsx(styles['number-of-notifications'])}>
                                {notificationsMessenger?.reduce((acc, noti) => acc + (noti?.isRead ? 0 : 1), 0)}
                            </div>
                        )}
                        <ReactTooltip id="tool-tip-message" place="bottom" content="Tin nhắn" />
                    </div>
                    <Messenger
                        messengerRef={messengerRef}
                        showMessenger={showMessenger}
                        setShowMessenger={setShowMessenger}
                        notificationConnection={notificationConnection}
                    />
                </div>

                <div>
                    <div
                        ref={notificationIconRef}
                        onClick={handleShowNotification}
                        className={clsx(
                            'd-flex justify-content-center align-items-center fz-16',
                            styles['action-user'],
                        )}
                        data-tooltip-id="tool-tip-notification"
                    >
                        <BellIcon className={clsx(styles['action-user-icon'])} />
                        {notificationsOther?.reduce((acc, noti) => (acc + noti?.isOpenMenu ? 0 : 1), 0) > 0 && (
                            <div className={clsx(styles['number-of-notifications'])}>
                                {notificationsOther?.reduce((acc, noti) => (acc + noti?.isOpenMenu ? 0 : 1), 0)}
                            </div>
                        )}
                        <ReactTooltip className="fz-16" id="tool-tip-notification" place="bottom" content="Thông báo" />
                    </div>
                    <Notification
                        notificationRef={notificationRef}
                        showNotification={showNotification}
                        setShowNotification={setShowNotification}
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
