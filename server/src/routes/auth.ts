import express from 'express';
import { loginUser, signupUser } from '../controller/auth';

const router = express.Router();

// Routes
router.post('/login', loginUser);
router.post('/signup', signupUser);

export default router;
