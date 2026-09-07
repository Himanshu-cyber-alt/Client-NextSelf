

// // components/Calendar.jsx
// import { useEffect, useState, useMemo } from "react";
// import { getHistory } from "../services/authService";

// const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// const TASK_MINUTES = 60; // must match backend/dashboard session duration

// function getColor(count) {
//   if (count === 0) return "bg-red-600/80"; // no activity that day
//   const hours = count * (TASK_MINUTES / 60);
//   if (hours < 6) return "bg-red-600/80";
//   if (hours <= 8) return "bg-green-700/60"; // light green
//   return "bg-green-400"; // proper green
// }

// function toKey(date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// function buildMonthGrid(year, month) {
//   const firstDay = new Date(year, month, 1);
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const startWeekday = firstDay.getDay(); // 0 = Sun

//   const cells = [];
//   for (let i = 0; i < startWeekday; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
//   while (cells.length % 7 !== 0) cells.push(null);

//   const weeks = [];
//   for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
//   return weeks;
// }

// export default function Calendar() {
//   const [history, setHistory] = useState([]); // [{ date: "Sat Aug 01 2026", tasks: [...] }]
//   const uuid = localStorage.getItem("uuid");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await getHistory(uuid);
//         setHistory(data.history || []);
//       } catch (e) {
//         console.log(e);
//       }
//     };
//     load();
//   }, [uuid]);

//   const countsByDay = useMemo(() => {
//     const map = {};
//     history.forEach((entry) => {
//       if (!entry.date) return;
//       const key = toKey(new Date(entry.date));
//       map[key] = (entry.tasks || []).length;
//     });
//     return map;
//   }, [history]);

//   const months = useMemo(() => {
//     const now = new Date();
//     const currentKey = now.getFullYear() * 12 + now.getMonth();

//     let startKey = currentKey;
//     history.forEach((entry) => {
//       if (!entry.date) return;
//       const d = new Date(entry.date);
//       const k = d.getFullYear() * 12 + d.getMonth();
//       if (k < startKey) startKey = k;
//     });

//     const list = [];
//     for (let k = startKey; k <= currentKey; k++) {
//       list.push({ year: Math.floor(k / 12), month: k % 12 });
//     }
//     return list;
//   }, [history]);

//   const todayKey = toKey(new Date());

//   const todayCount = countsByDay[todayKey] || 0;
//   const todayHours = (todayCount * (TASK_MINUTES / 60)).toFixed(1);

//   return (
//     <div className="bg-black/50 rounded-xl p-15 w-fit">
//       <div className="grid grid-cols-2 gap-4  ">
//         {months.map(({ year, month }) => {
//           const weeks = buildMonthGrid(year, month);
//           return (
//             <div
//               key={`${year}-${month}`}
//               className="border border-white/15 rounded-lg p-4 w-54 flex flex-col items-start"
//             >
//               <span className="text-sm text-white/70 mb-2">
//                 {MONTH_NAMES[month]}{month === 0 ? ` '${String(year).slice(2)}` : ""}
//               </span>
//               <div className="flex gap-1">
//                 {weeks.map((week, wi) => (
//                   <div key={wi} className="flex flex-col gap-1">
//                     {week.map((date, di) => {
//                       if (!date) {
//                         return <div key={di} className="w-4 h-4 rounded-sm bg-transparent" />;
//                       }
//                       const key = toKey(date);
//                       const isFuture = key > todayKey;
//                       const isToday = key === todayKey;
//                       const count = countsByDay[key] || 0;

//                       let colorClass = "bg-transparent";
//                       if (isToday) colorClass = "bg-white/20";
//                       else if (!isFuture) colorClass = getColor(count);

//                       return (
//                         <div
//                           key={di}
//                           title={`${key}: ${count} task${count === 1 ? "" : "s"} (${((count * TASK_MINUTES) / 60).toFixed(1)}h)`}
//                           className={`w-4 h-4 rounded-sm ${colorClass}`}
//                         />
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex items-center gap-1.5 mt-5 text-sm text-white/60">
//        <span>Today: {todayCount} task{todayCount === 1 ? "" : "s"} · {todayHours}h</span>
//       </div>
//     </div>
//   );
// }


// components/Calendar.jsx
import { useEffect, useState, useMemo } from "react";
import { getHistory } from "../services/authService";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// IMPORTANT: this is the fix for the "past days changed hours" bug.
// Instead of one global TASK_MINUTES applied to ALL history, we keep a
// timeline of which session length was active on which date. Add a new
// entry here every time you change session length going forward — never
// edit or remove old entries, or old days will shift again.
//
// Sorted oldest -> newest. `from` = first date (inclusive) this length applied.
const SESSION_LENGTH_HISTORY = [
  { from: new Date(2000, 0, 1), minutes: 50 }, // original 45-min sessions
  { from: new Date(2026, 8, 7), minutes: 60 }, // <-- SET THIS to the real date you switched to 60-min sessions
];

