import axios from '~/utils/axios';

export const getAllFriendsService = (userId) => {
    return axios.get(`/relationships/friends/${userId}`);
};

export const getFriendSuggestionsService = () => {
    return axios.get('/relationships/suggestion');
};

export const sendFriendRequestService = (receiverId) => {
    return axios.post('/relationships/request', { relationship: 1, receiverId });
};

export const getFriendRequestService = () => {
    return axios.get('/relationships/request');
};

export const refuseFriendRequestService = (senderId) => {
    return axios.delete(`/relationships/request/${senderId}`);
};

export const acceptFriendshipService = (friendId) => {
    return axios.post('/relationships/accept', { friendId });
};

export const unfriendService = (friendId) => {
    return axios.delete(`/relationships/${friendId}`);
};

export const getSentFriendRequestsService = () => {
    return axios.get('/relationships/sent-requests');
};

export const cancelFriendRequestService = (receiverId) => {
    return axios.delete(`/relationships/sent-request/${receiverId}`);
};
