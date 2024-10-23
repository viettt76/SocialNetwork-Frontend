export const START_LOADING = 'START_LOADING';
export const STOP_LOADING = 'STOP_LOADING';

export const startLoading = (payload) => {
    return {
        type: START_LOADING,
        payload,
    };
};

export const stopLoading = (payload) => {
    return {
        type: STOP_LOADING,
        payload,
    };
};
