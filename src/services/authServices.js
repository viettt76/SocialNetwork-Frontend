import axios from '~/utils/axios';

export const signUpService = ({ firstName, lastName, username, password }) => {
    return axios.post('/auth/signup', {
        firstName,
        lastName,
        username,
        password,
    });
};

export const loginService = ({ username, password }) => {
    return axios.post('/auth/login', {
        username,
        password,
    });
};

export const logoutService = () => {
    return axios.post('/auth/logout');
};
