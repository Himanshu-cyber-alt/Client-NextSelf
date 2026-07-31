




// import { useEffect, useState, useRef } from "react";
// import {
//   checkFocusStatus,
//   updateFocusStatus,
//   addDiamond,
//   updateTaskStatus,
//   addHistory
// } from "../services/authService";

// import { FaStudiovinari } from "react-icons/fa";
// const DURATION = 45 * 60;

// const audio = new Audio("/done.mp3");

// export default function TaskCard({ task, loadDiamond, buttonsDisabled, setButtonsDisabled }) {
//   const cliamSound = useRef(new Audio("/b.mp3"));
//   const startSound = useRef(new Audio("/a.mp3"));
//   const keepAliveAudio = useRef(new Audio("/silent-loop.mp3")); // prevents Chrome from freezing the tab

//   const audioCtxRef = useRef(null);       // Web Audio context - has its own internal clock
//   const alarmBufferRef = useRef(null);    // decoded /done.mp3, loaded once
//   const scheduledSourceRef = useRef(null); // the scheduled "play alarm at time X" node

//   const [timeLeft, setTimeLeft] = useState(DURATION);
//   const [isRunning, setIsRunning] = useState(false);
//   const [showAlarmPopup, setShowAlarmPopup] = useState(false);
//   const [status, setStatus] = useState(task.status);

//   // ---- setup keep-alive audio element once ----
//   useEffect(() => {
//     const el = keepAliveAudio.current;
//     el.loop = true;
//     el.volume = 0.01; // near-silent, not literally 0
//     el.setAttribute("playsinline", "true");
//     return () => el.pause();
//   }, []);

//   // ---- preload the alarm sound into an AudioBuffer once ----
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const AudioContextClass = window.AudioContext || window.webkitAudioContext;
//         if (!AudioContextClass) return; // very old browser fallback - regular audio.play() below still works
//         audioCtxRef.current = new AudioContextClass();

//         const response = await fetch("/done.mp3");
//         const arrayBuffer = await response.arrayBuffer();
//         const decoded = await audioCtxRef.current.decodeAudioData(arrayBuffer);
//         if (!cancelled) alarmBufferRef.current = decoded;
//       } catch (e) {
//         console.log("Web Audio preload failed, will fall back to <audio> tag:", e);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, []);

//   const setupMediaSession = () => {
//     if ("mediaSession" in navigator) {
//       navigator.mediaSession.metadata = new MediaMetadata({
//         title: task.title,
//         artist: "Focus Session Running",
//         album: "45 min timer",
//       });
//       navigator.mediaSession.playbackState = "playing";
//       navigator.mediaSession.setActionHandler("pause", () => {});
//       navigator.mediaSession.setActionHandler("play", () => {});
//     }
//   };

//   const clearMediaSession = () => {
//     if ("mediaSession" in navigator) {
//       navigator.mediaSession.playbackState = "none";
//     }
//   };

//   // Schedules the alarm to fire at an exact point on the AudioContext's own clock,
//   // independent of setInterval. secondsFromNow can be fractional.
//   const scheduleAlarm = (secondsFromNow) => {
//     const ctx = audioCtxRef.current;
//     const buffer = alarmBufferRef.current;
//     if (!ctx || !buffer) return false; // caller should fall back to setInterval-triggered audio.play()

//     // cancel any previous scheduled alarm for this card
//     if (scheduledSourceRef.current) {
//       try { scheduledSourceRef.current.stop(); } catch (e) {}
//     }

//     const source = ctx.createBufferSource();
//     source.buffer = buffer;
//     source.loop = true; // keep ringing until user taps stop, same as before
//     source.connect(ctx.destination);
//     source.start(ctx.currentTime + Math.max(0, secondsFromNow));
//     scheduledSourceRef.current = source;
//     return true;
//   };

//   const cancelScheduledAlarm = () => {
//     if (scheduledSourceRef.current) {
//       try { scheduledSourceRef.current.stop(); } catch (e) {}
//       scheduledSourceRef.current = null;
//     }
//   };

//   // -----------------------------------------------------------------------------------------------------------------------
// const runTimer = (startedAt) => {
//     setIsRunning(true);

