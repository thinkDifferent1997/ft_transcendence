import { io } from "socket.io-client";

export const socket = io({ path: "/ws", autoConnect: false }); // jeu (namespace par défaut)
export const statsSocket = io("/stats", { path: "/ws", autoConnect: false }); // stats