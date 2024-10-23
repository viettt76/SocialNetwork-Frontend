import {
    ADD_NOTIFICATION_MESSENGER,
    READ_NOTIFICATION_MESSENGER,
    ADD_NOTIFICATION_OTHER,
    REMOVE_NOTIFICATION_OTHER,
    READ_MESSAGE,
} from '../actions';

const initialState = {
    messenger: [],
    other: [],
};

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_NOTIFICATION_MESSENGER:
            return {
                ...state,
                messenger: state.messenger?.some(
                    (noti) => noti?.senderId === action?.payload?.senderId && noti?.type === action?.payload?.type,
                )
                    ? [...state.messenger]
                    : [action?.payload, ...state.messenger],
            };
        case READ_NOTIFICATION_MESSENGER:
            return {
                ...state,
                messenger: state.messenger?.map((noti) => ({
                    ...noti,
                    isOpenMenu: true,
                })),
            };
        case READ_MESSAGE:
            return {
                ...state,
                messenger: state.messenger?.map((noti) =>
                    noti?.id === action.payload ? { ...noti, isRead: true, isOpenMenu: true } : noti,
                ),
            };
        case ADD_NOTIFICATION_OTHER:
            return {
                ...state,
                other: state.other?.some((noti) => noti?.id === noti?.id)
                    ? [...state.other]
                    : [action.payload, ...state.other],
            };
        case REMOVE_NOTIFICATION_OTHER:
            return {
                ...state,
                other: state.other?.filter((noti) => noti?.id !== action?.payload),
            };
        default:
            return state;
    }
};

export default notificationReducer;
