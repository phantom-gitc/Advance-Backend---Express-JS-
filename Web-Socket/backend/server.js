import app from "./src/app/app.js";
import connectDB from "./src/config/database.js";
import {createServer} from "node:http";
import {Server} from "socket.io";



// Create HTTP server 

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})


// Handle WebSocket connections 

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);


    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

await connectDB();



httpServer.listen(3000, () => {
    console.log("Server is running on port 3000 🚀");
});

