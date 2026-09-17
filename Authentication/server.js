import app from "./src/app/app.js";
import connectDB from "./src/config/db.js";
import config from "./src/config/config.js";

await connectDB();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} ✅`);
});
