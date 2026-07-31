


import { memo } from "react";
import { FaStudiovinari } from "react-icons/fa";

// Wrap the component in React.memo so it ONLY re-renders when its specific props change
const TaskCard = memo(({ 
  task, 
  isActive, 
  isAnotherTaskActive, 
  timeLeft, 
  onStart, 
  onStop 
}) => {
  
  // Format the time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  const isCompleted = task.status === "completed";

  return (
    <>
      <div className="group rounded-3xl border border-[#5d4d36]/30 p-5 sm:p-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-cover bg-center">
        <div className="rounded-2xl bg-[#f8f3e8]/80 backdrop-blur-[2px] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            
            {/* --- TASK TITLE & STATUS --- */}
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg sm:text-3xl font-bold tracking-wide ${
                  isCompleted ? "line-through text-[#5d4d36]" : "text-[#1d1b18]"
                }`}
              >
                {task.title}
              </h3>

              <div className="mt-3 text-lg">
                {isCompleted ? (
                  <span className="text-black-700 font-medium">𖣠 Completed</span>
                ) : isActive ? (
                  <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" />
                    Focus Session Running
                  </span>
                ) : isAnotherTaskActive ? (
                  <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-700" />
                    Running Elsewhere
                  </span>
                ) : (
                  <span className="text-black-700 font-medium">Ready to begin</span>
                )}
              </div>
            </div>

            {/* --- TIMER DISPLAY --- */}
            <div className="flex justify-center sm:justify-end">
              <div className="rounded-xl border border-[#5d4d36]/30 bg-white/40 px-5 py-3 backdrop-blur-sm">
                <p className="font-mono text-4xl font-bold tracking-wider text-[#1d1b18]">
                  {String(minutes).padStart(2, "0")}
                  <span className="text-[#000000]">:</span>
                  {String(seconds).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="mt-6 border-t border-[#5d4d36]/20 pt-6">
            {isCompleted ? (
              <button disabled className="w-full rounded-xl bg-[#2f8b05] py-3 font-semibold text-[#000000] flex items-center justify-center gap-2 ">
                Completed
              </button>
            ) : isActive ? (
              <button
                disabled
                className="w-full rounded-xl bg-[#dec900] py-3 font-semibold text-[#000000] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Running...</span>
              </button>
            ) : isAnotherTaskActive ? (
              <button
                disabled
                className="w-full rounded-xl bg-[#cf271e] py-3 font-semibold text-[#fefefa] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Locked</span>
              </button>
            ) : (
              <button
                onClick={() => onStart(task)}
                className="w-full rounded-xl bg-[#000000] py-3 font-semibold text-white transition hover:bg-[#000000] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Start</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- ALARM POPUP --- */}
      {/* Only show if THIS specific task is active AND the timer has reached 0 */}
      {isActive && timeLeft <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#5d4d36]/20 bg-[#f8f3e8]/80 p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-8">
              <h2 className="text-3xl font-bold text-[#1d1b18]">SESSION COMPLETE</h2>
              <button
                onClick={() => onStop(task)}
                className="w-full rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-[#24b11f80] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Claim 10 </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default TaskCard;