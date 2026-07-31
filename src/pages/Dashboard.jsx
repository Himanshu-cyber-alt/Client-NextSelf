


// import { useEffect, useState } from "react";

// import Navbar from "../components/Navbar";
// import RightSidebar from "../components/RightSidebar";
// import CreateTask from "../components/CreateTask";
// import TaskCard from "../components/TaskCard";

// import { getTasks, getDiamond } from "../services/authService";

// export default function Dashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tasks, setTasks] = useState([]);
//   const [diamond, setDiamond] = useState(0);
//   const [buttonsDisabled, setButtonsDisabled] = useState(false);

//   const uuid = localStorage.getItem("uuid");

//   useEffect(() => {
//     loadTasks();
//     loadDiamond();
//   }, []);

//   const loadTasks = async () => {
//     try {
//       const response = await getTasks(uuid);
//       setTasks(response.tasks);
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

//   return (
//     <div className="min-h-screen relative">
//       <Navbar diamond={diamond} openSidebar={() => setSidebarOpen(true)} />

//       <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//       {/* Background layer - truly fixed to the viewport, sits behind everything,
//           never scrolls with the page content. This replaces bg-fixed, which
//           is unreliable on mobile browsers. */}
//       <div
//         className="fixed inset-0 -z-10 bg-cover bg-center"
//         style={{
//           backgroundImage: "url('/home.jpg')",
//         }}
//       >
//         <div className="absolute inset-0 bg-black/30" />
//       </div>

//       {/* Scrollable content sits on top of the fixed background */}
//       <div className="min-h-screen w-full flex justify-start">
//         <div className="w-full max-w-5xl px-6 py-6">
//           <h1 className="text-3xl font-bold text-white">Your Time Is Limited</h1>

//           <p className="text-white/80 mb-6">
//             {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} On Your List Today
//           </p>

//           {/* Create Task */}
//           <div className="sticky top-20 z-30 mb-5">
//             <div className="bg-white rounded-xl shadow-lg">
//               <CreateTask onTaskCreated={addTask} />
//             </div>
//           </div>

//           {/* Tasks */}
//           <div className="space-y-5">
//             {tasks.length === 0 ? (
//               <div className="text-white py-10">
//                 <p>No tasks yet</p>
//               </div>
//             ) : (
//               [...tasks]
//                 .sort((a, b) => {
//                   // Show incomplete tasks first
//                   if (a.status === "completed" && b.status !== "completed") return 1;
//                   if (a.status !== "completed" && b.status === "completed") return -1;
//                   return 0;
//                 })
//                 .map((task) => (
//                   <TaskCard
//                     key={task.id}
//                     task={task}
//                     loadDiamond={loadDiamond}
//                     buttonsDisabled={buttonsDisabled}
//                     setButtonsDisabled={setButtonsDisabled}
//                   />
//                 ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import RightSidebar from "../components/RightSidebar";
import CreateTask from "../components/CreateTask";
import TaskCard from "../components/TaskCard";

import { getTasks, getDiamond } from "../services/authService";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [diamond, setDiamond] = useState(0);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  const uuid = localStorage.getItem("uuid");

  useEffect(() => {
    loadTasks();
    loadDiamond();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks(uuid);
      setTasks(response.tasks);
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

  // Lets a TaskCard tell Dashboard its status changed (started / completed)
  // so the "only one task running" lock is always based on real data,
  // not a flag that can get out of sync on remount or new tasks being added.
  const updateTaskStatusLocal = (taskId, status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  // True if ANY task in the list is currently running - derived straight
  // from task data every render, so it's always accurate no matter when
  // a task was created or the page remounted.
  const anyTaskRunning = tasks.some((t) => t.status === "running");

  return (
    <div className="min-h-screen relative">
      <Navbar diamond={diamond} openSidebar={() => setSidebarOpen(true)} />

      <RightSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Background layer - truly fixed to the viewport, sits behind everything,
          never scrolls with the page content. This replaces bg-fixed, which
          is unreliable on mobile browsers. */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/home.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Scrollable content sits on top of the fixed background */}
      <div className="min-h-screen w-full flex justify-start">
        <div className="w-full max-w-5xl px-6 py-6">
          <h1 className="text-3xl font-bold text-white">Your Time Is Limited</h1>

          <p className="text-white/80 mb-6">
            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"} On Your List Today
          </p>

          {/* Create Task */}
          <div className="sticky top-20 z-30 mb-5">
            <div className="bg-white rounded-xl shadow-lg">
              <CreateTask onTaskCreated={addTask} />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-5">
            {tasks.length === 0 ? (
              <div className="text-white py-10">
                <p>No tasks yet</p>
              </div>
            ) : (
              [...tasks]
                .sort((a, b) => {
                  // Show incomplete tasks first
                  if (a.status === "completed" && b.status !== "completed") return 1;
                  if (a.status !== "completed" && b.status === "completed") return -1;
                  return 0;
                })
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    loadDiamond={loadDiamond}
                    onStatusChange={updateTaskStatusLocal}
                    // Disabled if: this specific click-guard flag is set,
                    // OR some OTHER task is already running (this task's own
                    // "Running..." button stays enabled-looking via its own
                    // isRunning state inside TaskCard, this only blocks Start).
                    buttonsDisabled={
                      buttonsDisabled ||
                      (anyTaskRunning && task.status !== "running")
                    }
                    setButtonsDisabled={setButtonsDisabled}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}