
import { Request, Response } from "express";

export const createSlot = async (req: Request, res: Response) => {
    try {
        const {name, description,startTime,endTime, isSwappable,userId } = req.body;
        console.log("📩 Create Slot attempt:",name, description, startTime, endTime, isSwappable,userId );
        
    } catch (error) {
        console.error("Create Slot error:", error);
        res.status(500).json({ message: "Server error" });
    }
    };

