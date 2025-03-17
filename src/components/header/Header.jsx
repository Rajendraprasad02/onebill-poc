import { LogOut, Menu, Receipt } from "lucide-react";

const Header = ({ profile, setMenuOpen, handleLogout }) => {
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
