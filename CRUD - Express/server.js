import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import config from "./src/config/config.js";

// Connect to database
connectDB();

const PORT = config.PORT || process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
