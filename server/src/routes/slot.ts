import express from 'express';
import {  createSlot,MySlot,allSlots, SlotById, swappableSlots, UpadteSlotById,DeleteSlotById } from '../controller/slot';

const router = express.Router();

// Routes
router.post('/Create-slots', createSlot);
router.get('/my-slots/:userEmail', MySlot);
router.get('/all-slots', allSlots);
router.get('/:slotId', SlotById);
router.get('/swappable', swappableSlots);
router.put( '/:slotId', UpadteSlotById);
router.delete('/:slotId', DeleteSlotById);

export default router;