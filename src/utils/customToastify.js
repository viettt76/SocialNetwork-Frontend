import { toast } from 'react-toastify';

const toastConfig = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'light',
};
const customToastify = {
    info(message) {
        return toast.info(message, toastConfig);
    },
    success(message) {
        return toast.success(message, toastConfig);
    },
    warning(message) {
        return toast.warn(message, toastConfig);
    },
    error(message) {
        return toast.error(message, toastConfig);
    },
};

export default customToastify;
