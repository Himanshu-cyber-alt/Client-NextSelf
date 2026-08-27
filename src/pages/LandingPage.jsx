import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { googleLogin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
export default function LandingPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Google Sign-In
      const result = await signInWithPopup(auth, provider);



      // Get Firebase ID Token
      const idToken = await result.user.getIdToken();


      // Send token to your backend
      const data = await googleLogin(idToken);

      // Save your own JWT
      localStorage.setItem("token", data.token);
      localStorage.setItem("uuid", data.user.id);
      localStorage.setItem("email",data.user.email);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
    } catch (error) {
      console.error(error);
    }
  };

return (
  <div className="w-full min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center text-center px-4">
      <h1 className="text-white text-5xl sm:text-6xl font-bold mb-4">
        Hemant
      </h1>

      <p className="text-gray-400 mb-8">
        The Only Option You Have
      </p>

    <button
  onClick={handleGoogleLogin}
  className="px-8 py-3 bg-white text-black rounded-full font-semibold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
>
  Enter
</button>



    </div>
  </div>
);


}