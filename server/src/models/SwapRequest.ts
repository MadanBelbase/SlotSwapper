import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapRequest extends Document {
  targetSlotId: mongoose.Types.ObjectId; // The slot user wants to get
  offeredSlotId: mongoose.Types.ObjectId; // The slot user is offering
  targetSlotOwnerEmail: string; // Owner of the target slot
  requesterEmail: string; // Who is requesting the swap
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  proposedStartTime: Date; // Start time of offered slot
  proposedEndTime: Date; // End time of offered slot
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema: Schema = new Schema({
  targetSlotId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  offeredSlotId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  targetSlotOwnerEmail: { 
    type: String, 
    required: true 
  },
  requesterEmail: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  message: { 
    type: String 
  },
  proposedStartTime: { 
    type: Date, 
    required: true 
  },
  proposedEndTime: { 
    type: Date, 
    required: true 
  }
}, { 
  timestamps: true 
});

// Index for better query performance
SwapRequestSchema.index({ targetSlotId: 1, status: 1 });
SwapRequestSchema.index({ offeredSlotId: 1, status: 1 });
SwapRequestSchema.index({ requesterEmail: 1, status: 1 });
SwapRequestSchema.index({ targetSlotOwnerEmail: 1, status: 1 });

export default mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);
