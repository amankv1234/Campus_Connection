import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Discovery = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchParams, setSearchParams] = useState({
    search: '',
    skill: '',
    branch: '',
    year: ''
  });

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const res = await axios.get(`http://localhost:5000/api/users?${query}`, {
         headers: { Authorization: `Bearer ${user.token}` }
      });
      // Filter out current user
      setUsers(res.data.filter(u => u._id !== user._id));
      
      // Also fetch our own profile to know active connections
      const meRes = await axios.get(`http://localhost:5000/api/users/${user._id}`, {
         headers: { Authorization: `Bearer ${user.token}` }
      });
      if (meRes.data.connections) {
         setConnections(meRes.data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const handleConnect = async (targetUserId, isConnected) => {
    try {
      const endpoint = isConnected ? 'disconnect' : 'connect';
      const res = await axios.post(`http://localhost:5000/api/users/${endpoint}/${targetUserId}`, {}, {
         headers: { Authorization: `Bearer ${user.token}` }
      });
      setConnections(res.data);
    } catch (error) {
      console.error('Failed to modify connection', error);
      alert('Failed to connect/disconnect.');
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Discovery</h1>
        <p className="text-gray-600">Find and connect with fellow students on campus.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search by name..."
              value={searchParams.search}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              name="skill"
              placeholder="Filter by skill (e.g. React)"
              value={searchParams.skill}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <input
              type="text"
              name="branch"
              placeholder="Filter by branch (e.g. CS)"
              value={searchParams.branch}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(profile => (
          <div key={profile._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <img 
              src={profile.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-100"
            />
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-500 mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
              {profile.branch} {profile.year ? `• ${profile.year}` : ''}
            </p>
            
            <div className="flex flex-wrap justify-center gap-1 mb-6 mt-2 h-16 overflow-hidden">
              {profile.skills?.slice(0, 4).map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {profile.skills?.length > 4 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{profile.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="mt-auto w-full grid grid-cols-2 gap-3">
              <Link to={`/chat?user=${profile._id}`} className="flex justify-center items-center space-x-2 w-full py-2 bg-primary-50 text-primary-700 font-medium rounded-md hover:bg-primary-100 transition">
                <FiMessageSquare size={16} />
                <span>Message</span>
              </Link>
              {connections.includes(profile._id.toString()) ? (
                <button 
                  onClick={() => handleConnect(profile._id, true)}
                  className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition"
                >
                  Connected
                </button>
              ) : (
                <button 
                  onClick={() => handleConnect(profile._id, false)}
                  className="w-full py-2 border border-primary-600 text-primary-600 font-medium rounded-md hover:bg-primary-50 transition"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
            <p className="text-gray-500">Try adjusting your search filters to find more people.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
