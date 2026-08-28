import {
  FaTimes,
  FaHistory,
  FaSignOutAlt,
  FaUserCircle,
   FaClock,
   FaFlag 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

export default function RightSidebar({ isOpen, onClose }) {

  const  email = localStorage.getItem("email");
 const name = email.split("@")[0].replace(/\d+/g, "");


  

  
  const navigate = useNavigate();


  const handleLogout = ()=>{
        logoutUser();
          navigate("/");
  }
  
  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-zinc-900 border-l border-zinc-700 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-white">Profile</h2>

          <button onClick={onClose}>
            <FaTimes className="text-xl text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* User */}
        <div className="flex flex-col items-center py-8 border-b border-zinc-700">
          <FaUserCircle className="text-7xl text-gray-300 mb-3" />

          <h3 className="text-xl font-semibold text-white">{name}</h3>

          <p className="text-white text-sm">
            {email}
          </p>
        </div>

        {/* Menu */}
        <div className="p-5 space-y-3">

        

         <button
  onClick={() => {
    navigate("/royal-reward");
    onClose();
  }}
  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-zinc-800 transition"
>
  <FaClock className="text-black-400 text-xl text-white" />
  <span className="font-medium text-white">Royal Rewards</span>
</button>

          <button 
          onClick={() => {
    navigate("/history");
    onClose();
  }}

          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-zinc-800 transition">
            <FaHistory className="text-black-400 text-xl text-white" />
            <span className="font-medium text-white">History</span>
          </button>





 <button 
          onClick={() => {
    navigate("/growth");
    onClose();
  }}

          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-zinc-800 transition">
            <FaFlag  className="text-black-400 text-xl text-white" />
            <span className="font-medium text-white">Growth</span>
          </button>




        </div>















        

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-5 border-t border-zinc-700">
          <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </>
  );


  
}