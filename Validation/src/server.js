import app from "./app/app.js";
import connectDB from "./config/db.js";
import config from "./config/config.js";

connectDB();

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} ❤️`);
});