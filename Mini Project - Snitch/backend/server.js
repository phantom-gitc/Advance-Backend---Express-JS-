import app from "./app/app.js";
import connectDB from "./config/database.js";
import Config from "./config/config.js";

await connectDB();


app.listen(Config.PORT,()=>{
    console.log("Server is running on port",Config.PORT,"✅");
});
