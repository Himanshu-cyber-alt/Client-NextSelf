import { Routes, Route } from "react-router-dom";



import Dashboard from "./pages/Dashboard";
import RoyalReward from "./pages/RoyalReward";
import History from "./pages/History";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Growth from "./pages/Growth.jsx";

function App() {
  return (
    <Routes>
    <Route path="/" element={<LandingPage />} />

   
   
         

           <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/royal-reward"
      element={

        <ProtectedRoute>
          <RoyalReward/>
        </ProtectedRoute>
      }

      />

 <Route path="/history"
      element={

        <ProtectedRoute>
          <History/>
        </ProtectedRoute>
      }
/>


    <Route path="/growth"
      element={

        <ProtectedRoute>
          <Growth/>
        </ProtectedRoute>
      }

      />


     

    </Routes>
  );
}

export default App;