


// import React, { useState, useRef, useEffect } from "react";
// import { getDiamond, removeDiamond, addReward, removeReward, sendEmailAlert } from "../services/authService";
// import { useNavigate } from "react-router-dom";
// import { FaStudiovinari } from "react-icons/fa";

// export default function RoyalReward() {
//   const [diamonds, setDiamonds] = useState(0);
//   const [playing, setPlaying] = useState(false);
//   const [selectedReward, setSelectedReward] = useState(null);
//   const [showReward, setShowReward] = useState(false);

//   // --- Lightweight HTML5 Audio Refs ---
//   const claimTime = useRef(new Audio("/c.mp3"));
//   const spin = useRef(new Audio("/d.mp3"));

//   const keepAliveAudio = useRef(new Audio("/silent-loop.mp3")); 
//   const alarmAudio = useRef(new Audio("/stop.mp3"));

//   const [rewardMinutes, setRewardMinutes] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);

//   const navigate = useNavigate();
//   const uuid = localStorage.getItem("uuid");
//   const SPIN_COST = 20;

//   const videoRef = useRef(null);
//   const intervalRef = useRef(null);
//   const spinningRef = useRef(false);

//   const REWARDS = [
//     { duration: 1, rarity: "common", chance: 50, video: "/30.mp4" },
//     { duration: 1, rarity: "rare", chance: 35, video: "/45.mp4" },
//     { duration: 1, rarity: "legendary", chance: 15, video: "/60.mp4" },
//   ];

//   // ---- Setup Keep-Alive Audio ----
//   useEffect(() => {
//     const el = keepAliveAudio.current;
//     el.loop = true;
//     el.volume = 0.01; 
//     el.setAttribute("playsinline", "true");
//     return () => el.pause();
//   }, []);

//   // ---- Cleanup Timer & Alarm on Unmount ----
//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (alarmAudio.current) {
//         alarmAudio.current.pause();
//       }
//     };
//   }, []);

//   const Diamond = async () => {
//     try {
//       const data = await getDiamond(uuid);
//       setDiamonds(data.data.diamonds);
//       setRewardMinutes(data.data.reward_minutes);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     Diamond();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   function pickReward(pool) {
//     const total = pool.reduce((sum, item) => sum + item.chance, 0);
//     let random = Math.random() * total;
//     for (const item of pool) {
//       if (random < item.chance) return item;
//       random -= item.chance;
//     }
//     return pool[pool.length - 1];
//   }

//   const handleSpin = async () => {
//     if (spinningRef.current || playing || diamonds < SPIN_COST) return;
//     spinningRef.current = true;

//     const reward = pickReward(REWARDS);

//     spin.current.currentTime = 0;
//     spin.current.play().catch(() => {});

//     setSelectedReward(reward);
//     setShowReward(false);
//     setPlaying(true);

//     if (videoRef.current) {
//       videoRef.current.src = reward.video;
//       videoRef.current.load();
//       videoRef.current.currentTime = 0;
//       videoRef.current.play().catch(() => {});
//     }

//     setDiamonds((prev) => prev - SPIN_COST);

//     try {
//       const result = await addReward(uuid, reward.duration);
//       setRewardMinutes(result.data.reward_minutes);
//       await removeDiamond(uuid);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       spinningRef.current = false;
//     }
//   };

//   // ------------------------------------------------------------
//   // CORE TIMER LOGIC
//   // ------------------------------------------------------------
//   const runTimer = (startedAt, totalSeconds) => {
//     if (intervalRef.current) clearInterval(intervalRef.current);

//     const interval = setInterval(() => {
//       const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//       const remaining = totalSeconds - elapsed;

//       if (remaining <= 0) {
//         clearInterval(interval);
//         intervalRef.current = null;
//         setTimeLeft(0);
//         localStorage.removeItem(`timer-${uuid}`);

//         keepAliveAudio.current.pause();
//         keepAliveAudio.current.currentTime = 0;

