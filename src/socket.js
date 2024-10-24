import { io } from 'socket.io-client';

const socket = io('https://localhost:7072', {
    withCredentials: true,
});

export default socket;
