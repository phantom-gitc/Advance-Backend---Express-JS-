import app from "./src/app/app.js";
import connectDB from "./src/config/database.js";
import Config from "./src/config/config.js";

await connectDB();


const PORT = process.env.PORT || Config.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port", PORT, "✅");
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use by another process!`);
        console.error(`Please change PORT in .env (e.g. PORT=5000) or stop the process using port ${PORT}.`);
    } else {
        console.error("❌ Server error:", err);
    }
});