//     const interval = setInterval(async () => {
//       const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//       const remaining = DURATION - elapsed;

//       if (remaining <= 0) {
//         clearInterval(interval);

//         setTimeLeft(0);
//         setIsRunning(false);
//         setButtonsDisabled(false);

//         localStorage.removeItem(`timer-${task.id}`);

//         keepAliveAudio.current.pause();
//         keepAliveAudio.current.currentTime = 0;

//         // Show UI + play alarm IMMEDIATELY — don't wait on network calls
//         setStatus("completed");

//         // The Web Audio scheduled alarm (below) already started playing itself
//         // at the right time if it was armed. This is the fallback path in case
//         // Web Audio wasn't available/preloaded in time.
//         if (!scheduledSourceRef.current) {
//           audio.loop = true;
//           audio.volume = 1;
//           audio.play();
//         }

//         setShowAlarmPopup(true);
//         clearMediaSession();

//         // Backend bookkeeping happens AFTER the popup is already showing
//         try {
//           const uuid = localStorage.getItem("uuid");
//           const title = task.title;

//           await updateFocusStatus(uuid, false);
//           await updateTaskStatus(task.id, "completed");
//           await addHistory(uuid, title);
//           await addDiamond(uuid, 10);
//         } catch (error) {
//           console.log(error);
//         }
//       } else {
//         setTimeLeft(remaining);
//       }
//     }, 1000);

//     return interval;
//   };
//   // ------------------------------------------------------------------------------------------------------------------------
//   useEffect(() => {
//     const saved = localStorage.getItem(`timer-${task.id}`);
//     if (!saved) return;

//     const { startedAt } = JSON.parse(saved);
//     const remainingNow = DURATION - Math.floor((Date.now() - startedAt) / 1000);

//     const interval = runTimer(startedAt);

//     keepAliveAudio.current.play().catch(() => {});
//     setupMediaSession();

//     // re-arm the precise scheduled alarm on reload/remount too
//     if (remainingNow > 0) {
//       scheduleAlarm(remainingNow);
//     }

//     return () => clearInterval(interval);
//   }, [task.id]);

//   // ----------------------------------------------------------------------------------------------------------------------------------
//   const startTimer = async () => {
//     if (buttonsDisabled) return;
//     setButtonsDisabled(true);
//     const startedAt = Date.now();

//     setIsRunning(true);
//     setTimeLeft(DURATION);

//     startSound.current.currentTime = 0;
//     startSound.current.play();

//     // resume AudioContext - browsers suspend it until a user gesture, this click counts
//     if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
//       await audioCtxRef.current.resume().catch(() => {});
//     }

//     keepAliveAudio.current.currentTime = 0;
//     keepAliveAudio.current.play().catch((e) => console.log("keepalive play blocked:", e));
//     setupMediaSession();

//     // schedule the alarm precisely via Web Audio's own clock
//     scheduleAlarm(DURATION);

//     localStorage.setItem(
//       `timer-${task.id}`,
//       JSON.stringify({ startedAt, duration: DURATION })
//     );

//     runTimer(startedAt);

//     try {
//       const uuid = localStorage.getItem("uuid");
//       const response = await checkFocusStatus(uuid);

//       if (response.is_running) {
//         setButtonsDisabled(false);
//         alert("Finish your current focus session first!");
//         return;
//       }

//       await updateFocusStatus(uuid, true);
//       await updateTaskStatus(task.id, "running");
//     } catch (error) {
//       setButtonsDisabled(false);
//       console.log(error);
//     }
//   };

//   // -------------------------------------------------------------------------------------------------------------------------------//
//   const stopAlarm = async () => {
//     cliamSound.current.currentTime = 0;
//     await cliamSound.current.play();

//     audio.pause();
//     audio.currentTime = 0;
//     cancelScheduledAlarm();

//     setShowAlarmPopup(false);
//     await loadDiamond();
//   };

//   //----------------------------------------------------------------------------------------------------------------------------------
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = Math.floor(timeLeft % 60);

