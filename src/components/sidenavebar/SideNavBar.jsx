import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SideNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const menuItems = [
    { name: "Inbox", route: "/invoice-emails" },
    { name: "Bill Payment", route: "/bill-payment" },
    { name: "Card Details", route: "/card-details" },
    { name: "Profile", route: "/profile" },
  ];

  // Update active tab based on current route
  useEffect(() => {
    const currentTab = menuItems.find(
      (item) => item.route === location.pathname
    );
    setActiveTab(currentTab ? currentTab.name : "");
  }, [location.pathname]);

  const handleNavigation = (tab, route) => {
    setActiveTab(tab);
    navigate(route);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100  fixed left-0 top-16 w-64">
      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        {menuOpen && (
          <aside className="w-[240px] bg-zinc-900 p-4 border-r border-zinc-800 md:hidden">
            <nav className="flex flex-col gap-2">
              {menuItems.map(({ name, route }) => (
                <button
                  key={name}
                  className={`p-2 text-left rounded-lg ${
                    activeTab === name
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-400"
                  }`}
                  onClick={() => handleNavigation(name, route)}
                >
                  {name}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[240px] border-r border-zinc-800 p-4">
          <nav className="flex flex-col gap-2">
            {menuItems.map(({ name, route }) => (
              <button
                key={name}
                className={`p-2 text-left cursor-pointer rounded-lg ${
                  activeTab === name
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400"
                }`}
                onClick={() => handleNavigation(name, route)}
              >
                {name}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default SideNavBar;
