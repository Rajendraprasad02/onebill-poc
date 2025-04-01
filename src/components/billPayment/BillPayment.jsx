import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  DollarSign,
  Loader2,
} from "lucide-react";
import { isSameMonth, parse, parseISO } from "date-fns";

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
  const [paymentLoader, setPaymentLoader] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [urgentBills, setUrgentBills] = useState([]);
  const [overDue, setOverdueBills] = useState([]);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = messages.indexOf(prev);
        return messages[(currentIndex + 1) % messages.length];
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // const fetchCardDetailsAndMails = async () => {
  //   try {
  //     const [cardResponse, billResponse] = await Promise.all([
  //       axios.get(
  //         `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`
  //       ),
  //       axios.get(
  //         `https://onebill-poc-backend-production.up.railway.app/api/bill-details/userid/${userId}`
  //       ),
  //     ]);

  //     const dueBills = [];
  //     const paidBills = [];
  //     const urgentBills = [];

  //     const currentDate = new Date();

  //     billResponse?.data?.forEach((bill) => {
  //       if (bill.isPaid) {
  //         paidBills.push(bill);
  //       } else {
  //         // If the bill is due this month, add it to urgentBills instead of dueBills
  //         if (bill.dueDate) {
  //           const billDate = parse(bill.dueDate, "MMMM yyyy", new Date()); // Parse "March 2025"
  //           if (isSameMonth(billDate, currentDate)) {
  //             urgentBills.push(bill);
  //             return; // Skip adding it to dueBills
  //           }
  //         }

  //         // If not urgent, add to dueBills
  //         dueBills.push(bill);
  //       }
  //     });

  //     setInvoiceDetails(billResponse?.data || []);
  //     setCardDetails(cardResponse?.data || []);
  //     setDueBills(dueBills);
  //     setPaidBills(paidBills);
  //     setUrgentBills(urgentBills); // Store urgent bills separately

  //     // Set default selected card if available
  //     if (cardResponse?.data?.length > 0 && !selectedCard) {
  //       setSelectedCard(cardResponse.data[0].id);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error("Failed to load your bills and payment methods");
  //   }
  // };

  const fetchCardDetailsAndMails = async () => {
    try {
      const [cardResponse, billResponse] = await Promise.all([
        axios.get(
          `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`
        ),
        axios.get(
          `https://onebill-poc-backend-production.up.railway.app/api/bill-details/userid/${userId}`
        ),
      ]);

      const dueBills = [];
      const paidBills = [];
      const urgentBills = [];
      const overdueBills = []; // New array for overdue bills

      const currentDate = new Date();

      billResponse?.data?.forEach((bill) => {
        if (bill.isPaid) {
          paidBills.push(bill);
        } else {
          // If the bill is due this month, add it to urgentBills instead of dueBills
          if (bill.dueDate) {
            const billDate = parse(bill.dueDate, "MMMM yyyy", new Date()); // Parse "March 2025"
            if (isSameMonth(billDate, currentDate)) {
              urgentBills.push(bill);
              return; // Skip adding it to dueBills
            }

            // If the bill's due date is in the past, add it to overdueBills
            if (billDate < currentDate) {
              overdueBills.push(bill);
              return; // Skip adding it to dueBills as it's overdue
            }
          }

          // If not urgent and not overdue, add to dueBills
          dueBills.push(bill);
        }
      });

      setInvoiceDetails(billResponse?.data || []);
      setCardDetails(cardResponse?.data || []);
      setDueBills(dueBills);
      setPaidBills(paidBills);
      setUrgentBills(urgentBills); // Store urgent bills separately
      setOverdueBills(overdueBills); // Store overdue bills

      // Set default selected card if available
      if (cardResponse?.data?.length > 0 && !selectedCard) {
        setSelectedCard(cardResponse.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load your bills and payment methods");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCardDetailsAndMails();
    }
  }, [userId]);

  const handlePayment = async (billId) => {
    if (!selectedCard) {
      toast.warning("Please select a payment method first");
      return;
    }

    try {
      setPaymentLoader(true);

      if (billId === "all") {
        setIsProcessingAll(true);
        // Process all bills sequentially
        for (const bill of dueBills) {
          await axios.put(
            `https://onebill-poc-backend-production.up.railway.app/api/bill-details/update/${bill.id}`,
            { isPaid: true },
            { headers: { "Content-Type": "application/json" } }
          );
        }
        setIsProcessingAll(false);
        toast.success("All bills paid successfully!");
      } else {
        // Process single bill
        await axios.put(
          `https://onebill-poc-backend-production.up.railway.app/api/bill-details/update/${billId}`,
          { isPaid: true },
          { headers: { "Content-Type": "application/json" } }
        );
        toast.success("Payment successful!");
      }

      // Refresh data
      await fetchCardDetailsAndMails();
    } catch (error) {
      console.error("Payment Error:", error);
      const errorMessage =
        error.response?.data?.message || "Payment failed! Please try again.";
      toast.error(errorMessage);
    } finally {
      setPaymentLoader(false);
    }
  };

  const formatCardNumber = (cardNumber) => {
    return cardNumber ? "•••• •••• •••• " + cardNumber.slice(-4) : "Card";
  };

  const calculateTotalDue = () => {
    return [...dueBills, ...urgentBills]
      .reduce((total, bill) => total + Number(bill.amount), 0)
      .toFixed(2);
  };

  if (paymentLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-zinc-950">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-300" />
          </div>
        </div>
        <div className="text-white mt-6 text-lg font-medium">
          {currentMessage}
        </div>
        <div className="text-zinc-400 mt-2 text-sm max-w-xs text-center">
          We're processing your transaction securely. This may take a moment.
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" theme="dark" />

      <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center">
          <DollarSign className="mr-2 h-8 w-8 text-blue-500" />
          Bill Payment Center
        </h1>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="w-full md:w-2/3 bg-zinc-900 shadow-lg rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
              Payment Method
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Select the card you want to use for payment
            </p>
            {cardDetails.length > 0 ? (
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="p-3 border border-gray-700 bg-gray-800 text-white rounded-lg w-full cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select a card
                </option>
                {cardDetails.map((card) => (
                  <option key={card.id} value={card.id}>
                    {formatCardNumber(card.cardNumber)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 border border-gray-700 bg-gray-800 text-gray-400 rounded-lg">
                No payment methods available
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-zinc-900 shadow-lg rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-400" />
              Total Due
            </h3>
            <p className="text-sm text-gray-400 mb-4">All pending bills</p>
            <div className="text-3xl font-bold text-green-400">
              ${calculateTotalDue()}
            </div>
            <button
              className={`cursor-pointer w-full mt-4 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all ${
                dueBills.length > 0 && selectedCard
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              onClick={() =>
                dueBills.length > 0 && selectedCard && handlePayment("all")
              }
              disabled={dueBills.length === 0 || !selectedCard}
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay All Bills
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* overDue Bills Section */}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="inline-block w-3 h-3 bg-red-700 rounded-full mr-2"></span>
            Overdue Bills ({overDue?.length})
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {overDue?.map((bill) => (
              <div
                key={bill.id}
                className="bg-zinc-900 shadow-lg rounded-lg p-5 border border-red-600 hover:border-red-500 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg text-white">
                      {bill.service}
                    </h3>
                    <p className="text-sm text-red-500 font-semibold">
                      Overdue: {bill.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-xl font-bold text-green-400">
                      ${Number(bill.amount).toFixed(2)}
                    </div>
                    <button
                      className={`py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 transition-all ${
                        selectedCard
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-700 cursor-not-allowed"
                      }`}
                      onClick={() => selectedCard && handlePayment(bill.id)}
                      disabled={!selectedCard}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Bills Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Immediate Due Bills ({urgentBills?.length})
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {urgentBills?.length > 0 ? (
              urgentBills?.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-900 shadow-lg rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-white">
                        {bill.service}
                      </h3>
                      <p className="text-sm text-red-500 font-semibold">
                        Due: {bill.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-xl font-bold text-green-400">
                        ${Number(bill.amount).toFixed(2)}
                      </div>
                      <button
                        className={`cursor-pointer py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 transition-all ${
                          selectedCard
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-700 cursor-not-allowed"
                        }`}
                        onClick={() => selectedCard && handlePayment(bill.id)}
                        disabled={!selectedCard}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-lg py-8 bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
                No pending bills
              </div>
            )}
          </div>
        </div>

        {/* Due Bills Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Pending Bills ({dueBills.length})
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {dueBills.length > 0 ? (
              dueBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-900 shadow-lg rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-white">
                        {bill.service}
                      </h3>
                      <p className="text-sm text-yellow-500 font-semibold">
                        Due: {bill.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-xl font-bold text-green-400">
                        ${Number(bill.amount).toFixed(2)}
                      </div>
                      <button
                        className={`cursor-pointer py-2 px-4 rounded-lg text-white font-medium flex items-center gap-2 transition-all ${
                          selectedCard
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-700 cursor-not-allowed"
                        }`}
                        onClick={() => selectedCard && handlePayment(bill.id)}
                        disabled={!selectedCard}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-lg py-8 bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
                No pending bills
              </div>
            )}
          </div>
        </div>

        {/* Paid Bills Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Paid Bills ({paidBills.length})
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {paidBills.length > 0 ? (
              paidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-zinc-800 shadow-md rounded-lg p-5 border border-zinc-700/30"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg text-white">
                        {bill.service}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Paid on: {bill.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Paid</span>
                    </div>

                    <div className="text-xl font-bold text-green-400/70">
                      ${Number(bill.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-lg py-8 bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
                No paid bills
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BillPayment;
