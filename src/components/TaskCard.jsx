

import { useEffect, useState,useRef } from "react";
import {
  checkFocusStatus,
  updateFocusStatus,
  addDiamond,
  updateTaskStatus,
  addHistory
} from "../services/authService";

import { FaStudiovinari } from "react-icons/fa";
const DURATION = 0.1 * 60;

const audio = new Audio("/done.mp3");


export default function TaskCard({ task, loadDiamond }) {

  const cliamSound = useRef(new Audio("/b.mp3"));
  const startSound = useRef(new Audio("/a.mp3"))
  
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isRunning, setIsRunning] = useState(false);

  const [showAlarmPopup, setShowAlarmPopup] = useState(false);

  const [status, setStatus] = useState(task.status);


// -----------------------------------------------------------------------------------------------------------------------
  const runTimer = (startedAt) => {
    setIsRunning(true);

    const interval = setInterval(async () => {
       const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = DURATION - elapsed;


      if (remaining <= 0) {
        clearInterval(interval);

        setTimeLeft(0);
        setIsRunning(false);

        localStorage.removeItem(`timer-${task.id}`);

        try {
          const uuid = localStorage.getItem("uuid");
          const title = task.title;


         

          await updateFocusStatus(uuid, false);
          await updateTaskStatus(task.id, "completed");
          await addHistory(uuid,title);  


          setStatus("completed");


          audio.loop = true;
           audio.play();

          setShowAlarmPopup(true);

           await addDiamond(uuid, 10);

        } catch (error) {
          console.log(error);
        }
      }
      
      else {
        setTimeLeft(remaining);
      }
    }, 1000);


    return interval;
  };


// ------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem(`timer-${task.id}`);
      

    if (!saved) return;

    const { startedAt } = JSON.parse(saved);

    const interval = runTimer(startedAt);

    return () => clearInterval(interval);
  }, [task.id]);


  // ----------------------------------------------------------------------------------------------------------------------------------

const startTimer = async () => {
  const startedAt = Date.now();

  setIsRunning(true);
  setTimeLeft(DURATION);

  startSound.current.currentTime = 0;
startSound.current.play().catch(() => {});

  localStorage.setItem(
    `timer-${task.id}`,
    JSON.stringify({
      startedAt,
      duration: DURATION,
    })
  );

  runTimer(startedAt);

  try {
    const uuid = localStorage.getItem("uuid");

    const response = await checkFocusStatus(uuid);

    if (response.is_running) {
      alert("Finish your current focus session first!");
      return;
    }

    await updateFocusStatus(uuid, true);
    await updateTaskStatus(task.id, "running");
  } catch (error) {
    console.log(error);
  }
};


  // -------------------------------------------------------------------------------------------------------------------------------//
  const stopAlarm = async () => {

      cliamSound.current.currentTime = 0;
  await cliamSound.current.play();

    audio.pause();
    audio.currentTime = 0; 


    setShowAlarmPopup(false);
      await loadDiamond();  
       
  };


  //----------------------------------------------------------------------------------------------------------------------------------
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);








  return (
  <>
    <div
      className="group rounded-3xl border border-[#5d4d36]/30 p-5 sm:p-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-cover bg-center"
  
    >
      {/* Dark overlay */}
      <div className="rounded-2xl bg-[#f8f3e8]/80 backdrop-blur-[2px] p-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          <div className="flex-1 min-w-0">
            <h3
              className={`text-lg sm:text-3xl font-bold tracking-wide ${
                status === "completed"
                  ? "line-through text-[#5d4d36]"
                  : "text-[#1d1b18]"
              }`}
            >
              {task.title}
            </h3>

            <div className="mt-3 text-lg">
              {status === "completed" ? (
                <span className="text-black-700 font-medium">
                  𖣠 Completed
                </span>
              ) : isRunning ? (
                <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" />
                  Focus Session Running
                </span>
              ) : (
                <span className="text-black-700 font-medium">
                  Ready to begin
                </span>
              )}
            </div>
          </div>

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

      <div className="mt-6 border-t border-[#5d4d36]/20 pt-6">
  {status === "completed" ? (
    <button
      disabled
      className="w-full rounded-xl bg-[#0c842690] py-3 font-semibold text-black "
    >
      Completed
    </button>
  ) : !isRunning ? (
    <button
      onClick={startTimer}
      className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-[#000000] flex items-center justify-center gap-2"
    >
      <FaStudiovinari className="text-xl" />
      <span>10</span>
    </button>
  ) : (
    <button
      disabled
      className="w-full rounded-xl bg-[#d8d1c3] py-3 font-semibold text-[#6b5d46] flex items-center justify-center gap-2"
    >
      <FaStudiovinari className="text-xl" />
      <span>Running...</span>
    </button>
  )}
</div>


      </div>
    </div>

    {showAlarmPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="w-full max-w-sm rounded-3xl border border-[#5d4d36]/20 bg-[#f8f3e8]/80 p-8 shadow-2xl">

      <div className="flex flex-col items-center text-center gap-8">

        <h2 className="text-3xl font-bold text-[#1d1b18]">
          45 COMPLETE
        </h2>

        <button
          onClick={stopAlarm}
          className="w-full rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-[#24b11f80] flex items-center justify-center gap-2"
        >
          <FaStudiovinari className="text-xl" />
          <span>10</span>
        </button>

      </div>

    </div>
  </div>
)}



  </>
);

}