export default function HistoryCards({ history }) {
  // newest date first
  const sorted = [...history].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

return (
  <div className="max-w-2xl mx-auto space-y-8">
    {sorted.map((day) => {
      const totalMinutes = day.tasks.length * 45;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return (
        <div
          key={day.date}
          className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:bg-black/50 hover:border-white/20"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-wide text-white">
              {new Date(day.date).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>

            <div className="rounded-full border border-black-400/30 bg-black-400/10 px-4 py-1 text-sm font-medium text-green-300">
               {hours}h {minutes}m
            </div>
          </div>

          <div className="space-y-3">
            {day.tasks.map((title, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm px-4 py-3 text-gray-100 transition-all duration-300 hover:bg-black/45 hover:border-yellow-400/20"
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
}