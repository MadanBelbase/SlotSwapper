import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import slotsRouter from './routes/slot';

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', // your React frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/slot', slotsRouter); // Example for slot creation route

export default app;
