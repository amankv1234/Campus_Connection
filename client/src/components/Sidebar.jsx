import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [trendingOpps, setTrendingOpps] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchOpps = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/opportunities', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setTrendingOpps(res.data.slice(0, 2));
        } catch (error) {
          console.error(error);
        }
      };
      fetchOpps();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="w-64 flex-shrink-0 hidden md:block">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center">
          <img 
            src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-primary-500 mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{user.bio || 'Student at CampusConnect'}</p>
          
          <div className="w-full border-t border-gray-200 py-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Connections</span>
              <span className="text-primary-600 font-medium">{user.connections?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Points</span>
              <span className="text-primary-600 font-medium">{user.points || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Profile Views</span>
              <span className="text-primary-600 font-medium">{user.views || 0}</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Link to="/profile" className="block w-full text-center py-2 border border-primary-600 text-primary-600 rounded-md font-medium hover:bg-primary-50 transition">
              View Profile
            </Link>
            {user.isAdmin && (
              <Link to="/admin" className="block w-full text-center py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4 h-auto">
        <h3 className="font-semibold text-gray-900 mb-3">Trending Opportunities</h3>
        <ul className="space-y-3">
          {trendingOpps.length > 0 ? trendingOpps.map(opp => (
            <li key={opp._id}>
              <Link to="/opportunities" className="text-sm font-medium text-gray-800 hover:text-primary-600 block truncate">{opp.title}</Link>
              <p className="text-xs text-gray-500">{opp.company} • {new Date(opp.createdAt).toLocaleDateString()}</p>
            </li>
          )) : (
            <p className="text-xs text-gray-500">No opportunities yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
