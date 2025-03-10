import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token"); // Get the Google token

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    console.log("in");

    const response = await fetch(
      "https://onebill-poc-backend-production.up.railway.app/api/google/set-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the Google token
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();
    if (data?.redirectUrl) {
      window.location.href = data.redirectUrl; // Redirects to external URL
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div>
      <h2>Set Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Set Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SetPassword;
