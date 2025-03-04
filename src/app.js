import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());

app.use(express.json({
    limit:"30kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "30kb"
}));
app.use(cookieParser());