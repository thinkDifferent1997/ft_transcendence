import { io } from "socket.io-client";

export const socket = io({
	path: "/ws",
    autoConnect: false,
	withCredentials: true,
});
