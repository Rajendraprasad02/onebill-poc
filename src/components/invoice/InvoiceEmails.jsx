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

  // useEffect(() => {
  //   if (!token) {
  //     setError("No token found.");
  //     setLoading(false);
  //     return;
  //   }

  //   const fetchEmails = async () => {
  //     setLoading(true);
  //     try {
  //       let response;
  //       let normalizedEmails = [];

  //       if (provider === "google") {
  //         response = await axios.get(
  //           // `http://localhost:3000/api/emails?token=${token}`
  //           `https://onebill-poc-backend-production.up.railway.app/api/emails?token=${token}`
  //         );

  //         console.log("responseresponse", response);

  //         const userProfile = response?.data?.userInfo;

  //         setProfile(userProfile);

  //         normalizedEmails =
  //           response?.data?.emails?.map((email, index) => ({
  //             id: index, // Use index as a temporary ID if the API doesn't provide one
  //             subject: email?.subject, // Fix variable reference
  //             sender: email?.from, // Fix variable reference
  //             message: email?.messageBody, // Include message body
  //             attachments: email?.attachments || [], // Ensure attachments are included
  //             received: email?.payload?.headers
  //               ?.find((i) => i?.name === "Received")
  //               ?.value?.match(
  //                 /(\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2})/
  //               )?.[0],
  //           })) || [];
  //       } else if (provider === "outlook") {
  //         try {
  //           // Fetch Outlook Emails with "invoice" in Subject
  //           const response = await axios.get(
  //             "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$filter=contains(subject, 'invoice')",
  //             {
  //               headers: { Authorization: `Bearer ${token}` },
  //             }
  //           );

  //           console.log("responseresponse", response);

  //           // Fetch User Profile
  //           const userProfileRes = await axios.get(
  //             "https://graph.microsoft.com/v1.0/me",
  //             {
  //               headers: { Authorization: `Bearer ${token}` },
  //             }
  //           );

  //           const userProfile = userProfileRes.data;

  //           let profilePictureUrl =
  //             "https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg"; // Default Image
  //           try {
  //             const profilePictureRes = await axios.get(
  //               "https://graph.microsoft.com/v1.0/me/photo/$value",
  //               {
  //                 headers: { Authorization: `Bearer ${token}` },
  //                 responseType: "blob",
  //               }
  //             );

  //             const imageUrl = URL.createObjectURL(profilePictureRes.data);
  //             profilePictureUrl = imageUrl;
  //           } catch (error) {
  //             console.warn("No profile picture found. Using default.");
  //           }

  //           // Set Profile State
  //           setProfile({
  //             name: userProfile?.displayName,
  //             email: userProfile?.mail || userProfile?.userPrincipalName, // Fallback for missing mail
  //             profilePicture: profilePictureUrl,
  //           });

  //           // Normalize Emails
  //           normalizedEmails =
  //             response?.data?.value?.map((email) => ({
  //               id: email.id,
  //               subject: email.subject,
  //               sender: email.from?.emailAddress?.address, // Outlook uses a nested structure
  //               received: formatReceivedDateTime(email.receivedDateTime),
  //               message: email?.body?.content,
  //             })) || [];
  //         } catch (error) {
  //           console.error("Error fetching Outlook emails/profile:", error);
  //         }
  //       } else {
  //         throw new Error("Invalid provider");
  //       }

  //       setEmails(normalizedEmails);
  //     } catch (error) {
  //       console.error("Error fetching emails:", error);
  //       setError("Failed to fetch emails.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEmails();
  // }, [token, provider]);

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

      console.log("Bills stored successfully:", response.data);
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

  const nessw = [
    {
      id: 0,
      subject: "Invoice for Apple Music",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nHere are the details of your Apple Music subscription:\r\n\r\nInvoice from: Apple Music\r\nInvoice Number: APL-2025-98765\r\nPayment Amount: $10.99\r\nBilling Period: July 2025\r\nPayment Purpose: Music Subscription\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nApple Billing Team\r\n\r\n\r\n",
      attachments: [],
    },
    {
      id: 1,
      subject: "Invoice for Disney+",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nHere are the details of your Disney+ subscription:\r\n\r\nInvoice from: Disney+\r\nInvoice Number: DIS-2025-13579\r\nPayment Amount: $12.99\r\nBilling Period: June 2025\r\nPayment Purpose: Streaming Subscription\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nDisney+ Billing Tea\r\n\r\n",
      attachments: [],
    },
    {
      id: 2,
      subject: "Invoice for Amazon Prime",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nHere are the details of your Amazon Prime subscription:\r\n\r\nInvoice from: Amazon Prime\r\nInvoice Number: AMZ-2025-24680\r\nPayment Amount: $14.99\r\nBilling Period: May 2025\r\nPayment Purpose: Prime Membership\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nAmazon Billing Team\r\n\r\n",
      attachments: [],
    },
    {
      id: 3,
      subject: "Invoice for Spotify",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nHere are the details of your Spotify subscription:\r\n\r\nInvoice from: Spotify\r\nInvoice Number: SPOT-2025-67890\r\nPayment Amount: $9.99\r\nBilling Period: April 2025\r\nPayment Purpose: Premium Music Subscription\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nSpotify Billing Team\r\n\r\n",
      attachments: [],
    },
    {
      id: 4,
      subject: "Invoice for Netflix",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nHere are the details of your Netflix subscription:\r\n\r\nInvoice from: Netflix\r\nInvoice Number: NET-2025-12345\r\nPayment Amount: $399.99\r\nBilling Period: March 2025\r\nPayment Purpose: Subscription Renewal\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nNetflix Billing Team\r\n\r\n",
      attachments: [],
    },
    {
      id: 5,
      subject: "invoice for youtube",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Customer,\r\n\r\nThank you for your payment!\r\nHere are the details of your Netflix subscription:\r\n\r\nInvoice from: **Netflix**\r\nInvoice Number: **NET-2025-45678**\r\nPayment Amount: **$450.99**\r\nBilling Period: March 2025\r\nPayment Purpose: **subscription**\r\n\r\nNo action is required on your part. Your subscription will renew \r\nautomatically.\r\n\r\nNetflix Billing Team\r\n\r\n",
      attachments: [],
    },
    {
      id: 6,
      subject: "Your Monthly Invoice from Adobe Creative Cloud",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Hello,\r\n\r\nYour monthly subscription payment for Adobe Creative Cloud has been \r\nprocessed.\r\n\r\nInvoice From: **Adobe Creative Cloud**\r\nInvoice Number: **ADOBE-98765**\r\nPayment Amount: **$52.99**\r\nSubscription Plan: **Adobe Creative Suite**\r\nPayment Purpose: **Subscription**\r\n\r\nFor any billing inquiries, contact support@adobe.com.\r\n\r\nBest regards,\r\nAdobe Billing Team\r\n\r\n",
      attachments: [],
    },
    {
      id: 7,
      subject: "Your Order Receipt from Amazon",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Alice,\r\n\r\nThank you for your purchase from **Amazon**.\r\n\r\nOrder Number: **AMZ-ORD-99876**\r\nInvoice #: **AMZ-INV-7654**\r\nTotal Amount: **$89.99**\r\nPayment Purpose: **Purchase**\r\n\r\nYour order will be delivered within 3-5 business days.\r\n\r\nBest,\r\nAmazon Customer Service\r\n\r\n",
      attachments: [],
    },
    {
      id: 8,
      subject: "Invoice for Global Innovations Inc. - Invoice # 2025-003",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Mr. Michael Davis,\r\n\r\nI hope this email finds you well.\r\n\r\nPlease find below the details of the invoice for the services provided \r\nby Tech Solutions Inc.:\r\n\r\nInvoice Number: 2025-003\r\nDate: March 25, 2025\r\nDue Date: April 15, 2025\r\nCompany Name: Global Innovations Inc.\r\nAmount Due: 3,200.00\r\nDescription: IT consulting and system integration services.\r\n\r\nKindly make the payment by the due date. Below are the payment details:\r\n\r\nBank Account Details:\r\n\r\nBank Name: Global Bank\r\nAccount Number: 1122334455\r\nIFSC Code: GLBB0009876\r\nPayment Reference: 2025-003\r\nIf you have any questions regarding this invoice or need further \r\nassistance, please feel free to reach out.\r\n\r\nThank you for your prompt attention to this matter.\r\n\r\nBest regards,\r\nEmily White\r\nBilling Department\r\nTech Solutions Inc.\r\nPhone: (555) 321-9876\r\nEmail: emily.white@techsolutions.com\r\n\r\n",
      attachments: [],
    },
    {
      id: 9,
      subject: "Invoice for Acme Corp - Invoice # 2025-001",
      sender: "rajendra.prasad@talentakeaways.com",
      message:
        "Dear Mr. John Smith,\r\n\r\nI hope this message finds you well.\r\n\r\nPlease find below the details of the invoice for the services provided \r\nby Tech Solutions Inc.:\r\n\r\nInvoice Number: 2025-001\r\nDate: March 20, 2025\r\nDue Date: April 10, 2025\r\nCompany Name: Acme Corp\r\nAmount Due: 1500.00\r\nDescription: Website development and maintenance services.\r\n\r\n",
      attachments: [],
    },
    {
      id: 10,
      subject: "Discover all the features of your Proton account",
      sender: "Proton <no-reply@notify.proton.me>",
      message:
        "Protect yourself online with our suite of privacy-first, encrypted services\n\n[Proton](https://proton.me/)\n\nDiscover all the features of your Proton account\n\nDear Proton community member,\n\nYour Proton Account gives you access to all Proton products for free: password manager, cloud storage, email, and Bitcoin wallet. Here are a few tips to get you started.\n\n[Proton Pass]\n\nManage your passwords with Proton Pass (free)\n\nProton Pass saves all your passwords in one place and automates logins.\n\nWith Proton Pass, you can:\n\n- Store your login credentials, credit cards and more with end-to-end encryption\n- Easily access and manage your passwords across unlimited devices\n- Securely share login information with friends and colleagues\n\nMigrate to Proton Pass from other password managers in less than a minute with our built-in support for importing passwords.\n\n[Start using Proton Pass](https://proton.me/pass/download)\n\n[Proton Drive]\n\nSave your files and photos with Proton Drive (free)\n\nProton Drive is an end-to-end encrypted vault for all your files.\n\nWith Proton Drive, you can:\n\n- Protect files with end-to-end encryption (E2EE)\n- Share files securely with anyone\n- Access your files from anywhere and on any device\n\n[Start using Proton Drive](https://proton.me/drive/download)\n\n[Proton Mail]\n\nKeep your conversations private with Proton Mail (free)\n\nProton Mail protects your emails with end-to-end and zero-access encryption so that no one – not even Proton – can read your emails but you.\n\nUse Proton Mail to:\n\n- Block trackers and prevent advertisers from monitoring your email activity and targeting you with ads\n- Keep your inbox organized with filters, folders and labels\n- Keep your schedule private with Proton Calendar\n\nYou can easily switch from your existing email provider to Proton Mail in one click.\n\n[Start using Proton Mail](https://mail.proton.me/)\n\n[Try Proton Calendar](https://calendar.proton.me/)\n\n[Proton Wallet]\n\nSecure your financial freedom with Proton Wallet\n\nSimilar to how Proton Mail made encrypted email simple, we designed Proton Wallet to make [Bitcoin](https://proton.me/wallet/bitcoin-guide-for-newcomers) self-custody simple, free, and secure for everyone. We hope this will empower people from around the world to gain financial freedom and sovereignty.\n\nWith Proton Wallet, you can:\n\n- Truly own Bitcoin without relying on banks or centralized exchanges\n- Easily send BTC to your friends and family with [Bitcoin via Email](https://proton.me/support/wallet-bitcoin-via-email)\n- Buy BTC in 150+ countries through our on-ramp partners\n\n[Open Proton Wallet](https://wallet.proton.me/)\n\nThanks for helping us build a better internet where privacy is the default.\n\nStay secure,\nThe Proton Team\n\nConnect with the Proton community\n\n[Twitter](https://twitter.com/ProtonPrivacy)\n\n[Reddit](https://reddit.com/r/ProtonMail)\n\n[LinkedIn](https://www.linkedin.com/company/protonprivacy/)\n\n[Facebook](https://facebook.com/Proton)\n\n[Instagram](https://instagram.com/protonprivacy)\n\n[Mastodon](https://mastodon.social/@protonmail)\n\n[Blog](https://proton.me/blog)\n\n© 2025 Proton AG Switzerland\nRoute de la Galaise 32, 1228 Plan-les-Ouates, Geneva, Switzerland",
      attachments: [],
    },
    {
      id: 11,
      subject: "invoice",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: "attancjj please checkk\r\n",
      attachments: [],
    },
    {
      id: 12,
      subject: "invoice",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: "",
      attachments: [],
    },
    {
      id: 13,
      subject: "invoice from ttipl",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: "",
      attachments: [],
    },
    {
      id: 14,
      subject: "invoice form youtube",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: '"funbeastgamers@gmail.com" <funbeastgamers@gmail.com>\r\n',
      attachments: [],
    },
    {
      id: 15,
      subject: "invoice from spotify",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: '"funbeastgamers@gmail.com" <funbeastgamers@gmail.com>\r\n',
      attachments: [],
    },
    {
      id: 16,
      subject: "invoce",
      sender: "Rajendra prasad R <14stxnightfury@gmail.com>",
      message: "invoice details\r\n",
      attachments: [],
    },
    {
      id: 17,
      subject: "Spotify Receipt",
      sender: "Spotify <no-reply@spotify.com>",
      message:
        '\r\n\r\n\r\n\r\n\r\n\r\n<!DOCTYPE html>\r\n<html xmlns="http://www.w3.org/1999/xhtml" style="margin: 0; padding: 0">\r\n<head>\r\n    <meta http-equiv="content-type" content="text/html; charset=utf-8" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\r\n    <title></title>\r\n    <style type="text/css">\r\n        @media only screen and (min-device-width: 481px) {\r\n            div[id="main"] {\r\n                width: 480px !important;\r\n            }\r\n        }\r\n    </style>\r\n    <!--[if mso]><style>body, table, tr, td, h1, h2, h3, h4, h5, h6, center p, a, span, table.MsoNormalTable {font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif !important}</style><![endif]-->\r\n</head>\r\n\r\n<body topmargin="0" leftmargin="0" rightmargin="0" bottommargin="0" marginheight="0" marginwidth="0" style="-webkit-font-smoothing: antialiased; width: 100% !important; -webkit-text-size-adjust: none; margin: 0; padding: 0">\r\n    \r\n    <!--TEST-FORM-->\r\n    <!--[if (mso) | (IE)]><table cellpadding="0" cellspacing="0" border="0" valign="top" width="480" align="center"><tr><td valign="top" align="left" style=" word-break:normal; border-collapse:collapse; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size:12px; line-height:18px; color:#555555;"><![endif]-->\r\n    <table cellpadding="0" cellspacing="0" border="0" valign="top" width="100%" align="center" style=" width:100%; max-width:480px;">\r\n        <tr>\r\n            <td valign="top" align="left" style=" word-break:normal; border-collapse:collapse; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size:12px; line-height:18px; color:#555555;">\r\n                <center>\r\n                    <div id="main">\r\n                        <table class="header-root" width="100%" height="50" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%; height: 50px;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;">\r\n                                    <td colspan="3" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <a href="https://wl.spotify.com/ss/c/u001.0fJ1LQ6VCBzrSH1Zl1-T2g2RIViyZ1IJSmVF4HNi5HY/4bs/KEuKj-xXRv-ff5ygR27GLQ/h0/h001.uVS5Ywlqowvz2ZG6XeR99guYRY7M-P15NebcUKWMtB0" style="border: none; margin: 0px; padding: 0px; text-decoration: none;"><img class="logo" src="http://aro.scdn.co/newsletters/b220713a2d4ac7a75ebe1f9ee0c78549.png"\r\n                                                width="122" height="37" alt="" style="border: none; margin: 0px; padding: 0px; display: block; max-width: 100%; width: 122px; height: 37px;"></a>\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;">\r\n                                    <td colspan="3" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="title-subtitle-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr height="28" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 28px;">\r\n                                    <td colspan="3" height="28" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 28px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <h2 class="font title-subtitle-title" align="center" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; text-decoration: none; color: rgb(85, 85, 85); font-size: 30px; font-weight: bold;          line-height: 45px; letter-spacing: -0.04em; text-align: center;">\r\n                                                \r\n  \r\n  Your Spotify Premium receipt\r\n\r\n                                        </h2>\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr height="16" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 16px;">\r\n                                    <td colspan="3" height="16" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 16px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="text-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;">\r\n  \r\n  November 26, 2024\r\n\r\n                                                            <center style="border: none; margin: 0px; padding: 0px;"></center>\r\n                                                        </center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;">\r\n                                                            \r\n  \r\n  Order ID: 2593043965368102-1-1\r\n\r\n                                                            <center style="border: none; margin: 0px; padding: 0px;"></center>\r\n                                                        </center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                    </td>\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="text-padding" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="text-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200;\r\n                                                                text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <table class="purchase-details" cellspacing="0" cellpadding="0" width="100%" bgcolor="#F7F7F7" style="margin: 0px; padding: 0px; background: rgb(247, 247, 247); border-collapse: collapse; width: 100%">\r\n                                                            <tbody>\r\n                                                                <tr>\r\n                                                                    <td style="border-style: solid; border-width: 1px; border-color: rgb(227, 227, 227)">\r\n                                                                        <table cellspacing="0" cellpadding="0" width="100%" style="margin: 0px; padding: 0px; width: 100%">\r\n                                                                            <tbody>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                                <tr>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                    <td valign="middle" style="font-weight: bold; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        Spotify Premium\r\n                                                                                    </td>\r\n                                                                                    <td width="20%" valign="middle" style="text-align: right; width: 20%; vertical-align: top; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        59.00 INR\r\n                                                                                    </td>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                </tr>\r\n                                                                                <tr>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                    <td colspan="3" valign="middle" style="font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        \r\n  \r\n  3 months\r\n\r\n                                                                                    </td>\r\n                                                                                </tr>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                            </tbody>\r\n                                                                        </table>\r\n                                                                    </td>\r\n                                                                </tr>\r\n\r\n                                                                <tr>\r\n                                                                    <td style="border-style: solid; border-width: 1px; border-color: rgb(227, 227, 227)">\r\n                                                                        <table cellspacing="0" cellpadding="0" width="100%" style="margin: 0px; padding: 0px; width: 100%">\r\n                                                                            <tbody>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                                <tr>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                    <!-- India needs round brackets for the tax_rate as tax descrition is composed of different items. -->\r\n                                                                                    <td valign="middle" style="font-weight: bold; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        IGST  (18%)\r\n                                                                                    </td>\r\n                                                                                    <td width="20%" valign="middle" style="text-align: right; width: 20%; vertical-align: top; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                      9.00 INR\r\n                                                                                    </td>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                </tr>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                            </tbody>\r\n                                                                        </table>\r\n                                                                    </td>\r\n                                                                </tr>\r\n                                                                <!-- @TODO total tax amount if tax > 1 -->\r\n                                                                <tr>\r\n                                                                    <td style="border-style: solid; border-width: 1px; border-color: rgb(227, 227, 227)">\r\n                                                                        <table cellspacing="0" cellpadding="0" width="100%" style="margin: 0px; padding: 0px; width: 100%">\r\n                                                                            <tbody>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                                <tr>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                    <td valign="middle" style="font-weight: bold; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        \r\n  \r\n  Total\r\n\r\n                                                                                    </td>\r\n                                                                                    <td width="20%" valign="middle" style="text-align: right; width: 20%; vertical-align: top; font-family:\'Circular\', \'Helvetica Neue\', Helvetica, Arial, sans-serif;">\r\n                                                                                        59.00 INR\r\n                                                                                    </td>\r\n                                                                                    <td width="5%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 5%;"></td>\r\n                                                                                </tr>\r\n                                                                                <tr class="purchase-details-padding" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px;">\r\n                                                                                    <td colspan="4" height="10" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 10px; font-size: 10px; line-height: 10px"></td>\r\n                                                                                </tr>\r\n                                                                            </tbody>\r\n                                                                        </table>\r\n                                                                    </td>\r\n                                                                </tr>\r\n                                                            </tbody>\r\n                                                        </table>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                    </td>\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="text-padding" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="text-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;"><b align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; text-align: left; text-decoration: none; font-weight: bold;">\r\n                                                            \r\n  \r\n  Payment Method\r\n\r\n                                                        </b></center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;">\r\n  \r\n  UPI\r\n</center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                    </td>\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="text-padding" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="text-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;"><b align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; text-align: left; text-decoration: none; font-weight: bold;">\r\n                                                            \r\n  \r\n  Username\r\n\r\n                                                        </b></center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;">316aney47xplezi4uyhrgydmstay</center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                    </td>\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="text-padding" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="text-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0px; padding: 0px">\r\n                                            <tbody>\r\n                                                <tr>\r\n                                                    <td class="font text-paragraph" align="left" style="border: none; margin: 0px; padding: 0px 0px 5px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(97, 100, 103); font-size: 14px; line-height: 20px;">\r\n                                                        <center style="border: none; margin: 0px; padding: 0px;">\r\n                                                            <font size="-1" style="border: none; margin: 0px; padding: 0px;">\r\n                                                                \r\n  \r\n  You agree that if you do not cancel your subscription before the end of your 3 month offer, you will automatically be charged the 119.00 INR subscription fee for Spotify Premium every month until you cancel. You can cancel your subscription at any time on your Account <a href="https://wl.spotify.com/ss/c/u001.veI_WGEwlX2CqkY-q1tdDvMpoDdq6kYkT537-o9hRR6yZ8-Zkaassw7NV69nM8ene2XcEFf2lrLf1L7ILyvTWQ/4bs/KEuKj-xXRv-ff5ygR27GLQ/h1/h001.hrH6cXbT9vMJEM7dKiqli5zEOmHcztmHaOMRyYZ6PrI">page</a> following the instructions <a href="https://wl.spotify.com/ss/c/u001.pzPy6UVCkJaYz38Nsz1uX1AvtI-Km6ynHrEIkdizWJb1IXQw2XENFKuFBsmkYEDG1vMDmPIfmTLbnHLFO_t7zd2oPVqCKA6FPeyKeFj3QD4/4bs/KEuKj-xXRv-ff5ygR27GLQ/h2/h001.e-AIMICUlu1WaLPAA4lbSvsWNTYodd6Z-2UiJiCrEt4">here</a>.\r\n\r\n                                                            </font>\r\n                                                        </center>\r\n                                                    </td>\r\n                                                </tr>\r\n                                            </tbody>\r\n                                        </table>\r\n                                    </td>\r\n                                    <td class="table-separator" width="6.25%" valign="middle" style="width: 6.25%; border: none; margin: 0px; padding: 0px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="text-padding" height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <style style="border: none; margin: 0px; padding: 0px;">\r\n                            .footer-root a.footer-link {\r\n                                color: #6D6D6D;\r\n                                text-decoration: none;\r\n                                font-weight: bold;\r\n                            }\r\n                        </style>\r\n                        <table class="footer-padding-root" width="100%" cellpadding="0" cellspacing="0" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%;">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr class="footer-padding" height="22" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 22px;">\r\n                                    <td colspan="3" class="footer-padding" height="22" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 22px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                        <table class="footer-root" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F7F7F7" style="border: none; margin: 0px; border-collapse: collapse; padding: 0px; width: 100%; background-color: rgb(247, 247, 247);">\r\n                            <tbody valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                <tr class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;">\r\n                                    <td colspan="3" class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;"><img class="footer-logo" src="http://aro.spotify.s3.amazonaws.com/newsletter/images/logo_footer.png"\r\n                                            width="77" height="23" alt="" style="border: none; margin: 0px; padding: 0px; display: block; max-width: 100%; width: 77px; height: 23px;"></td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;">\r\n                                    <td colspan="3" class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <hr bgcolor="#D1D5D9" style="border: none; margin: 0px; padding: 0px; height: 1px; background-color: rgb(209, 213, 217);">\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr class="footer-top-padding" height="12" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 12px;">\r\n                                    <td colspan="3" class="footer-top-padding" height="12" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 12px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td class="font" valign="middle" align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(136, 137, 140); font-size: 11px; line-height: 1.65em;">\r\n                                        \r\n  \r\n  Get Spotify for:\r\n &nbsp; <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.7t044FtSaxqJkg7lMs2HwrhHstRSbK1p_bfR1DbNFcCMacjMAK7fYk_CVqorhL3wUp0vpeQVSAc-Uyh3ntOFYA/4bs/KEuKj-xXRv-ff5ygR27GLQ/h3/h001.nv0P4mIlOS_o0gXPfnIPrmobyPx1CZUlzOCGzYFcgcE"\r\n                                            style="border-style: none solid none none; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 7px 0px 0px; color: rgb(109, 109, 109); font-weight: bold;">iPhone</a>\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.7t044FtSaxqJkg7lMs2HwrhHstRSbK1p_bfR1DbNFcCMacjMAK7fYk_CVqorhL3wUp0vpeQVSAc-Uyh3ntOFYA/4bs/KEuKj-xXRv-ff5ygR27GLQ/h4/h001.sBeCv-Wwo8dF6Xc51s_tP8Od_pWD1SeKcRlYf5MWJ4E" style="border-style: none solid; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 7px; color: rgb(109, 109, 109); font-weight: bold;">iPad</a>\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.sAGCdhjXZxfAAg6hD3c4rn4aD7lphfzw4oddIidKSrnMO8i_WOPvMs5fu229HadmxCK3gZNcfL2Xyaj6yfyPhwicZX0jRl9IvMJU63UZNAM/4bs/KEuKj-xXRv-ff5ygR27GLQ/h5/h001.xgdtfcCtBvxB7n9qhlpMKWT-rqFBkl1DHVJH1U0L460" style="border-style: none solid; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 7px; color: rgb(109, 109, 109); font-weight: bold;">Android</a>\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.veI_WGEwlX2CqkY-q1tdDoWRhJ1HJfRhqGJqUdwZPywAoSbGeC-fCRdXqZwAieuP/4bs/KEuKj-xXRv-ff5ygR27GLQ/h6/h001.1R8mrRqtVXlkYui_juH1ktN8SvvN02MxkBoWFi3FUU0" style="border-style: none none none solid; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 0px 0px 7px; color: rgb(109, 109, 109); font-weight: bold;">\r\n                                            \r\n  \r\n  Other\r\n\r\n                                        </a>\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr class="footer-top-padding" height="12" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 12px;">\r\n                                    <td colspan="3" class="footer-top-padding" height="12" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 12px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                        <hr bgcolor="#D1D5D9" style="border: none; margin: 0px; padding: 0px; height: 1px; background-color: rgb(209, 213, 217);">\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;">\r\n                                    <td colspan="3" class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td class="font" valign="middle" align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(136, 137, 140); font-size: 11px; line-height: 1.65em;">\r\n                                        \r\n  \r\n  This message was sent to 14stxnightfury@gmail.com. If you have questions or complaints, please <a class="footer-link" href="https://wl.spotify.com/ss/c/u001.veI_WGEwlX2CqkY-q1tdDvMpoDdq6kYkT537-o9hRR70G0KitR0-C5B72IGoRpt-J5GnWz1DL_8mnDtHbIDZ4Q/4bs/KEuKj-xXRv-ff5ygR27GLQ/h7/h001.Nn94DtyosEds2e-qbETublys_TV0SICF3J4i5W6QjVc" style="border: none; margin: 0px; padding: 0px; font-family: Circular, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; text-align: left; color: rgb(109, 109, 109); text-decoration: none; font-weight: bold;" align="left">contact us</a>.\r\n\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr class="footer-middle-padding" height="33" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 33px;">\r\n                                    <td colspan="3" class="footer-middle-padding" height="33" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 33px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td class="font font-small" valign="middle" align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(136, 137, 140); line-height: 1.65em; font-size: 11px;">\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.veI_WGEwlX2CqkY-q1tdDjWL-mHp-ET28Zlsnpwy2VmutIrsbB_tV7Nz6bZGFBrXT1k-Jr_wpfmfjNynvEpF9A/4bs/KEuKj-xXRv-ff5ygR27GLQ/h8/h001.PcYrJxp-qEAr3FTBj63JCtMvBCQnJr90md8pBa-Vzqs" style="border-style: none solid none none; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 7px 0px 0px; color: rgb(109, 109, 109); font-weight: bold;">\r\n                                            \r\n  \r\n  Terms of Use\r\n\r\n                                        </a>\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.pzPy6UVCkJaYz38Nsz1uX1AvtI-Km6ynHrEIkdizWJaZrHQWIJFM1-RYGQgMhKFflxG_NAroWaQMoZbue67OA3iPJ7neYPxKdsoeqgQhr-M/4bs/KEuKj-xXRv-ff5ygR27GLQ/h9/h001.ZLbQX5wyeUShoXtTXAp5f_4MU7gMUyNPem25hqYs-wA" style="border-style: none solid; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 7px; color: rgb(109, 109, 109); font-weight: bold;">\r\n                                            \r\n  \r\n  Technical requirements\r\n\r\n                                        </a>\r\n                                        <a class="footer-separated-text" href="https://wl.spotify.com/ss/c/u001.veI_WGEwlX2CqkY-q1tdDvMpoDdq6kYkT537-o9hRR70G0KitR0-C5B72IGoRpt-J5GnWz1DL_8mnDtHbIDZ4Q/4bs/KEuKj-xXRv-ff5ygR27GLQ/h10/h001.j2FvVI_U5ypL6iOLAIHJaMmcJuzup1O3NvDteXly9QE" style="border-style: none none none solid; margin: 0px; text-decoration: none; border-right-width: 1px; border-right-color: rgb(195, 195, 195); border-left-width: 1px; border-left-color: transparent; display: inline-block; padding: 0px 0px 0px 7px; color: rgb(109, 109, 109); font-weight: bold;">\r\n                                            \r\n  \r\n  Contact Us\r\n\r\n                                        </a>\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td colspan="3" class="footer-top-padding" height="12" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 12px;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td class="font font-small" valign="middle" align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(136, 137, 140); line-height: 1.65em; font-size: 11px;">\r\n                                      Spotify India LLP, Jet Airways - Godrej BKC, 1st Floor, Unit No 1& 2 Plot C-68, G Block, Bandra Kurla Complex, Bandra - East Mumbai MH 400051, India\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n                                <tr valign="middle" style="border: none; margin: 0px; padding: 0px;">\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                    <td class="font font-small" valign="middle" align="left" style="border: none; margin: 0px; padding: 0px; font-family: Circular, \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-weight: 200; text-align: left; text-decoration: none; color: rgb(136, 137, 140); line-height: 1.65em; font-size: 11px;">\r\n                                      GSTIN:          27ADYFS6905K1Z5\r\n                                    </td>\r\n                                    <td width="6.25%" valign="middle" style="border: none; margin: 0px; padding: 0px; width: 6.25%;"></td>\r\n                                </tr>\r\n\r\n                                <tr height="20" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 20px;">\r\n                                    <td colspan="3" class="footer-bottom-padding" height="25" valign="middle" style="border: none; margin: 0px; padding: 0px; height: 25px;"></td>\r\n                                </tr>\r\n                            </tbody>\r\n                        </table>\r\n                    </div>\r\n                </center>\r\n            </td>\r\n        </tr>\r\n    </table>\r\n    <!--[if (mso) | (IE)]></td></tr></table><![endif]-->\r\n<img src="https://wl.spotify.com/ss/o/u001.mhN8B4__P3bExMZqn9RTSA/4bs/KEuKj-xXRv-ff5ygR27GLQ/ho.gif" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;"/></body>\r\n\r\n</html>',
      attachments: [],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-white  pt-24">
      {nessw?.length === 0 ? (
        <div className="bg-zinc-950 text-zinc-100 w-full flex justify-center align-middle h-screen">
          <div className="">
            <p className="font-semibold">No invoice emails found.</p>
          </div>
        </div>
      ) : (
        <div className="h-full z-0 ">
          <ul className="flex flex-col gap-4">
            {nessw?.map((email, index) => (
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
