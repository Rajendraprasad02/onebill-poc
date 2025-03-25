import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const provider = queryParams.get("provider");
    const isNewUser = queryParams.get("isNewUser") === "true"; // Convert to boolean
    const userId = queryParams.get("userid"); // Convert to boolean

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("authProvider", provider);
      localStorage.setItem("userId", userId);

      // Redirect based on whether the user is new
      if (isNewUser) {
        navigate("/profile"); // Redirect to profile setup
      } else {
        navigate("/invoice-emails"); // Redirect to dashboard
      }
    } else {
      console.error("No token found.");
      navigate("/"); // Redirect to login if token is missing
    }
  }, [location, navigate]);

  return null; // No UI needed, just handling token storage and redirection
};

export default AuthRedirect;
