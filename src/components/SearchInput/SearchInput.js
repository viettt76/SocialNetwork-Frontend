import clsx from 'clsx';
import styles from './SearchInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import img1 from '~/assets/imgs/image 1.jpg';
import img3 from '~/assets/imgs/image 3.jpg';

const SearchInput = () => {
    return (
        <div className={clsx(styles['search-container'])}>
            <div className={clsx(styles['search-wrapper'])}>
                <div className={clsx(styles['header'])}>
                    <h1>Tìm kiếm</h1>
                    <div className={clsx(styles['more'])}>...</div>
                </div>
                <div className={clsx(styles['search-bar'])}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input placeholder="Tìm kiếm" type="text" />
                </div>
                <div className={clsx(styles['suggestions'])}>Gợi ý theo dõi</div>
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
                </div>
            </div>
        </div>
    );
};

export default SearchInput;
