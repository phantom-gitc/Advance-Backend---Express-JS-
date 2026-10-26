import app from "./src/app/app.js";
import connectDB from "./src/config/database.js";
import { createServer } from "node:http";
import { socketServer } from "./src/sockets/socket.server.js";

// Create HTTP server using Express app
// This allows us to use both HTTP and WebSocket protocols

const httpServer = createServer(app)

// Connect to database
await connectDB();


// Socket.io setup 
const io = socketServer(httpServer);

// Handle socket connections 



// Start server
httpServer.listen(3000, () => {
    console.log("Server is running on port 3000 🙈");
});