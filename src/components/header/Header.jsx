import axios from "axios";
import { LogOut, Menu, Receipt } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ setMenuOpen }) => {
  const [profile, setProfile] = useState({});
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const provider = localStorage.getItem("authProvider");

  useEffect(() => {
    if (!token) {
      setError("No token found.");
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      try {
        let response;
        let normalizedEmails = [];

        if (provider === "google") {
          response = await axios.get(
            // `http://localhost:3000/api/emails?token=${token}`
            `https://onebill-poc-backend-production.up.railway.app/api/emails?token=${token}`
          );

          const userProfile = response?.data?.userInfo;
          console.log("userProfile", userProfile);

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
            response = await axios.get(
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

  const handleLogout = () => {
    navigate("/");
  };

  console.log("profileprofile", profile);

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden p-2"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-lg">One Bill</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex justify-end items-center gap-2 p-2 rounded-xl cursor-pointer">
          {profile?.profilePicture && (
            <img
              className="w-10 h-10 rounded-full border"
              src={profile?.profilePicture}
              alt="Profile"
            />
          )}
          <div>
            <h1 className="font-bold text-gray-200">
              {profile?.name || "User"}
            </h1>
            <p className="text-sm text-gray-400">
              {profile?.email || "No Email"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-zinc-400 hover:text-zinc-100 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
