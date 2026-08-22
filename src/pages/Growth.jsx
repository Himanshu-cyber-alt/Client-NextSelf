

// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import RightSidebar from "../components/RightSidebar";
// import { getGrowthTopics, addGrowthTopic, deleteGrowthTopic } from "../services/authService";
// import { useNavigate } from "react-router-dom";

// const TARGET_HOURS = 20;
// const TARGET_MINUTES = TARGET_HOURS * 60; // 1200

// export default function Growth() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [topics, setTopics] = useState([]);
//   const [newTopic, setNewTopic] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   const uuid = localStorage.getItem("uuid");
//   const navigate = useNavigate();

//   // Load topics when page opens
//   useEffect(() => {
//     loadTopics();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadTopics = async () => {
//     setIsLoading(true);
//     try {
//       const response = await getGrowthTopics(uuid);
//       if (response.success) {
//         setTopics(response.topics);
//       }
//     } catch (error) {
//       console.error("Failed to load topics:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddTopic = async (e) => {
//     e.preventDefault();
//     if (!newTopic.trim()) return;

//     try {
//       const response = await addGrowthTopic(uuid, newTopic.trim());

//       if (response.success) {
//         // Add the new topic to the UI instantly
//         setTopics([response.topic, ...topics]);
//         setNewTopic(""); // Clear input
//       }
//     } catch (error) {
//       console.log(error);
//       alert("Could not add topic. Please try again.");
//     }
//   };

//   const handleDelete = async (topicId) => {
//     if (!window.confirm("Are you sure you want to delete this topic?")) return;

//     try {
//       await deleteGrowthTopic(topicId);
//       // Remove it from the UI
//       setTopics(topics.filter((t) => t.id !== topicId));
//     } catch (error) {
//       console.error("Failed to delete topic:", error);
//     }
//   };

//   // Helper to convert 135 minutes -> "2h 15m"
//   const formatTime = (totalMinutes) => {
//     if (!totalMinutes) return "0h 0m";
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return `${hours}h ${minutes}m`;
//   };

//   // Single source of truth for the red/yellow/green tier, driven by hours studied.
//   // 0h-5h -> red, 5h-14h -> yellow, 15h+ -> green
//   const getProgressTier = (totalMinutes) => {
//     const hours = (totalMinutes || 0) / 60;
//     if (hours < 5) return "red";
//     if (hours < 15) return "yellow";
//     return "green";
//   };

//   // Text color for the time display, matched to the same tier
//   const getTimeColorClass = (totalMinutes) => {
//     const tier = getProgressTier(totalMinutes);
//     if (tier === "red") return "text-red-500";
//     if (tier === "yellow") return "text-yellow-400";
//     return "text-[#27dc03]";
//   };

//   // Bar fill color, matched to the same tier
//   const getBarColorClass = (totalMinutes) => {
//     const tier = getProgressTier(totalMinutes);
//     if (tier === "red") return "bg-red-500";
//     if (tier === "yellow") return "bg-yellow-400";
//     return "bg-[#27dc03]";
//   };

//   // Helper: 0-100 progress % toward the 20h target
//   const getProgressPercent = (totalMinutes) => {
//     if (!totalMinutes) return 0;
//     const pct = (totalMinutes / TARGET_MINUTES) * 100;
//     return Math.min(pct, 100); // cap at 100%
//   };

//   return (
//     <div className="min-h-screen relative font-sans">

//       <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//       {/* Cinematic Background */}
//       <div
//         className="fixed inset-0 -z-10 bg-cover bg-center"
//         style={{ backgroundImage: "url('/home.jpg')" }}
//       >
//         <div className="absolute inset-0 bg-black/60" />
//       </div>

//       <div className="min-h-screen w-full flex justify-center py-10 px-4">
//         <div className="w-full max-w-4xl">

//           {/* Back to Home Button */}
//           <div className="mb-6">
//             <button
//               onClick={() => navigate("/home")}
//               className="inline-flex items-center text-[#c5a059] hover:text-white transition-colors font-semibold tracking-wide bg-transparent border-none cursor-pointer p-0"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//               </svg>
//               Back to Home
//             </button>
//           </div>

//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
//               Skill Progression
//             </h1>
//             <p className="text-[#8892b0] uppercase tracking-widest text-sm">
//               Track your time. Master your craft.
//             </p>
//           </div>

