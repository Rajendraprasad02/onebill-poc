import React from "react";
import Header from "../header/Header";
import InvoiceEmails from "../invoice/InvoiceEmails";
import SideNavBar from "../sidenavebar/SideNavBar";
import { Outlet } from "react-router-dom";

const MainPage = () => {
  return (
    <>
      <Header />
      {/* <InvoiceEmails /> */}
      <div className="flex w-full">
        <SideNavBar />
        <Outlet />
      </div>
    </>
  );
};

export default MainPage;
