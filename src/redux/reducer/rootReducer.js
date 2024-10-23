import { combineReducers } from 'redux';

import userReducer from './userReducer';
import chatReducer from './chatReducer';
import loadingReducer from './loadingReducer';
import notificationReducer from './notificationReducer';

const rootReducer = combineReducers({
    user: userReducer,
    chat: chatReducer,
    loading: loadingReducer,
    notifications: notificationReducer,
});

export default rootReducer;
