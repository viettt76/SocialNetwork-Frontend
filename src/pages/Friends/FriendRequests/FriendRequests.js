import Friend from '~/components/Friend';
import clsx from 'clsx';
import styles from './FriendRequests.module.scss';
import { useEffect, useState } from 'react';
import {
    acceptFriendshipService,
    getFriendRequestService,
    refuseFriendRequestService,
} from '~/services/relationshipServices';
import { filter } from 'lodash';
import socket from '~/socket';
import { Link } from 'react-router-dom';
import { Actions } from '@cloudinary/url-gen';
import signalRClient from '~/components/Post/signalRClient';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '~/redux/actions';

const FriendRequests = () => {
    const dispatch = useDispatch();

    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        const fetchFriendRequest = async () => {
            try {
                const res = await getFriendRequestService();
                setFriendRequests(res.data);
                console.log('Friend vinh', res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchFriendRequest();
    }, []);

    useEffect(() => {
        handleRefuseFriendRequest();
        signalRClient.on('CancelUser', handleAcceptFriendship);
        // signalRClient.on('cancelFriendRequest', handleCancelFriendRequest);

        return () => {
            signalRClient.off('CancelUser', handleAcceptFriendship);
            // signalRClient.off('cancelFriendRequest', handleCancelFriendRequest);
        };
    }, []);

    const handleAcceptFriendship = async (id) => {
        try {
            await acceptFriendshipService(id);
            setFriendRequests((prev) => {
                const frs = filter(prev, (f) => f.id !== id);
                return frs;
            });
            dispatch(actions.removeNotificationOther(notification));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRefuseFriendRequest = async (senderId) => {
        try {
            await refuseFriendRequestService(senderId);
            setFriendRequests((prev) => {
                const frs = filter(prev, (f) => f.id !== senderId);
                return frs;
            });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="mt-5 text-center fz-16">
            <div className={clsx(styles['nav-link'])}>
                <Link className={clsx(styles['nav-link-item'])} to="/friends">
                    Bạn bè
                </Link>
                <Link className={clsx(styles['nav-link-item'], styles['active'])} to="/friends/requests">
                    Lời mời kết bạn
                </Link>
                <Link className={clsx(styles['nav-link-item'])} to="/friends/sent-requests">
                    Lời mời đã gửi
                </Link>
            </div>
            {friendRequests?.length === 0 ? (
                <div className="w-100">
                    <div>Bạn không có lời mời kết bạn</div>
                </div>
            ) : (
                <div className={clsx(styles['wrapper'])}>
                    <div className={clsx(styles['friends-wrapper'])}>
                        {friendRequests?.map((request) => (
                            <Friend
                                className={clsx(styles['friend-wrapper'])}
                                key={`request-${request?.id}`}
                                type="friend-request"
                                id={request?.id}
                                firstName={request?.firstName}
                                lastName={request?.lastName}
                                avatar={request?.avatarUrl}
                                numberOfCommonFriends={request?.numberOfCommonFriends}
                                handleAcceptFriendship={handleAcceptFriendship}
                                handleRefuseFriendRequest={handleRefuseFriendRequest}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendRequests;
