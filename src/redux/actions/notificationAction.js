export const ADD_NOTIFICATION_MESSENGER = 'ADD_NOTIFICATION_MESSENGER';
export const READ_NOTIFICATION_MESSENGER = 'READ_NOTIFICATION_MESSENGER';
export const READ_MESSAGE = 'READ_MESSAGE';
export const ADD_NOTIFICATION_OTHER = 'ADD_NOTIFICATION_OTHER';
export const REMOVE_NOTIFICATION_OTHER = 'REMOVE_NOTIFICATION_OTHER';
export const SET_NOTIFICATIONS_OTHER = 'SET_NOTIFICATIONS_OTHER';
export const READ_NOTIFICATION_OTHER = 'READ_NOTIFICATION_OTHER';

export const addNotificationMessenger = (payload) => {
    return {
        type: ADD_NOTIFICATION_MESSENGER,
        payload,
    };
};

export const readNotificationMessenger = () => {
    return {
        type: READ_NOTIFICATION_MESSENGER,
    };
};

export const readMessage = (payload) => {
    return {
        type: READ_MESSAGE,
        payload,
    };
};

export const addNotificationOther = (payload) => {
    return {
        type: ADD_NOTIFICATION_OTHER,
        payload,
    };
};

export const removeNotificationOther = (payload) => {
    return {
        type: REMOVE_NOTIFICATION_OTHER,
        payload,
    };
};

export const setNotificationsOther = (payload) => {
    return {
        type: SET_NOTIFICATIONS_OTHER,
        payload,
    };
};
// export const readNotificationOther = () => {
//     return {
//         type: READ_NOTIFICATION_OTHER,
//     };
// };
