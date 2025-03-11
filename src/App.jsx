import React from "react";
import "./App.css";
import Login from "./components/login/Login";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/login/Signup";
import InvoiceEmails from "./components/invoice/InvoiceEmails";
import SetPassword from "./components/login/SetPassword";

const router = createHashRouter([
  { path: "/", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/invoice-emails", element: <InvoiceEmails /> },
  { path: "/set-password", element: <SetPassword /> },
  { path: "/set", element: <Signup /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