//   return (
//     <>
//       <div className="group rounded-3xl border border-[#5d4d36]/30 p-5 sm:p-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-cover bg-center">
//         <div className="rounded-2xl bg-[#f8f3e8]/80 backdrop-blur-[2px] p-5">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
//             <div className="flex-1 min-w-0">
//               <h3
//                 className={`text-lg sm:text-3xl font-bold tracking-wide ${
//                   status === "completed" ? "line-through text-[#5d4d36]" : "text-[#1d1b18]"
//                 }`}
//               >
//                 {task.title}
//               </h3>

//               <div className="mt-3 text-lg">
//                 {status === "completed" ? (
//                   <span className="text-black-700 font-medium">𖣠 Completed</span>
//                 ) : isRunning ? (
//                   <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
//                     <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" />
//                     Focus Session Running
//                   </span>
//                 ) : (
//                   <span className="text-black-700 font-medium">Ready to begin</span>
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-center sm:justify-end">
//               <div className="rounded-xl border border-[#5d4d36]/30 bg-white/40 px-5 py-3 backdrop-blur-sm">
//                 <p className="font-mono text-4xl font-bold tracking-wider text-[#1d1b18]">
//                   {String(minutes).padStart(2, "0")}
//                   <span className="text-[#000000]">:</span>
//                   {String(seconds).padStart(2, "0")}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 border-t border-[#5d4d36]/20 pt-6">
//             {status === "completed" ? (
//               <button disabled className="w-full rounded-xl bg-[#0c842690] py-3 font-semibold text-black ">
//                 Completed
//               </button>
//             ) : !isRunning ? (
//               <button
//                 onClick={startTimer}
//                 disabled={buttonsDisabled}
//                 className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-[#000000] flex items-center justify-center gap-2"
//               >
//                 <FaStudiovinari className="text-xl" />
//                 <span>10</span>
//               </button>
//             ) : (
//               <button
//                 disabled
//                 className="w-full rounded-xl bg-[#d8d1c3] py-3 font-semibold text-[#6b5d46] flex items-center justify-center gap-2"
//               >
//                 <FaStudiovinari className="text-xl" />
//                 <span>Running...</span>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {showAlarmPopup && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div className="w-full max-w-sm rounded-3xl border border-[#5d4d36]/20 bg-[#f8f3e8]/80 p-8 shadow-2xl">
//             <div className="flex flex-col items-center text-center gap-8">
//               <h2 className="text-3xl font-bold text-[#1d1b18]">45 COMPLETE</h2>
//               <button
//                 onClick={stopAlarm}
//                 className="w-full rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-[#24b11f80] flex items-center justify-center gap-2"
//               >
//                 <FaStudiovinari className="text-xl" />
//                 <span>10</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


import { useEffect, useState, useRef } from "react";
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

