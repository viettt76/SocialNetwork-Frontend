import { useEffect, useRef, useState } from 'react';

const useClickOutside = (initialIsVisible, exceptionTarget) => {
    const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
    const ref = useRef(null);

    useEffect(() => {
        let arrayException = [];
        if (exceptionTarget?.length > 0) {
            arrayException = [...exceptionTarget];
        } else if (exceptionTarget) {
            arrayException.push(exceptionTarget);
        }
        const handleClickOutside = (e) => {
            if (arrayException.length > 0) {
                if (
                    ref.current &&
                    !ref.current.contains(e.target) &&
                    arrayException.every((a) => !a.current?.contains(e.target))
                ) {
                    setIsComponentVisible(false);
                }
            } else {
                if (ref.current && !ref.current.contains(e.target)) {
                    setIsComponentVisible(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, exceptionTarget]);

    return { ref, isComponentVisible, setIsComponentVisible };
};

export default useClickOutside;
