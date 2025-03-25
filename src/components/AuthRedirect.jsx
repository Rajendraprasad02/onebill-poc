import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const [emails, setEmails] = useState([]);
  const [profile, setProfile] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  console.log("emailsemails", emails);
  console.log("profileprofile", profile);

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
          localStorage.setItem("userProfile", JSON.stringify(userProfile)); // ✅ Store profile in localStorage

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
            const finalProfile = {
              name: userProfile?.displayName,
              email: userProfile?.mail || userProfile?.userPrincipalName,
              profilePicture: profilePictureUrl,
            };

            setProfile(finalProfile);

            localStorage.setItem("userProfile", JSON.stringify(finalProfile)); // ✅ Store profile in localStorage

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
      }
    };

    fetchEmails();
  }, [token, provider]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const provider = queryParams.get("provider");
    const isNewUser = queryParams.get("isNewUser") === "true"; // Convert to boolean
    const userId = queryParams.get("userid"); // Convert to boolean

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("authProvider", provider);
      localStorage.setItem("userId", userId);

      // Redirect based on whether the user is new
      if (isNewUser) {
        navigate("/profile"); // Redirect to profile setup
      } else {
        navigate("/invoice-emails"); // Redirect to dashboard
      }
    } else {
      console.error("No token found.");
      navigate("/"); // Redirect to login if token is missing
    }
  }, [location, navigate]);

  return null; // No UI needed, just handling token storage and redirection
};

export default AuthRedirect;
