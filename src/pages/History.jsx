import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/authService";
import HistoryCards from "../components/HistoryCards.jsx";



export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const uuid = localStorage.getItem("uuid");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistory(uuid);
        setHistory(data.history || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uuid]);

return (
  <div
    className="relative min-h-screen bg-cover bg-center bg-fixed"
    style={{
      backgroundImage:
        "url('one.jpg')",
    }}
  >
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />

    {/* Content */}
    <div className="relative z-10 px-6 py-10">
      <button
        onClick={() => navigate("/home")}
        className="mb-8 rounded-lg border border-white/20 bg-black/40 px-5 py-2 text-white backdrop-blur-md hover:bg-black/60"
      >
        ← Dashboard
      </button>

      <h1 className="mb-10 text-center text-4xl font-bold text-white">
         Task History
      </h1>

      {loading && (
        <p className="text-center text-gray-300">
          Loading history...
        </p>
      )}

      {!loading && history.length === 0 && (
        <p className="text-center text-gray-300">
          No history yet.
        </p>
      )}

      <HistoryCards history={history} />
    </div>
  </div>
);


}