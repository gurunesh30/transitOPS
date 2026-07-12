import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rootRouter from './routes';
import { globalErrorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(rootRouter);
app.use(globalErrorHandler);

export default app;