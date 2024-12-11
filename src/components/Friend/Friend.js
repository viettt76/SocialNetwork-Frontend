import clsx from 'clsx';
import styles from './Friend.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch } from 'react-redux';
import * as actions from '~/redux/actions';
import { Link } from 'react-router-dom';

const Friend = ({
    className,
    type,
    id,
    firstName = '',
    lastName = '',
    avatar,
    numberOfCommonFriends = 0,
    handleSendFriendRequest,
    handleRefuseFriendRequest,
    handleAcceptFriendship,
    handleShowModalUnfriend,
    handleCancelFriendRequest,
}) => {
    const dispatch = useDispatch();

    const handleOpenChat = () => {
        dispatch(
            actions.openChat({
                id,
                firstName,
                lastName,
                avatar,
            }),
        );
    };

    return (
        <div className={clsx(styles['friend-wrapper'], className)}>
            <Link to={`/profile/${id}`}>
                <img className={clsx(styles['friend-avatar'])} src={avatar || defaultAvatar} />
            </Link>
            <div className={clsx(styles['friend-detail'])}>
                <Link to={`/profile/${id}`}>
                    <div className={clsx(styles['friend-name'])}>{`${lastName} ${firstName}`}</div>
                </Link>
                {numberOfCommonFriends > 0 && (
                    <div className={clsx(styles['mutual-friends'])}>{numberOfCommonFriends} bạn chung</div>
                )}
                {type === 'friend' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={handleOpenChat}>
                            Nhắn tin
                        </button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleShowModalUnfriend(id, firstName, lastName)}
                        >
                            Huỷ kết bạn
                        </button>
                    </div>
                )}
                {type === 'friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleAcceptFriendship(id)}>
                            Chấp nhận
                        </button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleRefuseFriendRequest(id)}
                        >
                            Từ chối
                        </button>
                    </div>
                )}
                {type === 'friend-suggestion' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleSendFriendRequest(id)}>
                            Thêm bạn bè
                        </button>
                    </div>
                )}
                {type === 'sent-friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleCancelFriendRequest(id)}
                        >
                            Thu hồi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friend;
