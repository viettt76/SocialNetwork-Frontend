import axios from '~/utils/axios';

export const getMyInfoService = () => {
    return axios.get('/user/my-info');
};

export const updateMyInfoService = ({ homeTown, school, workplace, avatar, birthday }) => {
    return axios.put('/user/my-info', { homeTown, school, workplace, avatar, birthday });
};

export const getUserInfoService = (userId) => {
    return axios.get(`/user/user-info/${userId}`);
};

export const getPicturesOfUserService = (userId) => {
    return axios.get(`/user/pictures/${userId}`);
};

export const getNotificationsService = () => {
    return axios.get('/user/notifications');
};

export const readNotificationService = (notificationId) => {
    return axios.patch(`/user/notification/${notificationId}`);
};

export const getNotificationsTypeService = () => {
    return axios.get('/user/notifications-type');
};

export const readMenuNotificationMessengerService = () => {
    return axios.patch('/user/notification/messenger/open');
};

export const readMenuNotificationOtherService = () => {
    return axios.patch('/user/notification/other/open');
};
