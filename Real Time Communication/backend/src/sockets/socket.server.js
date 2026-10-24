import { Server } from "socket.io";


// Initialize Socket.io server with CORS support 


export const socketServer = (httpServer) => {

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

    return io;
}


