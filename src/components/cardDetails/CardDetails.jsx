import React, { useEffect } from "react";

import { useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";

const CardDetails = () => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cards, setCards] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  const fetchUserCards = async () => {
    try {
      const response = await axios.get(
        `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`
      );

      const transformedCards = response?.data?.map((card) => ({
        id: card.id,
        type: card.cardHolder,
        last4: card.cardNumber.slice(-4), // Get the last 4 digits of the card number
        expiry: card.expiryDate, // Assuming the API already returns this in MM/YY format
        isDefault: card.isDefault || false, // Set default to false if null
        cvc: card.cvc,
      }));
      setCards(transformedCards);
    } catch (err) {
      setError("Failed to fetch cards");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserCards();
  }, []); // Empty dependency array to call the effect once

  // Validate inputs
  const validateForm = () => {
    let newErrors = {};

    // Card Number Validation (16 digits, formatted)
    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
      newErrors.cardNumber = "Enter a valid 16-digit card number";
    }

    // Expiry Date Validation (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Enter a valid MM/YY format";
    }

    // CVC Validation (3 or 4 digits)
    if (!/^\d{3,4}$/.test(cvc)) {
      newErrors.cvc = "CVC must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format card number as XXXX XXXX XXXX XXXX
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "") // Remove non-digits
      .replace(/(\d{4})/g, "$1 ") // Add space every 4 digits
      .trim()
      .slice(0, 19); // Limit to 19 chars (16 digits + 3 spaces)
  };

  // Sample card data

  const handleSubmit = async () => {
    // Set loading to true when the submission starts
    setCardLoading(true);

    const payload = [
      {
        cardHolder: cardholderName,
        cardNumber: cardNumber.replace(/\s+/g, ""),
        expiryDate: expiry,
        cvc: cvc,
      },
    ];

    try {
      const response = await fetch(
        `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      // Handle any other errors (e.g., network issues)
      console.error("Error:", error);
    } finally {
      fetchUserCards();
      setShowAddCard(false);
      setCardLoading(false);
    }
  };

  const SkeletonCard = () => (
    <div className="grid gap-4 md:grid-cols-2 w-3xl">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg animate-pulse border-gray-800"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-800 rounded"></div>
            <div className="h-4 w-16 bg-gray-800 rounded"></div>
          </div>
          <div className="h-4 w-24 bg-gray-800 rounded mt-2"></div>
          <div className="flex justify-between mt-4">
            <div className="h-8 w-16 bg-gray-800 rounded"></div>
            <div className="h-8 w-24 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const handleMarkAsDefault = async (userId, cardId) => {
    setLoading(true);
    try {
      await axios.patch(
        `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}/${cardId}`,
        { isDefault: true } // Sending the required field
      );

      // Update the UI by refetching cards
      fetchUserCards();
    } catch (error) {
      console.error("Error marking card as default:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-950 text-zinc-100 w-full h-screen ">
      <div className="flex justify-between items-center ">
        <h2 className="text-2xl font-bold">Card Details </h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          onClick={() => setShowAddCard(true)}
        >
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      {showAddCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80">
          <div className="bg-zinc-900 text-zinc-100 p-8 rounded-lg w-lg">
            <h3 className="text-xl font-semibold">
              Add a new credit or debit card.
            </h3>

            <div className="mt-4 space-y-3">
              <input
                className="w-full p-2 border rounded-md"
                placeholder="Cardholder Name"
                value={cardholderName} // Bind value to the state
                onChange={(e) => setCardholderName(e.target.value)} // Update state on change
              />

              <input
                className={`w-full p-2 border rounded-md ${
                  errors.cardNumber ? "border-red-500" : ""
                }`}
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                onBlur={validateForm}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm">{errors.cardNumber}</p>
              )}

              <div className="flex gap-2">
                <div className="flex flex-col w-full">
                  <input
                    className={`w-full p-2 border rounded-md ${
                      errors.expiry ? "border-red-500" : ""
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "").slice(0, 4); // Remove non-digit characters and limit to 4 digits
                      if (value.length >= 3) {
                        value = value.slice(0, 2) + "/" + value.slice(2); // Add slash after two digits
                      }
                      setExpiry(value);
                    }}
                    onBlur={validateForm}
                  />
                  {errors.expiry && (
                    <p className="text-red-500 text-sm">{errors.expiry}</p>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <input
                    className={`w-full p-2 border rounded-md ${
                      errors.cvc ? "border-red-500" : ""
                    }`}
                    placeholder="CVC"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    onBlur={validateForm}
                  />
                  {errors.cvc && (
                    <p className="text-red-500 text-sm">{errors.cvc}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 border rounded-lg cursor-pointer"
                onClick={() => setShowAddCard(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                  cardLoading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={handleSubmit}
              >
                {cardLoading ? "Saving..." : "Save Card"}{" "}
                {/* Change button text based on loading */}
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && <SkeletonCard />}

      <div className="grid gap-4 md:grid-cols-2 w-full">
        {cards?.map((card) => (
          <div
            key={card.id}
            className={`p-4 border rounded-lg ${
              card.isDefault ? "border-blue-600" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {card.type} •••• {card.last4}
              </span>
              {card.isDefault && (
                <span className="px-2 py-1 text-sm text-blue-600 border border-blue-600 rounded-md">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 my-2">Expires {card.expiry}</p>
            <p className="text-sm text-gray-500">cvc {card.cvc}</p>

            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 border rounded-lg cursor-pointer">
                Edit
              </button>
              {!card.isDefault && (
                <button
                  onClick={() => handleMarkAsDefault(card.id)}
                  className="px-4 py-2 border rounded-lg cursor-pointer"
                >
                  Make Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardDetails;
