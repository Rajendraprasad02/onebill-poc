// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Signup = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = (e) => {
//     e.preventDefault();
//   };

//   const handleOAuthLogin = (provider) => {
//     window.location.href = `https://onebill-poc-backend-production.up.railway.app/api/${provider}`;
//     // window.location.href = `http://localhost:3000/api/${provider}`;
//   };

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center md:text-blue-400">
//           Sign Up
//         </h2>

//         <form onSubmit={handleSignup}>
//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter your password"
//               className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300"
//           >
//             Sign Up
//           </button>
//         </form>

//         <div className="mt-4">
//           <p className="text-center text-gray-600">Or sign up with</p>
//           <div className="flex justify-center gap-3 mt-3">
//             <button
//               onClick={() => handleOAuthLogin("google")}
//               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
//             >
//               Google
//             </button>
//             <button
//               onClick={() => handleOAuthLogin("outlook")}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
//             >
//               Outlook
//             </button>
//             <button
//               onClick={() => handleOAuthLogin("yahoo")}
//               className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition duration-300"
//             >
//               Yahoo
//             </button>
//           </div>
//         </div>

//         <p className="mt-4 text-center text-gray-600">
//           Already have an account?{" "}
//           <button
//             onClick={() => navigate("/")}
//             className="text-blue-500 hover:underline"
//           >
//             Sign In
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;

import { Receipt } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const handleOAuthLogin = (provider) => {
    window.location.href = `https://onebill-poc-backend-production.up.railway.app/api/${provider}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
              <Receipt className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight">One Bill</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Simplify your finances. Manage all your bills in one place.
            </p>
          </div>
          <div className="mt-10 space-y-4  flex flex-col justify-center w-full">
            <button
              onClick={() => handleOAuthLogin("google")}
              className="w-full bg-white text-black font-medium py-3 rounded-lg flex items-center justify-center gap-3 mb-3 cursor-pointer"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuthLogin("yahoo")}
              className="w-full bg-purple-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-3 mb-3 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#fff"
                aria-label="Yahoo!"
                viewBox="0 0 512 512"
                id="yahoo"
                width="24"
                height="24"
              >
                <rect width="524" height="512" fill="#5f01d1" rx="15%"></rect>
                <path d="M203 404h-62l25-59-69-165h63l37 95 37-95h62m58 76h-69l62-148h69"></path>
                <circle cx="303" cy="308" r="38"></circle>
              </svg>
              Continue with Yahoo
            </button>
            <button
              onClick={() => handleOAuthLogin("outlook")}
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-3 cursor-pointer"
            >
              <img
                className="w-7 h-7"
                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
              />
              Continue with Outlook
            </button>
          </div>
          <div className="mt-8 text-center text-xs text-zinc-500">
            By continuing, you agree to One Bill's{" "}
            <a
              href="#"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
