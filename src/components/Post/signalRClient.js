import { HubConnectionBuilder } from '@microsoft/signalr';

const signalRClient = new HubConnectionBuilder()
    .withUrl('https://localhost:7072/postHub/')
    .withAutomaticReconnect()
    .build();

export default signalRClient;
