import React, { useState, useRef, useEffect } from "react";
import { getDiamond, removeDiamond, addReward, removeReward } from "../services/authService";
import { useNavigate } from "react-router-dom";

import { FaStudiovinari } from "react-icons/fa";

export default function RoyalReward() {
  const [diamonds, setDiamonds] = useState(15);
  const [playing, setPlaying] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);

    const claimTime = useRef(new Audio("/c.mp3"))
    const spin = useRef(new Audio("/d.mp3"))

  // rewardMinutes = minutes from server
  const [rewardMinutes, setRewardMinutes] = useState(0);

  // timeLeft is tracked in SECONDS (this is what the UI renders)
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();
  const uuid = localStorage.getItem("uuid");

  const SPIN_COST = 20;
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const spinningRef = useRef(false); // guards against double-click race

  // Create the Audio object once instead of on every render
  useEffect(() => {
    audioRef.current = new Audio("/stop.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const REWARDS = [
    { duration: 30, rarity: "common", chance: 50, video: "/30.mp4" },
    { duration: 45, rarity: "rare", chance: 35, video: "/45.mp4" },
    { duration: 60, rarity: "legendary", chance: 15, video: "/60.mp4" },
  ];

  const Diamond = async () => {
    try {
      const data = await getDiamond(uuid);
      setDiamonds(data.data.diamonds);
      setRewardMinutes(data.data.reward_minutes);
    } catch (error) {
      console.log(error);
    }
  };

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
    // guard immediately (state updates are async, so `playing` alone isn't enough)
    if (spinningRef.current || playing || diamonds < SPIN_COST) return;
    spinningRef.current = true;

    try { 
      
      spin.current.currentTime = 0;
      await spin.current.play();

      const reward = pickReward(REWARDS);
      const time = reward.duration;

      const result = await addReward(uuid, time);

  
     

      // reflect the newly awarded minutes so Start Focus uses the right duration
      setRewardMinutes(result.data.reward_minutes);

      setSelectedReward(reward);
      setShowReward(false);

      await removeDiamond(uuid);
      setDiamonds((prev) => prev - SPIN_COST);

      setPlaying(true);

      if (videoRef.current) {
        videoRef.current.src = reward.video;
        videoRef.current.load();
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } catch (error) {
      console.log(error);
    } finally {
      spinningRef.current = false;
    }
  };

  // Only fetch diamonds/reward_minutes once on mount
  useEffect(() => {
    Diamond();
  }, []);

  // ------------------------------------------------------------
  // runTimer only drives the countdown — it no longer touches the server,
  // so it's safe to call again (e.g. on resume after refresh) without
  // side effects firing more than once.
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
        if (audioRef.current) {
          audioRef.current.loop = true;
          audioRef.current.play();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    intervalRef.current = interval;
  };

  const startTimer = async () => {
    if (rewardMinutes <= 0) return;

    try {
      
      claimTime.current.currentTime = 0;
      await claimTime.current.play();

      const startedAt = Date.now();
      const totalSeconds = rewardMinutes * 60;

      localStorage.setItem(
        `timer-${uuid}`,
        JSON.stringify({
          startedAt,
          duration: totalSeconds,
        })
      );

      setTimeLeft(totalSeconds);

      // consume the reward exactly once, when the timer actually starts
      await removeReward(uuid);
      setRewardMinutes(0);

      runTimer(startedAt, totalSeconds);
    } catch (error) {
      console.log(error);
    }
  };

  // Resume a timer already running (e.g. after page refresh).
  // Runs once per uuid — NOT on every timeLeft tick (that was causing
  // the interval to be rebuilt, and removeReward to be re-called, every second).
  useEffect(() => {
    if (!uuid) return;
    const saved = localStorage.getItem(`timer-${uuid}`);
    if (!saved) return;

    const { startedAt, duration } = JSON.parse(saved);
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
     const remaining =  duration - elapsed

    if (remaining <= 0) {
      localStorage.removeItem(`timer-${uuid}`);
      return;
    }

    setTimeLeft(remaining);
    runTimer(startedAt, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // Clean up the interval on unmount, regardless of which path started it
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;



return (
  <div
    className="fixed inset-0 overflow-hidden bg-cover bg-center flex items-center justify-center"
    style={{
      backgroundImage:
        "url('seven.jpg')",
    }}
  >
    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* Dashboard Button */}
    <button
      onClick={() => navigate("/home")}
      className="absolute top-6 left-6 z-20 bg-gray-600 hover:bg-black text-white px-5 py-2 rounded-xl font-semibold transition"
    >
      ← Dashboard
    </button>

    {/* Main Content */}
    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 w-full h-screen px-6">

      {/* ================= Spin Wheel ================= */}
      <div className="w-full max-w-[800px] max-h-[90vh] overflow-hidden bg-[#16181d] border-2 border-gray-700 rounded-3xl shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#23262d] border-b border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            TIME
          </h1>

          <div className="flex items-center gap-2">
            <FaStudiovinari className="text-white text-3xl" />
            <span className="text-white text-2xl sm:text-3xl font-bold">
              {diamonds}
            </span>
          </div>
        </div>

        {/* Video */}
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

        {/* Spin Button */}
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
        style={{
          backgroundImage:
            "url('six.jpg')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">

          <h2 className="text-5xl font-bold text-white">
            TIME
          </h2>

          <p className="mt-6 font-mono text-5xl font-bold text-white">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>

          <button
            onClick={startTimer}
            disabled={rewardMinutes <= 0}
            className="mt-12 w-full rounded-2xl bg-red-700 hover:bg-red-700 py-4 font-semibold text-white transition disabled:opacity-1"
          >
            Consume
          </button>
        </div>
      </div>

    </div>
  </div>
);


}


