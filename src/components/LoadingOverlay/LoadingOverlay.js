import clsx from 'clsx';
import styles from './LoadingOverlay.module.scss';
import { Spinner } from 'react-bootstrap';
import { useEffect } from 'react';

const OverlayLoading = () => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => (document.body.style.overflow = 'auto');
    }, []);

    return (
        <div className={clsx(styles['overlay'])}>
            <Spinner className={clsx(styles['spinner'])} />
        </div>
    );
};

export default OverlayLoading;
