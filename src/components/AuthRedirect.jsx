// import { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const AuthRedirect = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const token = queryParams.get("token");
//     const provider = queryParams.get("provider");
//     const isNewUser = queryParams.get("isNewUser") === "true"; // Convert to boolean
//     const userId = queryParams.get("userid"); // Convert to boolean

//     if (token) {
//       localStorage.setItem("authToken", token);
//       localStorage.setItem("authProvider", provider);
//       localStorage.setItem("userId", userId);

//       // Redirect based on whether the user is new
//       if (isNewUser) {
//         navigate("/profile"); // Redirect to profile setup
//       } else {
//         navigate("/invoice-emails"); // Redirect to dashboard
//       }
//     } else {
//       console.error("No token found.");
//       navigate("/"); // Redirect to login if token is missing
//     }
//   }, [location, navigate]);

//   return null; // No UI needed, just handling token storage and redirection
// };

// export default AuthRedirect;

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmailsAndProfile = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");
      const provider = queryParams.get("provider");
      const isNewUser = queryParams.get("isNewUser") === "true"; // Convert to boolean
      const userId = queryParams.get("userid");

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("authProvider", provider);
        localStorage.setItem("userId", userId);

        if (isNewUser) {
          navigate("/profile"); // Redirect to profile setup
        } else {
          navigate("/"); // Redirect to dashboard
        }
      } else {
        console.error("No token found.");
        navigate("/"); // Redirect to login if token is missing
        return;
      }

      let userProfile = {};
      let normalizedEmails = [];

      try {
        if (provider === "google") {
          const response = await axios.get(
            `https://onebill-poc-backend-production.up.railway.app/api/emails?token=${token}`
          );

          userProfile = response?.data?.userInfo || {};
          normalizedEmails =
            response?.data?.emails?.map((email, index) => ({
              id: index,
              subject: email?.subject,
              sender: email?.from,
              message: email?.messageBody,
              attachments: email?.attachments || [],
            })) || [];
        } else if (provider === "outlook") {
          // Fetch Outlook Emails
          const response = await axios.get(
            "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$filter=contains(subject, 'invoice')",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Fetch User Profile
          const userProfileRes = await axios.get(
            "https://graph.microsoft.com/v1.0/me",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          userProfile = userProfileRes.data || {};

          let profilePictureUrl =
            "https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg";

          try {
            const profilePictureRes = await axios.get(
              "https://graph.microsoft.com/v1.0/me/photo/$value",
              {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
              }
            );

            profilePictureUrl = URL.createObjectURL(profilePictureRes.data);
          } catch (error) {
            console.warn("No profile picture found. Using default.");
          }

          userProfile = {
            name: userProfile?.displayName,
            email: userProfile?.mail || userProfile?.userPrincipalName,
            profilePicture: profilePictureUrl,
          };

          // Normalize Emails
          normalizedEmails =
            response?.data?.value?.map((email) => ({
              id: email.id,
              subject: email.subject,
              sender: email.from?.emailAddress?.address,
              receivedAt: email.receivedDateTime,
              message: email?.body?.content,
            })) || [];
        } else {
          throw new Error("Invalid provider");
        }

        // Store Profile & Emails in localStorage
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      } catch (error) {
        console.error("Error fetching emails/profile:", error);
      }
    };

    fetchEmailsAndProfile();
  }, [location, navigate]);

  return null; // No UI needed, just handling token storage and redirection
};

export default AuthRedirect;
