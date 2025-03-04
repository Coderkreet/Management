import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../controllers/Constants.js';

dotenv.config({
    path: '.env'
});

const url = process.env.MONGO_URI;

const Connection = async () => {
    try{
      const ConnectionInstance =  await  mongoose.connect(`${url}/${DB_NAME}`)
        console.log("MongoDB Connection !! DB HOST:-", ConnectionInstance.connection.host);
       
    }
    catch(err){
        console.log("MongoDB Connection error:-",err);
        process.exit(1);
    }
}

export default Connection;

