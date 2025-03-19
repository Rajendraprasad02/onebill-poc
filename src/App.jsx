import React from "react";
import "./App.css";
import Login from "./components/login/Login";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/login/Signup";
import InvoiceEmails from "./components/invoice/InvoiceEmails";
import SetPassword from "./components/login/SetPassword";
import MainPage from "./components/pages/MainPage";

const router = createHashRouter([
  { path: "/", element: <Signup /> },
  { path: "/signup", element: <Signup /> },
  { path: "/invoice-emails", element: <InvoiceEmails /> },
  { path: "/set-password", element: <SetPassword /> },
  { path: "/set", element: <MainPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
