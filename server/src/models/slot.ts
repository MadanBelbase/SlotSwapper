import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  slotId: string;
  userEmail: string;  
  name: string;       
  description: string;
  startTime: Date;
  endTime: Date;
  isSwappable: boolean;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

const SlotSchema: Schema = new Schema({
  slotId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },  
  name: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isSwappable: { type: Boolean, default: false },
  status: { 
    type: String, 
    required: true, 
    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'], 
    default: 'BUSY' 
  },
}, { timestamps: true }); // ✅ add timestamps for createdAt & updatedAt

export default mongoose.model<ISlot>('Slot', SlotSchema);

