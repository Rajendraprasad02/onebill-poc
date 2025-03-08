import React from "react";
import "./App.css";
import Login from "./components/login/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/login/Signup";
import InvoiceEmails from "./components/invoice/InvoiceEmails";
import SetPassword from "./components/login/SetPassword";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invoice-emails" element={<InvoiceEmails />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
