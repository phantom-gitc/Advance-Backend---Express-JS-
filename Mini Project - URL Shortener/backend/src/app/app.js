import express from "express" ;
import urlRoutes from "../routes/url.routes.js"


const app = express();


// CORS middleware to allow frontend requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());



// Routes

app.use('/api/url',urlRoutes)



export default app