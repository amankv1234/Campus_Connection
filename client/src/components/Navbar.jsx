import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMessageSquare, FiHome, FiUsers, FiBriefcase, FiCalendar, FiAward, FiCpu, FiLogOut, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import axios from 'axios';
import { API_URL } from '../config/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isDark, setIsDark] = React.useState(localStorage.getItem('theme') === 'dark');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUnreadCount(typeof res.data.count === 'number' ? res.data.count : 0);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">CampusConnect</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-500 hover:text-primary-600 flex flex-col items-center">
                  <FiHome className="h-6 w-6" />
                  <span className="text-xs mt-1">Home</span>
                </Link>
                <Link to="/discovery" className="text-gray-500 hover:text-primary-600 flex flex-col items-center">
                  <FiUsers className="h-6 w-6" />
                  <span className="text-xs mt-1">Network</span>
                </Link>
                <Link to="/opportunities" className="text-gray-500 hover:text-primary-600 flex flex-col items-center">
                  <FiBriefcase className="h-6 w-6" />
                  <span className="text-xs mt-1">Jobs</span>
                </Link>
                <Link to="/groups" className="hidden lg:flex text-gray-500 hover:text-primary-600 flex-col items-center">
                  <FiUsers className="h-6 w-6" />
                  <span className="text-xs mt-1">Groups</span>
                </Link>
                <Link to="/events" className="hidden lg:flex text-gray-500 hover:text-primary-600 flex-col items-center">
                  <FiCalendar className="h-6 w-6" />
                  <span className="text-xs mt-1">Events</span>
                </Link>
                <Link to="/leaderboard" className="hidden lg:flex text-gray-500 hover:text-primary-600 flex-col items-center">
                  <FiAward className="h-6 w-6" />
                  <span className="text-xs mt-1">Rank</span>
                </Link>
                <Link to="/ai" className="hidden lg:flex text-gray-500 hover:text-primary-600 flex-col items-center">
                  <FiCpu className="h-6 w-6" />
                  <span className="text-xs mt-1">AI</span>
                </Link>
                <Link to="/chat" className="text-gray-500 hover:text-primary-600 flex flex-col items-center">
                  <FiMessageSquare className="h-6 w-6" />
                  <span className="text-xs mt-1">Chat</span>
                </Link>
                <Link to="/notifications" className="text-gray-500 hover:text-primary-600 flex flex-col items-center relative">
                  <FiBell className="h-6 w-6" />
                  <span className="text-xs mt-1">Inbox</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative ml-4 flex items-center space-x-4">
                  <Link to="/profile">
                    <img 
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary-500" 
                      src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                      alt="Profile" 
                    />
                  </Link>
                  <button 
                    onClick={() => setIsDark(!isDark)} 
                    className="p-1.5 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {isDark ? <FiSun className="h-5 w-5 text-yellow-400" /> : <FiMoon className="h-5 w-5" />}
                  </button>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                    <FiLogOut className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsDark(!isDark)} 
                  className="p-1.5 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition mr-2"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <FiSun className="h-5 w-5 text-yellow-400" /> : <FiMoon className="h-5 w-5" />}
                </button>
                <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
