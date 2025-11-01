import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DecodedToken {
  email: string;
  [key: string]: any;
}

const CreateSlot: React.FC = () => {
  const [slotName, setSlotName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSwappable, setIsSwappable] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in first.");
      setIsLoading(false);
      return;
    }

    let userEmail: string;
    try {
      const decodedToken: DecodedToken = JSON.parse(atob(token.split(".")[1]));
      userEmail = decodedToken.email;
    } catch (err) {
      console.error("Token decoding failed:", err);
      setError("Invalid token. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://slotswapper1.onrender.com/api/slot/Create-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: slotName,
          description,
          startTime,
          endTime,
          isSwappable,
          userEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to create slot");
        return;
      }

      // Success animation and redirect
      setIsLoading(false);
      setTimeout(() => {
        navigate("/SlotSwapper/my-slots");
      }, 1500);
      
    } catch (err) {
      console.error("Request failed:", err);
      setError("Something went wrong while creating the slot.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏰</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Create New Slot</h1>
          <p className="text-cyan-100 mt-2">Schedule your time, maximize your efficiency</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slot Name */}
            <div className="group">
              <label className="block text-cyan-300 font-semibold mb-3 text-lg">
                Slot Name
              </label>
              <input
                type="text"
                value={slotName}
                onChange={(e) => setSlotName(e.target.value)}
                required
                placeholder="e.g., Morning Lab Session"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-cyan-300 font-semibold mb-3 text-lg">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add extra details about this time slot..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none group-hover:bg-white/10"
              />
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-cyan-300 font-semibold mb-3">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
              </div>
              <div className="group">
                <label className="block text-cyan-300 font-semibold mb-3">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
              </div>
            </div>

            {/* Swappable Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div>
                <label htmlFor="swappable" className="text-cyan-300 font-semibold cursor-pointer">
                  Make this slot swappable
                </label>
                <p className="text-gray-400 text-sm mt-1">
                  Allow others to request swaps for this time slot
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  id="swappable"
                  checked={isSwappable}
                  onChange={(e) => setIsSwappable(e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                    isSwappable ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setIsSwappable(!isSwappable)}
                >
                  <div 
                    className={`bg-white w-6 h-6 rounded-full shadow-lg transform transition-transform duration-300 ${
                      isSwappable ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-2xl shadow-cyan-500/25'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Slot...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Time Slot
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 py-3 px-6 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSlot;
