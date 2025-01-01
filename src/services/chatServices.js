import axios from '~/utils/axios';

export const getMessagesWithFriendService = (friendId) => {
    return axios.get(`/chat/messages?friendId=${friendId}`);
};

export const sendMessageWithFriendService = ({ friendId, message, file }) => {
    return axios.post('/chat/message', {
        friendId: friendId,
        message: message,
        file,
    });
};

export const createGroupChatService = ({ groupName, avatar, members }) => {
    return axios.post('/Chat/createGroupChat', {
        groupName,
        avatar,
        members,
    });
};

// export const getGroupChatsService = () => {
//     return axios.get('/chat/group-chat');
// };

export const getMessagesOfGroupChatService = (groupChatId) => {
    return axios.get(`/chat/group-chat/messages/${groupChatId}`);
};

export const sendGroupChatMessageService = ({ groupChatId, message, picture }) => {
    return axios.post('/chat/group-chat/message', {
        groupChatId,
        message,
        picture,
    });
};

// export const getGroupMembersService = (groupChatId) => {
//     return axios.get(`/chat/group-chat/getGroupChatMembers/${groupChatId}`);
// };

export const updateGroupMembersService = ({ groupChatId, members }) => {
    return axios.post(`/chat/group-chat/members`, {
        groupChatId,
        members,
    });
};
export const getGroupMembersService = ({ groupId, textSearch, pageIndex, isTotalCount }) => {
    if (pageIndex == undefined) {
        pageIndex = 0;
    }
    return axios.get('/Chat/getGroupChatMembers', {
        params: { TextSearch: textSearch, GroupChatId: groupId, PageIndex: pageIndex, IsTotalCount: isTotalCount },
    });
};
export const leaveGroupChatService = (groupId) => {
    return axios.put(`/chat/leaveGroupChat?groupId=${groupId}`);
};

export const getLatestConversationsService = ({ textSearch, pageIndex, isTotalCount }) => {
    if (pageIndex == undefined) {
        pageIndex = 0;
    }
    return axios.get('/Chat/getAllConversation', {
        params: { TextSearch: textSearch, PageIndex: pageIndex, IsTotalCount: isTotalCount },
    });
};

export const getFriendService = ({ textSearch, pageIndex, isTotalCount }) => {
    if (pageIndex == undefined) {
        pageIndex = 0;
    }
    return axios.get('/Chat/getFriends', {
        params: { TextSearch: textSearch, PageIndex: pageIndex, IsTotalCount: isTotalCount },
    });
};

export const getGroupChatsService = ({ textSearch, pageIndex, isTotalCount }) => {
    if (pageIndex == undefined) {
        pageIndex = 0;
    }
    return axios.get('/Chat/getGroupChats', {
        params: { TextSearch: textSearch, PageIndex: pageIndex, IsTotalCount: isTotalCount },
    });
};

export const updateGroupAvatarService = ({ groupChatId, avatar }) => {
    return axios.patch(`/chat/group-chat/avatar/${groupChatId}`, { avatar });
};

export const getAllMessageService = (receiverId) => {
    return axios.get(`/Chat/getAllPersonalMessage`, { params: { receiverId } });
};

export const getAllMessageChatGroupService = (groupId) => {
    return axios.get(`/Chat/getAllGroupChatMessage`, { params: { groupId } });
};

export const sendReactionMessage = ({ messageId, emotionType }) => {
    return axios.post(``);
};
