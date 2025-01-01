import axios from '~/utils/axios';

export const getAllFriendsService = () => {
    return axios.get(`/User/friends`);
};
export const getFriendSuggestionsService = () => {
    return axios.get('/relationships/suggestion');
};

export const getFriendsOnlineService = () => {
    return axios.get('/User/getFriendOnline');
};

// export const sendFriendRequestService = (friendId) => {
//     return axios.post('/User/Send', {
//         params: {
//             friendId,
//         },
//     });
// };

export const sendFriendRequestService = (friendId) => {
    return axios.post('/User/Send', friendId, {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const getFriendRequestService = () => {
    return axios.get('/User/request');
};

export const refuseFriendRequestService = (senderId) => {
    return axios.post(`/User/decline/${senderId}`);
};

export const readNotidicationService = (notificationId) => {
    return axios.put(`/User/readNotification?notificationId=${notificationId}`);
};

export const acceptFriendshipService = (friendId) => {
    return axios.post('/User/accept', friendId, {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const unfriendService = (friendId) => {
    return axios.post(`/User/cancel/${friendId}`);
};

export const getSentFriendRequestsService = () => {
    return axios.get('/User/sendRequest');
};

export const cancelFriendRequestService = (receiverId) => {
    return axios.post(`/User/cancelRequest/${receiverId}`);
};
