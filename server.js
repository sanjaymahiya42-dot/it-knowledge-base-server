import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();
console.log(process.cwd());
console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`IT Knowledge Base API running on port ${PORT}`);
  });
});

