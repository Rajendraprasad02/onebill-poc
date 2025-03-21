import React, { useState, useEffect } from "react";

const BillPayment = () => {
  const [invoiceDetails, setInvoiceDetails] = useState([]);

  useEffect(() => {
    // Get the invoice details from localStorage
    const storedDetails = JSON.parse(localStorage.getItem("invoiceDetails"));

    if (storedDetails) {
      setInvoiceDetails(storedDetails);
    }
  }, []);

  return (
    <div>
      <h2>Invoice Payment Details</h2>
      {invoiceDetails.length > 0 ? (
        <ul>
          {invoiceDetails.map((invoice, index) => (
            <li key={index}>
              <div>
                <strong>Company Name:</strong> {invoice.companyName}
              </div>
              <div>
                <strong>Detail:</strong> {invoice.detail}
              </div>
              <div>
                <strong>Amount:</strong> {invoice.amount}
              </div>
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoice details found.</p>
      )}
    </div>
  );
};

export default BillPayment;
