import { Spinner } from 'react-bootstrap';
import clsx from 'clsx';
import styles from './Loading.module.scss';

const Loading = ({ className }) => {
    return (
        <div className={clsx(styles['loading-wrapper'], className)}>
            <Spinner />
        </div>
    );
};

export default Loading;
