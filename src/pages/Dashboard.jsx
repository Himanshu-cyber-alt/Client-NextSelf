// import { useEffect, useState, useRef, useCallback } from "react";
// import Navbar from "../components/Navbar";
// import RightSidebar from "../components/RightSidebar";
// import CreateTask from "../components/CreateTask";
// import TaskCard from "../components/TaskCard";

// import {
//   getTasks,
//   getDiamond,
//   updateFocusStatus,
//   updateTaskStatus,
//   addHistory,
//   addDiamond,
//   checkFocusStatus,
//   updateGrowthTime
// } from "../services/authService";

// const POLL_INTERVAL = 5000;
// const DURATION = 45 * 60; // 6 seconds for testing. Change to 45 * 60 for production!

// export default function Dashboard() {
//     console.log("Dashboard is rendering");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tasks, setTasks] = useState([]);
//   const [diamond, setDiamond] = useState(0);
 
//   // GLOBAL TIMER STATE
//   const [activeTaskId, setActiveTaskId] = useState(null);
//   const [globalTimeLeft, setGlobalTimeLeft] = useState(DURATION);

//   const uuid = localStorage.getItem("uuid");
//   const timerRef = useRef(null);

//   // GLOBAL AUDIO REFS
//   const startAudio = useRef(null);
//   const alarmAudio = useRef(null);
//   const claimAudio = useRef(null);
//   const keepAliveAudio = useRef(null);
   
//   // ---------------------------------------------------------------------------
//   // 1. INITIAL LOAD & POLLING
//   // ---------------------------------------------------------------------------
//   useEffect(() => {
//     loadTasks();
//     loadDiamond();

//     // Restore active timer if the user refreshed the page
//     const saved = localStorage.getItem("activeTask");
//     if (saved) {
//       const { id, startedAt } = JSON.parse(saved);
//       const remaining = DURATION - Math.floor((Date.now() - startedAt) / 1000);
     
//       if (remaining > 0) {
//         setActiveTaskId(id);
//         setGlobalTimeLeft(remaining);
//         runGlobalTimer(startedAt, id);
//       } else {
//         localStorage.removeItem("activeTask");
//       }
//     }

  

//     const interval = setInterval(loadTasks, POLL_INTERVAL);
   
//     const onVisibilityChange = () => {
//       if (document.visibilityState === "visible") loadTasks();
//     };
//     document.addEventListener("visibilitychange", onVisibilityChange);

//     return () => {
//       clearInterval(interval);
//       if (timerRef.current) clearInterval(timerRef.current);
//       document.removeEventListener("visibilitychange", onVisibilityChange);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadTasks = async () => {

//     try {
      
//   const response = await getTasks(uuid);
//       const incoming = response.tasks;


//       const completedTasksToday = incoming.filter(task => task.status === "completed").length;

    

//       localStorage.setItem("totalTasks", completedTasksToday);



//       setTasks((prev) => {
//         if (prev.length !== incoming.length) return incoming;

//         const merged = prev.map(localTask => {
//           const serverTask = incoming.find(t => t.id === localTask.id);
//           if (!serverTask) return localTask;

//           // Protect completed tasks from being overwritten by delayed server data
//           if (localTask.status === "completed" && serverTask.status === "running") {
//             return localTask;
//           }
//           return { ...localTask, status: serverTask.status };
//         });

