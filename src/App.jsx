import React from "react";
import "./App.css";
import Login from "./components/login/Login";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/login/Signup";
import InvoiceEmails from "./components/invoice/InvoiceEmails";
import SetPassword from "./components/login/SetPassword";
import MainPage from "./components/pages/MainPage";
import AuthRedirect from "./components/AuthRedirect";
import Profile from "./components/profile/Profile";

const router = createHashRouter([
  { path: "/", element: <Signup /> },
  { path: "/signup", element: <Signup /> },
  // { path: "/invoice-emails", element: <InvoiceEmails /> },
  { path: "/set-password", element: <SetPassword /> },
  { path: "/profile", element: <Profile /> },
  { path: "/auth-redirect", element: <AuthRedirect /> },
  {
    path: "/invoice-emails",
    element: <MainPage />,
    children: [{ element: <InvoiceEmails />, path: "" }, {}],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
