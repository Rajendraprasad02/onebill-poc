import React, { useEffect, useState } from "react";

const ProfileView = () => {
  const [profile, setProfile] = useState({});
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
  };

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);
  console.log("profileprofile", profile);

  return (
    <div className="   bg-zinc-950 text-zinc-100 ">
      <div className=" p-6 rounded-lg shadow-lg h-screen bg-zinc-950">
        <div className="p-4 bg-zinc-900 rounded-xl w-1/2">
          <h2 className="text-2xl font-semibold  mb-4">Profile</h2>
          <div className="space-y-4 w-1/2 flex flex-col gap-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm">First Name</p>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>
              {/* <div>
                <p className="text-gray-400 text-sm">Last Name</p>
                <p className="text-lg font-medium">{user.lastName}</p>
              </div> */}
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
