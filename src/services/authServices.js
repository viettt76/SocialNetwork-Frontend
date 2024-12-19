import axios from '~/utils/axios';

export const signUpService = ({ firstName, lastName, email, password }) => {
    return axios.post('/Login/signup', {
        firstName,
        lastName,
        userName: email,
        email,
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

export const deleteAccountService = (password) => {
    return axios.delete('/auth/delete-account', { data: { password } });
};

export const recoverAccountService = ({ username, password }) => {
    return axios.post('/auth/recover-account', { username, password });
};

export const changePasswordService = ({ currentPassword, newPassword }) => {
    return axios.patch('/auth/change-password', {
        currentPassword,
        newPassword,
    });
};