export default function TaskCard({
  task,
  loadDiamond,
  buttonsDisabled,
  setButtonsDisabled,
  onStatusChange, // NEW - tells Dashboard "this task is now running/completed"
}) {
  const cliamSound = useRef(new Audio("/b.mp3"));
  const startSound = useRef(new Audio("/a.mp3"));
  const keepAliveAudio = useRef(new Audio("/silent-loop.mp3")); // prevents Chrome from freezing the tab

  const audioCtxRef = useRef(null);       // Web Audio context - has its own internal clock
  const alarmBufferRef = useRef(null);    // decoded /done.mp3, loaded once
  const scheduledSourceRef = useRef(null); // the scheduled "play alarm at time X" node

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isRunning, setIsRunning] = useState(false); // true ONLY on the device that owns the live timer/alarm
  const [showAlarmPopup, setShowAlarmPopup] = useState(false);
  const [status, setStatus] = useState(task.status); // "running"/"completed"/etc from the backend - true across ALL devices

  // keep local status in sync if the task prop changes (e.g. Dashboard refetches)
  useEffect(() => {
    setStatus(task.status);
  }, [task.status]);

  // ---- setup keep-alive audio element once ----
  useEffect(() => {
    const el = keepAliveAudio.current;
    el.loop = true;
    el.volume = 0.01; // near-silent, not literally 0
    el.setAttribute("playsinline", "true");
    return () => el.pause();
  }, []);

  // ---- preload the alarm sound into an AudioBuffer once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return; // very old browser fallback - regular audio.play() below still works
        audioCtxRef.current = new AudioContextClass();

        const response = await fetch("/done.mp3");
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await audioCtxRef.current.decodeAudioData(arrayBuffer);
        if (!cancelled) alarmBufferRef.current = decoded;
      } catch (e) {
        console.log("Web Audio preload failed, will fall back to <audio> tag:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setupMediaSession = () => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: task.title,
        artist: "Focus Session Running",
        album: "45 min timer",
      });
      navigator.mediaSession.playbackState = "playing";
      navigator.mediaSession.setActionHandler("pause", () => {});
      navigator.mediaSession.setActionHandler("play", () => {});
    }
  };

  const clearMediaSession = () => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
    }
  };

  // Schedules the alarm to fire at an exact point on the AudioContext's own clock,
  // independent of setInterval. secondsFromNow can be fractional.
  const scheduleAlarm = (secondsFromNow) => {
    const ctx = audioCtxRef.current;
    const buffer = alarmBufferRef.current;
    if (!ctx || !buffer) return false; // caller should fall back to setInterval-triggered audio.play()

    // cancel any previous scheduled alarm for this card
    if (scheduledSourceRef.current) {
      try { scheduledSourceRef.current.stop(); } catch (e) {}
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // keep ringing until user taps stop, same as before
    source.connect(ctx.destination);
    source.start(ctx.currentTime + Math.max(0, secondsFromNow));
    scheduledSourceRef.current = source;
    return true;
  };

  const cancelScheduledAlarm = () => {
    if (scheduledSourceRef.current) {
      try { scheduledSourceRef.current.stop(); } catch (e) {}
      scheduledSourceRef.current = null;
    }
  };

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
        setButtonsDisabled(false);

        localStorage.removeItem(`timer-${task.id}`);

        keepAliveAudio.current.pause();
        keepAliveAudio.current.currentTime = 0;

        // Show UI + play alarm IMMEDIATELY — don't wait on network calls
        setStatus("completed");
        onStatusChange?.(task.id, "completed"); // tell Dashboard the lock can release

        // The Web Audio scheduled alarm (below) already started playing itself
        // at the right time if it was armed. This is the fallback path in case
        // Web Audio wasn't available/preloaded in time.
        if (!scheduledSourceRef.current) {
          audio.loop = true;
          audio.volume = 1;
          audio.play();
        }

        setShowAlarmPopup(true);
        clearMediaSession();

        // Backend bookkeeping happens AFTER the popup is already showing
        try {
          const uuid = localStorage.getItem("uuid");
          const title = task.title;

          await updateFocusStatus(uuid, false);
          await updateTaskStatus(task.id, "completed");
          await addHistory(uuid, title);
          await addDiamond(uuid, 10);
        } catch (error) {
          console.log(error);
        }
      } else {
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
    const remainingNow = DURATION - Math.floor((Date.now() - startedAt) / 1000);

    const interval = runTimer(startedAt);

    keepAliveAudio.current.play().catch(() => {});
    setupMediaSession();

    // re-arm the precise scheduled alarm on reload/remount too
    if (remainingNow > 0) {
      scheduleAlarm(remainingNow);
    }

    // make sure Dashboard's lock reflects reality after a remount too -
    // this card resumed a running timer, so it IS running.
    onStatusChange?.(task.id, "running");

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  // ----------------------------------------------------------------------------------------------------------------------------------
  const startTimer = async () => {
    if (buttonsDisabled) return;
    setButtonsDisabled(true);
    const startedAt = Date.now();

    setIsRunning(true);
    setTimeLeft(DURATION);

    // Tell Dashboard immediately that this task is now running, so the
    // lock is correct even before the backend calls below finish.
    onStatusChange?.(task.id, "running");

    startSound.current.currentTime = 0;
    startSound.current.play();

    // resume AudioContext - browsers suspend it until a user gesture, this click counts
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume().catch(() => {});
    }

    keepAliveAudio.current.currentTime = 0;
    keepAliveAudio.current.play().catch((e) => console.log("keepalive play blocked:", e));
    setupMediaSession();

    // schedule the alarm precisely via Web Audio's own clock
    scheduleAlarm(DURATION);

    localStorage.setItem(
      `timer-${task.id}`,
      JSON.stringify({ startedAt, duration: DURATION })
    );

    runTimer(startedAt);

    try {
      const uuid = localStorage.getItem("uuid");
      const response = await checkFocusStatus(uuid);

      if (response.is_running) {
        setButtonsDisabled(false);
        onStatusChange?.(task.id, task.status); // revert - this task didn't actually start
        alert("Finish your current focus session first!");
        return;
      }

      await updateFocusStatus(uuid, true);
      await updateTaskStatus(task.id, "running");
      setStatus("running"); // reflect immediately in this device's own status too
    } catch (error) {
      setButtonsDisabled(false);
      console.log(error);
    }
  };

  // -------------------------------------------------------------------------------------------------------------------------------//
  const stopAlarm = async () => {
    cliamSound.current.currentTime = 0;
    await cliamSound.current.play();

    audio.pause();
    audio.currentTime = 0;
    cancelScheduledAlarm();

    setShowAlarmPopup(false);
    await loadDiamond();
  };

  //----------------------------------------------------------------------------------------------------------------------------------
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  // true if the task is running somewhere (this device or another) but THIS device
  // isn't the one holding the live countdown/alarm
  const runningElsewhere = status === "running" && !isRunning;

  return (
    <>
      <div className="group rounded-3xl border border-[#5d4d36]/30 p-5 sm:p-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-cover bg-center">
        <div className="rounded-2xl bg-[#f8f3e8]/80 backdrop-blur-[2px] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg sm:text-3xl font-bold tracking-wide ${
                  status === "completed" ? "line-through text-[#5d4d36]" : "text-[#1d1b18]"
                }`}
              >
                {task.title}
              </h3>

              <div className="mt-3 text-lg">
                {status === "completed" ? (
                  <span className="text-black-700 font-medium">𖣠 Completed</span>
                ) : isRunning ? (
                  <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-700 animate-pulse" />
                    Focus Session Running
                  </span>
                ) : runningElsewhere ? (
                  <span className="flex items-center gap-2 text-[#1d1b18] font-medium">
                    <span className="h-2 w-2 rounded-full bg-red-700" />
                    Running
                  </span>
                ) : (
                  <span className="text-black-700 font-medium">Ready to begin</span>
                )}
              </div>
            </div>

            <div className="flex justify-center sm:justify-end">
              <div className="rounded-xl border border-[#5d4d36]/30 bg-white/40 px-5 py-3 backdrop-blur-sm">
                <p className="font-mono text-4xl font-bold tracking-wider text-[#1d1b18]">
                  {isRunning ? String(minutes).padStart(2, "0") : "45"}
                  <span className="text-[#000000]">:</span>
                  {isRunning ? String(seconds).padStart(2, "0") : "00"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#5d4d36]/20 pt-6">
            {status === "completed" ? (
              <button disabled className="w-full rounded-xl bg-[#0c842690] py-3 font-semibold text-black ">
                Completed
              </button>
            ) : isRunning ? (
              <button
                disabled
                className="w-full rounded-xl bg-[#29801a] py-3 font-semibold text-[#000000] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Running...</span>
              </button>
              
            ) : runningElsewhere ? (
              <button
                disabled
                className="w-full rounded-xl bg-[#29801a] py-3 font-semibold text-[#fefefa] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Running</span>
              </button>
            ) : (
              <button
                onClick={startTimer}
                disabled={buttonsDisabled}
                className="w-full rounded-xl bg-[#000000] py-3 font-semibold text-white transition hover:bg-[#000000] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaStudiovinari className="text-xl" />
                <span>Start</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showAlarmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#5d4d36]/20 bg-[#f8f3e8]/80 p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-8">
              <h2 className="text-3xl font-bold text-[#1d1b18]">45 COMPLETE</h2>
              <button
                onClick={stopAlarm}
                className="w-full rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-[#24b11f80] flex items-center justify-center gap-2"
              >
                <FaStudiovinari className="text-xl" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}