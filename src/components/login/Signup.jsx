import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
    // Add signup logic here (e.g., API call)
  };

  const handleOAuthLogin = (provider) => {
    console.log(`Signing up with ${provider}`);
    window.location.href = `https://onebill-poc-backend-production.up.railway.app/api/${provider}`; // Redirects the user for OAuth
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4">
          <p className="text-center text-gray-600">Or sign up with</p>
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin("microsoft")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Outlook
            </button>
            <button
              onClick={() => handleOAuthLogin("yahoo")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Yahoo
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-blue-500 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
