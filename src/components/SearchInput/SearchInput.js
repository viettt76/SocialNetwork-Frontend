import clsx from 'clsx';
import styles from './SearchInput.module.scss';

const SearchInput = () => {
    return (
        <div className={clsx(styles['search-wrapper'])}>
            <input className={clsx('form-control', styles['search-input'])} placeholder="Tìm kiếm..." />
        </div>
    );
};

export default SearchInput;
