import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { LogOut, Menu, Receipt, Search } from "lucide-react";

const InvoiceEmails = () => {
  const [emails, setEmails] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEmailIndex, setActiveEmailIndex] = useState(null); // Track expanded email
  const [activeTab, setActiveTab] = useState("inbox");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const provider = localStorage.getItem("authProvider");

  console.log("tokentoken", token);
  console.log("providerprovider", provider);

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
  // const token = queryParams.get("token");
  // const provider = queryParams.get("provider");

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
              messageBody: email?.messageBody, // Include message body
              attachments: email?.attachments || [], // Ensure attachments are included
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

            console.log("response_microsoft", response);

            // Fetch User Profile
            const userProfileRes = await axios.get(
              "https://graph.microsoft.com/v1.0/me",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log("userProfileRes_microsoft", userProfileRes);

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
                receivedAt: email.receivedDateTime,
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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 w-full">
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto p-4">
          {/* <h1 className="text-xl font-bold capitalize">{activeTab}</h1> */}
          <div className="my-4 border-t border-zinc-800"></div>

          {emails?.length === 0 ? (
            <div className="bg-zinc-950 text-zinc-100 w-full flex justify-center align-middle h-screen">
              <div className="">
                <p className="font-semibold">No invoice emails found.</p>
              </div>
            </div>
          ) : (
            <>
              <ul className="space-y-6 w-full flex flex-col ">
                {emails?.map((email, index) => (
                  <li
                    key={index}
                    className="w-6xl bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-4 transition-all transform cursor-pointer mx-auto"
                    onClick={() => toggleEmailDetail(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-200">
                        {email?.sender || "Unknown"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {email?.subject || "No Subject"}
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
                                __html: DOMPurify.sanitize(
                                  email?.message?.trim()
                                ),
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InvoiceEmails;
