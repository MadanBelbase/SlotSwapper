import express from "express";
import { 
  createSwapRequest, 

  updateSwapRequestStatus, 
  getMySwapRequests, 
  getAllSwappableSlots,
  getReceivedSwapRequests,
  cancelSwapRequest,
  getSwapHistory
} from "../controller/swapController";

const router = express.Router();

// Create swap request
router.post("/request", createSwapRequest);



// Get user's sent swap requests
router.get("/my-requests/:email", getMySwapRequests);

// Get user's received swap requests
router.get("/received", getReceivedSwapRequests);

// Get swap history
router.get("/history/:email", getSwapHistory);

// Update swap request status (approve/reject)
router.put("/:requestId/status", updateSwapRequestStatus);

// Cancel swap request
router.put("/:requestId/cancel", cancelSwapRequest);

// Get all swappable slots
router.get('/swappable-slots', getAllSwappableSlots);

export default router;