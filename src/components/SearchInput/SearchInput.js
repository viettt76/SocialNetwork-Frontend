import clsx from 'clsx';
import styles from './SearchInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { getSearchUserService } from '~/services/userServices';

const SearchInput = () => {
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const searchQuery = {
                keyWord: keyword,
                PageIndex: pageIndex,
                PageSize: 10,
            };

            const response = await getSearchUserService(searchQuery);
            const usersData = response.data.data || [];
            setUsers(usersData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (keyword) {
            fetchUsers();
        }
    }, [keyword, pageIndex]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPageIndex(1);
    };
    return (
        <div className="search-container">
            <h2>Tìm kiếm</h2>
            <div className="search-box">
                <input type="text" placeholder="Tìm kiếm" value={keyword} onChange={handleSearch} />
            </div>

            {loading && <p>Đang tải...</p>}

            {users.length > 0 && (
                <div className="search-results">
                    {users.map((user) => (
                        <div key={user.id} className="user-item">
                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                            <div className="user-info">
                                <span className="user-username">{user.firstName}</span>
                                <span className="user-displayName">{user.lastName}</span>
                                <span className="user-followers">{user.followers} người theo dõi</span>
                            </div>
                            <button className="follow-button">Theo dõi</button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && users.length === 0 && keyword && <p>Không tìm thấy kết quả nào.</p>}
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
