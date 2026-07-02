import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { userContext } from "../context/UserContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { token, setToken } = useContext(userContext);
  const navigate = useNavigate();

  // লগআউট ফাংশন
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <nav className="bg-gray-200 p-4 sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <div 
          className="text-2xl font-extrabold text-blue-600 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          MyApp
        </div>

        {/* Links - Desktop (সবগুলো পেজ এখানে আছে) */}
        <div className="hidden md:flex gap-5 items-center">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Home</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Profile</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Contact</NavLink>
          <NavLink to="/partice" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Partice</NavLink>
          <NavLink to="/order" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Order</NavLink>
          <NavLink to="/verify" className={({ isActive }) => isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-500"}>Verify</NavLink>

          {/* প্রোফাইল আইকন ও লগআউট ড্রপডাউন */}
          <div className="relative group ml-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer font-bold border-2 border-white shadow-md transform transition group-hover:scale-105">
              U
            </div>
            
            {/* ড্রপডাউন মেনু (Hover করলে আসবে) */}
            <div className="absolute right-0 hidden group-hover:block bg-white shadow-2xl border rounded-lg mt-2 p-2 w-40 z-50 animate-fadeIn">
              <div className="py-2 px-3 text-xs text-gray-400 uppercase font-bold border-b">Settings</div>
              <p 
                onClick={() => navigate('/order')} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-2 text-gray-700"
              >
                📦 My Orders
              </p>
              <p 
                onClick={logout} 
                className="p-2 hover:bg-red-50 cursor-pointer text-sm text-red-500 font-bold flex items-center gap-2"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Hamburger button (Mobile) */}
        <button
          className="md:hidden text-gray-700 text-3xl focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu (সবগুলো পেজ মোবাইলেও থাকবে) */}
      {open && (
        <div className="flex flex-col gap-4 mt-4 md:hidden bg-white p-5 rounded-xl shadow-xl border border-gray-100 animate-slideIn">
          <NavLink to="/" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Home</NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Profile</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Contact</NavLink>
          <NavLink to="/partice" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Partice</NavLink>
          <NavLink to="/order" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Order</NavLink>
          <NavLink to="/verify" onClick={() => setOpen(false)} className="text-lg border-b pb-2">Verify</NavLink>
          <button 
            onClick={() => { logout(); setOpen(false); }} 
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold mt-2 shadow-md"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;