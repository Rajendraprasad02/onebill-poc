import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const InvoiceEmails = () => {
  const [emails, setEmails] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeEmailIndex, setActiveEmailIndex] = useState(null); // Track expanded email

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [gmailToken, setGmailToken] = useState(null);
  const [yahooToken, setYahooToken] = useState(null);
  const [outlookToken, setOutlookToken] = useState(null);

  useEffect(() => {
    if (token && provider) {
      switch (provider) {
        case "gmail":
          setGmailToken(token);
          break;
        case "yahoo":
          setYahooToken(token);
          break;
        case "outlook":
          setOutlookToken(token);
          break;
        default:
          console.warn("Unknown provider:", provider);
      }
    }
  }, [token, provider]); // Runs when token or provider changes

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
  const token = queryParams.get("token");
  const provider = queryParams.get("provider");

  // useEffect(() => {
  //   if (!token) {
  //     setError("No token found.");
  //     setLoading(false);
  //     return;
  //   }

  //   // const fetchEmails = async () => {
  //   //   try {
  //   //     const response = await axios.get(
  //   //       `https://onebill-poc-backend-production.up.railway.app/api/yahoo/emails?token=${token}`
  //   //       // `https://onebill-poc-backend-production.up.railway.app/api/emails?token=${token}`
  //   //     );
  //   //     setEmails(response?.data?.emails || []);
  //   //     setProfile(response?.data?.userInfo || {});
  //   //   } catch (err) {
  //   //     setError("Failed to fetch emails.");
  //   //   }
  //   //   setLoading(false);
  //   // };

  //   const fetchEmails = async (token) => {
  //     try {
  //       const response = await axios.get(
  //         "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages",
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );
  //       console.log("responseresponse", response);

  //       setEmails(response.data.value);
  //     } catch (error) {
  //       console.error("Error fetching emails:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEmails(token);
  // }, [token]);

  const toggleEmailDetail = (index) => {
    setActiveEmailIndex((prev) => (prev === index ? null : index));
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="p-6">
        {/* Skeleton for Profile Section */}
        <div className="w-full flex justify-end items-center gap-2">
          <Skeleton circle={true} height={40} width={40} />
          <div>
            <Skeleton width={120} height={20} />
            <Skeleton width={180} height={16} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-6">Invoice Emails</h2>

        {/* Skeleton for Email List */}
        <ul className="space-y-4 w-full flex justify-center flex-col">
          {[1, 2, 3].map((_, index) => (
            <li
              key={index}
              className="w-5xl bg-gray-50 rounded-lg shadow-md p-4 transition-all transform cursor-pointer mx-auto"
            >
              <div className="flex justify-between items-center">
                <Skeleton width={200} height={20} />
                <Skeleton width={150} height={16} />
              </div>
              <Skeleton count={3} className="mt-2" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  const normalizeEmail = (email, provider) => {
    switch (provider) {
      case "gmail":
        return {
          id: email.id,
          from:
            email?.payload?.headers?.find((h) => h.name === "From")?.value ||
            "Unknown",
          subject: email?.snippet || "No Subject",
          body: email?.payload?.body?.data || "No Content",
          attachments: email?.payload?.parts?.filter((p) => p.filename) || [],
        };

      case "yahoo":
        return {
          id: email.messageId,
          from: email?.from?.emailAddress?.address || "Unknown",
          subject: email?.subject || "No Subject",
          body: email?.body?.content || "No Content",
          attachments: email?.attachments || [],
        };

      case "outlook":
        return {
          id: email.id,
          from: email?.from?.emailAddress?.address || "Unknown",
          subject: email?.subject || "No Subject",
          body: email?.body?.content || "No Content",
          attachments: email?.attachments || [],
        };

      default:
        console.log("email", email);
        return email;
    }
  };

  const fetchEmails = async (provider, token) => {
    try {
      let response;
      if (provider === "gmail") {
        response = await axios.get(
          "https://www.googleapis.com/gmail/v1/users/me/messages",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (provider === "yahoo") {
        response = await axios.get(
          "https://some-yahoo-api-endpoint.com/emails",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (provider === "outlook") {
        response = await axios.get(
          "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      console.log("response", response);

      const emails = response.data.value.map((email) =>
        normalizeEmail(email, provider)
      );
      return emails;
    } catch (error) {
      console.error(`Error fetching ${provider} emails:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllEmails = async () => {
      setLoading(true);
      try {
        const fetchPromises = [];

        if (gmailToken) fetchPromises.push(fetchEmails("gmail", gmailToken));
        if (yahooToken) fetchPromises.push(fetchEmails("yahoo", yahooToken));
        if (outlookToken)
          fetchPromises.push(fetchEmails("outlook", outlookToken));

        const emailResults = await Promise.all(fetchPromises);

        // Flatten the results since fetchPromises might have a variable number of elements
        const allEmails = emailResults
          .flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log("fetchPromises", fetchPromises);
        console.log("allEmails", allEmails);

        setEmails(allEmails);
      } catch (err) {
        setError("Failed to fetch emails.");
      }
      setLoading(false);
    };

    fetchAllEmails();
  }, [gmailToken, yahooToken, outlookToken]); // Dependencies updated

  return (
    <div className="p-6">
      {/* Profile Section */}
      <div className="relative" ref={menuRef}>
        <div className="w-full flex justify-between items-center gap-2 ">
          <div className="font-extrabold text-xl ml-32">OneBill.</div>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex justify-end items-center gap-2 bg-slate-50 w-fit p-2 rounded-xl cursor-pointer"
          >
            {profile?.profilePicture && (
              <img
                className="w-10 h-10 rounded-full"
                src={profile?.profilePicture}
                alt="Profile"
              />
            )}
            <div>
              <h1 className="font-bold">{profile?.name || "User"}</h1>
              <p className="text-sm">{profile?.email || "No Email"}</p>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md p-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <span>Logout</span>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        )}
      </div>

      <h2 className="text-3xl font-bold text-center mb-6">Invoice Emails</h2>
      {emails?.length === 0 ? (
        <p className="text-center">No invoice emails found.</p>
      ) : (
        <ul className="space-y-4 w-full flex justify-center flex-col">
          {emails?.map((email, index) => (
            <li
              key={index}
              className="w-5xl bg-gray-50 rounded-lg shadow-md p-4 transition-all transform cursor-pointer mx-auto"
              onClick={() => toggleEmailDetail(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-gray-800">
                  From: {email?.from?.emailAddress?.address || "Unknown"}
                </h3>
                <p className="text-gray-500">
                  {email?.subject || "No Subject"}
                </p>
              </div>

              {activeEmailIndex === index && (
                <div className="mt-2 text-gray-700">
                  <div className="bg-gray-100 p-4 rounded">
                    {Array.isArray(email?.attachments) &&
                      email.attachments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-lg">
                            Attachments:
                          </h4>
                          <ul className="space-y-3 mt-2">
                            {email.attachments.map((file, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-center p-2 border-b border-gray-300"
                              >
                                <span className="text-gray-800 font-medium">
                                  {file.filename || "Unknown File"}
                                </span>
                                <a
                                  href={`/api/attachments/${file.attachmentId}`} // Adjust this URL as needed
                                  download={file.filename}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline bg-blue-100 px-4 py-2 rounded-md"
                                >
                                  Download
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <strong>Message:</strong>
                    {email?.body?.content ? (
                      <div
                        className="mt-2"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(email.messageBody.trim()),
                        }}
                      />
                    ) : (
                      <p>No message content available.</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvoiceEmails;
