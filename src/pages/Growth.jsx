import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RightSidebar from "../components/RightSidebar";
import { getGrowthTopics, addGrowthTopic, deleteGrowthTopic } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Growth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const uuid = localStorage.getItem("uuid");
  const navigate = useNavigate();

  // Load topics when page opens
  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const response = await getGrowthTopics(uuid);
      if (response.success) {
        setTopics(response.topics);
      }
    } catch (error) {
      console.error("Failed to load topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    
    

    try {
      const response = await addGrowthTopic(uuid, newTopic.trim());

      if (response.success) {
        // Add the new topic to the UI instantly
        setTopics([response.topic, ...topics]);
        setNewTopic(""); // Clear input
      }
    } catch (error) {
      console.log(error);
      alert("Could not add topic. Please try again.");
    }
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    try {
      await deleteGrowthTopic(topicId);
      // Remove it from the UI
      setTopics(topics.filter((t) => t.id !== topicId));
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  // Helper to convert 135 minutes -> "2h 15m"
  const formatTime = (totalMinutes) => {
    if (!totalMinutes) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };



return (
    <div className="min-h-screen relative font-sans">
     
      <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Cinematic Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/home.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" /> {/* Darker overlay for readability */}
      </div>

      <div className="min-h-screen w-full flex justify-center py-10 px-4">
        <div className="w-full max-w-4xl">
          
          {/* --- UPDATED HOME BUTTON USING USENAVIGATE --- */}
          <div className="mb-6">
            <button 
              onClick={() => navigate("/home")} 
              className="inline-flex items-center text-[#c5a059] hover:text-white transition-colors font-semibold tracking-wide bg-transparent border-none cursor-pointer p-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          </div>
          {/* --------------------------------------------- */}

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Skill Progression
            </h1>
            <p className="text-[#8892b0] uppercase tracking-widest text-sm">
              Track your time. Master your craft.
            </p>
          </div>

          {/* Add Topic Form */}
          <div className="bg-[#1f2833]/80 backdrop-blur-md border border-[#c5a059]/30 rounded-xl p-6 mb-10 shadow-2xl">
            <form onSubmit={handleAddTopic} className="flex gap-4">
              <input
                type="text"
                placeholder="E.g., JavaScript, DSA, AWS..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="flex-1 bg-[#0b0c10] border border-[#c5a059]/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#c5a059]"
                maxLength={50}
              />
              <button
                type="submit"
                disabled={!newTopic.trim()}
                className="bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Create Topic
              </button>
            </form>
          </div>

          {/* Topics List with Horizontal Lines */}
          {isLoading ? (
            <div className="text-[#dddfdd] text-center py-10 text-xl animate-pulse">Loading mastery stats...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#c5a059]/30 rounded-xl bg-[#0b0c10]/50">
              <p className="text-white text-lg">No topics created yet.</p>
              <p className="text-[#8892b0] text-sm mt-2">Start typing above to track your first skill.</p>
            </div>
          ) : (
            <div className="flex flex-col border-t border-[#8892b0]/40 mt-4  rounded-xl">
              {topics.map((topic) => (
                <div 
                  key={topic.id} 
                  className="flex items-center rounded-xl justify-between py-6 px-4 border-b border-[#8892b0]/40 group hover:bg-[#1f2833]/60 transition-colors bg-[#0b0c10]/60 backdrop-blur-sm"
                >
                  {/* Left Side: Topic Name */}
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-0">
                    {topic.topic}
                  </h3>
                  
                  {/* Right Side: Time and Delete Button */}
                  <div className="flex items-center gap-8">
                   
                        <h2 className="className=text-xl text-[#27dc03] font-mono text-2xl">
                      {formatTime(topic.time_minutes)}
                      </h2>
                  
                    
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2"
                      title="Delete Topic"
                    >
                      {/* SVG Trash Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
  

}