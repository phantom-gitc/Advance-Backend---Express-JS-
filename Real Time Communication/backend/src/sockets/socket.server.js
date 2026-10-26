import { Server } from "socket.io";


// Initialize Socket.io server with CORS support 


export const socketServer = (httpServer) => {


    const io = new Server(httpServer);

    io.on("connection" , (socket)=>{
        console.log("A user connected " , socket.id);

     
        socket.on("disconnect" ,(socket)=>{
            console.log("A user disconnect", socket.id);
            
        })


        
    })

    return io;
}


