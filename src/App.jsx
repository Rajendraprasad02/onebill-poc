import React from "react";
import "./App.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/login/Signup";
import InvoiceEmails from "./components/invoice/InvoiceEmails";
import SetPassword from "./components/login/SetPassword";
import MainPage from "./components/pages/MainPage";
import AuthRedirect from "./components/AuthRedirect";
import Profile from "./components/profile/Profile";
import CardDetails from "./components/cardDetails/CardDetails";
import BillPayment from "./components/billPayment/BillPayment";
import ProfileView from "./components/profile/profileView";

const router = createHashRouter([
  { path: "/signup", element: <Signup /> },
  // { path: "/invoice-emails", element: <InvoiceEmails /> },
  { path: "/set-password", element: <SetPassword /> },
  { path: "/profile", element: <Profile /> },
  { path: "/auth-redirect", element: <AuthRedirect /> },
  {
    path: "/",
    element: <MainPage />,
    children: [
      { element: <InvoiceEmails />, path: "/invoice-emails" },
      { path: "card-details", element: <CardDetails /> },
      { path: "bill-payment", element: <BillPayment /> },
      { path: "my-profile", element: <ProfileView /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
