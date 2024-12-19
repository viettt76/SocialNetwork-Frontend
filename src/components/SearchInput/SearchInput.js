import clsx from 'clsx';
import styles from './SearchInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { getSearchUserService } from '~/services/userServices';
import useDebounced from '~/hook/useDebounced';
import { sendFriendRequestService } from '~/services/relationshipServices';

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
        } else {
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
                            <button
                                className={clsx(styles['follow-btn'])}
                                onClick={() => handleSendFriendRequest(user?.id)}
                            >
                                Thêm bạn
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SearchInput;

// export default SearchInput;

// {
/* <div className={clsx(styles['suggestions'])}>Gợi ý theo dõi</div>
                <div className={clsx(styles['user'])}>
                    <div className={clsx(styles['user-info'])}>
                        <img alt="Profile picture of liverpool_fc_fanatics_" height="40" src={img1} width="40" />
                        <div>
                            <div className={clsx(styles['name'])}>liverpool_fc_fanatics_</div>
                            <div className={clsx(styles['description'])}>
                                Liverpool FC Fanatics
                                <br />
                                15,3K người theo dõi
                            </div>
                        </div>
                    </div>
                    <button className={clsx(styles['follow-btn'])}>Theo dõi</button>
                </div>

                <div className={clsx(styles['user'])}>
                    <div className={clsx(styles['user-info'])}>
                        <img alt="Profile picture of moingay1trangsach.vn" height="40" src={img3} width="40" />
                        <div>
                            <div className={clsx(styles['name'])}>moingay1trangsach.vn</div>
                            <div className={clsx(styles['description'])}>
                                Mỗi Ngày 1 Trang Sách
                                <br />
                                262K người theo dõi
                            </div>
                        </div>
                    </div>
                    <button className={clsx(styles['follow-btn'])}>Theo dõi</button>
                </div>

                <div className={clsx(styles['user'])}>
                    <div className={clsx(styles['user-info'])}>
                        <img
                            alt="Profile picture of lfcretail"
                            height="40"
                            src="https://storage.googleapis.com/a1aa/image/2BV1cR8zjGo1KZfPdIZzHcFRHhmDruMEhlhmEUw2zlHgzJzJA.jpg"
                            width="40"
                        />
                        <div>
                            <div className={clsx(styles['name'])}>
                                <div>
                                    <span>
                                        lfcretail
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            color="#3897F0"
                                            style={{ marginLeft: '5px' }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className={clsx(styles['description'])}>
                                Offical LFC Retail
                                <br />
                                321K người theo dõi
                            </div>
                        </div>
                    </div>
                    <button className={clsx(styles['follow-btn'])}>Theo dõi</button>
                </div>

                <div className={clsx(styles['user'])}>
                    <div className={clsx(styles['user-info'])}>
                        <img
                            alt="Profile picture of liverpoolfcw"
                            height="40"
                            src="https://storage.googleapis.com/a1aa/image/FRi4qu4b7FqjFVemfZ7kp3g9TCTAEl1rCra1vJj85kbHnTmTA.jpg"
                            width="40"
                        />
                        <div>
                            <div className={clsx(styles['name'])}>
                                <div>
                                    <span>
                                        liverpoolfcw
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            color="#3897F0"
                                            style={{ marginLeft: '5px' }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className={clsx(styles['description'])}>
                                Liverpool FC Women
                                <br />
                                268K người theo dõi
                            </div>
                        </div>
                    </div>
                    <button className={clsx(styles['follow-btn'])}>Theo dõi</button>
                </div>

                <div className={clsx(styles['user'])}>
                    <div className={clsx(styles['user-info'])}>
                        <img
                            alt="Profile picture of liverpoolfcw"
                            height="40"
                            src="https://storage.googleapis.com/a1aa/image/cYbw0KfyHv2eBUZfCA5FmBAby0d8vOJr1bRBb5DDrsIGOnMnA.jpg"
                            width="40"
                        />
                        <div>
                            <div className={clsx(styles['name'])}>
                                <div>
                                    <span>
                                        Dior
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            color="#3897F0"
                                            style={{ marginLeft: '5px' }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className={clsx(styles['description'])}>
                                Dior Offical
                                <br />
                                6,1 triệu người theo dõi
                            </div>
                        </div>
                    </div>
                    <button className={clsx(styles['follow-btn'])}>Theo dõi</button>
                </div>*/
// }
