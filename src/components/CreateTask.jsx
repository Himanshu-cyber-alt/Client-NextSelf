import { useState } from "react";
import { createTask } from "../services/authService";

export default function CreateTask({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const uuid = localStorage.getItem("uuid");

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      const response = await createTask({
        title,
        uuid,
      });

      onTaskCreated(response.task);

      setTitle("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="flex flex-col sm:flex-row gap-3">
    <input
      type="text"
      placeholder="Enter task title..."
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !loading) {
          handleSubmit();
        }
      }}
      className="flex-2 rounded-12xl border border-gray-300 bg-white px-5 py-4 text-xl text-black placeholder:text-gray-400 outline-none transition-all "
    />

    <button
      onClick={handleSubmit}
      disabled={loading}
      className="rounded-12xl bg-black px-8 py-4 text-xl font-semibold text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Creating..." : "Create Task"}
    </button>
  </div>
);


}