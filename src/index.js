import { app } from './app.js';
import Connection from './db/Connection.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Import cookie-parser

dotenv.config();

const PORT = process.env.PORT;

// Use cookie-parser middleware
app.use(cookieParser()); // Add this line

Connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Error !!", err);
    process.exit(1);
  });







