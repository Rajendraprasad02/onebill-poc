import React from "react";
import Header from "../header/Header";
import InvoiceEmails from "../invoice/InvoiceEmails";
import SideNavBar from "../sidenavebar/SideNavBar";
import { Outlet } from "react-router-dom";

const MainPage = () => {
  return (
    <>
      <Header className="z-50 fixed top-0 left-0 w-full bg-zinc-950" />
      {/* <InvoiceEmails /> */}
      <div className="flex w-full">
        <SideNavBar />
        <div className="flex-1 ml-64 overflow-y-auto h-full mt-16">
          <Outlet />
        </div>{" "}
      </div>
    </>
  );
};

export default MainPage;
