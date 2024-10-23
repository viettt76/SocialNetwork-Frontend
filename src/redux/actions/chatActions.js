export const OPEN_CHAT = 'OPEN_CHAT';
export const CLOSE_CHAT = 'CLOSE_CHAT';
export const CLOSE_ALL_CHAT = 'CLOSE_ALL_CHAT';
export const UPDATE_GROUP_CHAT_AVATAR = 'UPDATE_GROUP_CHAT_AVATAR';

export const openChat = (payload) => {
    return {
        type: OPEN_CHAT,
        payload,
    };
};

export const closeChat = (payload) => {
    return {
        type: CLOSE_CHAT,
        payload,
    };
};

export const closeAllChat = () => {
    return {
        type: CLOSE_ALL_CHAT,
    };
};

export const updateGroupChatAvatar = (payload) => {
    return {
        type: UPDATE_GROUP_CHAT_AVATAR,
        payload,
    };
};
