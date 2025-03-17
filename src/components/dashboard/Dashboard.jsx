import React, { useState } from "react";
// import InvoiceList from "./InvoiceList";
// import CardDetails from "./CardDetails";
// import BillPayment from "./BillPayment";
// import Header from "./Header";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <main className="container mx-auto p-4 pt-20">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Total Due</h3>
            <p className="text-gray-500 text-sm">All pending invoices</p>
            <div className="text-2xl font-bold mt-2">$1,248.42</div>
          </div>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">Due This Week</h3>
            <p className="text-gray-500 text-sm">Upcoming payments</p>
            <div className="text-2xl font-bold mt-2">$425.50</div>
          </div>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600">
              Paid This Month
            </h3>
            <p className="text-gray-500 text-sm">Total paid invoices</p>
            <div className="text-2xl font-bold mt-2">$2,156.00</div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex border-b mb-4">
            <button
              className={`py-2 px-4 flex-1 text-center ${
                activeTab === "invoices"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("invoices")}
            >
              Invoices
            </button>
            <button
              className={`py-2 px-4 flex-1 text-center ${
                activeTab === "payment"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("payment")}
            >
              Bill Payment
            </button>
            <button
              className={`py-2 px-4 flex-1 text-center ${
                activeTab === "cards"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("cards")}
            >
              Card Details
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {/* {activeTab === "invoices" && <InvoiceList />}
            {activeTab === "payment" && <BillPayment />}
            {activeTab === "cards" && <CardDetails />} */}
          </div>
        </div>
      </main>
    </div>
  );
}
