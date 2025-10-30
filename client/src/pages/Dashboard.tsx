import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  exp?: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        <p className="text-lg text-gray-600">Loading user info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-2xl">
        <p className="text-lg text-gray-700 mb-4">
          Welcome back,{" "}
          <span className="font-semibold text-blue-700">
            {user.name || user.email}
          </span>
          ! 👋
        </p>

        <p className="text-gray-600 mb-6">
          You don’t have any slots yet. Start by creating your first slot or
          managing existing ones.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/create-slot"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            ➕ Create Slot
          </Link>

          <Link
            to="/my-slots"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
          >
            📋 Your Slots
          </Link>

          <Link
            to="/slot-swaps"
            className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            🔄 View Swaps
          </Link>
        </div>
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        Logged in as: {user.email}
      </footer>
    </div>
  );
};

export default Dashboard;

