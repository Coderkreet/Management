import {app} from './app.js'
import Connection from './db/Connection.js'
import dotenv from 'dotenv';
dotenv.config()

const PORT =  process.env.PORT ;


Connection().then(() => {
   app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
   });

}).catch((err) => {
    console.log("MongoDB Connection Error !!", err);
    process.exit(1);
});







