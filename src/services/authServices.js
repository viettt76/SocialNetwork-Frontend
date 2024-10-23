import axios from '~/utils/axios';

export const signUpService = ({ firstName, lastName, username, password }) => {
    return axios.post('/Login/signup', {
        firstName,
        lastName,
        username,
        password,
    });
};

export const loginService = ({ email, password }) => {
    return axios.post('/Login/login', { 
        email,
        password,
    });
};

export const logoutService = () => {
    return axios.post('/Login/logout');
};