//         // Only trigger re-render if statuses actually changed
//         const hasChanges = merged.some((m, i) => m.status !== prev[i].status);
//         return hasChanges ? merged : prev;
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const loadDiamond = async () => {
//     try {
//       const response = await getDiamond(uuid);
//       setDiamond(response.data.diamonds);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const addTask = (task) => {
//     setTasks((prev) => [...prev, task]);
//   };

//   // ---------------------------------------------------------------------------
//   // 2. GLOBAL TIMER LOGIC
//   // ---------------------------------------------------------------------------
//   const runGlobalTimer = (startedAt, taskId) => {
//     if (timerRef.current) clearInterval(timerRef.current);

//     timerRef.current = setInterval(() => {
//       const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//       const remaining = DURATION - elapsed;

//       if (remaining <= 0) {
//         clearInterval(timerRef.current);
//         setGlobalTimeLeft(0);

//         // Stop background audio, play alarm
//         if (keepAliveAudio.current) keepAliveAudio.current.pause();
       
//         if (!alarmAudio.current) alarmAudio.current = new Audio("/done.mp3");
//         alarmAudio.current.loop = true;
//         alarmAudio.current.volume = 1;
//         alarmAudio.current.play().catch(e => console.log("Alarm blocked:", e));

//         // Optimistically update the UI to "completed" instantly
//         setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "completed" } : t));

//         // Mark as free in the backend
//         const userUuid = localStorage.getItem("uuid");
//         updateFocusStatus(userUuid, false).catch(()=>{});
//         updateTaskStatus(taskId, "completed").catch(()=>{});
       
//       } else {
//         setGlobalTimeLeft(remaining);
//       }
//     }, 1000);
//   };

//   // ---------------------------------------------------------------------------
//   // 3. START TASK (Wrapped in useCallback for React.memo)
//   // ---------------------------------------------------------------------------
//   const handleStartTask = useCallback(async (task) => {
//     if (activeTaskId) return; // Prevent clicking if another task is already running locally

//     try {
//       const response = await checkFocusStatus(uuid);
//       if (response.is_running) {
//         alert("Finish your current focus session first!");
//         return;
//       }

//       // 1. Setup Audio
//       if (!startAudio.current) startAudio.current = new Audio("/a.mp3");
//       startAudio.current.currentTime = 0;
//       startAudio.current.play().catch(()=>{});

//       if (!keepAliveAudio.current) {
//         keepAliveAudio.current = new Audio("/silent-loop.mp3");
//         keepAliveAudio.current.loop = true;
//       }
//       keepAliveAudio.current.play().catch(()=>{});

//       // 2. Setup State & LocalStorage
//       const startedAt = Date.now();
//       setActiveTaskId(task.id);
//       setGlobalTimeLeft(DURATION);
//       localStorage.setItem("activeTask", JSON.stringify({ id: task.id, startedAt }));

//       // 3. Optimistic UI update
//       setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "running" } : t));

//       // 4. Start Interval & APIs
//       runGlobalTimer(startedAt, task.id);
//       await updateFocusStatus(uuid, true);
//       await updateTaskStatus(task.id, "running");

//     } catch (error) {
//       console.log("Failed to start task:", error);
//       setActiveTaskId(null); // reset on fail
//     }
//   }, [activeTaskId, uuid]);

//   // ---------------------------------------------------------------------------
//   // 4. STOP & CLAIM (Wrapped in useCallback for React.memo)
//   // ---------------------------------------------------------------------------
//   const handleStopAlarm = useCallback(async (task) => {
//     // 1. Swap audio
//     if (alarmAudio.current) {
//       alarmAudio.current.pause();
//       alarmAudio.current.currentTime = 0;
//     }

//     if (!claimAudio.current) claimAudio.current = new Audio("/b.mp3");
//     claimAudio.current.currentTime = 0;
//     claimAudio.current.play().catch(()=>{});

//     // 2. Release the lock so a new task can be started
//     setActiveTaskId(null);
//     localStorage.removeItem("activeTask");

//     // 3. Claim rewards
//     try {
//       await addHistory(uuid, task.title);
//       await addDiamond(uuid, 10);
//       await loadDiamond(); // refresh diamond count
//       await updateGrowthTime(uuid, task.title);
//     } catch (e) {
//       console.log("Failed to claim reward", e);
//     }
//   }, [uuid]);

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   const anyTaskRunning = tasks.some((t) => t.status === "running") || activeTaskId !== null;

//   return (
//     <div className="min-h-screen relative">
//       <Navbar diamond={diamond} openSidebar={() => setSidebarOpen(true)} />
//       <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//       <div
//         className="fixed inset-0 -z-10 bg-cover bg-center"
//         style={{ backgroundImage: "url('/home.jpg')" }}
//       >
//         <div className="absolute inset-0 bg-black/30" />
//       </div>

//       <div className="min-h-screen w-full flex justify-start">
//         <div className="w-full max-w-5xl px-6 py-6">
//           <h1 className="text-3xl font-bold text-white">Your Time Is Limited</h1>

//           <p className="text-white/80 mb-6">
//             {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} On Your List Today
//           </p>

//           <div className="sticky top-20 z-30 mb-5">
//             <div className="bg-white rounded-xl shadow-lg">
//               <CreateTask onTaskCreated={addTask} />
//             </div>
//           </div>

//           <div className="space-y-5">
//             {tasks.length === 0 ? (
//               <div className="text-white py-10">
//                 <p>No tasks yet</p>
//               </div>
//             ) : (
//               [...tasks]
//                 .sort((a, b) => {
//                   if (a.status === "completed" && b.status !== "completed") return 1;
//                   if (a.status !== "completed" && b.status === "completed") return -1;
//                   return 0;
//                 })
//                 .map((task) => {
//                   const isThisTaskActive = activeTaskId === task.id;
                 
//                   // A task is locked if:
//                   // 1. Another task holds the activeTaskId locally
//                   // OR 2. The database says a task is running, but it's not this one
//                   const isLocked = (activeTaskId !== null && activeTaskId !== task.id) ||
//                                    (anyTaskRunning && task.status !== "running");

//                   return (
//                     <TaskCard
//                       key={task.id}
//                       task={task}
//                       isActive={isThisTaskActive}
//                       isAnotherTaskActive={isLocked}
//                       timeLeft={isThisTaskActive ? globalTimeLeft : DURATION}
//                       onStart={handleStartTask}
//                       onStop={handleStopAlarm}
//                     />
//                   );
//                 })
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



























import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import RightSidebar from "../components/RightSidebar";
import CreateTask from "../components/CreateTask";
import TaskCard from "../components/TaskCard";
import { getHistory } from "../services/authService";
import Calendar from "../components/Calendar";

import {
  getTasks,
  getDiamond,
  updateFocusStatus,
  updateTaskStatus,
  addHistory,
  addDiamond,
  checkFocusStatus,
  updateGrowthTime
} from "../services/authService";

const POLL_INTERVAL = 5000;
const DURATION = 45 * 60; 

export default function Dashboard() {
    console.log("Dashboard is rendering");



  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [diamond, setDiamond] = useState(0);
 
  // GLOBAL TIMER STATE
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(DURATION);

  const uuid = localStorage.getItem("uuid");
  const timerRef = useRef(null);

  // GLOBAL AUDIO REFS
  const startAudio = useRef(null);
  const alarmAudio = useRef(null);
  const claimAudio = useRef(null);
  const keepAliveAudio = useRef(null);
   
  // ---------------------------------------------------------------------------
  // 1. INITIAL LOAD & POLLING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadTasks();
    loadDiamond();

    
    const saved = localStorage.getItem("activeTask");
    if (saved) {
      const { id, startedAt } = JSON.parse(saved);
      const remaining = DURATION - Math.floor((Date.now() - startedAt) / 1000);
     
      if (remaining > 0) {
        setActiveTaskId(id);
        setGlobalTimeLeft(remaining);
        runGlobalTimer(startedAt, id);
      } else {
        localStorage.removeItem("activeTask");
      }
    }


    const interval = setInterval(loadTasks, POLL_INTERVAL);
   
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") loadTasks();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);






  const loadTasks = async () => {

    try {
  const response = await getTasks(uuid);
      const incoming = response.tasks;


      const completedTasksToday = incoming.filter(task => task.status === "completed").length;

    

      localStorage.setItem("totalTasks", completedTasksToday);



      setTasks((prev) => {
        if (prev.length !== incoming.length) return incoming;

        const merged = prev.map(localTask => {
          const serverTask = incoming.find(t => t.id === localTask.id);
          if (!serverTask) return localTask;

          if (localTask.status === "completed" && serverTask.status === "running") {
            return localTask;
          }
          return { ...localTask, status: serverTask.status };
        });

    
        const hasChanges = merged.some((m, i) => m.status !== prev[i].status);
        return hasChanges ? merged : prev;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadDiamond = async () => {
    try {
      const response = await getDiamond(uuid);
      setDiamond(response.data.diamonds);
    } catch (error) {
      console.log(error);
    }
  };

  const addTask = (task) => {
    setTasks((prev) => [...prev, task]);
  };

  // ---------------------------------------------------------------------------
  // 2. GLOBAL TIMER LOGIC
  // ---------------------------------------------------------------------------
  const runGlobalTimer = (startedAt, taskId) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = DURATION - elapsed;

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setGlobalTimeLeft(0);

        // Stop background audio, play alarm
        if (keepAliveAudio.current) keepAliveAudio.current.pause();
       
        if (!alarmAudio.current) alarmAudio.current = new Audio("/done.mp3");
        alarmAudio.current.loop = true;
        alarmAudio.current.volume = 1;
        alarmAudio.current.play().catch(e => console.log("Alarm blocked:", e));

        // Optimistically update the UI to "completed" instantly
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "completed" } : t));

        // Mark as free in the backend
        const userUuid = localStorage.getItem("uuid");
        updateFocusStatus(userUuid, false).catch(()=>{});
        updateTaskStatus(taskId, "completed").catch(()=>{});
       
      } else {
        setGlobalTimeLeft(remaining);
      }
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // 3. START TASK (Wrapped in useCallback for React.memo)
  // ---------------------------------------------------------------------------
  const handleStartTask = useCallback(async (task) => {
    if (activeTaskId) return; // Prevent clicking if another task is already running locally

    try {
   
      // 1. Setup Audio
      if (!startAudio.current) startAudio.current = new Audio("/a.mp3");
      startAudio.current.currentTime = 0;
      startAudio.current.play().catch(()=>{});

      if (!keepAliveAudio.current) {
        keepAliveAudio.current = new Audio("/silent-loop.mp3");
        keepAliveAudio.current.loop = true;
      }
      keepAliveAudio.current.play().catch(()=>{});

      // 2. Setup State & LocalStorage
      const startedAt = Date.now();
      setActiveTaskId(task.id);
      setGlobalTimeLeft(DURATION);
      localStorage.setItem("activeTask", JSON.stringify({ id: task.id, startedAt }));

      // 3. Optimistic UI update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "running" } : t));

      // 4. Start Interval & APIs
      runGlobalTimer(startedAt, task.id);
      await updateFocusStatus(uuid, true);
      await updateTaskStatus(task.id, "running");

    } catch (error) {
      console.log("Failed to start task:", error);
      setActiveTaskId(null); // reset on fail
    }
  }, [activeTaskId, uuid]);

  // ---------------------------------------------------------------------------
  // 4. STOP & CLAIM (Wrapped in useCallback for React.memo)
  // ---------------------------------------------------------------------------
  const handleStopAlarm = useCallback(async (task) => {
    // 1. Swap audio
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
    }

    if (!claimAudio.current) claimAudio.current = new Audio("/b.mp3");
    claimAudio.current.currentTime = 0;
    claimAudio.current.play().catch(()=>{});

    // 2. Release the lock so a new task can be started
    setActiveTaskId(null);
    localStorage.removeItem("activeTask");

    // 3. Claim rewards
    try {
      await addHistory(uuid, task.title);
      await addDiamond(uuid, 10);
      await loadDiamond(); // refresh diamond count
      await updateGrowthTime(uuid, task.title);
    } catch (e) {
      console.log("Failed to claim reward", e);
    }
  }, [uuid]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  const anyTaskRunning = tasks.some((t) => t.status === "running") || activeTaskId !== null;


return (
  <div className="min-h-screen relative">
    <Navbar diamond={diamond} openSidebar={() => setSidebarOpen(true)} />
    <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

    <div
      className="fixed inset-0 -z-10 bg-black"
    >
      <div className="absolute inset-0 bg-black/30" />
    </div>

    <div className="min-h-screen w-full flex gap-6 px-6 py-6">
      {/* Main task column */}
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-white">Your Time Is Limited</h1>

        <p className="text-white/80 mb-6">
          {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} On Your List Today
        </p>

        <div className="sticky top-20 z-30 mb-5">
          <div className="bg-white rounded-xl shadow-lg">
            <CreateTask onTaskCreated={addTask} />
          </div>
        </div>

        <div className="space-y-5">
          {tasks.length === 0 ? (
            <div className="text-white py-10">
              <p>No tasks yet</p>
            </div>
          ) : (
            [...tasks]
              .sort((a, b) => {
                if (a.status === "completed" && b.status !== "completed") return 1;
                if (a.status !== "completed" && b.status === "completed") return -1;
                return 0;
              })
              .map((task) => {
                const isThisTaskActive = activeTaskId === task.id;
                const isLocked = (activeTaskId !== null && activeTaskId !== task.id) ||
                                 (anyTaskRunning && task.status !== "running");

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isActive={isThisTaskActive}
                    isAnotherTaskActive={isLocked}
                    timeLeft={isThisTaskActive ? globalTimeLeft : DURATION}
                    onStart={handleStartTask}
                    onStop={handleStopAlarm}
                  />
                );
              })
          )}
        </div>
      </div>

      {/* Calendar column - far right, vertical */}
      <div className="hidden lg:block sticky top-60 h-fit">
        <Calendar />
      </div>
    </div>
  </div>
);

}





