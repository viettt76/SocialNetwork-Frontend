import { useState, useEffect } from 'react';

const useDebounced = (value, delay) => {
    const [valueDebounced, setValueDebounced] = useState(value);

    useEffect(() => {
        const idTimeout = setTimeout(() => {
            setValueDebounced(value);
        }, delay);

        return () => clearTimeout(idTimeout);
    }, [value]);

    return valueDebounced;
};

export default useDebounced;