//           {/* Add Topic Form */}
//           <div className="bg-[#1f2833]/80 backdrop-blur-md border border-[#c5a059]/30 rounded-xl p-6 mb-10 shadow-2xl">
//             <form onSubmit={handleAddTopic} className="flex gap-4">
//               <input
//                 type="text"
//                 placeholder="E.g., JavaScript, DSA, AWS..."
//                 value={newTopic}
//                 onChange={(e) => setNewTopic(e.target.value)}
//                 className="flex-1 bg-[#0b0c10] border border-[#c5a059]/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#c5a059]"
//                 maxLength={50}
//               />
//               <button
//                 type="submit"
//                 disabled={!newTopic.trim()}
//                 className="bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
//               >
//                 Create Topic
//               </button>
//             </form>
//           </div>

//           {/* Topics List */}
//           {isLoading ? (
//             <div className="text-[#dddfdd] text-center py-10 text-xl animate-pulse">Loading mastery stats...</div>
//           ) : topics.length === 0 ? (
//             <div className="text-center py-16 border-2 border-dashed border-[#c5a059]/30 rounded-xl bg-[#0b0c10]/50">
//               <p className="text-white text-lg">No topics created yet.</p>
//               <p className="text-[#8892b0] text-sm mt-2">Start typing above to track your first skill.</p>
//             </div>
//           ) : (
//             <div className="flex flex-col border-t border-[#8892b0]/40 mt-4 rounded-xl">
//               {topics.map((topic) => {
//                 const percent = getProgressPercent(topic.time_minutes);

//                 return (
//                   <div
//                     key={topic.id}
//                     className="flex flex-col rounded-xl py-6 px-4 border-b border-[#8892b0]/40 group hover:bg-[#1f2833]/60 transition-colors bg-[#0b0c10]/60 backdrop-blur-sm"
//                   >
//                     {/* Top row: Topic Name + Time + Delete */}
//                     <div className="flex items-center justify-between mb-3">
//                       <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-0">
//                         {topic.topic}
//                       </h3>

//                       <div className="flex items-center gap-8">
//                         {/* Dynamic color based on time */}
//                         <h2 className={`font-mono text-2xl ${getTimeColorClass(topic.time_minutes)}`}>
//                           {formatTime(topic.time_minutes)}
//                         </h2>

//                         <button
//                           onClick={() => handleDelete(topic.id)}
//                           className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2"
//                           title="Delete Topic"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </div>
//                     </div>

//                     {/* Progress bar row - same red/yellow/green tier as the time text */}
//                     <div className="flex items-center gap-3">
//                       <div className="flex-1 h-3 bg-[#1f2833] rounded-full overflow-hidden border border-[#8892b0]/20">
//                         <div
//                           className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColorClass(topic.time_minutes)}`}
//                           style={{ width: `${percent}%` }}
//                         />
//                       </div>
                   
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RightSidebar from "../components/RightSidebar";
import {
  getGrowthTopics,
  addGrowthTopic,
  deleteGrowthTopic,
  updateGrowthTopic, // NEW: add this to authService.js (see notes)
} from "../services/authService";
import { useNavigate } from "react-router-dom";

const DEFAULT_TARGET_HOURS = 5;

