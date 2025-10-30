import mongoose, { Schema, Document } from 'mongoose';


export interface ISlot extends Document {
  slotId: string;
  userId: string;
  date: Date;
  time: string;
  status: string; 
}


const SlotSchema: Schema = new Schema({
  slotId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, required: true, enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'] },
});

export default mongoose.model<ISlot>('Slot', SlotSchema);
