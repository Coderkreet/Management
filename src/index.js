import express from 'express';
import Connection from './db/Connection.js'
import dotenv from 'dotenv';
dotenv.config({
    path: '.env'
});

const PORT =  5000;
const app = express();

Connection().then(() => {
   app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
   });

}).catch((err) => {
    console.log("MongoDB Connection Error !!", err);
    process.exit(1);
});






