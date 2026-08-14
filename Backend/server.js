import "dotenv/config";

import dns from "node:dns";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});