function sessionMinutesForDate(date) {
  let minutes = SESSION_LENGTH_HISTORY[0].minutes;
  for (const entry of SESSION_LENGTH_HISTORY) {
    if (entry.from <= date) minutes = entry.minutes;
    else break;
  }
  return minutes;
}

// Preferred: if a history entry (or its tasks) already carries real duration
// data, use that instead of guessing from a count. This is the long-term fix —
// have the backend record actual minutes studied, not just a task count.
function minutesForEntry(entry, date) {
  if (typeof entry.totalMinutes === "number") {
    return entry.totalMinutes;
  }
  const tasks = entry.tasks || [];
  const hasPerTaskMinutes = tasks.length > 0 && typeof tasks[0]?.minutes === "number";
  if (hasPerTaskMinutes) {
    return tasks.reduce((sum, t) => sum + (t.minutes || 0), 0);
  }
  // Fallback for old entries that only stored task titles/count:
  // use whatever session length was actually active on that date.
  return tasks.length * sessionMinutesForDate(date);
}

function getColor(hours) {
  if (hours === 0) return "bg-red-600/80"; // no activity that day
  if (hours < 6) return "bg-red-600/80";
  if (hours <= 8) return "bg-green-700/60"; // light green
  return "bg-green-400"; // proper green
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0 = Sun

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function Calendar() {
  const [history, setHistory] = useState([]); // [{ date: "Sat Aug 01 2026", tasks: [...] }]
  const uuid = localStorage.getItem("uuid");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistory(uuid);
        setHistory(data.history || []);
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, [uuid]);

  // Now stores { count, minutes, hours } per day instead of just a raw count,
  // so each day's minutes are locked to whatever was true on that date.
  const dataByDay = useMemo(() => {
    const map = {};
    history.forEach((entry) => {
      if (!entry.date) return;
      const date = new Date(entry.date);
      const key = toKey(date);
      const count = (entry.tasks || []).length;
      const minutes = minutesForEntry(entry, date);
      map[key] = { count, minutes, hours: minutes / 60 };
    });
    return map;
  }, [history]);

  const months = useMemo(() => {
    const now = new Date();
    const currentKey = now.getFullYear() * 12 + now.getMonth();

    let startKey = currentKey;
    history.forEach((entry) => {
      if (!entry.date) return;
      const d = new Date(entry.date);
      const k = d.getFullYear() * 12 + d.getMonth();
      if (k < startKey) startKey = k;
    });

    const list = [];
    for (let k = startKey; k <= currentKey; k++) {
      list.push({ year: Math.floor(k / 12), month: k % 12 });
    }
    return list;
  }, [history]);

  const todayKey = toKey(new Date());

  const todayData = dataByDay[todayKey] || { count: 0, hours: 0 };
  const todayHours = todayData.hours.toFixed(1);

  return (
    <div className="bg-black/50 rounded-xl p-15 w-fit">
      <div className="grid grid-cols-2 gap-4  ">
        {months.map(({ year, month }) => {
          const weeks = buildMonthGrid(year, month);
          return (
            <div
              key={`${year}-${month}`}
              className="border border-white/15 rounded-lg p-4 w-54 flex flex-col items-start"
            >
              <span className="text-sm text-white/70 mb-2">
                {MONTH_NAMES[month]}{month === 0 ? ` '${String(year).slice(2)}` : ""}
              </span>
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((date, di) => {
                      if (!date) {
                        return <div key={di} className="w-4 h-4 rounded-sm bg-transparent" />;
                      }
                      const key = toKey(date);
                      const isFuture = key > todayKey;
                      const isToday = key === todayKey;
                      const dayData = dataByDay[key] || { count: 0, hours: 0 };

                      let colorClass = "bg-transparent";
                      if (isToday) colorClass = "bg-white/20";
                      else if (!isFuture) colorClass = getColor(dayData.hours);

                      return (
                        <div
                          key={di}
                          title={`${key}: ${dayData.count} task${dayData.count === 1 ? "" : "s"} (${dayData.hours.toFixed(1)}h)`}
                          className={`w-4 h-4 rounded-sm ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-5 text-sm text-white/60">
       <span>Today: {todayData.count} task{todayData.count === 1 ? "" : "s"} · {todayHours}h</span>
      </div>
    </div>
  );
}