const MainContainer = ({
  emails,
  activeTab,
  activeEmailIndex,
  toggleEmailDetail,
}) => {
  return (
    <main className="flex-1 overflow-auto p-4">
      <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
      <div className="my-4 border-t border-zinc-800"></div>

      {emails.length === 0 ? (
        <p className="text-center text-gray-300">No invoice emails found.</p>
      ) : (
        <ul className="space-y-4 w-full flex flex-col">
          {emails.map((email, index) => (
            <li
              key={index}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-4 transition-all transform cursor-pointer mx-auto"
              onClick={() => toggleEmailDetail(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl text-gray-200">
                  {email.sender || "Unknown"}
                </h3>
                <p className="text-gray-400">{email.subject || "No Subject"}</p>
              </div>
              {activeEmailIndex === index && (
                <div className="mt-2 text-gray-300 bg-gray-800 p-4 rounded">
                  {email?.message}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default MainContainer;
