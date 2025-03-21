import React, { useState, useEffect } from "react";

import { AlertCircle, CheckCircle2 } from "lucide-react";

const BillPayment = () => {
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [paymentError, setPaymentError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedCard, setSelectedCard] = useState("1");
  useEffect(() => {
    // Get the invoice details from localStorage
    const storedDetails = JSON.parse(localStorage.getItem("invoiceDetails"));

    if (storedDetails) {
      setInvoiceDetails(storedDetails);
    }
  }, []);

  // Sample bills data
  const bills = [
    {
      id: 1,
      service: "Internet Provider",
      amount: 89.99,
      dueDate: "2023-06-15",
      autopay: false,
    },
    {
      id: 2,
      service: "Electricity Bill",
      amount: 145.5,
      dueDate: "2023-06-20",
      autopay: true,
    },
    {
      id: 3,
      service: "Water Utility",
      amount: 65.75,
      dueDate: "2023-06-25",
      autopay: false,
    },
    {
      id: 4,
      service: "Mobile Service",
      amount: 55.0,
      dueDate: "2023-06-18",
      autopay: true,
    },
    {
      id: 5,
      service: "Streaming Service",
      amount: 14.99,
      dueDate: "2023-06-10",
      autopay: false,
    },
  ];

  const handlePayment = (billId) => {
    // Simulate payment process
    setPaymentError(false);
    setPaymentSuccess(false);

    // Randomly succeed or fail for demo purposes
    const isSuccess = Math.random() > 0.3;

    setTimeout(() => {
      if (isSuccess) {
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 3000);
      } else {
        setPaymentError(true);
        setTimeout(() => setPaymentError(false), 3000);
      }
    }, 1000);
  };

  const toggleAutopay = (billId) => {
    // This would update the autopay status in a real app
    console.log(`Toggled autopay for bill ${billId}`);
  };

  return (
    <div className="space-y-6">
      {paymentError && (
        <div className="bg-red-500 text-white p-4 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <div>
            <strong>Payment Failed</strong>
            <p>
              There was an error processing your payment. Please try again or
              use a different payment method.
            </p>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="bg-green-50 text-green-800 border-green-200 p-4 rounded-md flex items-center">
          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
          <div>
            <strong>Payment Successful</strong>
            <p>Your payment has been processed successfully.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="w-full md:w-2/3 bg-white shadow-md rounded-md p-6">
          <h3 className="text-lg font-bold mb-2">Payment Method</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select the card you want to use for payment
          </p>
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="1">Visa •••• 4242</option>
            <option value="2">Mastercard •••• 5678</option>
          </select>
        </div>

        <div className="w-full md:w-1/3 bg-white shadow-md rounded-md p-6">
          <h3 className="text-lg font-bold mb-2">Total Due</h3>
          <p className="text-sm text-gray-500 mb-4">All pending bills</p>
          <div className="text-3xl font-bold">
            ${bills.reduce((total, bill) => total + bill.amount, 0).toFixed(2)}
          </div>
          <button
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md"
            onClick={() => handlePayment("all")}
          >
            Pay All Bills
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Due Bills</h2>

      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="bg-white shadow-md rounded-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{bill.service}</h3>
                <p className="text-sm text-gray-500">
                  Due on {new Date(bill.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`autopay-${bill.id}`}
                    checked={bill.autopay}
                    onChange={() => toggleAutopay(bill.id)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`autopay-${bill.id}`} className="text-sm">
                    Auto-Pay
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xl font-bold">
                  ${bill.amount.toFixed(2)}
                </div>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md"
                  onClick={() => handlePayment(bill.id)}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default BillPayment;
