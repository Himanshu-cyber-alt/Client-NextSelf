import { FaStudiovinari, FaUserCircle } from "react-icons/fa";

export default function Navbar({ openSidebar, diamond }) {
  return (
    <nav className="sticky top-0 z-50 h-20 border-b border-zinc-800 flex items-center justify-between px-6 sm:px-10 bg-black">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">NextSelf</h1>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 bg-zinc-900 px-4 sm:px-5 py-2 rounded-full">
          <FaStudiovinari className="text-white text-2xl" />
          <span className="font-bold text-white">{diamond}</span>
        </div>

        <button onClick={openSidebar}>
          <FaUserCircle className="text-4xl sm:text-5xl text-gray-300 hover:text-white transition" />
        </button>
      </div>
    </nav>
  );
}