//         // 1. Play the loud alarm
//         if (alarmAudio.current) {
//           alarmAudio.current.loop = true;
//           alarmAudio.current.play().catch(e => console.log("Alarm blocked:", e));
//         }

//         // 2. Send the Email Alert!
//         sendEmailAlert("h9119796@gmail.com");

//       } else {
//         setTimeLeft(remaining);
//       }
//     }, 1000);

//     intervalRef.current = interval;
//   };

//   const startTimer = async () => {
//     if (rewardMinutes <= 0) return;

//     try {
//       claimTime.current.currentTime = 0;
//       await claimTime.current.play();

//       const startedAt = Date.now();
      
//       // Using the actual reward minutes for the countdown (e.g., 30 * 60 = 1800 seconds)
//       const totalSeconds = rewardMinutes * 60; 

//       // Start the keep-alive background audio to prevent browser sleep
//       keepAliveAudio.current.currentTime = 0;
//       keepAliveAudio.current.play().catch((e) => console.log("keepalive blocked:", e));

//       // Mobile trick: briefly play/pause the alarm so it is allowed to ring later
//       alarmAudio.current.play().then(() => alarmAudio.current.pause()).catch(()=>{});

//       localStorage.setItem(`timer-${uuid}`, JSON.stringify({ startedAt, duration: totalSeconds }));
//       setTimeLeft(totalSeconds);

//       await removeReward(uuid);
//       setRewardMinutes(0);

//       runTimer(startedAt, totalSeconds);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Resume a timer if the user refreshed the page
//   useEffect(() => {
//     if (!uuid) return;
//     const saved = localStorage.getItem(`timer-${uuid}`);
//     if (!saved) return;

//     const { startedAt, duration } = JSON.parse(saved);
//     const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//     const remaining = duration - elapsed;

//     if (remaining <= 0) {
//       localStorage.removeItem(`timer-${uuid}`);
//       return;
//     }

//     setTimeLeft(remaining);
//     runTimer(startedAt, duration);
//     keepAliveAudio.current.play().catch(() => {});
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [uuid]);

//   // Function to stop the alarm from ringing
//   const handleStopAlarm = () => {
//     if (alarmAudio.current) {
//       alarmAudio.current.pause();
//       alarmAudio.current.currentTime = 0;
//     }
//   };

//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;

//   // Determine if a timer is actively running
//   const isTimerActive = timeLeft > 0;

//   return (
//     <div
//       className="fixed inset-0 overflow-hidden bg-cover bg-center flex items-center justify-center"
//       style={{ backgroundImage: "url('seven.jpg')" }}
//     >
//       <div className="absolute inset-0 bg-black/40"></div>

//       <button
//         onClick={() => {
//           handleStopAlarm();
//           navigate("/home");
//         }}
//         className="absolute top-6 left-6 z-20 bg-gray-600 hover:bg-black text-white px-5 py-2 rounded-xl font-semibold transition"
//       >
//         ← Dashboard
//       </button>

//       <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 w-full h-screen px-6">
        
//         {/* ================= Spin Wheel ================= */}
//         <div className="w-full max-w-[800px] max-h-[90vh] overflow-hidden bg-[#16181d] border-2 border-gray-700 rounded-3xl shadow-2xl">
//           <div className="flex justify-between items-center px-6 py-4 bg-[#23262d] border-b border-gray-700">
//             <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">TIME</h1>
//             <div className="flex items-center gap-2">
//               <FaStudiovinari className="text-white text-3xl" />
//               <span className="text-white text-2xl sm:text-3xl font-bold">{diamonds}</span>
//             </div>
//           </div>

//           <div className="rounded-xl overflow-hidden border-2 border-gray-700 bg-black">
//             <video
//               ref={videoRef}
//               playsInline
//               poster="four.jpg"
//               className="w-full h-[260px] sm:h-[360px] md:h-[450px] object-cover"
//               onEnded={() => {
//                 setPlaying(false);
//                 setShowReward(true);
//               }}
//             />
//           </div>

