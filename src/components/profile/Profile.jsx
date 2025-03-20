import React from "react";
import { useState } from "react";
import {
  Plus,
  Trash2,
  CreditCard,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    cards: [
      {
        id: 1,
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvc: "",
        isDefault: true,
      },
    ],
  });
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCardChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      ),
    }));

    // Clear error for this field if it exists
    const errorKey = `card-${id}-${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleDefaultChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => ({
        ...card,
        isDefault: card.id === id,
      })),
    }));
  };

  const addCard = () => {
    const newId = Math.max(0, ...formData.cards.map((card) => card.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          id: newId,
          cardName: "",
          cardNumber: "",
          expiryDate: "",
          cvc: "",
          isDefault: false,
        },
      ],
    }));
  };

  const removeCard = (id) => {
    // Don't remove if it's the only card
    if (formData.cards.length <= 1) return;

    let updatedCards = formData.cards.filter((card) => card.id !== id);

    // If we removed the default card, set the first remaining card as default
    if (
      formData.cards.find((card) => card.id === id)?.isDefault &&
      updatedCards.length > 0
    ) {
      updatedCards = updatedCards.map((card, index) => ({
        ...card,
        isDefault: index === 0,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      cards: updatedCards,
    }));

    // Remove any errors for this card
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.includes(`card-${id}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate user details
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    // Validate cards
    formData.cards.forEach((card) => {
      if (!card.cardName.trim()) {
        newErrors[`card-${card.id}-cardName`] = "Cardholder name is required";
      }

      if (!card.cardNumber.trim()) {
        newErrors[`card-${card.id}-cardNumber`] = "Card number is required";
      } else if (!/^\d{16}$/.test(card.cardNumber.replace(/\s/g, ""))) {
        newErrors[`card-${card.id}-cardNumber`] =
          "Card number must be 16 digits";
      }

      if (!card.expiryDate.trim()) {
        newErrors[`card-${card.id}-expiryDate`] = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiryDate)) {
        newErrors[`card-${card.id}-expiryDate`] = "Use format MM/YY";
      }

      if (!card.cvc.trim()) {
        newErrors[`card-${card.id}-cvc`] = "CVC is required";
      } else if (!/^\d{3,4}$/.test(card.cvc)) {
        newErrors[`card-${card.id}-cvc`] = "CVC must be 3-4 digits";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (true) {
      setIsSubmitting(true);

      const userPayload = {
        username: formData?.firstName + formData?.lastName,
        password: formData?.password,
        email: formData?.email,
      };

      try {
        // Step 1: Create User
        const userResponse = await fetch(
          "https://onebill-poc-backend-production.up.railway.app/api/google/set-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userPayload),
          }
        );

        const userResult = await userResponse.json();

        if (userResponse.ok) {
          const userId = userResult?.user?.id; // Ensure userId is returned

          // if (!userId) {
          //   throw new Error("User ID is missing from response");
          // }

          const cardPayload = formData?.cards.map((card) => ({
            cardHolder: card.cardName,
            cardNumber: card.cardNumber.replace(/\s+/g, ""), // Remove spaces
            expiryDate: card.expiryDate,
            cvc: card.cvc,
          }));

          console.log("Card Payload:", cardPayload);

          // const cardResponse = await fetch(
          //   `https://onebill-poc-backend-production.up.railway.app/api/cards/${userId}`,
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //       Accept: "application/json", // Ensure API accepts JSON
          //     },
          //     body: JSON.stringify(cardPayload),
          //   }
          // );

          const response = await axios.post(
            `https://onebill-poc-backend-production.up.railway.app/api/cards/${58}`,
            cardPayload,
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("cardResponse", response);

          navigate("/invoice-emails"); // Navigate after successful card addition
        } else {
          console.error("User creation failed:", userResult);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value, id) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      handleCardChange(id, "cardNumber", parts.join(" "));
      return parts.join(" ");
    } else {
      handleCardChange(id, "cardNumber", value);
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value, id) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 2) {
      const month = v.substring(0, 2);
      const year = v.substring(2, 4);

      if (year) {
        handleCardChange(id, "expiryDate", `${month}/${year}`);
        return `${month}/${year}`;
      } else {
        handleCardChange(id, "expiryDate", month);
        return month;
      }
    }

    handleCardChange(id, "expiryDate", value);
    return value;
  };

  const formatCVC = (value, id) => {
    const v = value.replace(/[^0-9]/gi, "");
    handleCardChange(id, "cvc", v);
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">User Details</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Details Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleUserChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleUserChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleUserChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleUserChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleUserChange}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 pl-10 pr-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleUserChange}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 pl-10 pr-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Confirm Password"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Details Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment Cards</h2>
              <button
                type="button"
                onClick={addCard}
                className="flex items-center px-4 py-2 bg-transparent border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </button>
            </div>

            <div className="space-y-4">
              {formData.cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
                        Card {index + 1}
                      </h3>
                      {formData.cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCard(card.id)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove card</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Card Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor={`card-${card.id}-name`}
                          className="block text-sm font-medium text-gray-300"
                        >
                          Cardholder Name
                        </label>
                        <input
                          id={`card-${card.id}-name`}
                          value={card.cardName}
                          onChange={(e) =>
                            handleCardChange(
                              card.id,
                              "cardName",
                              e.target.value
                            )
                          }
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="John Doe"
                        />
                        {errors[`card-${card.id}-cardName`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`card-${card.id}-cardName`]}
                          </p>
                        )}
                      </div>

                      {/* Card Number */}
                      <div className="space-y-2">
                        <label
                          htmlFor={`card-${card.id}-number`}
                          className="block text-sm font-medium text-gray-300"
                        >
                          Card Number
                        </label>
                        <input
                          id={`card-${card.id}-number`}
                          value={card.cardNumber}
                          onChange={(e) =>
                            formatCardNumber(e.target.value, card.id)
                          }
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {errors[`card-${card.id}-cardNumber`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`card-${card.id}-cardNumber`]}
                          </p>
                        )}
                      </div>

                      {/* Expiry Date and CVC in a row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor={`card-${card.id}-expiry`}
                            className="block text-sm font-medium text-gray-300"
                          >
                            Expiry Date
                          </label>
                          <input
                            id={`card-${card.id}-expiry`}
                            value={card.expiryDate}
                            onChange={(e) =>
                              formatExpiryDate(e.target.value, card.id)
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors[`card-${card.id}-expiryDate`] && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors[`card-${card.id}-expiryDate`]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`card-${card.id}-cvc`}
                            className="block text-sm font-medium text-gray-300"
                          >
                            CVC/CVV
                          </label>
                          <div className="relative">
                            <input
                              id={`card-${card.id}-cvc`}
                              value={card.cvc}
                              onChange={(e) =>
                                formatCVC(e.target.value, card.id)
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="123"
                              maxLength={4}
                              type="password"
                            />
                            <Shield className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                          </div>
                          {errors[`card-${card.id}-cvc`] && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors[`card-${card.id}-cvc`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center">
                      <div className="flex items-center">
                        <input
                          id={`card-${card.id}-default`}
                          type="radio"
                          checked={card.isDefault}
                          onChange={() => handleDefaultChange(card.id)}
                          className="h-4 w-4 text-blue-500 border-gray-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                        <label
                          htmlFor={`card-${card.id}-default`}
                          className="ml-2 text-sm text-gray-300 cursor-pointer"
                        >
                          Set as Default
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save Information"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
