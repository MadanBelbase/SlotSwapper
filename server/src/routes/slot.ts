import express from 'express';
import {  createSlot } from '../controller/slot';

const router = express.Router();

// Routes
router.post('/Create-slots', createSlot);

export default router;