//           <div className="p-4">
//             <button
//               onClick={handleSpin}
//               disabled={playing || diamonds < SPIN_COST}
//               className="w-full rounded-2xl bg-gray-700 hover:bg-green-700 py-4 text-xl font-bold text-white disabled:opacity-40 transition flex items-center justify-center gap-3"
//             >
//               <FaStudiovinari className="text-2xl" />
//               <span>{SPIN_COST} SPIN</span>
//             </button>
//           </div>
//         </div>

//         {/* ================= Reward Card ================= */}
//         <div
//           className="relative w-full max-w-[480px] max-h-[90vh] rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-gray-700 bg-cover bg-center"
//           style={{ backgroundImage: "url('six.jpg')" }}
//         >
//           <div className="absolute inset-0 bg-black/50"></div>

//           <div className="relative z-10 flex flex-col items-center justify-center h-full">
//             <h2 className="text-5xl font-bold text-white">TIME</h2>

//             <p className="mt-6 font-mono text-5xl font-bold text-white">
//               {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
//             </p>

//             {/* Conditionally render the button based on the timer status */}
//             {!isTimerActive ? (
//               <button
//                 onClick={startTimer}
//                 disabled={playing || rewardMinutes <= 0}
//                 className="mt-12 w-full rounded-2xl bg-red-700 hover:bg-red-800 py-4 font-semibold text-white transition disabled:opacity-50"
//               >
//                 Consume
//               </button>
//             ) : (
//               <button
//                 onClick={handleStopAlarm}
//                 className="mt-12 w-full rounded-2xl bg-black border-2 border-gray-600 hover:bg-gray-800 py-4 font-semibold text-white transition"
//               >
//                 Stop Alarm
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useRef, useEffect } from "react";
import { getDiamond, removeDiamond, addReward, removeReward, sendEmailAlert } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FaStudiovinari } from "react-icons/fa";

