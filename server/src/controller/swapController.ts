import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Slot from "../models/slot";
import SwapRequest from "../models/SwapRequest";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const decodeToken = (req: Request) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) throw new Error("No token provided");

  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch (err) {
    throw new jwt.JsonWebTokenError("Invalid token");
  }
};

// Create Swap Request - SIMPLIFIED
export const createSwapRequest = async (req: Request, res: Response) => {
  try {
    const { targetSlotId, offeredSlotId, message } = req.body;
    
    // Decode JWT token to get user info
    const decoded = decodeToken(req);
    const requesterEmail = decoded.email;

    // Basic validation
    if (!targetSlotId || !offeredSlotId) {
      return res.status(400).json({ 
        message: "Both slots are required" 
      });
    }

    // Prevent swapping the same slot
    if (targetSlotId === offeredSlotId) {
      return res.status(400).json({ 
        message: "Cannot swap a slot with itself" 
      });
    }

    // Find both slots
    const targetSlot = await Slot.findById(targetSlotId);
    const offeredSlot = await Slot.findById(offeredSlotId);

    if (!targetSlot || !offeredSlot) {
      return res.status(404).json({ message: "One or both slots not found" });
    }

    // Check if slots are swappable (basic check only)
    if (!targetSlot.isSwappable || !offeredSlot.isSwappable) {
      return res.status(400).json({ 
        message: "One or both slots are not marked as swappable" 
      });
    }

    // Create new swap request
    const swapRequest = new SwapRequest({
      targetSlotId,
      targetSlotOwnerEmail: targetSlot.userEmail,
      offeredSlotId,
      requesterEmail,
      message,
      proposedStartTime: offeredSlot.startTime,
      proposedEndTime: offeredSlot.endTime,
      status: "PENDING"
    });

    await swapRequest.save();

    // Populate the response
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('targetSlotId')
      .populate('offeredSlotId');

    res.status(201).json({
      message: "Swap request sent successfully",
      request: populatedRequest
    });

  } catch (err) {
    console.error("Create swap request error:", err);
    
    if (err instanceof Error && err.message === 'No token provided') {
      return res.status(401).json({ message: "Please log in first" });
    }
    
    res.status(500).json({ 
      message: "Failed to create swap request",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// Get user's sent swap requests
export const getMySwapRequests = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    // Verify token
    const decoded = decodeToken(req);
    
    // Simple verification - allow users to see their own requests
    if (decoded.email !== email) {
      return res.status(403).json({ 
        message: "Can only view your own requests" 
      });
    }

    const requests = await SwapRequest.find({ requesterEmail: email })
      .populate('targetSlotId')
      .populate('offeredSlotId')
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });

  } catch (err) {
    console.error("Get my swap requests error:", err);
    res.status(500).json({ 
      message: "Failed to fetch your requests",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// Get user's received swap requests
export const getReceivedSwapRequests = async (req: Request, res: Response) => {
  try {
    const decoded = decodeToken(req);
    const userEmail = decoded.email;

    const requests = await SwapRequest.find({ 
      targetSlotOwnerEmail: userEmail,
      status: "PENDING"
    })
      .populate('targetSlotId')
      .populate('offeredSlotId')
      .sort({ createdAt: -1 });

    res.json({ requests });

  } catch (err) {
    console.error("Get received swap requests error:", err);
    res.status(500).json({ 
      message: "Failed to fetch received requests",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// Approve/Reject swap request - SIMPLIFIED
export const updateSwapRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "APPROVE" or "REJECT"
    
    const decoded = decodeToken(req);
    const userEmail = decoded.email;

    if (!["APPROVE", "REJECT"].includes(status)) {
      return res.status(400).json({ message: "Use 'APPROVE' or 'REJECT'" });
    }

    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate('targetSlotId')
      .populate('offeredSlotId');

    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    // Simple permission check - target slot owner can manage
    const swapReq = swapRequest as any;
    if (swapReq.targetSlotOwnerEmail !== userEmail) {
      return res.status(403).json({ 
        message: "Can only manage requests for your slots" 
      });
    }

    // Check if request is still pending
    if (swapReq.status !== "PENDING") {
      return res.status(400).json({ 
        message: "Request already processed" 
      });
    }

    if (status === "APPROVE") {
      // Simple swap - just exchange owners
      const targetSlot = swapReq.targetSlotId;
      const offeredSlot = swapReq.offeredSlotId;

      // Swap the owners
      const tempEmail = targetSlot.userEmail;
      const tempId = targetSlot.userId;

      await Slot.findByIdAndUpdate(targetSlot._id, {
        userEmail: offeredSlot.userEmail,
        userId: offeredSlot.userId,
        status: "BUSY"
      });

      await Slot.findByIdAndUpdate(offeredSlot._id, {
        userEmail: tempEmail,
        userId: tempId,
        status: "BUSY"
      });

      // Update request status
      await SwapRequest.findByIdAndUpdate(requestId, { status: "APPROVED" });

    } else if (status === "REJECT") {
      // Just update status
      await SwapRequest.findByIdAndUpdate(requestId, { status: "REJECTED" });
    }

    // Get updated request
    const updatedRequest = await SwapRequest.findById(requestId)
      .populate('targetSlotId')
      .populate('offeredSlotId');

    res.json({
      message: `Swap request ${status.toLowerCase()}d`,
      request: updatedRequest
    });

  } catch (err) {
    console.error("Update swap request status error:", err);
    res.status(500).json({ 
      message: "Failed to update request",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// Cancel swap request - SIMPLIFIED
export const cancelSwapRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    
    const decoded = decodeToken(req);
    const userEmail = decoded.email;

    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const swapReq = swapRequest as any;

    // Simple check - requester can cancel their own requests
    if (swapReq.requesterEmail !== userEmail) {
      return res.status(403).json({ 
        message: "Can only cancel your own requests" 
      });
    }

    // Check if request is still pending
    if (swapReq.status !== "PENDING") {
      return res.status(400).json({ 
        message: "Cannot cancel processed request" 
      });
    }

    // Cancel the request
    await SwapRequest.findByIdAndUpdate(requestId, { status: "CANCELLED" });

    // Get updated request
    const updatedRequest = await SwapRequest.findById(requestId)
      .populate('targetSlotId')
      .populate('offeredSlotId');

    res.json({ 
      message: "Swap request cancelled",
      request: updatedRequest
    });

  } catch (err) {
    console.error("Cancel swap request error:", err);
    res.status(500).json({ 
      message: "Failed to cancel request",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};

// Get all swappable slots - SIMPLIFIED
export const getAllSwappableSlots = async (req: Request, res: Response) => {
  try {
    const slots = await Slot.find({ 
      isSwappable: true, 
      status: "SWAPPABLE" 
    });

    res.status(200).json({
      message: "Swappable slots fetched",
      slots,
    });

  } catch (error) {
    console.error("Fetch swappable slots error:", error);
    res.status(500).json({ 
      message: "Failed to fetch slots",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get swap history/logs
export const getSwapHistory = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const decoded = decodeToken(req);
    
    if (decoded.email !== email) {
      return res.status(403).json({ 
        message: "Can only view your own history" 
      });
    }

    // Get all requests involving this user
    const requests = await SwapRequest.find({
      $or: [
        { requesterEmail: email },
        { targetSlotOwnerEmail: email }
      ],
      status: { $in: ["APPROVED", "REJECTED", "CANCELLED"] }
    })
      .populate('targetSlotId')
      .populate('offeredSlotId')
      .sort({ updatedAt: -1 });

    res.json({ requests });

  } catch (err) {
    console.error("Get swap history error:", err);
    res.status(500).json({ 
      message: "Failed to fetch history",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
};