import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const CreateSlot: React.FC = () => {
  const [slotName, setSlotName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSwappable, setIsSwappable] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in first.");
      return;
    }
    const decodedToken: any = JSON.parse(atob(token.split(".")[1]));
    const userId = decodedToken.id;
    
    console.log("Decoded User ID:", userId);
    try {
      const response = await fetch("http://localhost:3000/api/slot/Create-slots", {
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
          userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Slot created successfully!");
        navigate("/dashboard");
      } else {
        setError(data.message || "Failed to create slot");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Create New Slot
        </h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Slot Name
            </label>
            <input
              type="text"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Morning Lab Session"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add extra details..."
            ></textarea>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id="swappable"
              checked={isSwappable}
              onChange={(e) => setIsSwappable(e.target.checked)}
            />
            <label htmlFor="swappable" className="text-gray-700">
              Mark this slot as swappable
            </label>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Slot
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSlot;


