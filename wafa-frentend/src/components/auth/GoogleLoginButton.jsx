import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <motion.button
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 shadow-sm hover:shadow-md"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <FcGoogle className="text-2xl" />
      <span className="font-medium text-gray-700">
        Continuer avec Google
      </span>
    </motion.button>
  );
};

export default GoogleLoginButton;
