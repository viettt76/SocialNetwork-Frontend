import { faGear, faHouse, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';
import Logo from '~/components/Logo';
import styles from './Sidebar.module.scss';
import clsx from 'clsx';

const Sidebar = () => {
    const location = useLocation();

    return (
        <div className={clsx(styles['sidebar-wrapper'])}>
            <Link to={'/'}>
                <Logo />
            </Link>
            <div className="d-flex flex-column">
                <Link
                    to="/"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname === '/',
                    })}
                >
                    <FontAwesomeIcon icon={faHouse} />
                </Link>
                <Link
                    to="/search"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname === '/search',
                    })}
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </Link>
                <Link
                    to="/profile"
                    className={clsx(styles['sidebar-item'], styles['sidebar-item-link'], {
                        [[styles['active']]]: location.pathname === '/profile',
                    })}
                >
                    <FontAwesomeIcon icon={faUser} />
                </Link>
            </div>
            <div>
                <div className={clsx(styles['sidebar-item'])}>
                    <FontAwesomeIcon icon={faGear} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
