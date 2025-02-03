import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";

export default function Navigation() {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    localStorage.removeItem("role"); // Remove role
    navigate("/login"); // Redirect to login
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px threshold
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowNav(true);
      }

      // Always show nav at top
      if (currentScrollY === 0) {
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transform transition-transform duration-300 ${
      !showNav ? '-translate-y-full' : 'translate-y-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            {/* Nav Links */}
          <div className="flex space-x-8">
            <NavLink 
              to="/counter" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-red-100'
                }`
              }
            >
              Counter
            </NavLink>
            <NavLink 
              to="/search" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-red-100'
                }`
              }
            >
              Search
            </NavLink>
            <NavLink 
              to="/get-names" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-red-100'
                }`
              }
            >
              Get Names
            </NavLink>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}