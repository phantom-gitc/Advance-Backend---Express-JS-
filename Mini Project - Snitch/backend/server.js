import app from "./src/app/app.js";
import connectDB from "./src/config/database.js";
import Config from "./src/config/config.js";

await connectDB();


app.listen(Config.PORT,()=>{
    console.log("Server is running on port",Config.PORT,"✅");
});

