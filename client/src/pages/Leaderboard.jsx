import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        // Sort by points descending and take top 10
        const sorted = res.data.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
        setLeaders(sorted);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      }
    };
    fetchLeaders();
  }, [user]);

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 mb-2">
          Campus Top Contributors
        </h1>
        <p className="text-lg text-gray-600">Earn points by posting, helping others, and staying active.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex text-sm font-semibold text-gray-600 uppercase tracking-wider">
          <div className="w-16 text-center">Rank</div>
          <div className="flex-grow px-4">Student</div>
          <div className="w-32 text-right">Points</div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {leaders.map((leader, index) => (
            <div key={leader._id} className={`px-6 py-4 flex items-center transition hover:bg-gray-50 ${user._id === leader._id ? 'bg-primary-50' : ''}`}>
               <div className="w-16 flex justify-center">
                 {index === 0 ? <span className="text-2xl">🥇</span> : 
                  index === 1 ? <span className="text-2xl">🥈</span> : 
                  index === 2 ? <span className="text-2xl">🥉</span> : 
                  <span className="font-bold text-gray-500 text-lg">#{index + 1}</span>}
               </div>
               
               <div className="flex-grow px-4 flex items-center space-x-4">
                 <img 
                    src={leader.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                    alt={leader.name}
                    className="w-10 h-10 rounded-full object-cover"
                 />
                 <div>
                   <h3 className="font-bold text-gray-900">{leader.name} {user._id === leader._id && '(You)'}</h3>
                   <p className="text-xs text-gray-500">{leader.branch} {leader.year}</p>
                 </div>
               </div>
               
               <div className="w-32 text-right font-bold text-primary-600 text-lg">
                 {leader.points || 0}
               </div>
            </div>
          ))}

          {leaders.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading leaderboard...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
