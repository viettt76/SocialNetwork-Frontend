import clsx from 'clsx';
import styles from './SidebarAdmin.module.scss';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const SidebarAdmin = () => {
    const location = useLocation();

    return (
        <>
            <label className={clsx(styles['btn-show__mobile-label'])} htmlFor="checkbox-show-sidebar-friend">
                <FontAwesomeIcon className={clsx(styles['btn-show__mobile-icon'])} icon={faBars} />
            </label>
            <input
                className={clsx(styles['btn-show__mobile-checkbox'])}
                type="checkbox"
                id="checkbox-show-sidebar-friend"
            />
            <div className={clsx(styles['sidebar-wrapper'])}>
                <div className={clsx(styles['sidebar-title'])}>Trang quản trị</div>
                <Link
                    to="/admin/manage-post"
                    className={clsx(styles['sidebar-item'], {
                        [[styles['active']]]: location.pathname.toLowerCase() === '/admin/manage-post',
                    })}
                >
                    Quản lý bài viết
                </Link>
            </div>
        </>
    );
};

export default SidebarAdmin;
