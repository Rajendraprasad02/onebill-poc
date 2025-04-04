import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { LogOut, Menu, Receipt, Search } from "lucide-react";
import { format, parseISO } from "date-fns";

const InvoiceEmails = () => {
  const [emails, setEmails] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEmailIndex, setActiveEmailIndex] = useState(null); // Track expanded email
  const [activeTab, setActiveTab] = useState("inbox");
  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const provider = localStorage.getItem("authProvider");
  const userId = localStorage.getItem("userId");

  const formatReceivedDateTime = (isoString) => {
    return format(parseISO(isoString), "EEE, dd MMM yyyy hh:mm:ss a");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract token from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (!token) {
      setError("No token found.");
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      setLoading(true);
      try {
        let response;
        let normalizedEmails = [];

        if (provider === "google") {
          response = await axios.get(
            // `http://localhost:3000/api/emails?token=${token}`
            `https://onebill-poc-backend-production.up.railway.app/api/emails?token=${token}`
          );

          const userProfile = response?.data?.userInfo;

          setProfile(userProfile);

          normalizedEmails =
            response?.data?.emails?.map((email, index) => ({
              id: index, // Use index as a temporary ID if the API doesn't provide one
              subject: email?.subject, // Fix variable reference
              sender: email?.from, // Fix variable reference
              message: email?.messageBody, // Include message body
              attachments: email?.attachments || [], // Ensure attachments are included
              received: email?.payload?.headers
                ?.find((i) => i?.name === "Received")
                ?.value?.match(
                  /(\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2})/
                )?.[0],
            })) || [];
        } else if (provider === "outlook") {
          try {
            // Fetch Outlook Emails with "invoice" in Subject
            const response = await axios.get(
              "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$filter=contains(subject, 'invoice')",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Fetch User Profile
            const userProfileRes = await axios.get(
              "https://graph.microsoft.com/v1.0/me",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const userProfile = userProfileRes.data;

            let profilePictureUrl =
              "https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg"; // Default Image
            try {
              const profilePictureRes = await axios.get(
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: "blob",
                }
              );

              const imageUrl = URL.createObjectURL(profilePictureRes.data);
              profilePictureUrl = imageUrl;
            } catch (error) {
              console.warn("No profile picture found. Using default.");
            }

            // Set Profile State
            setProfile({
              name: userProfile?.displayName,
              email: userProfile?.mail || userProfile?.userPrincipalName, // Fallback for missing mail
              profilePicture: profilePictureUrl,
            });

            // Normalize Emails
            normalizedEmails =
              response?.data?.value?.map((email) => ({
                id: email.id,
                subject: email.subject,
                sender: email.from?.emailAddress?.address, // Outlook uses a nested structure
                received: formatReceivedDateTime(email.receivedDateTime),
                message: email?.body?.content,
              })) || [];
          } catch (error) {
            console.error("Error fetching Outlook emails/profile:", error);
          }
        } else {
          throw new Error("Invalid provider");
        }

        setEmails(normalizedEmails);
      } catch (error) {
        console.error("Error fetching emails:", error);
        setError("Failed to fetch emails.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [token, provider]);

  const toggleEmailDetail = (index) => {
    setActiveEmailIndex((prev) => (prev === index ? null : index));
  };

  if (error)
    return (
      <div className="bg-zinc-950 text-zinc-100 w-full flex justify-center align-middle h-screen">
        <div className="flex justify-center items-center mb-32">
          <div className="">
            <p className="font-semibold">{error}</p>
          </div>
          <div className="">
            <button
              onClick={() => window.location.reload()} // Or trigger fetchEmails() if retrying
              className="ml-3 px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-full bg-zinc-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  const extractInvoiceDetails = (messages) => {
    return messages
      .map((message) => {
        const { id, subject, message: messageBody } = message;

        let companyName = "";
        let detail = "";
        let amount = null;

        // Extract company name from subject or body
        if (subject.includes("Invoice")) {
          companyName =
            messageBody
              .match(/(?:Invoice from:)\s*(.*?)(?=\r\n|\n|$)/)?.[1]
              ?.replace(/\*/g, "") // Remove asterisks
              .trim() || "N/A";
        }

        // Extract the detail (service description)
        if (messageBody.includes("Billing Period")) {
          detail =
            messageBody
              .match(/(?:Billing Period:)\s*(.*?)(?=\r\n|\n|$)/)?.[1]
              ?.replace(/\*/g, "") // Remove asterisks
              .trim() || "N/A";
        }

        // Extract amount from message body
        const amountMatch = messageBody.match(/\$([\d,]+\.\d{2})/);
        if (amountMatch) {
          amount = parseFloat(amountMatch[1].replace(/,/g, "")); // Convert to number
        }

        // Only return if all data points are available (not "N/A")
        if (companyName !== "N/A" && detail !== "N/A" && amount !== null) {
          return {
            id: id,
            service: companyName,
            dueDate: detail,
            amount: amount,
          };
        }

        return null; // Skip if any data is missing
      })
      .filter((item) => item !== null); // Remove null entries
  };

  const storeBillDetails = async (userId) => {
    try {
      // Ensure details exist and add userId to each entry
      const billDetailsWithUser = details.map(({ id, ...bill }) => ({
        ...bill,
        userId: Number(userId), // Ensure userId is a number
      }));

      const response = await axios.post(
        "https://onebill-poc-backend-production.up.railway.app/api/bill-details",
        billDetailsWithUser, // Send modified data
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error storing bill details:",
        error.response?.data || error.message
      );
    }
  };

  const details = extractInvoiceDetails(emails);
  storeBillDetails(userId);

  if (details.length > 0) {
    localStorage.setItem("invoiceDetails", JSON.stringify(details));
  } else {
    console.warn("No valid invoice details extracted.");
  }

  localStorage.setItem("invoiceDetails", JSON.stringify(details));

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-white  pt-24">
      {emails?.length === 0 ? (
        <div className="bg-zinc-950 text-zinc-100 w-full flex justify-center align-middle h-screen">
          <div className="">
            <p className="font-semibold">No invoice emails found.</p>
          </div>
        </div>
      ) : (
        <div className="h-full z-0 ">
          <h1 className="text-2xl font-bold text-gray-300 py-2">
            Inbox From {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </h1>

          <ul className="flex flex-col gap-4">
            {emails?.map((email, index) => (
              <li
                key={index}
                className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-4 transition-all transform cursor-pointer mx-auto"
                onClick={() => toggleEmailDetail(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="">
                    <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-200">
                      {email?.subject || "Unknown"}
                    </h3>
                    <p className="text-xs font-light text-zinc-400">
                      From: {email?.sender}
                    </p>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {email?.received || "-"}
                  </p>
                </div>

                {activeEmailIndex === index && (
                  <div className="mt-2 text-gray-700 dark:text-gray-300">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                      {Array.isArray(email?.attachments) &&
                        email.attachments.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                              Attachments:
                            </h4>
                            <ul className="space-y-3 mt-2">
                              {email.attachments.map((file, i) => (
                                <li
                                  key={i}
                                  className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700"
                                >
                                  <span className="text-gray-800 dark:text-gray-300 font-medium">
                                    {file.filename || "Unknown File"}
                                  </span>
                                  <a
                                    href={`/api/attachments/${file.attachmentId}`} // Adjust this URL as needed
                                    download={file.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-200 hover:underline  px-4 py-2 rounded-md"
                                  >
                                    Download
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <strong className="text-gray-800 dark:text-gray-200">
                        Message:
                      </strong>
                      {email?.message ? (
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(email?.message?.trim()),
                          }}
                        />
                      ) : (
                        <p className="dark:text-gray-400">
                          No message content available.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceEmails;
