import { faGear, faHouse, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';
import Logo from '~/components/Logo';
import styles from './Sidebar.module.scss';
import clsx from 'clsx';
import useClickOutside from '~/hook/useClickOutside';
import { useRef } from 'react';
import UserDashboard from '~/components/UserDashboard';

const Sidebar = () => {
    const location = useLocation();

    const userDashboardIconRef = useRef(null);

    const {
        ref: userDashboardRef,
        isComponentVisible: showUserDashboard,
        setIsComponentVisible: setShowUserDashboard,
    } = useClickOutside(false, [userDashboardIconRef]);

    return (
        <div className={clsx(styles['sidebar-wrapper'])}>
            <Link to={'/'}>
                <Logo />
            </Link>
            <div className="d-flex flex-column">
                <Link
                    to="/"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname.toLowerCase() === '/',
                    })}
                >
                    <FontAwesomeIcon icon={faHouse} />
                </Link>
                <Link
                    to="/search"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname.toLowerCase() === '/search',
                    })}
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </Link>
                <Link
                    to="/profile"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname.toLowerCase() === '/profile',
                    })}
                >
                    <FontAwesomeIcon icon={faUser} />
                </Link>
            </div>
            <div className="position-relative">
                <div
                    ref={userDashboardIconRef}
                    className={clsx(styles['sidebar-item'])}
                    onClick={() => setShowUserDashboard(!showUserDashboard)}
                >
                    <FontAwesomeIcon icon={faGear} />
                </div>
                <UserDashboard
                    userDashboardRef={userDashboardRef}
                    showUserDashboard={showUserDashboard}
                    setShowUserDashboard={setShowUserDashboard}
                />
            </div>
        </div>
    );
};

export default Sidebar;
