import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  exp?: number;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMenuOpen(false);
    navigate("/SlotSwapper/login");
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              isScrolled 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/25' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30'
            }`}>
              <span className={`text-xl font-bold ${
                isScrolled ? 'text-white' : 'text-white'
              }`}>🔄</span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
              isScrolled ? '' : 'drop-shadow-lg'
            }`}>
              SlotSwapper
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to= "/SlotSwapper/your-swaps"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/dashboard') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/25' 
                      : isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                  }`}
                >
                  Your Swaps
                </Link>
                <Link
                  to="/SlotSwapper/create-slot"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/create-slot') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/25' 
                      : isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                  }`}
                >
                  ➕ Create Slot
                </Link>
                <Link
                  to="/SlotSwapper/my-slots"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/my-slots') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/25' 
                      : isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                  }`}
                >
                  ⏰ My Slots
                </Link>
                <div className="relative group">
                  <button className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/20'
                  }`}>
                    <span>👤 {user.name || user.email.split('@')[0]}</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/SlotSwapper/login"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActiveRoute('/login') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/25' 
                      : isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                  }`}
                >
                  🔑 Login
                </Link>
                <Link
                  to="/SlotSwapper/signup"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700' 
                      : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  🚀 Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-3 rounded-xl transition-all duration-300 ${
              isScrolled 
                ? 'bg-gray-100 hover:bg-gray-200' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`w-6 h-6 relative transition-transform duration-300 ${
              isMenuOpen ? 'rotate-90' : ''
            }`}>
              <span className={`absolute block w-6 h-0.5 transition-all duration-300 ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              } ${isMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
              <span className={`absolute block w-6 h-0.5 transition-all duration-300 ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              } ${isMenuOpen ? 'opacity-0' : 'opacity-100 top-3'}`}></span>
              <span className={`absolute block w-6 h-0.5 transition-all duration-300 ${
                isScrolled ? 'bg-gray-700' : 'bg-white'
              } ${isMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className={`py-4 rounded-2xl backdrop-blur-xl border ${
            isScrolled 
              ? 'bg-white/90 border-gray-200' 
              : 'bg-white/20 border-white/30'
          }`}>
            {user ? (
              <div className="space-y-2 px-4">
                <div className="px-4 py-3 text-center border-b border-white/20 mb-2">
                  <p className={`font-semibold ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                    👋 Hello, {user.name || user.email.split('@')[0]}
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActiveRoute('/dashboard') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                      : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/SlotSwapper/create-slot"
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActiveRoute('/create-slot') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                      : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ➕ Create Slot
                </Link>
                <Link
                  to="/SlotSwapper/my-slots"
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActiveRoute('/my-slots') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                      : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⏰ My Slots
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${
                    isScrolled ? 'text-red-600 hover:bg-red-50' : 'text-red-300 hover:bg-red-500/20'
                  }`}
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  to="/login"
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActiveRoute('/login') 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                      : isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔑 Login
                </Link>
                <Link
                  to="/SlotSwapper/signup"
                  className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚀 Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;