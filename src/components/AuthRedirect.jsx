import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const provider = queryParams.get("provider");

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("authProvider", provider);
      navigate("/invoice-emails"); // Redirect to dashboard after storing token
    } else {
      console.error("No token found.");
      navigate("/"); // Redirect to login if token is missing
    }
  }, [location, navigate]);

  return null; // No UI needed, just handling token storage and redirection
};

export default AuthRedirect;
