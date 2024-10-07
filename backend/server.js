import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import authRouter from './Routes/auth.route.js'
import { dbConnect } from './Config/dbConnect.js';

const app = express();

dotenv.config();
dbConnect();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);  // mount auth routes at /auth

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});