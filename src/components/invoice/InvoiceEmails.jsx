import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";

const InvoiceEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeEmailIndex, setActiveEmailIndex] = useState(null); // Track expanded email

  // Extract token from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No token found.");
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/emails?token=${token}`
        );
        console.log("Fetched Emails:", response.data);
        setEmails(response.data);
      } catch (err) {
        setError("Failed to fetch emails.");
      }
      setLoading(false);
    };

    fetchEmails();
  }, [token]);

  const toggleEmailDetail = (index) => {
    setActiveEmailIndex((prev) => (prev === index ? null : index));
  };

  if (loading) return <p>Loading emails...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Invoice Emails</h2>
      {emails?.length === 0 ? (
        <p className="text-center">No invoice emails found.</p>
      ) : (
        <ul className="space-y-4 w-full align-middle flex justify-center flex-col ">
          {emails?.map((email, index) => (
            <li
              key={index}
              className="w-5xl bg-gray-50 rounded-lg shadow-2xs p-4 transition-all transform cursor-pointer mx-auto"
              onClick={() => toggleEmailDetail(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-gray-800">
                  From: {email?.from || "Unknown"}
                </h3>
                <p className="text-gray-500">
                  {email?.subject || "No Subject"}
                </p>
              </div>

              <div className="mt-2">
                {activeEmailIndex === index && (
                  <div className="text-gray-700 mt-4">
                    <div className="bg-gray-100 p-4 rounded text-gray-800">
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
                      {email?.messageBody ? (
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              email.messageBody.trim()
                            ),
                          }}
                        />
                      ) : (
                        <p>No message content available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InvoiceEmails;
