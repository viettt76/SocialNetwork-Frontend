import { START_LOADING, STOP_LOADING } from '../actions/loadingActions';

const initialState = {};

const loadingReducer = (state = initialState, action) => {
    switch (action.type) {
        case START_LOADING:
            return {
                ...state,
                [action.payload]: true,
            };
        case STOP_LOADING:
            delete state[action.payload];
            return {
                ...state,
            };
        default:
            return state;
    }
};

export default loadingReducer;
