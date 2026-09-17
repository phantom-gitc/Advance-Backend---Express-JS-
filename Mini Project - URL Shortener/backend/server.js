import app from "./src/app/app.js"
import connectDatabase from "./src/config/database.js";
import config from "./src/config/config.js";



await connectDatabase();


// For starting server on given port number

const server = app.listen(config.PORT,()=>{
    console.log(`Server running on port ${config.PORT} ❤️`);
})



// For handling unhandled errors 


process.on("uncaughtException",(error)=>{
    console.log("Shutting down server due to uncaught exception ❌❌");
    console.log(error.message);
    
    
    server.close(()=>{
        process.exit(1);
    })
    
})