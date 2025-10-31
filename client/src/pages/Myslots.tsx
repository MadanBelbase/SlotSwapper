import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

interface Slot {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isSwappable: boolean;
  userEmail: string;
}

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  exp?: number;
}

const MySlots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [swapTargetSlot, setSwapTargetSlot] = useState<string>("");
  const [swapMessage, setSwapMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your slots.");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userEmail = decoded.email;

        if (!userEmail) throw new Error("Invalid token: user email not found");

        const response = await fetch(`http://localhost:3000/api/slot/my-slots/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch slots");

        const data = await response.json();
        setSlots(data.slots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start)
      return { status: "upcoming", color: "bg-blue-500/20 text-blue-300 border-blue-500/50", icon: "⏰" };
    if (now >= start && now <= end)
      return { status: "ongoing", color: "bg-green-500/20 text-green-300 border-green-500/50", icon: "🔥" };
    return { status: "completed", color: "bg-gray-500/20 text-gray-300 border-gray-500/50", icon: "✅" };
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
      <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>
    );

  const filteredSlots = slots.filter((slot) => {
    if (activeTab === "all") return true;
    const status = getTimeStatus(slot.startTime, slot.endTime);
    return status.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          My Slots
        </h1>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSlots.map((slot) => {
            const timeStatus = getTimeStatus(slot.startTime, slot.endTime);
            const duration = formatDuration(slot.startTime, slot.endTime);

            return (
              <div
                key={slot._id}
                className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {slot.name}
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${timeStatus.color}`}
                  >
                    {timeStatus.icon} {timeStatus.status}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-2 text-sm">{slot.description}</p>

                {/* Time Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start:</span>
                    <span>{new Date(slot.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End:</span>
                    <span>{new Date(slot.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-cyan-300 font-semibold">{duration}</span>
                  </div>
                </div>

                {/* Swappable Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    slot.isSwappable
                      ? "bg-green-500/20 text-green-300 border-green-500/50"
                      : "bg-red-500/20 text-red-300 border-red-500/50"
                  }`}
                >
                  {slot.isSwappable ? "🔄 Swappable" : "🔒 Locked"}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-white/10 mt-4">
                  <Link
                    to={`/slot/${slot._id}`}
                    className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-xl text-sm font-semibold text-center transition-all"
                  >
                    👁️ View
                  </Link>
                  {slot.isSwappable && (
                    <button
                      onClick={() => navigate(`/swap/${slot._id}`)}
                      className="flex-1 py-2 px-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 rounded-xl text-sm font-semibold text-center transition-all transform hover:scale-105"
                    >
                      📋 Swap
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MySlots;
