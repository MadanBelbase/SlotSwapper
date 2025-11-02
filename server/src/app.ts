import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import slotsRouter from './routes/slot';
import swapRequestRoutes from "./routes/swapRequestRoutes";

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',         // for local dev
  'https://madanbelbase.github.io' // ✅ correct GitHub Pages origin (case-insensitive)
];

// ✅ CORS middleware should be placed before express.json() and routes
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// ✅ Mount routes
app.use('/api/auth', authRouter);
app.use('/api/slot', slotsRouter);
app.use('/api/swap', swapRequestRoutes);

// ✅ Test route to verify CORS
app.get('/', (req, res) => {
  res.json({ message: 'CORS is working properly!' });
});

export default app;


