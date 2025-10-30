import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  exp?: number;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        // Check if token expired
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold cursor-pointer" onClick={() => navigate("/")}>
              SlotSwapper
            </h1>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="flex space-x-6 items-center">
              {user ? (
                <>
                  <li>
                    <Link
                      to="/create-slot"
                      className="font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-blue-700 hover:shadow-md"
                    >
                      Create Slot
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-blue-700 hover:shadow-md"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-red-600 hover:shadow-md"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-blue-700 hover:shadow-md"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-blue-100 hover:shadow-md"
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
