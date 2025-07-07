import { Link, Outlet, useNavigate } from "react-router-dom";

function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.open("http://localhost:5000/auth/logout", "_self");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with enhanced styling */}
      <div className="min-w-[18rem] bg-gray-900 text-white flex flex-col p-6 relative border-r-2 border-gray-700">
        {/* Vertical line on the right side */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-600"></div>
        
        <h2 className="text-4xl font-bold mb-12">📨 Email Tracker</h2>
        
        {/* Navigation Links */}
        <nav className="flex-1 space-y-8">
          <Link 
            to="/compose" 
            className="flex items-center p-4 text-xl rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors"
          >
            <span className="mr-3">✉️</span> Compose Email
          </Link>
          <Link 
            to="/tracking" 
            className="flex items-center p-4 text-xl rounded-lg hover:bg-gray-800 hover:text-blue-400 transition-colors"
          >
            <span className="mr-3">📊</span> Track Emails
          </Link>
        </nav>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto mb-4 p-4 text-xl rounded-lg hover:bg-gray-800 hover:text-red-400 transition-colors flex items-center"
        >
          <span className="mr-3">🚪</span> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;