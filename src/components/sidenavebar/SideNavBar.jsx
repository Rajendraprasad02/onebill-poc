import React, { useState } from "react";

const SideNavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");

  return (
    <>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
        <div className="flex flex-1">
          {menuOpen && (
            <aside className="w-[240px] bg-zinc-900 p-4 border-r border-zinc-800 md:hidden">
              <nav className="flex flex-col gap-2">
                {["inbox"].map((tab) => (
                  <button
                    key={tab}
                    className={`p-2 text-left ${
                      activeTab === tab
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-400"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </aside>
          )}
          <aside className="hidden md:block w-[240px] border-r border-zinc-800 p-4">
            <nav className="flex flex-col gap-2">
              {["inbox"].map((tab) => (
                <button
                  key={tab}
                  className={`p-2 text-left ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
};

export default SideNavBar;
