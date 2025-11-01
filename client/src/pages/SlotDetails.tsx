import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Slot {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isSwappable: boolean;
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING";
  userEmail: string;
}

interface DecodedToken {
  email: string;
  name?: string;
}

const SlotPage: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSwappable, setIsSwappable] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view this slot.");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserEmail(decoded.email);

        const slotRes = await fetch(`https://slotswapper1.onrender.com/api/slot/${slotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!slotRes.ok) throw new Error("Failed to fetch slot details");
        const slotData: { slot: Slot } = await slotRes.json();
        setSlot(slotData.slot);

        if (decoded.email === slotData.slot.userEmail) {
          setName(slotData.slot.name);
          setDescription(slotData.slot.description);
          setStartTime(new Date(slotData.slot.startTime).toISOString().slice(0, 16));
          setEndTime(new Date(slotData.slot.endTime).toISOString().slice(0, 16));
          setIsSwappable(slotData.slot.isSwappable);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slotId]);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://slotswapper1.onrender.com/api/slot/${slotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, startTime, endTime, isSwappable }),
      });

      if (!res.ok) throw new Error("Failed to update slot");
      const data = await res.json();
      setSlot(data.slot);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://slotswapper1.onrender.com/api/slot/${slotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete slot");
      setShowDeleteModal(false);
      navigate("/SlotSwapper/my-slots");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SWAPPABLE":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "SWAP_PENDING":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "BUSY":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading slot details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-red-200 text-xl mb-2">Error Loading Slot</h3>
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

  if (!slot)
    return (
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

  const isCreator = userEmail === slot.userEmail;
  const duration = formatDuration(slot.startTime, slot.endTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Slot Details
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-8">
            {/* Status Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full border mb-6 ${getStatusColor(slot.status)}`}>
              <div className="w-2 h-2 rounded-full mr-2 bg-current"></div>
              Status: {slot.status.replace("_", " ")}
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-cyan-300 font-semibold mb-3 text-lg">Slot Name</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="group">
                  <label className="block text-cyan-300 font-semibold mb-3 text-lg">Description</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-cyan-500"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-cyan-300 font-semibold mb-3">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-cyan-300 font-semibold mb-3">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSwappable}
                    onChange={(e) => setIsSwappable(e.target.checked)}
                    className="w-5 h-5 bg-white/5 border-white/10 rounded focus:ring-cyan-500"
                  />
                  <span className="text-cyan-300 font-semibold">Make this slot swappable</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <h2 className="text-3xl font-bold text-cyan-300 mb-2">{slot.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 flex items-center space-x-2"
                    >
                      <span>←</span>
                      <span>Back</span>
                    </button>

                    {isCreator && (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-all flex items-center space-x-2"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>

                        {/* Swap Button */}
                        <button
                          onClick={() => navigate(`/SlotSwapper/swap/${slotId}`)}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
                        >
                          <span>📋</span>
                          <span>Swap</span>
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-xl font-semibold hover:scale-105 transition-all flex items-center space-x-2"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed">{slot.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-cyan-300 font-semibold mb-1">⏰ Start Time</p>
                    <p>{new Date(slot.startTime).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-cyan-300 font-semibold mb-1">⏱️ End Time</p>
                    <p>{new Date(slot.endTime).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-cyan-300 font-semibold mb-1">🕒 Duration</p>
                    <p>{duration}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-cyan-300 font-semibold mb-1">🔄 Swappable</p>
                    <p>{slot.isSwappable ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-cyan-300 font-semibold mb-1">👤 Created By</p>
                  <p>{slot.userEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-red-300 mb-4 flex items-center">
              <span className="text-3xl mr-3">⚠️</span>
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this slot? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotPage;
