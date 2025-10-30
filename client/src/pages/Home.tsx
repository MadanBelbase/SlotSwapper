import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Welcome to SlotSwapper 🎉</h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
        Easily swap, manage, and organize your schedules with efficiency.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Login
        </a>
        <a
          href="/signup"
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default Home;
