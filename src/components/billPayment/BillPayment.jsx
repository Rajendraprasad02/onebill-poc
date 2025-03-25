import React, { useState, useEffect } from "react";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";

const BillPayment = () => {
  const messages = [
    "Processing your payment...",
    "Please don't refresh this page...",
    "Validating your transaction...",
    "Almost done...",
  ];
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [dueBills, setDueBills] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [paymentError, setPaymentError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoader, setPaymentLoader] = useState(false);
  const [selectedCard, setSelectedCard] = useState();
  const userId = localStorage.getItem("userId");

  console.log("paidBillspaidBills", paidBills);
  console.log("dueBillsdueBills", dueBills);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchCardDetailsAndMails = async () => {
    try {
      const cardDetails = await axios.get(
        `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`
      );

      const mailDetails = await axios.get(
        `https://onebill-poc-backend-production.up.railway.app/api/bill-details/userid/${userId}`
      );

      console.log("mailDetails:", mailDetails);

      const dueBills = [];
      const paidBills = [];

      mailDetails?.data?.forEach((bill) => {
        if (bill.isPaid) {
          paidBills.push(bill);
        } else {
          dueBills.push(bill);
        }
      });

      setInvoiceDetails(mailDetails?.data);
      setCardDetails(cardDetails?.data);
      setDueBills(dueBills);
      setPaidBills(paidBills);
    } catch (error) {
      console.error("Error fetching card details or bills:", error);
    }
  };

  useEffect(() => {
    fetchCardDetailsAndMails();
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

  const handlePayment = async (billId) => {
    // Simulate payment process
    setPaymentError(false);
    setPaymentSuccess(false);
    setPaymentLoader(true);

    try {
      const response = await axios.put(
        `https://onebill-poc-backend-production.up.railway.app/api/bill-details/update/${billId}`,
        { isPaid: true },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      fetchCardDetailsAndMails();
      setPaymentLoader(false);
    } catch (error) {
      setPaymentError(true);
    }
  };

  if (paymentLoader)
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <div className="text-white mt-4">{currentMessage}</div>
      </div>
    );

  return (
    <div className="h-screen bg-zinc-950 p-6">
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
        <div className="w-full md:w-2/3 bg-zinc-900 shadow-md rounded-md p-6">
          <h3 className="text-lg font-bold text-white mb-2">Payment Method</h3>
          <p className="text-sm text-gray-400 mb-4">
            Select the card you want to use for payment
          </p>
          <select
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
            className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md w-full cursor-pointer"
          >
            {cardDetails?.map((i) => (
              <option key={i.id} value={i.id}>
                {"•••• •••• •••• " + i.cardNumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3 bg-zinc-900 shadow-md rounded-md p-6 border border-zinc-300">
          <h3 className="text-lg font-bold text-white mb-2">Total Due</h3>
          <p className="text-sm text-gray-400 mb-4">All pending bills</p>
          <div className="text-3xl font-bold text-green-400">
            $
            {
              invoiceDetails.reduce((total, bill) => total + bill.amount, 0)
              // .toFixed(2)
            }
          </div>
          <button
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer"
            onClick={() => handlePayment("all")}
          >
            Pay All Bills
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Due Bills</h2>

      <div className="space-y-8">
        {/* Due Bills Section */}
        <div>
          <h2 className="text-xl font-semibold text-white">Pending Bills</h2>
          <div className="space-y-4">
            {dueBills.length > 0 ? (
              dueBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-900 shadow-md rounded-md p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-white">
                        {bill.service}
                      </h3>
                      <p className="text-sm text-gray-400">{bill.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-green-400">
                        ${bill.amount}
                      </div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer"
                        onClick={() => handlePayment(bill.id)}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-lg mt-4">
                No pending bills
              </div>
            )}
          </div>
        </div>

        {/* Paid Bills Section */}
        <div>
          <h2 className="text-xl font-semibold text-white">Paid Bills</h2>
          <div className="space-y-4">
            {paidBills.length > 0 ? (
              paidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-800 shadow-md rounded-md p-6 opacity-70"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-white">
                        {bill.service}
                      </h3>
                      <p className="text-sm text-gray-400">{bill.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-green-400">
                        ${bill.amount}
                      </div>
                      <span className="text-green-500 font-medium">Paid</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-lg mt-4">
                No paid bills
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BillPayment;
