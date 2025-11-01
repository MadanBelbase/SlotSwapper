// SwapManagementPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Slot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  userEmail: string;
  description?: string;
}

interface SwapRequest {
  _id: string;
  targetSlotId: Slot;
  offeredSlotId: Slot;
  requesterEmail: string;
  targetSlotOwnerEmail: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

const SwapManagementPage: React.FC = () => {
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [myRequests, setMyRequests] = useState<SwapRequest[]>([]);
  const [logs, setLogs] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState({
    received: true,
    myRequests: true,
    logs: true
  });
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "logs">("received");

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("email") || "";

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (token && userEmail) {
      fetchReceivedRequests();
      fetchMyRequests();
      fetchLogs();
    }
  }, [token, userEmail]);

  const fetchReceivedRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, received: true }));
      const res = await axios.get("https://slotswapper1.onrender.com/api/swap/received", axiosConfig);
      setReceivedRequests(res.data.requests || []);
    } catch (err: any) {
      console.error("Error fetching received requests:", err);
      alert(err.response?.data?.message || "Failed to fetch received requests");
    } finally {
      setLoading(prev => ({ ...prev, received: false }));
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, myRequests: true }));
      const res = await axios.get(`https://slotswapper1.onrender.com/api/swap/my-requests/${userEmail}`, axiosConfig);
      setMyRequests(res.data.requests || []);
    } catch (err: any) {
      console.error("Error fetching my requests:", err);
      alert(err.response?.data?.message || "Failed to fetch your requests");
    } finally {
      setLoading(prev => ({ ...prev, myRequests: false }));
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      // Since we don't have a specific logs endpoint, we'll use all requests and filter
      const receivedRes = await axios.get("https://slotswapper1.onrender.com/api/swap/received", axiosConfig);
      const myRes = await axios.get(`https://slotswapper1.onrender.com/api/swap/my-requests/${userEmail}`, axiosConfig);
      
      const allRequests = [
        ...(receivedRes.data.requests || []),
        ...(myRes.data.requests || [])
      ];
      
      // Filter for completed requests (approved, rejected, cancelled)
      const completedRequests = allRequests.filter(
        (req: SwapRequest) => 
          req.status === "APPROVED" || 
          req.status === "REJECTED" || 
          req.status === "CANCELLED"
      );
      
      setLogs(completedRequests);
    } catch (err: any) {
      console.error("Error fetching swap logs:", err);
      // Don't show alert for logs as it's non-critical
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  const handleApproveReject = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      await axios.put(
        `https://slotswapper1.onrender.com/api/swap/${requestId}/status`, 
        { status: action }, 
        axiosConfig
      );
      fetchReceivedRequests();
      fetchLogs();
      alert(`Swap request ${action.toLowerCase()}d successfully`);
    } catch (err: any) {
      console.error("Error updating swap request:", err);
      alert(err.response?.data?.message || "Failed to update request");
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await axios.put(
        `https://slotswapper1.onrender.com/api/swap/${requestId}/cancel`, 
        {}, 
        axiosConfig
      );
      fetchMyRequests();
      fetchLogs();
      alert("Swap request cancelled successfully");
    } catch (err: any) {
      console.error("Error cancelling request:", err);
      alert(err.response?.data?.message || "Failed to cancel request");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500";
      case "APPROVED": return "bg-green-500";
      case "REJECTED": return "bg-red-500";
      case "CANCELLED": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  if (!token || !userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-red-200 text-xl mb-2">Authentication Required</h3>
          <p className="text-red-300 mb-6">Please log in to view swap management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Swap Management
        </h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/20 mb-6">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "received"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("received")}
          >
            Received Requests
            {receivedRequests.length > 0 && (
              <span className="ml-2 bg-cyan-500 text-white text-xs rounded-full px-2 py-1">
                {receivedRequests.filter(req => req.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "sent"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("sent")}
          >
            My Requests
            {myRequests.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {myRequests.filter(req => req.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "logs"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            Swap History
          </button>
        </div>

        {/* Received Requests Tab */}
        {activeTab === "received" && (
          <section className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
              <span className="text-3xl mr-3">📥</span>
              Received Swap Requests
            </h2>
            
            {loading.received ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading received requests...</p>
              </div>
            ) : receivedRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl">No received swap requests</p>
                <p className="text-sm mt-2">When someone requests to swap with your slots, they'll appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {receivedRequests.map((req) => (
                  <div key={req._id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <span className="ml-3 text-sm text-gray-300">
                            From: {req.requesterEmail}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-cyan-300 font-semibold mb-2">Your Slot</h4>
                            <p className="font-semibold">{req.targetSlotId.name}</p>
                            <p className="text-sm text-gray-300">
                              {formatDate(req.targetSlotId.startTime)} - {formatDate(req.targetSlotId.endTime)}
                            </p>
                            <p className="text-sm text-gray-300">
                              Duration: {formatDuration(req.targetSlotId.startTime, req.targetSlotId.endTime)}
                            </p>
                          </div>
                          
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-cyan-300 font-semibold mb-2">Offered Slot</h4>
                            <p className="font-semibold">{req.offeredSlotId.name}</p>
                            <p className="text-sm text-gray-300">
                              {formatDate(req.offeredSlotId.startTime)} - {formatDate(req.offeredSlotId.endTime)}
                            </p>
                            <p className="text-sm text-gray-300">
                              Duration: {formatDuration(req.offeredSlotId.startTime, req.offeredSlotId.endTime)}
                            </p>
                          </div>
                        </div>

                        {req.message && (
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-4">
                            <h4 className="text-cyan-300 font-semibold mb-1">Message</h4>
                            <p className="text-sm">{req.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-semibold transition-all"
                          onClick={() => handleApproveReject(req._id, "APPROVE")}
                        >
                          ✅ Approve Swap
                        </button>
                        <button
                          className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl font-semibold transition-all"
                          onClick={() => handleApproveReject(req._id, "REJECT")}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* My Requests Tab */}
        {activeTab === "sent" && (
          <section className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
              <span className="text-3xl mr-3">📤</span>
              My Swap Requests
            </h2>
            
            {loading.myRequests ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading your requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl">No swap requests sent</p>
                <p className="text-sm mt-2">Your swap requests will appear here once you send them.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myRequests.map((req) => (
                  <div key={req._id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                          <span className="ml-3 text-sm text-gray-300">
                            To: {req.targetSlotOwnerEmail}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-cyan-300 font-semibold mb-2">Target Slot</h4>
                            <p className="font-semibold">{req.targetSlotId.name}</p>
                            <p className="text-sm text-gray-300">
                              {formatDate(req.targetSlotId.startTime)} - {formatDate(req.targetSlotId.endTime)}
                            </p>
                            <p className="text-sm text-gray-300">
                              Owner: {req.targetSlotOwnerEmail}
                            </p>
                          </div>
                          
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-cyan-300 font-semibold mb-2">Your Offered Slot</h4>
                            <p className="font-semibold">{req.offeredSlotId.name}</p>
                            <p className="text-sm text-gray-300">
                              {formatDate(req.offeredSlotId.startTime)} - {formatDate(req.offeredSlotId.endTime)}
                            </p>
                          </div>
                        </div>

                        {req.message && (
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-4">
                            <h4 className="text-cyan-300 font-semibold mb-1">Your Message</h4>
                            <p className="text-sm">{req.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                          className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-xl font-semibold transition-all"
                          onClick={() => handleCancelRequest(req._id)}
                        >
                          🗑️ Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Swap History Tab */}
        {activeTab === "logs" && (
          <section className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
              <span className="text-3xl mr-3">📊</span>
              Swap History
            </h2>
            
            {loading.logs ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading swap history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl">No swap history yet</p>
                <p className="text-sm mt-2">Completed swap requests will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {logs.map((log) => (
                  <div key={log._id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      <span className="ml-3 text-sm text-gray-300">
                        {formatDate(log.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-300 font-semibold mb-2">
                          {log.requesterEmail === userEmail ? "Your Offered Slot" : "Offered Slot"}
                        </h4>
                        <p className="font-semibold">{log.offeredSlotId.name}</p>
                        <p className="text-sm text-gray-300">
                          {formatDate(log.offeredSlotId.startTime)} - {formatDate(log.offeredSlotId.endTime)}
                        </p>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-300 font-semibold mb-2">
                          {log.targetSlotOwnerEmail === userEmail ? "Your Target Slot" : "Target Slot"}
                        </h4>
                        <p className="font-semibold">{log.targetSlotId.name}</p>
                        <p className="text-sm text-gray-300">
                          {formatDate(log.targetSlotId.startTime)} - {formatDate(log.targetSlotId.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 mb-2">
                      <span className="font-semibold">Parties:</span> {log.requesterEmail} ↔ {log.targetSlotOwnerEmail}
                    </div>

                    {log.message && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                        <h4 className="text-cyan-300 font-semibold mb-1">Message</h4>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default SwapManagementPage;