export default function Growth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [newTargetHours, setNewTargetHours] = useState(DEFAULT_TARGET_HOURS);
  const [isLoading, setIsLoading] = useState(true);

  // Which topic's target is currently being edited (id or null)
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const uuid = localStorage.getItem("uuid");
  const navigate = useNavigate();

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

    const targetHours = Number(newTargetHours) || DEFAULT_TARGET_HOURS;

    try {
      const response = await addGrowthTopic(uuid, newTopic.trim(), targetHours);

      if (response.success) {
        setTopics([response.topic, ...topics]);
        setNewTopic("");
        setNewTargetHours(DEFAULT_TARGET_HOURS);
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
      setTopics(topics.filter((t) => t.id !== topicId));
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  // --- Target hours editing ---

  const startEditing = (topic) => {
    setEditingId(topic.id);
    setEditValue(String(topic.target_hours ?? DEFAULT_TARGET_HOURS));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveTargetHours = async (topicId) => {
    const parsed = Number(editValue);
    if (!parsed || parsed <= 0) {
      alert("Enter a valid number of hours.");
      return;
    }

    // Optimistic update
    const prevTopics = topics;
    setTopics(
      topics.map((t) =>
        t.id === topicId ? { ...t, target_hours: parsed } : t
      )
    );
    setEditingId(null);

    try {
      const response = await updateGrowthTopic(topicId, parsed);
      if (!response.success) {
        // Roll back on failure
        setTopics(prevTopics);
        alert("Could not update target hours. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update target hours:", error);
      setTopics(prevTopics);
      alert("Could not update target hours. Please try again.");
    }
  };

  // Helper to convert 135 minutes -> "2h 15m"
  const formatTime = (totalMinutes) => {
    if (!totalMinutes) return "0h 0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Tier now driven by progress toward THIS topic's own target, not a fixed number
  const getProgressTier = (totalMinutes, targetHours) => {
    const target = targetHours || DEFAULT_TARGET_HOURS;
    const hours = (totalMinutes || 0) / 60;
    const pct = hours / target;
    if (pct < 0.33) return "red";
    if (pct < 0.8) return "yellow";
    return "green";
  };

  const getTimeColorClass = (totalMinutes, targetHours) => {
    const tier = getProgressTier(totalMinutes, targetHours);
    if (tier === "red") return "text-red-500";
    if (tier === "yellow") return "text-yellow-400";
    return "text-[#27dc03]";
  };

  const getBarColorClass = (totalMinutes, targetHours) => {
    const tier = getProgressTier(totalMinutes, targetHours);
    if (tier === "red") return "bg-red-500";
    if (tier === "yellow") return "bg-yellow-400";
    return "bg-[#27dc03]";
  };

  // Progress % toward THIS topic's own target
  const getProgressPercent = (totalMinutes, targetHours) => {
    const target = targetHours || DEFAULT_TARGET_HOURS;
    const targetMinutes = target * 60;
    if (!totalMinutes) return 0;
    const pct = (totalMinutes / targetMinutes) * 100;
    return Math.min(pct, 100);
  };

  return (
    <div className="min-h-screen relative font-sans">

      <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Cinematic Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/home.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="min-h-screen w-full flex justify-center py-10 px-4">
        <div className="w-full max-w-4xl">

          {/* Back to Home Button */}
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
              <input
                type="number"
                min={1}
                placeholder="Target hrs"
                value={newTargetHours}
                onChange={(e) => setNewTargetHours(e.target.value)}
                className="w-32 bg-[#0b0c10] border border-[#c5a059]/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#c5a059]"
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

          {/* Topics List */}
          {isLoading ? (
            <div className="text-[#dddfdd] text-center py-10 text-xl animate-pulse">Loading mastery stats...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#c5a059]/30 rounded-xl bg-[#0b0c10]/50">
              <p className="text-white text-lg">No topics created yet.</p>
              <p className="text-[#8892b0] text-sm mt-2">Start typing above to track your first skill.</p>
            </div>
          ) : (
            <div className="flex flex-col border-t border-[#8892b0]/40 mt-4 rounded-xl">
              {topics.map((topic) => {
                const percent = getProgressPercent(topic.time_minutes, topic.target_hours);
                const isEditing = editingId === topic.id;

                return (
                  <div
                    key={topic.id}
                    className="flex flex-col rounded-xl py-6 px-4 border-b border-[#8892b0]/40 group hover:bg-[#1f2833]/60 transition-colors bg-[#0b0c10]/60 backdrop-blur-sm"
                  >
                    {/* Top row: Topic Name + Time + Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-0">
                        {topic.topic}
                      </h3>

                      <div className="flex items-center gap-8">
                        <h2 className={`font-mono text-2xl ${getTimeColorClass(topic.time_minutes, topic.target_hours)}`}>
                          {formatTime(topic.time_minutes)}
                        </h2>

                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2"
                          title="Delete Topic"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress bar row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-[#1f2833] rounded-full overflow-hidden border border-[#8892b0]/20">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColorClass(topic.time_minutes, topic.target_hours)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Target hours row: view or edit mode */}
                    <div className="flex items-center justify-end gap-2 mt-2 text-sm">
                      {isEditing ? (
                        <>
                          <span className="text-[#8892b0]">Target:</span>
                          <input
                            type="number"
                            min={1}
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveTargetHours(topic.id);
                              if (e.key === "Escape") cancelEditing();
                            }}
                            className="w-16 bg-[#0b0c10] border border-[#c5a059]/50 text-white rounded px-2 py-1 focus:outline-none focus:border-[#c5a059]"
                          />
                          <span className="text-[#8892b0]">h</span>
                          <button
                            onClick={() => saveTargetHours(topic.id)}
                            className="text-[#27dc03] hover:text-white px-2"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-500 hover:text-white px-2"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[#8892b0]">
                            Target: {topic.target_hours ?? DEFAULT_TARGET_HOURS}h
                          </span>
                          <button
                            onClick={() => startEditing(topic)}
                            className="text-[#c5a059]/60 hover:text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Edit target hours"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}