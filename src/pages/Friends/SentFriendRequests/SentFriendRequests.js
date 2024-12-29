import Friend from '~/components/Friend';
import clsx from 'clsx';
import styles from './SentFriendRequests.module.scss';
import { useEffect, useState } from 'react';
import { getSentFriendRequestsService, cancelFriendRequestService } from '~/services/relationshipServices';
import { filter } from 'lodash';
import socket from '~/socket';
import { Link } from 'react-router-dom';

const SentFriendRequests = () => {
    const [sentFriendRequests, setSentFriendRequests] = useState([]);

    useEffect(() => {
        const fetchSentFriendRequests = async () => {
            try {
                const res = await getSentFriendRequestsService();
                setSentFriendRequests(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchSentFriendRequests();
    }, []);

    useEffect(() => {
        socket.on('CancelUser', handleCancelFriendRequest);

        return () => {
            socket.off('CancelUser', handleCancelFriendRequest);
        };
    }, []);

    const handleCancelFriendRequest = async (receiverId) => {
        try {
            await cancelFriendRequestService(receiverId);
            setSentFriendRequests((prev) => {
                const frs = filter(prev, (f) => f.id !== receiverId);
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
                <Link className={clsx(styles['nav-link-item'])} to="/friends/requests">
                    Lời mời kết bạn
                </Link>
                <Link className={clsx(styles['nav-link-item'], styles['active'])} to="/friends/sent-requests">
                    Lời mời đã gửi
                </Link>
            </div>
            {sentFriendRequests?.length === 0 ? (
                <div className="w-100">
                    <div>Bạn chưa gửi lời mời kết bạn nào</div>
                </div>
            ) : (
                <div className={clsx(styles['wrapper'])}>
                    <div className={clsx(styles['friends-wrapper'])}>
                        {sentFriendRequests?.map((request) => (
                            <Friend
                                className={clsx(styles['friend-wrapper'])}
                                key={`request-${request?.id}`}
                                type="sent-friend-request"
                                id={request?.id}
                                firstName={request?.firstName}
                                lastName={request?.lastName}
                                avatar={request?.avatarUrl}
                                numberOfCommonFriends={request?.numberOfCommonFriends}
                                handleCancelFriendRequest={handleCancelFriendRequest}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SentFriendRequests;
