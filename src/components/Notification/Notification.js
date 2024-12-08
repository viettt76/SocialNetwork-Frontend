import clsx from 'clsx';
import styles from './Notification.module.scss';
import { useEffect, useState } from 'react';
import { getNotificationsService, getNotificationsTypeService } from '~/services/userServices';
import { useDispatch, useSelector } from 'react-redux';
import { notificationsOtherSelector } from '~/redux/selectors';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { Button } from 'react-bootstrap';
import { timeDifferenceFromNow } from '~/utils/commonUtils';
import { Link } from 'react-router-dom';
import { acceptFriendshipService, refuseFriendRequestService } from '~/services/relationshipServices';
import * as actions from '~/redux/actions';
import signalRClient from '../Post/signalRClient';

const Notification = ({ notificationRef, showNotification, setShowNotification }) => {
    const dispatch = useDispatch();
    const notificationsOther = useSelector(notificationsOtherSelector);
    const [notificationsType, setNotificationsType] = useState([]);
    console.log('notificationsOther ', notificationsOther);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const res = await getNotificationsService();

                if (res.data && Array.isArray(res.data)) {
                    dispatch(actions.setNotificationsOther(res.data));
                }
                // console.log('Notifications loaded:', res.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotification();

        // const handleRealtimeNotification = (notification) => {
        //     console.log('Realtime Notification Received:', notification);

        //     dispatch(actions.addNotificationOther(notification));
        // };

        signalRClient.on('ReceiveNotification', fetchNotification());

        return () => {
            signalRClient.off('ReceiveNotification', fetchNotification());
        };
    }, [dispatch]);

    // const handleAcceptFriendship = async ({ notificationId, senderId }) => {
    //     try {
    //         await acceptFriendshipService(senderId);
    //         dispatch(actions.removeNotificationOther(notificationId));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // const handleRefuseFriendRequest = async ({ notificationId, senderId }) => {
    //     try {
    //         await refuseFriendRequestService(senderId);
    //         dispatch(actions.removeNotificationOther(notificationId));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    return (
        <div
            ref={notificationRef}
            className={clsx(styles['notification-wrapper'], {
                [styles['show-notification']]: showNotification,
            })}
        >
            {notificationsOther?.length > 0 ? (
                notificationsOther?.map((notification) => {
                    return (
                        <div key={`notification-${notification?.id}`} className={clsx(styles['notification-item'])}>
                            <Link to={`/profile/${notification?.senderId}`}>
                                <img
                                    className={clsx(styles['notification-avatar'])}
                                    src={notification?.senderAvatar || defaultAvatar}
                                />
                            </Link>
                            <div className={clsx(styles['notification-content-time'])}>
                                <div
                                    className={clsx(styles['notification-content'])}
                                    dangerouslySetInnerHTML={{ __html: notification?.content }}
                                ></div>
                                <div className={clsx(styles['notification-time'])}>
                                    {timeDifferenceFromNow(notification?.createdAt)}
                                </div>
                                {notification?.type ===
                                    notificationsType?.find((type) => type?.name === 'friend request')?.id && (
                                    <div className="mt-2">
                                        <Button
                                            className="fz-16 me-3"
                                            size="lg"
                                            variant="primary"
                                            onClick={() =>
                                                handleAcceptFriendship({
                                                    notificationId: notification?.id,
                                                    senderId: notification?.senderId,
                                                })
                                            }
                                        >
                                            Xác nhận
                                        </Button>
                                        <Button
                                            className="fz-16"
                                            size="lg"
                                            variant="light"
                                            onClick={() =>
                                                handleRefuseFriendRequest({
                                                    notificationId: notification?.id,
                                                    senderId: notification?.senderId,
                                                })
                                            }
                                        >
                                            Xoá
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="fz-16 text-center pt-3 pb-3">Bạn không có thông báo nào</div>
            )}
        </div>
    );
};

export default Notification;
