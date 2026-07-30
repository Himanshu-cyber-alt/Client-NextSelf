

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
        // response.data.diamonds
        setDiamond(response.data.diamonds);
      } catch (error) {
        console.log(error);
      }
    };

    const addTask = (task) => {
      setTasks((prev) => [...prev, task]);
    };

return (
  <div className="min-h-screen">
    <Navbar
      diamond={diamond}
      openSidebar={() => setSidebarOpen(true)}
    />

    <RightSidebar
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
    />

    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('/home.jpg')",
      }}
    >
      <div className="min-h-screen bg-black/30">
        {/* Left aligned container */}
        <div className="w-full flex justify-start">
          <div className="w-full max-w-5xl px-6 py-6">

            <h1 className="text-3xl font-bold text-white">
            Your Time Is Limited
            </h1>

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
        />
      ))
  )}
</div>

          </div>
        </div>
      </div>
    </div>
  </div>
);

  }