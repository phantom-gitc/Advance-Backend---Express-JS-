import app from "./src/app/app.js";
import connectDB from "./src/config/database.js";
import Config from "./src/config/config.js";

await connectDB();


const server = app.listen(Config.PORT, () => {

    console.log("Server is running on port", Config.PORT, "✅");
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {

        console.error(`❌ Port ${Config.PORT} is already in use by another process!`);
        
        console.error(`Please change PORT in .env (e.g. PORT=5000) or stop the process using port ${Config.PORT}.`);
    } else {
        console.error("❌ Server error:", err);
    }
});

