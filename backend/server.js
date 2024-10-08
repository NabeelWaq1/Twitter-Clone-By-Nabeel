import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import authRouter from './Routes/auth.route.js'
import userRouter from './Routes/user.route.js'
import postRouter from './Routes/post.route.js'
import notificationRouter from './Routes/notification.route.js'
import { dbConnect } from './Config/dbConnect.js';
import {v2 as cloudinary} from 'cloudinary';
import path from 'path';

const app = express();

const __dirname = path.resolve();

dotenv.config();
dbConnect();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use('/api/auth', authRouter); 
app.use('/api/user', userRouter); 
app.use('/api/post', postRouter); 
app.use('/api/notification', notificationRouter); 

const port = process.env.PORT || 5000;

if(process.env.NODE_ENV !== 'development'){
  app.use(express.static(path.join(__dirname ,'frontend/dist')));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname,'frontend/dist/index.html'));
  })
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});