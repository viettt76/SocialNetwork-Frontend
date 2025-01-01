import clsx from 'clsx';
import styles from './SearchInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { getSearchUserService } from '~/services/userServices';
import useDebounced from '~/hook/useDebounced';
import {
    cancelFriendRequestService,
    refuseFriendRequestService,
    sendFriendRequestService,
    unfriendService,
} from '~/services/relationshipServices';
import signalRClient from '../Post/signalRClient';

const SearchInput = () => {
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const keywordDebounced = useDebounced(keyword, 300);

    useEffect(() => {
        if (keywordDebounced.trim() !== '') {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const searchQuery = {
                        keyWord: keywordDebounced,
                        PageIndex: pageIndex,
                        PageSize: 10,
                    };

                    const response = await getSearchUserService(searchQuery);

                    setUsers(response.data.data);
                    setTotalCount(response.data.totalCount);
                } catch (error) {
                    console.error('Error fetching users:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUsers();
            signalRClient.on('CancelUser', fetchUsers);
        } else {
            signalRClient.on('seedSearUser', (users) => {
                setUsers(users);
            });
            setUsers([]);
        }
    }, [keywordDebounced, pageIndex]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPageIndex(1);
    };

    const handleSendFriendRequest = async (friendId) => {
        try {
            await sendFriendRequestService(friendId);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnfriend = async (friendId) => {
        try {
            await unfriendService(friendId);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['search-container'])}>
            <div className={clsx(styles['search-wrapper'])}>
                <div className={clsx(styles['search-bar'])}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input placeholder="Tìm kiếm" type="text" value={keyword} onChange={handleSearch} />
                </div>
                {users?.length > 0 && <div className={clsx(styles['suggestions'])}>Danh sách tìm kiếm</div>}
                {users?.map((user) => {
                    return (
                        <div className={clsx(styles['user'])}>
                            <div className={clsx(styles['user-info'])}>
                                <img
                                    alt="Profile picture of liverpool_fc_fanatics_"
                                    height="40"
                                    src={user?.avatarUrl}
                                    width="40"
                                />
                                <div>
                                    <div className={clsx(styles['name'])}>
                                        {user?.lastName} {user?.firstName}
                                    </div>
                                </div>
                            </div>
                            {!user.isRelationShip ? (
                                <button
                                    className={clsx(styles['follow-btn'])}
                                    onClick={() => handleSendFriendRequest(user?.id)}
                                >
                                    Thêm bạn
                                </button>
                            ) : (
                                <button className={clsx(styles['follow-btn'])} onClick={() => handleUnfriend(user?.id)}>
                                    Hủy kết bạn
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchInput;
