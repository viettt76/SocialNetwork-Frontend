export const SAVE_USER_INFO = 'SAVE_USER_INFO';
export const CLEAR_USER_INFO = 'CLEAR_USER_INFO';

export const saveUserInfo = (payload) => {
    return {
        type: SAVE_USER_INFO,
        payload,
    };
};

export const clearUserInfo = () => {
    return {
        type: CLEAR_USER_INFO,
    };
};
