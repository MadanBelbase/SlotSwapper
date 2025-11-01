import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  exp?: number;
}

interface Slot {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isSwappable: boolean;
  userEmail: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUser(decoded);

        const response = await fetch("https://slotswapper1.onrender.com/api/slot/all-slots", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch slots");

        const data = await response.json();
        setAllSlots(data.allSlots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return "Past";
    if (hours < 1) return "Soon";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-200 text-xl mb-4">{error}</p>
        <Link to="/SlotSwapper/login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
          Return to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          
          {user && (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-xl text-gray-300 mb-6">
                Welcome back,{" "}
                <span className="font-bold text-cyan-300">
                  {user.name || user.email}
                </span>! 👋
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/SlotSwapper/create-slot"
                  className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/25"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <span className="font-semibold">Create Slot</span>
                </Link>

                <Link
                  to="/SlotSwapper/my-slots"
                  className="group bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <span className="font-semibold">Your Slots</span>
                </Link>

                <Link
                  to="/SlotSwapper/slot-swaps"
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-500/25"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <span className="font-semibold">View Swaps</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* All Slots Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-cyan-300">All Available Slots</h2>
            <div className="text-gray-400">
              {allSlots.length} slot{allSlots.length !== 1 ? 's' : ''} total
            </div>
          </div>

          {allSlots.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-2">No Slots Available</h3>
              <p className="text-gray-400 mb-6">Be the first to create a time slot!</p>
              <Link
                to="/SlotSwapper/create-slot"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Create Your First Slot
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSlots.map((slot) => (
                <div 
                  key={slot._id} 
                  className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setExpandedSlotId(expandedSlotId === slot._id ? null : slot._id)}
                >
                  {/* Slot Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {slot.name}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      slot.isSwappable 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/50'
                    }`}>
                      {slot.isSwappable ? '🔄 Swappable' : '🔒 Locked'}
                    </div>
                  </div>

                  {/* Slot Description */}
                  <p className="text-gray-300 mb-4 line-clamp-2">{slot.description}</p>

                  {/* Time Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                      {getTimeUntil(slot.startTime)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(slot.startTime).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-sm font-semibold transition-all flex items-center justify-center">
                    {expandedSlotId === slot._id ? "Hide Details" : "View Details"}
                    <svg 
                      className={`w-4 h-4 ml-2 transition-transform ${
                        expandedSlotId === slot._id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Details */}
                  {expandedSlotId === slot._id && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-slideDown">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Start:</span>
                        <span className="text-white">{new Date(slot.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">End:</span>
                        <span className="text-white">{new Date(slot.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Created by:</span>
                        <span className="text-cyan-300">{slot.userEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 inline-block">
            Logged in as: <span className="text-cyan-300 font-mono">{user?.email}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;