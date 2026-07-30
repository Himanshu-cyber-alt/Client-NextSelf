export default function ProgressBar() {
  return (
    <div className="mb-8">

      <div className="flex justify-between mb-2">

        <h2 className="text-xl font-bold">
          Today's Progress
        </h2>

        <span>
          4 / 8 Tasks
        </span>

      </div>

      <div className="w-full h-4 rounded-full bg-zinc-800 overflow-hidden">

        <div className="h-full w-1/2 bg-green-500 rounded-full transition-all"></div>

      </div>

    </div>
  );
}