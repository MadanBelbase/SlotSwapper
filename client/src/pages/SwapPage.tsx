import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


interface Slot {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isSwappable: boolean;
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING";
  userEmail: string;
  userId: string;
}

interface SwapRequest {
  _id: string;
  targetSlotId: string;
  offeredSlotId: string;
  targetSlotOwnerEmail: string;
  requesterEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  message?: string;
  proposedStartTime: string;
  proposedEndTime: string;
  createdAt: string;
  updatedAt: string;
}

interface DecodedToken {
  email: string;
  name?: string;
  id: string;
}

const SwapPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const [targetSlot, setTargetSlot] = useState<Slot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedOfferedSlot, setSelectedOfferedSlot] = useState<string>("");
  const [swapMessage, setSwapMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOwnSlot, setIsOwnSlot] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to request a swap.");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserEmail(decoded.email);
        setUserName(decoded.name || decoded.email.split('@')[0]);
        setUserId(decoded.id);

        // Fetch target slot details
        const slotRes = await fetch(`https://slotswapper1.onrender.com/api/slot/${slotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!slotRes.ok) throw new Error("Failed to fetch slot details");
        
        const slotData = await slotRes.json();
        
        // Handle different response structures
        const targetSlotData = slotData.slot || slotData;
        if (!targetSlotData) {
          throw new Error("Invalid slot data received");
        }
        
        setTargetSlot(targetSlotData);

        // Check if user is trying to swap their own slot
        const ownSlot = decoded.email === targetSlotData.userEmail;
        setIsOwnSlot(ownSlot);

        // Allow swapping regardless of ownership, but show appropriate messaging
        if (!targetSlotData.isSwappable || targetSlotData.status !== "SWAPPABLE") {
          setError("This slot is not available for swapping.");
          setLoading(false);
          return;
        }

        let swappableSlots: Slot[] = [];

        // Try to fetch ALL swappable slots (not just user's slots)
        try {
          const allSlotsRes = await fetch(
            `https://slotswapper1.onrender.com/api/swap/swappable-slots`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (allSlotsRes.ok) {
            const allSlotsData = await allSlotsRes.json();
            
            // Handle different response structures
            const slotsArray = allSlotsData.slots || allSlotsData || [];
            
            // Filter out the target slot itself and only include swappable slots
            swappableSlots = slotsArray.filter(
              (slot: Slot) =>
                slot &&
                slot._id &&
                slot.isSwappable && 
                slot.status === "SWAPPABLE" && 
                slot._id !== slotId
            );
          }
        } catch (swappableError) {
          console.log("Swappable slots endpoint not available, falling back to user slots");
        }

        // If no swappable slots found from the first endpoint, try user's slots
        if (swappableSlots.length === 0) {
          try {
            const userSlotsRes = await fetch(
              `https://slotswapper1.onrender.com/api/slot/my-slots/${decoded.email}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (userSlotsRes.ok) {
              const userSlotsData = await userSlotsRes.json();
              const userSlotsArray = userSlotsData.slots || userSlotsData || [];
              
              swappableSlots = userSlotsArray.filter(
                (slot: Slot) =>
                  slot &&
                  slot._id &&
                  slot.isSwappable && 
                  slot.status === "SWAPPABLE" && 
                  slot._id !== slotId
              );
            }
          } catch (userSlotsError) {
            console.log("User slots endpoint also failed");
          }
        }

        setAvailableSlots(swappableSlots);

        // Auto-select first available slot if there's only one
        if (swappableSlots.length === 1) {
          setSelectedOfferedSlot(swappableSlots[0]._id);
        }

      } catch (err) {
        console.error("Fetch data error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slotId]);

  const handleSwapRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedOfferedSlot) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("https://slotswapper1.onrender.com/api/swap/request", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          targetSlotId: slotId,
          offeredSlotId: selectedOfferedSlot,
          message: swapMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send swap request");
      }

      const result = await res.json();
      
      alert("Swap request sent successfully! 🎉");
      navigate("/SlotSwapper/your-swaps");
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "Swap request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    return `${minutes}m`;
  };

  const getSelectedSlotDetails = () => {
    return availableSlots.find(slot => slot._id === selectedOfferedSlot);
  };

  // Count slots by ownership - safely handle undefined
  const userSlotsCount = availableSlots ? availableSlots.filter(slot => slot.userEmail === userEmail).length : 0;
  const otherSlotsCount = availableSlots ? availableSlots.filter(slot => slot.userEmail !== userEmail).length : 0;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading swap details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-red-200 text-xl mb-2">Error</h3>
        <p className="text-red-300 mb-6">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!targetSlot) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-8 text-center max-w-md">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-yellow-200 text-xl mb-2">Slot Not Found</h3>
        <p className="text-yellow-300 mb-6">The requested slot could not be found.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const selectedSlot = getSelectedSlotDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Request Swap
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {isOwnSlot ? (
              <>Swap your own time slots</>
            ) : (
              <>Exchange your time slot with {targetSlot.userEmail}'s slot</>
            )}
          </p>
          {isOwnSlot && (
            <div className="mt-4 bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-cyan-200 flex items-center justify-center">
                <span className="mr-2">🔄</span>
                You are swapping your own slots
              </p>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Target Slot Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              {isOwnSlot ? "Your Slot You Want to Replace" : "Slot You Want"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-white">{targetSlot.name}</h4>
                <p className="text-gray-300 mt-2">{targetSlot.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-cyan-300 text-sm font-semibold">Start Time</p>
                  <p className="text-white text-sm">{new Date(targetSlot.startTime).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-cyan-300 text-sm font-semibold">End Time</p>
                  <p className="text-white text-sm">{new Date(targetSlot.endTime).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-cyan-300 text-sm font-semibold">Duration</p>
                  <p className="text-white text-sm">{formatDuration(targetSlot.startTime, targetSlot.endTime)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-cyan-300 text-sm font-semibold">Status</p>
                  <p className="text-white text-sm">{targetSlot.status}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-cyan-300 text-sm font-semibold">Created By</p>
                <p className="text-white text-sm">{targetSlot.userEmail}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-cyan-300 text-sm font-semibold">Swappable</p>
                <p className="text-white text-sm flex items-center">
                  {targetSlot.isSwappable ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Yes - Available for swapping
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      No - Not available for swapping
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Swap Form Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
              <span className="text-3xl mr-3">🔄</span>
              Your Offer
            </h3>

            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <p className="text-cyan-300 font-semibold">Requesting as:</p>
                <p className="text-white">{userName} ({userEmail})</p>
              </div>

              {/* Available Slots Selection */}
              <div className="group">
                <label className="block text-cyan-300 font-semibold mb-3">
                  Select a Slot to Offer
                </label>
                <select
                  value={selectedOfferedSlot}
                  onChange={(e) => setSelectedOfferedSlot(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Choose a slot to swap...</option>
                  
                  {/* User's own slots */}
                  {userSlotsCount > 0 && (
                    <optgroup label={`Your Slots (${userSlotsCount})`}>
                      {availableSlots
                        .filter(slot => slot.userEmail === userEmail)
                        .map(slot => (
                          <option key={slot._id} value={slot._id}>
                            🏠 {slot.name} ({new Date(slot.startTime).toLocaleString()})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  
                  {/* Other users' slots */}
                  {otherSlotsCount > 0 && (
                    <optgroup label={`Other Users' Slots (${otherSlotsCount})`}>
                      {availableSlots
                        .filter(slot => slot.userEmail !== userEmail)
                        .map(slot => (
                          <option key={slot._id} value={slot._id}>
                            👤 {slot.name} ({new Date(slot.startTime).toLocaleString()}) - by {slot.userEmail}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
                
                {availableSlots.length === 0 && (
                  <p className="text-yellow-300 text-sm mt-2">
                    No swappable slots available. Create one first!
                  </p>
                )}
                
                {/* Slot count summary */}
                {availableSlots.length > 0 && (
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Your slots: {userSlotsCount}</span>
                    <span>Others' slots: {otherSlotsCount}</span>
                    <span>Total: {availableSlots.length}</span>
                  </div>
                )}
              </div>

              {/* Selected Slot Details */}
              {selectedSlot && (
                <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/20">
                  <h4 className="text-cyan-300 font-semibold mb-3">Selected Slot Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cyan-300">Name:</span>
                      <span className="text-white">{selectedSlot.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300">Owner:</span>
                      <span className="text-white">
                        {selectedSlot.userEmail === userEmail ? "You" : selectedSlot.userEmail}
                        {selectedSlot.userEmail === userEmail && " 🏠"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300">Time:</span>
                      <span className="text-white">
                        {new Date(selectedSlot.startTime).toLocaleString()} - {new Date(selectedSlot.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300">Duration:</span>
                      <span className="text-white">{formatDuration(selectedSlot.startTime, selectedSlot.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300">Description:</span>
                      <span className="text-white">{selectedSlot.description || "No description"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="group">
                <label className="block text-cyan-300 font-semibold mb-3">
                  {selectedSlot && selectedSlot.userEmail === userEmail 
                    ? "Note (Optional)" 
                    : "Message to Slot Owner (Optional)"
                  }
                </label>
                <textarea
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  placeholder={
                    selectedSlot && selectedSlot.userEmail === userEmail 
                      ? "Add a note about this swap..." 
                      : `Explain why you want to swap with ${selectedSlot?.userEmail || 'the slot owner'}...`
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSwapRequest}
                  disabled={!selectedOfferedSlot || isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Request...
                    </div>
                  ) : (
                    "Send Swap Request"
                  )}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
            <span className="text-2xl mr-3">ℹ️</span>
            How Swapping Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-gray-300">
                Select any available slot - yours or others' - to offer in exchange
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-gray-300">
                {selectedSlot && selectedSlot.userEmail === userEmail 
                  ? "Self-swaps happen immediately" 
                  : "The slot owner reviews and approves/rejects your request"
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-gray-300">Track your requests in the 'Your Swaps' page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;