import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import slotsRouter from './routes/slot';
import swapRequestRoutes from "./routes/swapRequestRoutes"; 

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
app.use('/api/slot', slotsRouter); 
app.use('/api/swap', swapRequestRoutes); 

export default app;
