import { Request, Response } from "express";
import Slot from "../models/slot"; 
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const createSlot = async (req: Request, res: Response) => {
  try {
    const { name, description, startTime, endTime, isSwappable, userEmail } = req.body;

    console.log("📩 Create Slot attempt:", name, description, startTime, endTime, isSwappable, userEmail);

    // Validate required fields
    if (!name || !startTime || !endTime || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slotId = uuidv4(); 

    const newSlot = new Slot({
      slotId,
      userEmail,
      name,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isSwappable: !!isSwappable,
      status: isSwappable ? "SWAPPABLE" : "BUSY",
    });

    await newSlot.save();

    res.status(201).json({
      message: "Slot created successfully",
      slot: newSlot,
    });

  } catch (error) {
    console.error("Create Slot error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const MySlot = async (req: Request, res: Response) => {
  try {
    const userEmail = req.params.userEmail;
    console.log("📩 Fetching slots for user:", userEmail);

    const slots = await Slot.find({ userEmail });

    res.status(200).json({
      message: "Slots fetched successfully",
      slots,
    });

  } catch (error) {
    console.error("Fetch Slots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const allSlots = async (req: Request, res: Response) => {
  try {
    console.log("📩 Fetching all slots");

    const allSlots = await Slot.find();

    res.status(200).json({
      message: "All slots fetched successfully",
      allSlots,
    });

  } catch (error) {
    console.error("Fetch All Slots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
  
export const SlotById = async (req: Request, res: Response) => {
  try {
    const slotId = req.params.slotId;
    console.log("📩 Fetching slot by ID:", slotId);

    let slot;

    // Check if slotId is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(slotId)) {
      slot = await Slot.findById(slotId);
    } else {
      // Treat slotId as a status or another string field
      slot = await Slot.findOne({ status: slotId.toUpperCase() }); // "swappable" => "SWAPPABLE"
    }

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    console.log("✅ Slot found:", slot);
    res.json({
      message: "Slot fetched successfully",
      slot,
    });
  } catch (error) {
    console.error("Fetch Slot by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const swappableSlots = async (req: Request, res: Response) => {
  try {
    console.log("📩 Fetching swappable slots...");

    const slots = await Slot.find({ isSwappable: true, status: "SWAPPABLE" });
    
    console.log(`✅ Found ${slots.length} swappable slot(s)`);

    return res.status(200).json({
      message: "Swappable slots fetched successfully",
      slots,
    });

  } catch (error) {
    console.error("❌ Fetch Swappable Slots error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const UpadteSlotById = async (req: Request, res: Response) => {
  try {
    const slotId = req.params.slotId;
    const updateData = req.body;

    console.log("📩 Update Slot attempt:", slotId, updateData);

    const updatedSlot = await Slot.findByIdAndUpdate(
      slotId,
      updateData,
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    console.log("✅ Slot updated:", updatedSlot);
    res.json({
      message: "Slot updated successfully",
      slot: updatedSlot,
    });

  } catch (error) {
    console.error("Update Slot error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const DeleteSlotById = async (req: Request, res: Response) => {
  try {
    const slotId = req.params.slotId;

    console.log("📩 Delete Slot attempt:", slotId);

    const deletedSlot = await Slot.findByIdAndDelete(slotId);

    if (!deletedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    console.log("✅ Slot deleted:", deletedSlot);
    res.json({
      message: "Slot deleted successfully",
      slot: deletedSlot,
    });

  } catch (error) {
    console.error("Delete Slot error:", error);
    res.status(500).json({ message: "Server error" });
  }
}