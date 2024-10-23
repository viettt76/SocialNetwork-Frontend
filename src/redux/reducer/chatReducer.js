import { OPEN_CHAT, CLOSE_CHAT, CLOSE_ALL_CHAT, UPDATE_GROUP_CHAT_AVATAR } from '../actions/chatActions';

const initialState = {
    openChats: [],
};

const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_CHAT: {
            const existingChatIndex = state.openChats.findIndex(
                (chat) => chat?.id === action.payload?.id && chat?.isGroupChat === action.payload?.isGroupChat,
            );

            let updatedOpenChats = [...state.openChats];

            if (existingChatIndex !== -1) {
                const existingChat = updatedOpenChats.splice(existingChatIndex, 1)[0];
                updatedOpenChats.unshift(existingChat);
            } else {
                updatedOpenChats.unshift(action.payload);
            }

            return {
                ...state,
                openChats: updatedOpenChats,
            };
        }
        case CLOSE_CHAT: {
            const updatedOpenChats = state.openChats.filter((chat) => chat?.id !== action.payload);

            return {
                ...state,
                openChats: updatedOpenChats,
            };
        }
        case CLOSE_ALL_CHAT: {
            return {
                ...state,
                openChats: [],
            };
        }
        case UPDATE_GROUP_CHAT_AVATAR: {
            const { groupId, avatar } = action.payload;

            return {
                ...state,
                openChats: state.openChats.map((chat) => (chat.id === groupId ? { ...chat, avatar } : chat)),
            };
        }
        default:
            return state;
    }
};

export default chatReducer;
