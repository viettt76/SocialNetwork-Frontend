import { SAVE_USER_INFO, CLEAR_USER_INFO } from '../actions/userActions';

const initialState = {
    id: null,
    firstName: null,
    lastName: null,
    gender: null,
    dateOfBirthFormatted: null,
    role: null,
    avatar: null,
    address: null,
    school: null,
    workplace: null,
    isPrivate: false,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_USER_INFO:
            return {
                ...state,
                ...Object.keys(action.payload || {}).reduce((acc, key) => {
                    if (action.payload[key] !== null) {
                        acc[key] = action.payload[key];
                    }
                    return acc;
                }, {}),
            };
        case CLEAR_USER_INFO:
            return {
                id: null,
                firstName: null,
                lastName: null,
                gender: null,
                dateOfBirthFormatted: null,
                role: null,
                avatar: null,
                address: null,
                school: null,
                workplace: null,
                isPrivate: false,
            };
        default:
            return state;
    }
};

export default userReducer;