export default function RoyalReward() {
  const [diamonds, setDiamonds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);

  // --- Kept Only the Button Sounds ---
  const claimTime = useRef(new Audio("/c.mp3"));
  const spin = useRef(new Audio("/d.mp3"));

  const [rewardMinutes, setRewardMinutes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();
  const uuid = localStorage.getItem("uuid");
  const SPIN_COST = 20;

  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const spinningRef = useRef(false);
  
  const  email = localStorage.getItem("email");

  const REWARDS = [
    { duration: 1, rarity: "common", chance: 50, video: "/30.mp4" },
    { duration: 1, rarity: "rare", chance: 35, video: "/45.mp4" },
    { duration: 1, rarity: "legendary", chance: 15, video: "/60.mp4" },
  ];

  // ---- Cleanup Timer on Unmount ----
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const Diamond = async () => {
    try {
      const data = await getDiamond(uuid);
      setDiamonds(data.data.diamonds);
      setRewardMinutes(data.data.reward_minutes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    Diamond();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickReward(pool) {
    const total = pool.reduce((sum, item) => sum + item.chance, 0);
    let random = Math.random() * total;
    for (const item of pool) {
      if (random < item.chance) return item;
      random -= item.chance;
    }
    return pool[pool.length - 1];
  }

  const handleSpin = async () => {
    if (spinningRef.current || playing || diamonds < SPIN_COST) return;
    spinningRef.current = true;

    const reward = pickReward(REWARDS);

    // Play spin sound
    spin.current.currentTime = 0;
    spin.current.play().catch(() => {});

    setSelectedReward(reward);
    setShowReward(false);
    setPlaying(true);

    if (videoRef.current) {
      videoRef.current.src = reward.video;
      videoRef.current.load();
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    setDiamonds((prev) => prev - SPIN_COST);

    try {
      const result = await addReward(uuid, reward.duration);
      setRewardMinutes(result.data.reward_minutes);
      await removeDiamond(uuid);
    } catch (error) {
      console.log(error);
    } finally {
      spinningRef.current = false;
    }
  };

  // ------------------------------------------------------------
  // CORE TIMER LOGIC
  // ------------------------------------------------------------
  const runTimer = (startedAt, totalSeconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = totalSeconds - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        intervalRef.current = null;
        setTimeLeft(0);
        localStorage.removeItem(`timer-${uuid}`);

        // Send the Email Alert!
        sendEmailAlert(email);

      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    intervalRef.current = interval;
  };

  const startTimer = async () => {
    if (rewardMinutes <= 0) return;

    try {
      // Play claim sound
      claimTime.current.currentTime = 0;
      await claimTime.current.play();

      const startedAt = Date.now();
      
      // Using the actual reward minutes for the countdown (e.g., 30 * 60 = 1800 seconds)
      const totalSeconds = rewardMinutes * 60; 

      localStorage.setItem(`timer-${uuid}`, JSON.stringify({ startedAt, duration: totalSeconds }));
      setTimeLeft(totalSeconds);

      await removeReward(uuid);
      setRewardMinutes(0);

      runTimer(startedAt, totalSeconds);
    } catch (error) {
      console.log(error);
    }
  };

  // Resume a timer if the user refreshed the page
  useEffect(() => {
    if (!uuid) return;
    const saved = localStorage.getItem(`timer-${uuid}`);
    if (!saved) return;

    const { startedAt, duration } = JSON.parse(saved);
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = duration - elapsed;

    if (remaining <= 0) {
      localStorage.removeItem(`timer-${uuid}`);
      return;
    }

    setTimeLeft(remaining);
    runTimer(startedAt, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimerActive = timeLeft > 0;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('seven.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 z-20 bg-gray-600 hover:bg-black text-white px-5 py-2 rounded-xl font-semibold transition"
      >
        ← Dashboard
      </button>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 w-full h-screen px-6">
        
        {/* ================= Spin Wheel ================= */}
        <div className="w-full max-w-[800px] max-h-[90vh] overflow-hidden bg-[#16181d] border-2 border-gray-700 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center px-6 py-4 bg-[#23262d] border-b border-gray-700">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">TIME</h1>
            <div className="flex items-center gap-2">
              <FaStudiovinari className="text-white text-3xl" />
              <span className="text-white text-2xl sm:text-3xl font-bold">{diamonds}</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border-2 border-gray-700 bg-black">
            <video
              ref={videoRef}
              playsInline
              poster="four.jpg"
              className="w-full h-[260px] sm:h-[360px] md:h-[450px] object-cover"
              onEnded={() => {
                setPlaying(false);
                setShowReward(true);
              }}
            />
          </div>

          <div className="p-4">
            <button
              onClick={handleSpin}
              disabled={playing || diamonds < SPIN_COST}
              className="w-full rounded-2xl bg-gray-700 hover:bg-green-700 py-4 text-xl font-bold text-white disabled:opacity-40 transition flex items-center justify-center gap-3"
            >
              <FaStudiovinari className="text-2xl" />
              <span>{SPIN_COST} SPIN</span>
            </button>
          </div>
        </div>

        {/* ================= Reward Card ================= */}
        <div
          className="relative w-full max-w-[480px] max-h-[90vh] rounded-3xl p-8 shadow-2xl overflow-hidden border-2 border-gray-700 bg-cover bg-center"
          style={{ backgroundImage: "url('six.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <h2 className="text-5xl font-bold text-white">TIME</h2>

            <p className="mt-6 font-mono text-5xl font-bold text-white">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>

            {/* Conditionally render the button based on the timer status */}
            {!isTimerActive ? (
              <button
                onClick={startTimer}
                disabled={playing || rewardMinutes <= 0}
                className="mt-12 w-full rounded-2xl bg-red-700 hover:bg-red-800 py-4 font-semibold text-white transition disabled:opacity-50"
              >
                Consume
              </button>
            ) : (
              <button
                disabled
                className="mt-12 w-full rounded-2xl bg-black border-2 border-gray-600 py-4 font-semibold text-white transition opacity-50 cursor-not-allowed"
              >
                Running...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}