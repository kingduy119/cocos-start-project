// https://socket.io/docs/v4/client-initialization/
import { io } from "socket.io-client";

const URL = "http://localhost:3001";
// const URL = "http://54.178.94.128/";
let socket = null;
const options = { 
    transports : ['websocket', 'polling', 'flashsocket'] 
};


export function getSocket() {
    if(!socket) {
        socket = io(URL, options);
    }
    return socket;
}

